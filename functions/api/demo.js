const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby4Ya8vA2H1fEvm9t6lGEXqLOPhA1g1WSyGUonL4_oxX_0LcOxl_tT4rqktKOLT7ZLHfg/exec";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });

const clean = (value, max = 500) =>
  String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);

export async function onRequestPost(context) {
  try {
    const contentType = context.request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return json({ ok: false, error: "Unsupported request format." }, 415);
    }

    const body = await context.request.json();

    // Honeypot. Pretend success so bots do not learn the filter.
    if (clean(body.website, 200)) {
      return json({ ok: true });
    }

    const payload = {
      name: clean(body.name, 120),
      company: clean(body.company, 160),
      email: clean(body.email, 180).toLowerCase(),
      phone: clean(body.phone, 40),
      role: clean(body.role, 100),
      monthlyVolume: clean(body.monthlyVolume, 80),
      rooftops: clean(body.rooftops, 80),
      dms: clean(body.dms, 100),
      challenge: clean(body.challenge, 1800),
      source: clean(body.source, 120),
      page: clean(body.page, 500),
      userAgent: clean(body.userAgent, 500),
      submittedAtClient: clean(body.submittedAtClient, 80)
    };

    if (!payload.name || !payload.company || !payload.email || !payload.role || !payload.challenge) {
      return json({ ok: false, error: "Please complete all required fields." }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email)) {
      return json({ ok: false, error: "Please enter a valid work email." }, 400);
    }

    const form = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => form.set(key, value));

    const googleResponse = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: form.toString(),
      redirect: "follow"
    });

    const responseText = await googleResponse.text();

    if (!googleResponse.ok) {
      console.error("Google Apps Script HTTP error", googleResponse.status, responseText);
      return json({ ok: false, error: "The request could not be delivered." }, 502);
    }

    let googleResult = null;
    try {
      googleResult = JSON.parse(responseText);
    } catch {
      // Older Apps Script response versions may return HTML. A successful
      // 200 still means the Sheet/email workflow executed.
      googleResult = { ok: true };
    }

    if (googleResult && googleResult.ok === false) {
      return json({
        ok: false,
        error: clean(googleResult.error, 240) || "The request could not be delivered."
      }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("ENGENIX demo relay error", error);
    return json({ ok: false, error: "Unexpected request error." }, 500);
  }
}

export function onRequestGet() {
  return json({ ok: false, error: "Method not allowed." }, 405);
}
