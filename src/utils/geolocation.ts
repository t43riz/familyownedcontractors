/**
 * IP Geolocation Utility
 * Detects user's location (zip code) from their IP address
 * Used for matching Facebook leads to landing page visitors
 */

export interface GeolocationData {
  ip: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_code: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface GeolocationResult {
  success: boolean;
  data?: GeolocationData;
  error?: string;
}

/**
 * Fetches geolocation data from IP address using ipapi.co (free tier: 1000 requests/day)
 * Returns zip code and location data for Facebook lead matching
 */
export const getIPGeolocation = async (): Promise<GeolocationResult> => {
  try {
    // Using ipapi.co free API - no API key required for basic usage
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if we got an error from the API
    if (data.error) {
      throw new Error(data.reason || 'IP geolocation API error');
    }

    return {
      success: true,
      data: {
        ip: data.ip,
        city: data.city,
        region: data.region,
        region_code: data.region_code,
        country: data.country_name,
        country_code: data.country_code,
        postal: data.postal,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      },
    };
  } catch (error) {
    console.error('IP Geolocation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Fallback #1: ipinfo.io (CORS-enabled, free tier)
 */
export const getIPGeolocationFallback1 = async (): Promise<GeolocationResult> => {
  try {
    const response = await fetch('https://ipinfo.io/json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Parse location data from ipinfo.io format
    const [city, region] = (data.city || '').split(',').map((s: string) => s.trim());
    const [lat, lon] = (data.loc || '0,0').split(',').map((s: string) => parseFloat(s.trim()));

    return {
      success: true,
      data: {
        ip: data.ip || '',
        city: city || '',
        region: data.region || '',
        region_code: data.region || '',
        country: data.country || '',
        country_code: data.country || '',
        postal: data.postal || '',
        latitude: lat,
        longitude: lon,
        timezone: data.timezone || '',
      },
    };
  } catch (error) {
    console.error('IP Geolocation fallback #1 error (ipinfo.io):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Fallback #2: ip-api.com (CORS-enabled, free, no HTTPS on free tier - use for development only)
 */
export const getIPGeolocationFallback2 = async (): Promise<GeolocationResult> => {
  try {
    // Note: ip-api.com only supports HTTPS on paid plans
    // This is included as a fallback but may not work on production HTTPS sites
    const response = await fetch('http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,query', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'fail') {
      throw new Error(data.message || 'IP geolocation API error');
    }

    return {
      success: true,
      data: {
        ip: data.query || '',
        city: data.city || '',
        region: data.regionName || '',
        region_code: data.region || '',
        country: data.country || '',
        country_code: data.countryCode || '',
        postal: data.zip || '',
        latitude: data.lat || 0,
        longitude: data.lon || 0,
        timezone: data.timezone || '',
      },
    };
  } catch (error) {
    console.error('IP Geolocation fallback #2 error (ip-api.com):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Fallback #3: ipapi.com (CORS-enabled, free tier with API key)
 */
export const getIPGeolocationFallback3 = async (): Promise<GeolocationResult> => {
  try {
    // ipapi.com - free tier (1000 requests/month, no API key needed)
    const response = await fetch('https://ipapi.com/ip_api.php?ip=', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        ip: data.ip || '',
        city: data.city || '',
        region: data.region || '',
        region_code: data.region_code || '',
        country: data.country_name || '',
        country_code: data.country_code || '',
        postal: data.postal || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        timezone: data.time_zone?.id || '',
      },
    };
  } catch (error) {
    console.error('IP Geolocation fallback #3 error (ipapi.com):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Gets user's zip code from IP with automatic fallback
 * Tries multiple services in order until one succeeds
 * Returns just the zip code string or null if all failed
 */
export const getZipFromIP = async (): Promise<string | null> => {
  // Try primary service (ipapi.co)
  console.log('Attempting IP geolocation with ipapi.co...');
  const result = await getIPGeolocation();

  if (result.success && result.data?.postal) {
    console.log('✅ IP geolocation successful (ipapi.co):', result.data.postal);
    return result.data.postal;
  }

  // Try fallback #1 (ipinfo.io)
  console.log('Primary failed, trying fallback #1 (ipinfo.io)...');
  const fallback1 = await getIPGeolocationFallback1();

  if (fallback1.success && fallback1.data?.postal) {
    console.log('✅ IP geolocation successful (ipinfo.io):', fallback1.data.postal);
    return fallback1.data.postal;
  }

  // Try fallback #2 (ip-api.com - may not work on HTTPS production)
  console.log('Fallback #1 failed, trying fallback #2 (ip-api.com)...');
  const fallback2 = await getIPGeolocationFallback2();

  if (fallback2.success && fallback2.data?.postal) {
    console.log('✅ IP geolocation successful (ip-api.com):', fallback2.data.postal);
    return fallback2.data.postal;
  }

  // Try fallback #3 (ipapi.com)
  console.log('Fallback #2 failed, trying fallback #3 (ipapi.com)...');
  const fallback3 = await getIPGeolocationFallback3();

  if (fallback3.success && fallback3.data?.postal) {
    console.log('✅ IP geolocation successful (ipapi.com):', fallback3.data.postal);
    return fallback3.data.postal;
  }

  // All services failed
  console.warn('❌ All IP geolocation services failed - could not detect zip code');
  return null;
};
