export async function onRequestPost(context) {
  try {
    const request = context.request;
    const type = request.headers.get("content-type") || "";
    const data = type.includes("application/json") ? await request.json() : Object.fromEntries((await request.formData()).entries());
    if (data.website) return Response.json({ ok: true });
    const required = ["firstName", "lastName", "email", "title", "company", "consent"];
    if (required.some((key) => !String(data[key] || "").trim())) return Response.json({ ok: false, error: "Please complete all required fields." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) return Response.json({ ok: false, error: "Please enter a valid work email." }, { status: 400 });
    if (!context.env.RESEND_API_KEY || !context.env.DEMO_TO_EMAIL) return Response.json({ ok: false, error: "Demo delivery is not configured yet. Email demo@engenix.co directly." }, { status: 503 });
    const fields = Object.entries(data).filter(([k]) => !["website","consent"].includes(k)).map(([k,v]) => `<tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>${escapeHtml(k)}</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(String(v || ""))}</td></tr>`).join("");
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${context.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: context.env.DEMO_FROM_EMAIL || "ENGENIX Website <demo@engenix.co>", to: [context.env.DEMO_TO_EMAIL], reply_to: data.email, subject: `Private demo request: ${data.company}`, html: `<h1>New ENGENIX demo request</h1><table style="border-collapse:collapse">${fields}</table>` }) });
    if (!response.ok) throw new Error(await response.text());
    return Response.json({ ok: true });
  } catch (error) { console.error(error); return Response.json({ ok: false, error: "We could not send your request. Please email demo@engenix.co." }, { status: 500 }); }
}
function escapeHtml(value) { return value.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
