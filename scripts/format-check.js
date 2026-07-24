import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

const roots = [".", "css", "js", "functions", "tests", "scripts", "docs"];
const extensions = new Set([".html", ".css", ".js", ".json", ".md", ".txt", ".xml"]);
const files = [];

for (const root of roots) {
    for (const entry of await readdir(root, { withFileTypes: true })) {
        if (entry.isFile() && extensions.has(extname(entry.name))) files.push(join(root, entry.name));
    }
}

const problems = [];
for (const file of files) {
    const content = await readFile(file, "utf8");
    if (!content.endsWith("\n")) problems.push(`${file}: missing final newline`);
    content.split("\n").forEach((line, index) => {
        if (/[ \t]+$/.test(line)) problems.push(`${file}:${index + 1}: trailing whitespace`);
        if (line.includes("\t")) problems.push(`${file}:${index + 1}: tab character`);
    });
}

if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
}

console.log(`Formatting checks passed for ${files.length} text files.`);
