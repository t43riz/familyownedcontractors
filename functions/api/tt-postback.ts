interface Env {
  // Add any secrets here if needed in the future
}

const POSTBACK_URL = 'https://www.ujjkl8trk.com/';
const NID = '3494';

// Per-service event_id mapping. Add new entries here as event_ids are
// provisioned for each service in the affiliate network. Both the original
// service keys (`hvac`, `roofing`) and the new strict-category keys
// (`roofing_install`, `hvac_install`) map to the same event_ids since they
// represent the same conversions for tracking purposes.
const EVENT_IDS: Record<string, string> = {
  hvac: '396',
  hvac_install: '396',
  roofing: '398',
  roofing_install: '398',
  flooring_install: '407',
  interior_painting: '409',
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body: any = await context.request.json();
    const { transaction_id, service_key } = body;

    if (!transaction_id) {
      return new Response(
        JSON.stringify({ error: 'transaction_id is required' }),
        { status: 400, headers }
      );
    }

    const eventId = service_key ? EVENT_IDS[service_key] : undefined;

    // Without a known event_id for this service, do not fire the postback —
    // we'd be attributing to the wrong offer. Surface that to the caller so
    // it's visible in logs but don't 500.
    if (!eventId) {
      return new Response(
        JSON.stringify({
          success: false,
          skipped: true,
          reason: 'no event_id mapping for service',
          service_key: service_key || null,
          transaction_id,
        }),
        { status: 200, headers }
      );
    }

    const postbackUrl = new URL(POSTBACK_URL);
    postbackUrl.searchParams.set('nid', NID);
    postbackUrl.searchParams.set('event_id', eventId);
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
        service_key: service_key || null,
        event_id: eventId,
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
