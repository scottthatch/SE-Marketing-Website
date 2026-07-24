import { access, copyFile, mkdir, readdir, readFile, rm } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";

const projectRoot = resolve(".");
const outputDirectory = resolve(projectRoot, "dist");
const publicFiles = [
    "index.html",
    "preview.html",
    "pricing.html",
    "privacy.html",
    "terms.html",
    "_headers",
    "robots.txt",
    "sitemap.xml",
    "site.webmanifest"
];
const publicDirectories = ["css", "js", "images", "assets"];
const requiredProjectFiles = [...publicFiles, ...publicDirectories, "functions/api/contact.js"];

if (basename(outputDirectory) !== "dist" || dirname(outputDirectory) !== projectRoot) {
    throw new Error(`Refusing to recreate unexpected output path: ${outputDirectory}`);
}

for (const path of requiredProjectFiles) {
    try {
        await access(resolve(projectRoot, path));
    } catch {
        throw new Error(`Required project file is missing: ${path}`);
    }
}

async function copyDirectory(source, destination) {
    await mkdir(destination, { recursive: true });
    const entries = (await readdir(source, { withFileTypes: true })).sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    for (const entry of entries) {
        if (entry.name.startsWith(".")) {
            throw new Error(`Refusing to copy dotfile from public directory: ${join(source, entry.name)}`);
        }

        const sourcePath = join(source, entry.name);
        const destinationPath = join(destination, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(sourcePath, destinationPath);
        } else if (entry.isFile()) {
            await copyFile(sourcePath, destinationPath);
        } else {
            throw new Error(`Refusing to copy non-file entry: ${sourcePath}`);
        }
    }
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory);

for (const file of publicFiles) {
    await copyFile(resolve(projectRoot, file), resolve(outputDirectory, file));
}

for (const directory of publicDirectories) {
    await copyDirectory(resolve(projectRoot, directory), resolve(outputDirectory, directory));
}

JSON.parse(await readFile(resolve(outputDirectory, "site.webmanifest"), "utf8"));

const sitemap = await readFile(resolve(outputDirectory, "sitemap.xml"), "utf8");
if (
    !sitemap.includes("<urlset") ||
    !sitemap.includes("https://truepartnertech.com/") ||
    !sitemap.includes("https://truepartnertech.com/pricing.html")
) {
    throw new Error("Built sitemap.xml is missing required production URLs.");
}

const outputFiles = [];
async function listOutput(directory) {
    const entries = (await readdir(directory, { withFileTypes: true })).sort((a, b) =>
        a.name.localeCompare(b.name)
    );
    for (const entry of entries) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) await listOutput(path);
        else outputFiles.push(relative(outputDirectory, path).replaceAll("\\", "/"));
    }
}
await listOutput(outputDirectory);

console.log(`Static production build created dist with ${outputFiles.length} public files.`);
