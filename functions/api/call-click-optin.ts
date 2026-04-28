interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

interface OptinRow {
  txid: string | null;
  service: string | null;
  page: string | null;
  phone_dialed: string | null;
  phone_display: string | null;
  jornaya_leadid: string | null;
  trustedform_cert_url: string | null;
  landing_page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_address: string | null;
  query_params: unknown;
  sparrow_session_id: string | null;
  raw_body: unknown;
}

function logToSupabase(env: Env, row: OptinRow, ctx: EventContext<any, any, any>) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  const insertUrl = `${url}/rest/v1/call_click_optins`;
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
    // swallow — log failures must not affect user experience
  });

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
  const userAgent = request.headers.get('user-agent') || null;
  const referrer = request.headers.get('referer') || null;
  const ipAddress =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    null;

  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'invalid json body' }),
      { status: 400, headers }
    );
  }

  const row: OptinRow = {
    txid: body?.txid ?? null,
    service: body?.service ?? null,
    page: body?.page ?? null,
    phone_dialed: body?.phone_dialed ?? null,
    phone_display: body?.phone_display ?? null,
    jornaya_leadid: body?.jornaya_leadid ?? null,
    trustedform_cert_url: body?.trustedform_cert_url ?? null,
    landing_page_url: body?.landing_page_url ?? null,
    referrer: body?.referrer ?? referrer,
    user_agent: body?.user_agent ?? userAgent,
    ip_address: ipAddress,
    query_params: body?.query_params ?? null,
    sparrow_session_id: body?.sparrow_session_id ?? null,
    raw_body: body,
  };

  logToSupabase(context.env, row, context);

  return new Response(
    JSON.stringify({ success: true }),
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
