import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const outputRoot = resolve("dist");
const pages = ["index.html", "pricing.html", "preview.html", "privacy.html", "terms.html"];
const failures = [];

for (const page of pages) {
    const pagePath = resolve(outputRoot, page);
    const html = await readFile(pagePath, "utf8");
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
    const references = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

    for (const reference of references) {
        if (/^(?:https?:|mailto:|data:)/.test(reference) || reference === "/api/contact") continue;
        const [pathname, fragment] = reference.split("#");
        if (!pathname && fragment && !ids.has(fragment)) {
            failures.push(`${page}: missing fragment #${fragment}`);
            continue;
        }
        if (!pathname) continue;

        const normalized = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
        try {
            await access(resolve(dirname(pagePath), normalized));
        } catch {
            failures.push(`${page}: missing built target ${reference}`);
        }
    }
}

if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
}

console.log(`Built link and asset checks passed for ${pages.length} public pages in dist.`);
