interface Env {
  // Add any secrets here if needed in the future
}

const POSTBACK_URL = 'https://www.ujjkl8trk.com/';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body: any = await context.request.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return new Response(
        JSON.stringify({ error: 'transaction_id is required' }),
        { status: 400, headers }
      );
    }

    const postbackUrl = new URL(POSTBACK_URL);
    postbackUrl.searchParams.set('nid', '3494');
    postbackUrl.searchParams.set('event_id', '396');
    postbackUrl.searchParams.set('transaction_id', transaction_id);

    const resp = await fetch(postbackUrl.toString(), {
      method: 'GET',
      headers: { 'User-Agent': 'FOC-Postback/1.0' },
    });

    return new Response(
      JSON.stringify({
        success: resp.ok,
        status: resp.status,
        transaction_id,
      }),
      { status: 200, headers }
    );
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
