const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
    });

const clean = (value, limit) => (typeof value === "string" ? value.trim().slice(0, limit) : "");
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function onRequestPost({ request, env }) {
    let input;
    try {
        input = await request.json();
    } catch {
        return json({ success: false, error: "Please submit the form again." }, 400);
    }

    if (clean(input.website, 200)) return json({ success: true });

    const name = clean(input.name, 100);
    const email = clean(input.email, 254);
    const business = clean(input.business, 120);
    const message = clean(input.message, 5000);

    if (!name || !validEmail(email) || message.length < 10) {
        return json({ success: false, error: "Please provide your name, a valid email, and a message of at least 10 characters." }, 400);
    }

    if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
        console.error("Contact form email environment variables are not configured.");
        return json({ success: false, error: "The contact form is temporarily unavailable." }, 503);
    }

    let providerResponse;
    try {
        providerResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: env.CONTACT_FROM_EMAIL,
                to: [env.CONTACT_TO_EMAIL],
                reply_to: email,
                subject: `Website inquiry from ${name}`,
                text: `Name: ${name}\nEmail: ${email}\nBusiness: ${business || "Not provided"}\n\n${message}`
            })
        });
    } catch (error) {
        console.error("Contact provider request failed.", error);
        return json({ success: false, error: "Your inquiry could not be sent right now." }, 502);
    }

    if (!providerResponse.ok) {
        console.error("Contact provider rejected the message.", providerResponse.status);
        return json({ success: false, error: "Your inquiry could not be sent right now." }, 502);
    }

    return json({ success: true }, 200);
}

export function onRequest() {
    return json({ success: false, error: "Method not allowed." }, 405);
}
