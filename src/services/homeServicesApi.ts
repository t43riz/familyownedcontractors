/**
 * Home Services API Adapter
 * Transforms frontend payloads to backend expected format and handles submission
 */

// Backend API base URL
const API_BASE_URL = 'https://uvx-backend-86db26411613.herokuapp.com';

// Service types supported by the API
export type ServiceType = 'bath' | 'roofing' | 'windows' | 'hvac' | 'kitchen' | 'plumbing';

// Common fields sent by all landers
export interface CommonLeadData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  home_owner: string;
  landing_page_url: string;
  user_agent: string;
  tcpa_text: string;
  jornaya_leadid?: string;  // Jornaya LeadID token
  trustedform_cert_url?: string;  // TrustedForm certificate URL
  query_parameters?: Record<string, string>;
  publisher_id?: string;  // Publisher/affiliate ID
  original_lead_id?: string | null;
}

// Backend payload structure
export interface BackendPayload {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  property_address: string;
  city: string;
  state: string;
  zip_code: string;
  home_owner: string;
  lead_source: string;
  user_agent: string;
  tcpa_text: string;
  jornaya_leadid?: string;  // Jornaya LeadID token
  trustedform_cert_url?: string;  // TrustedForm certificate URL
  query_parameters?: Record<string, string>;
  publisher_id?: string;  // Publisher/affiliate ID
  service_data: Record<string, any>;
}

// Service-specific field definitions
const SERVICE_SPECIFIC_FIELDS: Record<ServiceType, string[]> = {
  bath: ['property_type', 'home_type', 'remodel_type', 'service'],
  roofing: ['property_type', 'install_repair', 'product_type', 'roof_type', 'funding_source', 'roof_age', 'call_time', 'damage_cause'],
  windows: ['property_type', 'install_repair', 'product_count', 'material'],
  hvac: ['property_type', 'project_type', 'air_type', 'air_sub_type', 'service'],
  kitchen: ['service'],
  plumbing: ['service'],
};

/**
 * Transform frontend payload to backend expected format
 */
export function transformToBackendPayload(
  frontendData: CommonLeadData & Record<string, any>,
  serviceType: ServiceType
): BackendPayload {
  // Extract service-specific fields into service_data
  const serviceFields = SERVICE_SPECIFIC_FIELDS[serviceType] || [];
  const serviceData: Record<string, any> = {};

  for (const field of serviceFields) {
    if (frontendData[field] !== undefined) {
      serviceData[field] = frontendData[field];
    }
  }

  // Transform home_owner from Yes/No to True/False
  let homeOwner = frontendData.home_owner;
  if (homeOwner === 'Yes') homeOwner = 'True';
  if (homeOwner === 'No') homeOwner = 'False';

  return {
    first_name: frontendData.first_name,
    last_name: frontendData.last_name,
    phone_number: frontendData.phone,
    email: frontendData.email,
    property_address: frontendData.address,
    city: frontendData.city,
    state: frontendData.state,
    zip_code: frontendData.zip_code,
    home_owner: homeOwner,
    lead_source: frontendData.landing_page_url,
    user_agent: frontendData.user_agent,
    tcpa_text: frontendData.tcpa_text,
    jornaya_leadid: frontendData.jornaya_leadid,  // Jornaya LeadID token
    trustedform_cert_url: frontendData.trustedform_cert_url,  // TrustedForm certificate URL
    query_parameters: frontendData.query_parameters,
    publisher_id: frontendData.publisher_id,  // Publisher/affiliate ID
    service_data: serviceData,
  };
}

/**
 * Submit a home services lead to the backend API
 */
export async function submitHomeServicesLead(
  frontendData: CommonLeadData & Record<string, any>,
  serviceType: ServiceType
): Promise<{
  success: boolean;
  lead_id?: string;
  message?: string;
  error?: string;
  is_duplicate?: boolean;
  test_mode?: boolean;
}> {
  const backendPayload = transformToBackendPayload(frontendData, serviceType);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/leads/submitsell-homeservices/${serviceType}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendPayload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || 'Failed to submit lead',
      };
    }

    return {
      success: true,
      lead_id: data.lead_id,
      message: data.message,
      is_duplicate: data.is_duplicate,
      test_mode: data.test_mode,
    };
  } catch (error) {
    console.error('Error submitting home services lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Submit multiple home services leads (for multi-service hub)
 */
export async function submitMultipleHomeServicesLeads(
  commonData: CommonLeadData,
  services: Array<{ serviceType: ServiceType; serviceData: Record<string, any> }>
): Promise<Array<{ serviceType: ServiceType; result: Awaited<ReturnType<typeof submitHomeServicesLead>> }>> {
  const results = await Promise.all(
    services.map(async ({ serviceType, serviceData }) => {
      const payload = {
        ...commonData,
        ...serviceData,
      };
      const result = await submitHomeServicesLead(payload, serviceType);
      return { serviceType, result };
    })
  );

  return results;
}

/**
 * Qualify an existing lead for home services (cross-sell from cash lander)
 */
export async function qualifyLeadForHomeServices(
  leadId: string,
  serviceTypes: ServiceType[],
  serviceData: Record<ServiceType, Record<string, any>>,
  triggerDistribution: boolean = true
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/leads/qualify-home-services/${leadId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_types: serviceTypes,
          service_data: serviceData,
          trigger_distribution: triggerDistribution,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || 'Failed to qualify lead',
      };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('Error qualifying lead for home services:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
