interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
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

interface LogRow {
  transaction_id: string | null;
  service_key: string | null;
  event_id: string | null;
  fired: boolean;
  skip_reason: string | null;
  response_status: number | null;
  response_ok: boolean | null;
  postback_url: string | null;
  request_origin: string | null;
  user_agent: string | null;
  error_message: string | null;
  raw_body: unknown;
}

/**
 * Fire-and-forget insert into Supabase. Uses the service-role key (never
 * exposed to the client) to bypass RLS. We never await this to avoid slowing
 * down the postback path — logging failures must never block conversions.
 */
function logToSupabase(env: Env, row: LogRow, ctx: EventContext<any, any, any>) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  const insertUrl = `${url}/rest/v1/thumbtack_postback_logs`;
  const promise = fetch(insertUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  }).catch(() => {
    // swallow — log failures must not affect postback
  });

  // Keep the worker alive until the log write finishes
  if (typeof (ctx as any).waitUntil === 'function') {
    (ctx as any).waitUntil(promise);
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  const request = context.request;
  const requestOrigin = request.headers.get('origin') || request.headers.get('referer') || null;
  const userAgent = request.headers.get('user-agent') || null;

  let rawBody: any = null;
  try {
    rawBody = await request.json();
  } catch {
    logToSupabase(
      context.env,
      {
        transaction_id: null,
        service_key: null,
        event_id: null,
        fired: false,
        skip_reason: 'invalid_json',
        response_status: null,
        response_ok: null,
        postback_url: null,
        request_origin: requestOrigin,
        user_agent: userAgent,
        error_message: 'invalid_json',
        raw_body: null,
      },
      context
    );
    return new Response(
      JSON.stringify({ error: 'invalid json body' }),
      { status: 400, headers }
    );
  }

  const transactionId: string | null = rawBody?.transaction_id ?? null;
  const serviceKey: string | null = rawBody?.service_key ?? null;

  if (!transactionId) {
    logToSupabase(
      context.env,
      {
        transaction_id: null,
        service_key: serviceKey,
        event_id: null,
        fired: false,
        skip_reason: 'missing_transaction_id',
        response_status: null,
        response_ok: null,
        postback_url: null,
        request_origin: requestOrigin,
        user_agent: userAgent,
        error_message: null,
        raw_body: rawBody,
      },
      context
    );
    return new Response(
      JSON.stringify({ error: 'transaction_id is required' }),
      { status: 400, headers }
    );
  }

  const eventId = serviceKey ? EVENT_IDS[serviceKey] : undefined;

  // Without a known event_id for this service, do not fire the postback —
  // we'd be attributing to the wrong offer. Surface that to the caller so
  // it's visible in logs but don't 500.
  if (!eventId) {
    logToSupabase(
      context.env,
      {
        transaction_id: transactionId,
        service_key: serviceKey,
        event_id: null,
        fired: false,
        skip_reason: serviceKey ? 'no_event_id_for_service' : 'missing_service_key',
        response_status: null,
        response_ok: null,
        postback_url: null,
        request_origin: requestOrigin,
        user_agent: userAgent,
        error_message: null,
        raw_body: rawBody,
      },
      context
    );
    return new Response(
      JSON.stringify({
        success: false,
        skipped: true,
        reason: 'no event_id mapping for service',
        service_key: serviceKey || null,
        transaction_id: transactionId,
      }),
      { status: 200, headers }
    );
  }

  const postbackUrl = new URL(POSTBACK_URL);
  postbackUrl.searchParams.set('nid', NID);
  postbackUrl.searchParams.set('event_id', eventId);
  postbackUrl.searchParams.set('transaction_id', transactionId);

  let resp: Response;
  try {
    resp = await fetch(postbackUrl.toString(), {
      method: 'GET',
      headers: { 'User-Agent': 'FOC-Postback/1.0' },
    });
  } catch (err) {
    logToSupabase(
      context.env,
      {
        transaction_id: transactionId,
        service_key: serviceKey,
        event_id: eventId,
        fired: false,
        skip_reason: 'fetch_error',
        response_status: null,
        response_ok: false,
        postback_url: postbackUrl.toString(),
        request_origin: requestOrigin,
        user_agent: userAgent,
        error_message: err instanceof Error ? err.message : String(err),
        raw_body: rawBody,
      },
      context
    );
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Fetch error' }),
      { status: 500, headers }
    );
  }

  logToSupabase(
    context.env,
    {
      transaction_id: transactionId,
      service_key: serviceKey,
      event_id: eventId,
      fired: true,
      skip_reason: null,
      response_status: resp.status,
      response_ok: resp.ok,
      postback_url: postbackUrl.toString(),
      request_origin: requestOrigin,
      user_agent: userAgent,
      error_message: null,
      raw_body: rawBody,
    },
    context
  );

  return new Response(
    JSON.stringify({
      success: resp.ok,
      status: resp.status,
      transaction_id: transactionId,
      service_key: serviceKey,
      event_id: eventId,
    }),
    { status: 200, headers }
  );
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
