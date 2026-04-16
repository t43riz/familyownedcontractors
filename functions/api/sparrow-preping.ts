interface Env {
  SPARROW_WEBHOOK_URL: string;
  SPARROW_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body: any = await context.request.json();
    const { phone, zip_code, service_type, first_name, last_name, email, state } = body;

    if (!phone || !zip_code) {
      return new Response(
        JSON.stringify({ accepted: false, error: 'phone and zip_code are required' }),
        { status: 400, headers }
      );
    }

    const webhookUrl = context.env.SPARROW_WEBHOOK_URL;
    const apiKey = context.env.SPARROW_API_KEY;

    if (!webhookUrl || !apiKey) {
      return new Response(
        JSON.stringify({ accepted: false, error: 'Sparrow not configured' }),
        { status: 500, headers }
      );
    }

    const response = await fetch(`${webhookUrl}/api/web-preping/${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caller_id: phone.startsWith('+1') ? phone : `+1${phone.replace(/\D/g, '')}`,
        publisher_id: 'foc-waterfall',
        publisher_name: 'FamilyOwnedContractors',
        zip_code,
        service_type,
        custom_data: {
          first_name: first_name || '',
          last_name: last_name || '',
          email: email || '',
          state: state || '',
          source: 'foc-waterfall',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ accepted: false, error: 'Sparrow API error', detail: errorText }),
        { status: response.status, headers }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ accepted: false, error: error instanceof Error ? error.message : 'Internal error' }),
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
