/**
 * Lead Data Handoff Utility
 * Handles encoding/decoding lead data for URL parameter passing between landers
 */

export interface LeadData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
  property_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: string;
  property_condition?: string;
  lead_id?: string;
  home_owner?: string;
  trustedform_cert_url?: string;
  jornaya_leadid?: string;
}

// Short keys for URL encoding to minimize URL length
const KEY_MAP: Record<keyof LeadData, string> = {
  first_name: 'fn',
  last_name: 'ln',
  phone_number: 'ph',
  email: 'em',
  property_address: 'addr',
  city: 'city',
  state: 'st',
  zip_code: 'zip',
  property_type: 'pt',
  property_condition: 'cond',
  lead_id: 'lid',
  home_owner: 'ho',
  trustedform_cert_url: 'tf',
  jornaya_leadid: 'jl'
};

const REVERSE_KEY_MAP: Record<string, keyof LeadData> = Object.entries(KEY_MAP).reduce(
  (acc, [key, value]) => ({ ...acc, [value]: key as keyof LeadData }),
  {} as Record<string, keyof LeadData>
);

/**
 * Encode lead data for URL parameter
 * Returns base64 encoded JSON string
 */
export function encodeLeadData(data: LeadData): string {
  const shortData: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '') {
      const shortKey = KEY_MAP[key as keyof LeadData];
      if (shortKey) {
        shortData[shortKey] = String(value);
      }
    }
  }

  const jsonString = JSON.stringify(shortData);
  // Use btoa for base64 encoding, handling unicode
  return btoa(encodeURIComponent(jsonString));
}

/**
 * Decode lead data from URL parameters
 * Expects ?ld=BASE64_STRING format
 */
export function decodeLeadData(params: URLSearchParams): LeadData | null {
  const encoded = params.get('ld');

  if (!encoded) {
    return null;
  }

  try {
    const jsonString = decodeURIComponent(atob(encoded));
    const shortData = JSON.parse(jsonString);

    const data: LeadData = {};

    for (const [shortKey, value] of Object.entries(shortData)) {
      const fullKey = REVERSE_KEY_MAP[shortKey];
      if (fullKey && typeof value === 'string') {
        data[fullKey] = value;
      }
    }

    return data;
  } catch (error) {
    console.error('Failed to decode lead data:', error);
    return null;
  }
}

/**
 * Get list of pre-filled field names from lead data
 */
export function getPrefilledFields(data: LeadData | null): string[] {
  if (!data) return [];

  return Object.entries(data)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key]) => key);
}

/**
 * Check if contact info is already available
 */
export function hasContactInfo(data: LeadData | null): boolean {
  if (!data) return false;

  return Boolean(
    data.first_name &&
    data.last_name &&
    data.phone_number &&
    data.email
  );
}

/**
 * Check if address info is already available
 */
export function hasAddressInfo(data: LeadData | null): boolean {
  if (!data) return false;

  return Boolean(
    data.property_address &&
    data.city &&
    data.state &&
    data.zip_code
  );
}

/**
 * Build redirect URL with encoded lead data
 */
export function buildHandoffUrl(basePath: string, data: LeadData, additionalParams?: Record<string, string>): string {
  const params = new URLSearchParams();
  params.set('ld', encodeLeadData(data));

  if (additionalParams) {
    for (const [key, value] of Object.entries(additionalParams)) {
      params.set(key, value);
    }
  }

  return `${basePath}?${params.toString()}`;
}
