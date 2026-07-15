const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyYggK-MIIaSpGqwAdh4YXuZ5DCKCQMGw6T7V-TeAME5vJKQf51qSiVA8ugah3QdsWl/exec";

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/demo") {
      if (request.method !== "POST") {
        return json(
          { ok: false, error: "Method not allowed." },
          405
        );
      }

      try {
        const body = await request.json();

        // Quietly accept bot honeypot submissions.
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
          briefing: clean(body.briefing, 120),
          challenge: clean(body.challenge, 1800),
          source: clean(body.source, 120),
          page: clean(body.page, 500),
          userAgent: clean(body.userAgent, 500),
          submittedAtClient: clean(body.submittedAtClient, 80)
        };

        if (
          !payload.name ||
          !payload.company ||
          !payload.email ||
          !payload.role ||
          !payload.challenge
        ) {
          return json(
            {
              ok: false,
              error: "Please complete all required fields."
            },
            400
          );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email)) {
          return json(
            {
              ok: false,
              error: "Please enter a valid work email."
            },
            400
          );
        }

        const form = new URLSearchParams();

        Object.entries(payload).forEach(([key, value]) => {
          form.set(key, value);
        });

        const response = await fetch(
          GOOGLE_APPS_SCRIPT_URL,
          {
            method: "POST",
            headers: {
              "content-type":
                "application/x-www-form-urlencoded;charset=UTF-8"
            },
            body: form.toString(),
            redirect: "follow"
          }
        );

        const text = await response.text();

        let result = null;

        try {
          result = JSON.parse(text);
        } catch {
          result = null;
        }

        if (!response.ok || !result || result.ok !== true) {
          console.error(
            "Google relay error",
            response.status,
            text
          );

          return json(
            {
              ok: false,
              error:
                result?.error ||
                "The request could not be delivered."
            },
            502
          );
        }

        return json({ ok: true });
      } catch (error) {
        console.error(
          "ENGENIX founding form error",
          error
        );

        return json(
          {
            ok: false,
            error: "Unexpected request error."
          },
          500
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
