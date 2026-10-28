import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { outputs } from "./mark.js";

const DIR = new URL("logos/", import.meta.url);

rmSync(DIR, { recursive: true, force: true });
mkdirSync(DIR);
const files = Object.entries(outputs());
for (const [name, content] of files) writeFileSync(new URL(`${name}.svg`, DIR), content);
console.log(`wrote ${files.length} files to logos/`);
