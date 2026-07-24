import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/contact.js";

const request = (body) =>
    new Request("https://truepartnertech.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

const validBody = {
    name: "Jamie Owner",
    email: "jamie@example.com",
    business: "Main Street Services",
    message: "I would like to discuss a new website.",
    website: ""
};

const env = {
    RESEND_API_KEY: "test-key",
    CONTACT_TO_EMAIL: "hello@truepartnertech.com",
    CONTACT_FROM_EMAIL: "True Partner Tech <website@truepartnertech.com>"
};

test("successful provider delivery reports success", async (t) => {
    t.mock.method(globalThis, "fetch", async () => new Response("{}", { status: 200 }));
    const response = await onRequestPost({ request: request(validBody), env });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true });
});

test("provider failure never reports success", async (t) => {
    t.mock.method(globalThis, "fetch", async () => new Response("rejected", { status: 500 }));
    const response = await onRequestPost({ request: request(validBody), env });
    assert.equal(response.status, 502);
    assert.equal((await response.json()).success, false);
});

test("network failure never reports success", async (t) => {
    t.mock.method(globalThis, "fetch", async () => {
        throw new Error("network unavailable");
    });
    const response = await onRequestPost({ request: request(validBody), env });
    assert.equal(response.status, 502);
    assert.equal((await response.json()).success, false);
});

test("invalid submissions are rejected before delivery", async (t) => {
    const provider = t.mock.method(globalThis, "fetch", async () => new Response("{}", { status: 200 }));
    const response = await onRequestPost({ request: request({ ...validBody, email: "bad" }), env });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).success, false);
    assert.equal(provider.mock.callCount(), 0);
});

test("missing configuration reports a service error", async () => {
    const response = await onRequestPost({ request: request(validBody), env: {} });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).success, false);
});
