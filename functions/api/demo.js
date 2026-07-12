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

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Demo service is not configured." }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  if (clean(payload.website, 200)) {
    return json({ ok: true });
  }

  const record = {
    full_name: clean(payload.name, 120),
    company: clean(payload.company, 160),
    email: clean(payload.email, 180).toLowerCase(),
    role: clean(payload.role, 100),
    message: clean(payload.message, 2000),
    source: clean(payload.source, 500),
    page_url: clean(payload.page_url, 1000),
    session_id: clean(payload.session_id, 120),
    user_agent: clean(request.headers.get("user-agent"), 500),
    ip_hash_source: clean(request.headers.get("cf-connecting-ip"), 100),
  };

  if (record.full_name.length < 2 || record.company.length < 2 || !isEmail(record.email)) {
    return json({ error: "Please provide a valid name, company, and work email." }, 422);
  }

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/demo_requests`, {
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
    console.error("Supabase demo request error:", await response.text());
    return json({ error: "Unable to save your request. Please try again." }, 502);
  }

  return json({ ok: true }, 201);
}
