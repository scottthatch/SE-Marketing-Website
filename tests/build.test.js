import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const requiredOutput = [
    "index.html",
    "preview.html",
    "pricing.html",
    "privacy.html",
    "terms.html",
    "404.html",
    "css",
    "js",
    "images",
    "assets",
    "_headers",
    "robots.txt",
    "sitemap.xml",
    "site.webmanifest"
];
const forbiddenOutput = [
    "README.md",
    "docs",
    "tests",
    "scripts",
    "package.json",
    "package-lock.json",
    "node_modules",
    ".git",
    "functions",
    ".env"
];

test("dist contains every required public route and asset group", async () => {
    const entries = await readdir(resolve("dist"));
    for (const path of requiredOutput) {
        assert.ok(entries.includes(path), `dist should contain ${path}`);
    }
});

test("dist excludes internal, generated, secret, and Function source files", async () => {
    const entries = await readdir(resolve("dist"));
    for (const path of forbiddenOutput) {
        assert.ok(!entries.includes(path), `dist should not contain ${path}`);
    }
    await access(resolve("functions/api/contact.js"));
});

test("404 page is private from search and has valid public navigation", async () => {
    const page = await readFile(resolve("dist/404.html"), "utf8");
    assert.match(page, /<title>Page Not Found \| True Partner Tech<\/title>/);
    assert.match(page, /name="robots" content="noindex,nofollow"/);
    assert.match(page, /href="\/">Return to the Homepage<\/a>/);
    assert.match(page, /href="\/pricing\.html"/);
    assert.match(page, /href="\/privacy\.html"/);
    assert.match(page, /href="\/terms\.html"/);
});

test("unknown routes are not intentionally rewritten to index.html", async () => {
    await assert.rejects(access(resolve("_redirects")));
    await assert.rejects(access(resolve("dist/_redirects")));

    const sitemap = await readFile(resolve("dist/sitemap.xml"), "utf8");
    assert.doesNotMatch(sitemap, /404\.html/);
});
