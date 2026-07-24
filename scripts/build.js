import { access, readFile } from "node:fs/promises";

const required = [
    "index.html",
    "pricing.html",
    "preview.html",
    "privacy.html",
    "terms.html",
    "css/styles.css",
    "js/script.js",
    "functions/api/contact.js",
    "assets/favicon.svg",
    "robots.txt",
    "sitemap.xml",
    "site.webmanifest",
    "_headers"
];

for (const file of required) await access(file);
JSON.parse(await readFile("site.webmanifest", "utf8"));

const sitemap = await readFile("sitemap.xml", "utf8");
if (
    !sitemap.includes("<urlset") ||
    !sitemap.includes("https://truepartnertech.com/") ||
    !sitemap.includes("https://truepartnertech.com/pricing.html")
) {
    throw new Error("sitemap.xml is missing required production URLs.");
}

console.log(`Static production build validated (${required.length} required files).`);
