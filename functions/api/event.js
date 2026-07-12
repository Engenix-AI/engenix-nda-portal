const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function clean(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ ok: true });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: true });
  }

  const record = {
    event_name: clean(payload.event_name, 120),
    path: clean(payload.path, 500),
    session_id: clean(payload.session_id, 120),
    metadata: payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {},
    user_agent: clean(request.headers.get("user-agent"), 500),
  };

  if (!record.event_name) {
    return json({ ok: true });
  }

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/site_events`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    console.error("Supabase event error:", await response.text());
  }

  return json({ ok: true });
}
