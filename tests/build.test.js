import test from "node:test";
import assert from "node:assert/strict";
import { access, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const requiredOutput = [
    "index.html",
    "preview.html",
    "pricing.html",
    "privacy.html",
    "terms.html",
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
