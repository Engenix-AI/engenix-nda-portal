const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });

const clean = (value, max = 300) =>
  String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max);

const escapeHtml = (value) =>
  clean(value, 3000)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const sendEmail = async (apiKey, payload) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  return { response, result };
};

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return json({ ok: false, error: "Unsupported request format." }, 415);
    }

    const body = await request.json();

    // Honeypot. Return success so bots do not learn the filter.
    if (clean(body.website, 200)) {
      return json({ ok: true });
    }

    const name = clean(body.name, 120);
    const company = clean(body.company, 160);
    const email = clean(body.email, 180).toLowerCase();
    const phone = clean(body.phone, 40);
    const role = clean(body.role, 100);
    const monthlyVolume = clean(body.monthlyVolume, 80);
    const rooftops = clean(body.rooftops, 80);
    const dms = clean(body.dms, 100);
    const challenge = clean(body.challenge, 1800);
    const source = clean(body.source, 120);
    const page = clean(body.page, 500);
    const userAgent = clean(body.userAgent, 500);

    if (!name || !company || !email || !role || !challenge) {
      return json({ ok: false, error: "Please complete all required fields." }, 400);
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(email)) {
      return json({ ok: false, error: "Please enter a valid work email." }, 400);
    }

    if (!env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return json({ ok: false, error: "The request service is not configured yet." }, 503);
    }

    const to = env.DEMO_TO_EMAIL || "demo@engenix.co";
    const from = env.DEMO_FROM_EMAIL || "ENGENIX Website <website@engenix.co>";
    const submittedAt = new Date().toISOString();
    const subject = `Private demo request: ${company} — ${name}`;

    const leadHtml = `
      <div style="font-family:Arial,sans-serif;max-width:760px;margin:auto;background:#080b10;color:#f4f5f7;padding:32px;border-radius:18px">
        <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#f1cf74;margin-bottom:10px">ENGENIX PRIVATE ACCESS</div>
        <h1 style="font-size:28px;margin:0 0 24px">New private demo request</h1>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:10px 0;color:#8f98a6;width:190px">Name</td><td>${escapeHtml(name)}</td></tr>
          <tr><td style="padding:10px 0;color:#8f98a6">Dealership / Group</td><td>${escapeHtml(company)}</td></tr>
          <tr><td style="padding:10px 0;color:#8f98a6">Work email</td><td><a style="color:#4b97f1" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding:10px 0;color:#8f98a6">Phone</td><td>${escapeHtml(phone || "Not provided")}</td></tr>
          <tr><td style="padding:10px 0;color:#8f98a6">Role</td><td>${escapeHtml(role)}</td></tr>
          <tr><td style="padding:10px 0;color:#8f98a6">Monthly volume</td><td>${escapeHtml(monthlyVolume || "Not provided")}</td></tr>
          <tr><td style="padding:10px 0;color:#8f98a6">Rooftops</td><td>${escapeHtml(rooftops || "Not provided")}</td></tr>
          <tr><td style="padding:10px 0;color:#8f98a6">DMS</td><td>${escapeHtml(dms || "Not provided")}</td></tr>
          <tr><td style="padding:10px 0;color:#8f98a6;vertical-align:top">Demo focus</td><td style="white-space:pre-wrap">${escapeHtml(challenge)}</td></tr>
          <tr><td style="padding:10px 0;color:#8f98a6">Source</td><td>${escapeHtml(source || "Website")}</td></tr>
        </table>
        <div style="margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,.12);font-size:12px;color:#6d7583">
          Submitted: ${escapeHtml(submittedAt)}<br>
          Page: ${escapeHtml(page || "Unknown")}<br>
          Browser: ${escapeHtml(userAgent || "Unknown")}
        </div>
      </div>`;

    const leadSend = await sendEmail(env.RESEND_API_KEY, {
      from,
      to: [to],
      reply_to: email,
      subject,
      html: leadHtml
    });

    if (!leadSend.response.ok) {
      console.error("Resend lead error", leadSend.response.status, leadSend.result);
      return json({ ok: false, error: "The request could not be delivered." }, 502);
    }

    // Optional confirmation email to the lead.
    if (env.SEND_CONFIRMATION_EMAIL !== "false") {
      const confirmationHtml = `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;background:#080b10;color:#f4f5f7;padding:32px;border-radius:18px">
          <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#f1cf74;margin-bottom:10px">ENGENIX PRIVATE ACCESS</div>
          <h1 style="font-size:28px;margin:0 0 18px">Your request is in.</h1>
          <p style="line-height:1.7;color:#b6bec9">Thank you, ${escapeHtml(name)}. We received your request and will prepare the conversation around ${escapeHtml(company)} and the priorities you shared.</p>
          <p style="line-height:1.7;color:#b6bec9">A member of the ENGENIX team will contact you shortly.</p>
          <div style="margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,.12);font-size:12px;color:#6d7583">
            ENGEN LLC d/b/a ENGENIX<br>
            Operating Intelligence for Automotive Retail
          </div>
        </div>`;

      const confirmSend = await sendEmail(env.RESEND_API_KEY, {
        from,
        to: [email],
        subject: "ENGENIX private demonstration request received",
        html: confirmationHtml
      });

      if (!confirmSend.response.ok) {
        console.error("Resend confirmation error", confirmSend.response.status, confirmSend.result);
      }
    }

    return json({ ok: true });
  } catch (error) {
    console.error("Demo request function error", error);
    return json({ ok: false, error: "Unexpected request error." }, 500);
  }
}

export function onRequestGet() {
  return json({ ok: false, error: "Method not allowed." }, 405);
}
