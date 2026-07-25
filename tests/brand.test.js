import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const publicFiles = ["index.html", "pricing.html", "preview.html", "privacy.html", "terms.html"];
const headerFiles = [...publicFiles, "404.html"];

function relativeLuminance(hex) {
    const channels = hex.match(/[a-f\d]{2}/gi).map((channel) => Number.parseInt(channel, 16) / 255);
    const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2]);
}

function contrastRatio(foreground, background) {
    const foregroundLuminance = relativeLuminance(foreground);
    const backgroundLuminance = relativeLuminance(background);
    const lighter = Math.max(foregroundLuminance, backgroundLuminance);
    const darker = Math.min(foregroundLuminance, backgroundLuminance);
    return (lighter + 0.05) / (darker + 0.05);
}

test("eyebrow text uses AA colors on light and dark sections", async () => {
    const styles = await readFile("css/styles.css", "utf8");
    assert.match(styles, /\.eyebrow\s*{\s*color: var\(--navy\);/);
    assert.match(styles, /\.plan-card \.eyebrow\s*{\s*color: var\(--navy\);/);
    assert.match(styles, /\.hero \.eyebrow,[\s\S]*\.preview-cta \.eyebrow\s*{\s*color: var\(--white\);/);
    assert.ok(contrastRatio("#12345a", "#e9f4ff") >= 4.5);
    assert.ok(contrastRatio("#12345a", "#ffffff") >= 4.5);
    assert.ok(contrastRatio("#ffffff", "#1e6aa8") >= 4.5);
    assert.ok(contrastRatio("#ffe4a3", "#0f2744") >= 4.5);
    assert.ok(contrastRatio("#dca640", "#ffffff") < 4.5);
    assert.ok(contrastRatio("#dca640", "#e9f4ff") < 4.5);
});

test("public headers use the connection mark without a lettermark", async () => {
    for (const file of headerFiles) {
        const page = await readFile(file, "utf8");
        assert.match(page, /class="brand-mark"[^>]*>.*class="brand-symbol"/, `${file} should use the brand symbol`);
        assert.match(page, /<span>True Partner Tech<\/span>/, `${file} should preserve the full header name`);
        assert.doesNotMatch(page, /class="brand-mark"[^>]*>\s*TP\s*</, `${file} should not use the TP lettermark`);
    }

    const favicon = await readFile("assets/favicon.svg", "utf8");
    assert.match(favicon, /<path /);
    assert.doesNotMatch(favicon, /<text|>TP</);
});

test("public pages use the new brand, domain, and email", async () => {
    const pages = await Promise.all(publicFiles.map((file) => readFile(file, "utf8")));
    const combined = pages.join("\n");
    assert.match(combined, /True Partner Tech/);
    assert.match(combined, /https:\/\/truepartnertech\.com/);
    assert.match(combined, /hello@truepartnertech\.com/);
    assert.doesNotMatch(combined, /semarketingconsulting\.com/i);
    assert.doesNotMatch(combined, /semarketing\.consulting@gmail\.com/i);
    assert.doesNotMatch(combined, />SE Marketing(?: Consulting)?</i);
});

test("each public page has an apex-domain canonical URL", async () => {
    for (const file of publicFiles) {
        const page = await readFile(file, "utf8");
        assert.match(page, /rel="canonical" href="https:\/\/truepartnertech\.com(?:\/|\/[^"]+)"/);
    }
});

test("pricing is discoverable and contains the approved service paths", async () => {
    const pages = await Promise.all(publicFiles.map((file) => readFile(file, "utf8")));
    for (const [index, page] of pages.entries()) {
        assert.match(page, /href="\/pricing\.html"/, `${publicFiles[index]} should link to pricing`);
    }

    const pricing = await readFile("pricing.html", "utf8");
    const sitemap = await readFile("sitemap.xml", "utf8");
    assert.match(sitemap, /https:\/\/truepartnertech\.com\/pricing\.html/);
    assert.match(pricing, /Website Rental/);
    assert.match(pricing, /Website Ownership/);
    assert.match(pricing, /Business Growth and Automation/);
    assert.match(pricing, /Request a Custom Quote/);
    assert.match(pricing, /Ask About Website Rental/);
});

test("rental and True Partner promises use approved, qualified language", async () => {
    const homepage = await readFile("index.html", "utf8");
    const pricing = await readFile("pricing.html", "utf8");
    const combined = `${homepage}\n${pricing}`;
    assert.match(homepage, /The True Partner promise/);
    assert.match(homepage, /A technology partner who stays involved/);
    assert.match(combined, /lower upfront/i);
    assert.match(combined, /predictable monthly/i);
    assert.match(combined, /reasonable-update limits/i);
    assert.match(combined, /written agreement/i);
});

test("plans contain no unapproved dollar pricing or unsupported AI claims", async () => {
    const pricing = await readFile("pricing.html", "utf8");
    assert.doesNotMatch(pricing, /\$\s*\d|\d+\s*(?:dollars|\/\s*month|per month)/i);
    assert.doesNotMatch(pricing, /fully autonomous|replace(?:s|ment of)? employees|guaranteed (?:revenue|rankings|leads|uptime)|no human (?:review|oversight)/i);
    assert.match(pricing, /human oversight/);
    assert.match(pricing, /custom implementation/i);
});

test("legal disclosures use public-facing brand language without implying a DBA", async () => {
    const privacy = await readFile("privacy.html", "utf8");
    const terms = await readFile("terms.html", "utf8");
    const homepage = await readFile("index.html", "utf8");
    const combined = `${privacy}\n${terms}\n${homepage}`;

    assert.match(privacy, /operating under the public-facing brand True Partner Tech/);
    assert.match(terms, /under the public-facing brand True Partner Tech/);
    assert.match(homepage, /public-facing brand of SE Marketing Consulting LLC/);
    assert.doesNotMatch(combined, /doing business|doing business publicly|public brand of/i);
});

test("terms preserve customer and third-party intellectual property exclusions", async () => {
    const terms = await readFile("terms.html", "utf8");
    for (const phrase of [
        "third-party software",
        "open-source components",
        "fonts",
        "stock images or licensed media",
        "plugins or integrations",
        "domain registrations",
        "third-party subscriptions",
        "customer-provided text, logos, photographs, trademarks"
    ]) {
        assert.match(terms, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    }
});

test("client code only shows success after an affirmative server response", async () => {
    const script = await readFile("js/script.js", "utf8");
    assert.match(script, /!response\.ok \|\| result\.success !== true/);
    assert.match(script, /dataset\.state = "error"/);
});
