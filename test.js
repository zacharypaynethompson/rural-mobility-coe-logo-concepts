import { readdirSync, readFileSync } from "node:fs";
import { COLOUR, REST, RING, SPOKES, base, draw } from "./mark.js";
import { DRAW, DESTINATIONS, WHOLE } from "./motion.js";

let failed = 0;
const fail = (msg) => (failed++, console.log("FAIL", msg));

function unbalanced(text) {
  const tags = text.replace(/<[^>]*\/>/g, "").match(/<\/?[a-zA-Z][^>]*>/g) ?? [];
  const open = [];
  for (const tag of tags) {
    const name = tag.match(/<\/?([a-zA-Z]+)/)[1];
    if (tag[1] !== "/") open.push(name);
    else if (open.pop() !== name) return `</${name}> closes the wrong tag`;
  }
  return open.length ? `<${open.join(">, <")}> left open` : null;
}

const PALETTE = new Set(Object.values(COLOUR));
const STILL = base(COLOUR).join("");
const ringEdge = RING.r + RING.width / 2;
let frames = 0;
function check(name, anim, at = (t) => anim.at(t)) {
  for (let t = 0; t <= anim.duration + 1e-9; t += 0.02, frames++) {
    const s = at(t), frame = draw(COLOUR, s).join(""), where = `${name} at ${t.toFixed(2)}s`;
    const problem = unbalanced(frame);
    if (problem) fail(`${where}: ${problem}`);
    if (/NaN|Infinity/.test(frame)) fail(`${where}: a number isn't finite`);
    for (const c of frame.match(/#[0-9A-Fa-f]{6}\b/g) ?? []) if (!PALETTE.has(c)) fail(`${where}: ${c} isn't a palette colour`);
    const ids = frame.match(/ id="[^"]*"/g) ?? [];
    if (new Set(ids).size !== ids.length) fail(`${where}: an id is used twice`);
    SPOKES.forEach(({ r }, k) => {
      if (r - RING.stop * s.stops[k] <= ringEdge) fail(`${where}: stop ${k} reaches the ring`);
    });
  }
  if (draw(COLOUR, at(anim.duration)).join("") !== STILL) fail(`${name} doesn't end on the still mark`);
}
check("drawing", DRAW);
if (draw(COLOUR, DRAW.at(0)).join("") !== "") fail("the drawing doesn't start from nothing");
for (const destination of DESTINATIONS) check(destination.name, destination);
check("whole", WHOLE);
const shown = new Set(Array.from({ length: 1000 }, (_, k) => WHOLE.caption((k / 1000) * WHOLE.duration)).filter(Boolean));
if (shown.size !== DESTINATIONS.length) fail(`the whole animation captions ${shown.size} destinations, not ${DESTINATIONS.length}`);
console.log(`animation: ${frames} frames checked, ${WHOLE.duration.toFixed(1)}s in all`);
if (REST.hl !== 0) fail("the amber stop at rest should be the first spoke, 0");

const DIR = new URL("logos/", import.meta.url);
const files = readdirSync(DIR);
for (const f of files) {
  const problem = unbalanced(readFileSync(new URL(f, DIR), "utf8"));
  if (problem) fail(`${f}: ${problem}`);
}
console.log(`logos: ${files.length} files checked`);

const linked = new Set(readFileSync(new URL("index.html", import.meta.url), "utf8").match(/logos\/[\w-]+\.svg/g).map((s) => s.slice(6)));
for (const f of linked) if (!files.includes(f)) fail(`index.html links logos/${f}, which build.js doesn't write`);
for (const f of files) if (!linked.has(f)) fail(`index.html doesn't link logos/${f}`);

if (failed) process.exit(1);
