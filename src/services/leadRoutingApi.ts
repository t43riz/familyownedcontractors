/**
 * Lead Routing API - 3-Tier Waterfall
 *
 * Tier A: Ping/Post - Ping existing backend for buyer availability, then post if accepted
 * Tier B: Sparrow RTB - Web pre-ping via Sparrow for RTB buyers, returns phone number
 * Tier C: Thumbtack - Fallback to Thumbtack pro search
 */

import { transformToBackendPayload, type CommonLeadData, type ServiceType } from './homeServicesApi';

const API_BASE_URL = 'https://uvx-backend-86db26411613.herokuapp.com';

export type RoutingTier = 'pingpost' | 'rtb' | 'thumbtack';

export interface PingResponse {
  has_buyer: boolean;
  ping_id?: string;
  buyer_name?: string;
  bid_amount?: number;
  expires_at?: string;
  message?: string;
}

export interface SparrowPrePingResponse {
  accepted: boolean;
  phone_number?: string;
  bid_id?: string;
  expires_in_seconds?: number;
  error?: string;
}

export interface PostResponse {
  success: boolean;
  lead_id?: string;
  message?: string;
  error?: string;
  is_duplicate?: boolean;
  test_mode?: boolean;
}

export interface RoutingResult {
  tier: RoutingTier;
  pingpost?: PostResponse;
  rtb?: SparrowPrePingResponse;
  thumbtack?: { zipCode: string; serviceType: ServiceType };
}

/**
 * Tier A: Ping the backend to check buyer availability (without committing the lead)
 */
export async function pingForBuyer(
  frontendData: CommonLeadData & Record<string, any>,
  serviceType: ServiceType
): Promise<PingResponse> {
  const backendPayload = transformToBackendPayload(frontendData, serviceType);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/leads/ping-homeservices/${serviceType}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { has_buyer: false, message: data.detail || 'Ping failed' };
    }

    return {
      has_buyer: data.has_buyer ?? false,
      ping_id: data.ping_id,
      buyer_name: data.buyer_name,
      bid_amount: data.bid_amount,
      expires_at: data.expires_at,
      message: data.message,
    };
  } catch (error) {
    console.error('Error pinging for buyer:', error);
    return { has_buyer: false, message: 'Network error' };
  }
}

/**
 * Tier A (post step): Submit the lead to the reserved buyer using the ping_id
 */
export async function postLead(
  frontendData: CommonLeadData & Record<string, any>,
  serviceType: ServiceType,
  pingId: string
): Promise<PostResponse> {
  const backendPayload = transformToBackendPayload(frontendData, serviceType);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/leads/post-homeservices/${serviceType}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...backendPayload, ping_id: pingId }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || data.error || 'Failed to submit lead' };
    }

    return {
      success: true,
      lead_id: data.lead_id,
      message: data.message,
      is_duplicate: data.is_duplicate,
      test_mode: data.test_mode,
    };
  } catch (error) {
    console.error('Error posting lead:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Tier B: Ping Sparrow RTB via the proxy function
 */
export async function sparrowWebPrePing(
  phone: string,
  zipCode: string,
  serviceType: string,
  additionalData?: Record<string, string>
): Promise<SparrowPrePingResponse> {
  try {
    const response = await fetch('/api/sparrow-preping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        zip_code: zipCode,
        service_type: serviceType,
        ...additionalData,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { accepted: false, error: data.error || 'Sparrow pre-ping failed' };
    }

    return data;
  } catch (error) {
    console.error('Error in Sparrow web pre-ping:', error);
    return { accepted: false, error: 'Network error' };
  }
}

/**
 * Main waterfall orchestrator.
 * Runs Tier A -> Tier B -> Tier C in sequence, stopping at first success.
 */
export async function routeLead(
  frontendData: CommonLeadData & Record<string, any>,
  serviceType: ServiceType
): Promise<RoutingResult> {
  // Tier A: Ping for buyer
  const pingResult = await pingForBuyer(frontendData, serviceType);

  if (pingResult.has_buyer && pingResult.ping_id) {
    // Buyer found -- post the lead to the reserved buyer
    const postResult = await postLead(frontendData, serviceType, pingResult.ping_id);

    // If post succeeded, we're done. If ping expired, fall through to Tier B.
    if (postResult.success) {
      return { tier: 'pingpost', pingpost: postResult };
    }
  }

  // Tier B: Sparrow RTB web pre-ping
  const phone = frontendData.phone?.replace(/\D/g, '') || '';
  const zipCode = frontendData.zip_code || '';

  if (phone && zipCode) {
    const rtbResult = await sparrowWebPrePing(phone, zipCode, serviceType, {
      first_name: frontendData.first_name || '',
      last_name: frontendData.last_name || '',
      email: frontendData.email || '',
      state: frontendData.state || '',
    });

    if (rtbResult.accepted && rtbResult.phone_number) {
      return { tier: 'rtb', rtb: rtbResult };
    }
  }

  // Tier C: Thumbtack fallback
  return {
    tier: 'thumbtack',
    thumbtack: { zipCode, serviceType },
  };
}
