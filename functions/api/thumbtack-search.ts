interface Env {
  THUMBTACK_CLIENT_ID: string;
  THUMBTACK_CLIENT_SECRET: string;
  THUMBTACK_ENV?: string; // 'production' or 'staging'
}

const STAGING_AUTH_URL = 'https://staging-auth.thumbtack.com/oauth2/token';
const STAGING_API_URL = 'https://staging-api.thumbtack.com/api/v4/businesses/search';
const PROD_AUTH_URL = 'https://auth.thumbtack.com/oauth2/token';
const PROD_API_URL = 'https://api.thumbtack.com/api/v4/businesses/search';

// Token cache (persists across requests within the same isolate)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(env: Env): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const isProduction = env.THUMBTACK_ENV === 'production';
  const authUrl = isProduction ? PROD_AUTH_URL : STAGING_AUTH_URL;
  const credentials = btoa(`${env.THUMBTACK_CLIENT_ID}:${env.THUMBTACK_CLIENT_SECRET}`);

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&audience=urn:partner-api',
  });

  if (!response.ok) {
    throw new Error(`OAuth token request failed: ${response.status}`);
  }

  const data: any = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body: any = await context.request.json();
    const { searchQuery, zipCode, limit = 10 } = body;

    if (!searchQuery || !zipCode) {
      return new Response(
        JSON.stringify({ error: 'searchQuery and zipCode are required' }),
        { status: 400, headers }
      );
    }

    const token = await getAccessToken(context.env);
    const isProduction = context.env.THUMBTACK_ENV === 'production';
    const apiUrl = isProduction ? PROD_API_URL : STAGING_API_URL;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchQuery,
        zipCode,
        utmData: { utm_source: 'cma-udonis' },
        limit,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: 'Thumbtack API error', detail: errorText }),
        { status: response.status, headers }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
};
