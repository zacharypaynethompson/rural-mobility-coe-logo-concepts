const SAGE = "#4F7D5C", LIGHT_SAGE = "#9CC3A6", CHARCOAL = "#2E3538", AMBER = "#E39B2D", WHITE = "#FFFFFF";

export const COLOUR = { a: SAGE, c: CHARCOAL, hl: AMBER, bg: WHITE };
const MONO = { a: WHITE, c: WHITE, hl: WHITE, bg: SAGE };
const DARK = { a: LIGHT_SAGE, c: WHITE, hl: AMBER, bg: CHARCOAL };

const THEMES = ["Community Transport", "Active Travel", "Digital Connectivity", "Accessibility", "Demand-Responsive Transport", "Research & Evaluation"];
const ART = ["community-transport", "active-travel", "digital-connectivity", "accessibility", "demand-responsive-transport", "research-evaluation"];

const theme = (i) => ({ ...COLOUR, theme: i });

function polar(r, deg, cx = 50, cy = 50) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export function svg(body, { w = 100, h = 100, bg } = {}) {
  const rect = bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${rect}${body.join("")}</svg>`;
}

const f2 = (n) => n.toFixed(2);

export const RING = { r: 21, width: 6, disc: 9.5, spoke: 4, stop: 5.5 };
export const SPOKES = [
  { deg: -58, r: 38 },
  { deg: 2, r: 41 },
  { deg: 58, r: 35.5 },
  { deg: 122, r: 40 },
  { deg: 184, r: 36.5 },
  { deg: 243, r: 41 },
];
const SMALL = { r: 20, width: 10, disc: 8, spoke: 7.5, stop: 8.5, spokes: SPOKES.map((_, k) => ({ deg: -60 + 60 * k, r: 37.5 })) };

export const REST = { ring: 1, centre: 1, reach: [1, 1, 1, 1, 1, 1], stops: [1, 1, 1, 1, 1, 1], hl: 0, trail: null };

function arc(r, frac) {
  if (frac >= 1) return { circle: true };
  const [x0, y0] = polar(r, -90), [x1, y1] = polar(r, -90 + 360 * frac);
  return { d: `M${f2(x0)},${f2(y0)} A${r},${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${f2(x1)},${f2(y1)}` };
}

function spokePath(geo, { deg, r }, reach, from = 0) {
  const [x0, y0] = polar(geo.r + (r - geo.r) * from, deg), [x1, y1] = polar(geo.r + (r - geo.r) * reach, deg);
  return `M${f2(x0)},${f2(y0)} L${f2(x1)},${f2(y1)}`;
}

export function draw(p, s = REST, geo = RING) {
  const spokes = geo.spokes ?? SPOKES, out = [];
  const hl = p.theme ?? s.hl;
  spokes.forEach((spoke, k) => {
    if (s.reach[k] <= 0) return;
    out.push(`<path id="spoke-${k}" d="${spokePath(geo, spoke, s.reach[k])}" fill="none" stroke="${p.a}" stroke-width="${geo.spoke}" stroke-linecap="round"/>`);
  });
  if (s.trail && s.trail.to > s.trail.from) {
    const { spoke, from, to } = s.trail;
    out.push(`<path id="trail" d="${spokePath(geo, spokes[spoke], to, from)}" fill="none" stroke="${p.hl}" stroke-width="${geo.spoke}" stroke-linecap="round"/>`);
  }
  spokes.forEach(({ deg, r }, k) => {
    if (s.stops[k] <= 0) return;
    const [x, y] = polar(r, deg);
    out.push(`<circle id="stop-${k}" cx="${f2(x)}" cy="${f2(y)}" r="${f2(geo.stop * s.stops[k])}" fill="${k === hl ? p.hl : p.a}"/>`);
  });
  if (s.ring > 0) {
    const a = arc(geo.r, s.ring), paint = `fill="none" stroke="${p.a}" stroke-width="${geo.width}" stroke-linecap="round"`;
    out.push(a.circle ? `<circle id="ring" cx="50" cy="50" r="${geo.r}" ${paint}/>` : `<path id="ring" d="${a.d}" ${paint}/>`);
  }
  if (s.centre > 0) out.push(p.theme === undefined ? `<circle id="centre" cx="50" cy="50" r="${f2(geo.disc * s.centre)}" fill="${p.c}"/>` : pictogram(p.theme, p));
  return out;
}

export const base = (p) => draw(p);
const small = (p) => draw(p, REST, SMALL);

const readArt = async (path) => {
  const url = new URL(path, import.meta.url);
  return typeof window === "undefined" ? (await import("node:fs")).readFileSync(url, "utf8") : await (await fetch(url)).text();
};
const PICTOGRAMS = await Promise.all(ART.map(async (name) => {
  const text = await readArt(`art/${name}.svg`);
  const inner = text.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1];
  if (!inner) throw new Error(`art/${name}.svg: no <svg> root`);
  return inner.trim().replace(/\s*\n\s*/g, "");
}));

const ART_FIT = RING.r - RING.width / 2 - 2.5;

function pictogram(i, p) {
  const k = ART_FIT / 48, t = 50 - 64 * k;
  return `<g id="${ART[i]}" data-theme="${i}" color="${p.c}" transform="translate(${f2(t)},${f2(t)}) scale(${k.toFixed(4)})">${PICTOGRAMS[i]}</g>`;
}

function tile(bg, body, { rx = 22, scale = 0.8 } = {}) {
  const pad = 50 * (1 - scale);
  return [`<rect width="100" height="100" rx="${rx}" fill="${bg}"/>`, `<g transform="translate(${f2(pad)},${f2(pad)}) scale(${scale})">${body}</g>`];
}

function adaptiveFavicon() {
  const parts = small(COLOUR).join("").replace(/ (fill|stroke)="(#[0-9A-F]{6})"/g, (_, attr, hex) => ` class="${attr}-${role(hex)}"`);
  const rule = (pal) => ["a", "c", "hl"].map((r) => `.fill-${r} { fill: ${pal[r]}; } .stroke-${r} { stroke: ${pal[r]}; }`).join(" ");
  return svg([`<style>${rule(COLOUR)} @media (prefers-color-scheme: dark) { ${rule(DARK)} }</style>`, parts]);
}
const role = (hex) => Object.keys(COLOUR).find((r) => COLOUR[r] === hex);

function icons() {
  return {
    favicon: adaptiveFavicon(),
    "favicon-light": svg(small(COLOUR)),
    "favicon-dark": svg(small(DARK)),
    "tile-white": svg(tile(WHITE, small(COLOUR).join(""))),
    "tile-sage": svg(tile(SAGE, small(MONO).join(""))),
    maskable: svg(tile(WHITE, base(COLOUR).join(""), { rx: 0, scale: 0.72 })),
    "apple-touch": svg(tile(WHITE, base(COLOUR).join(""), { rx: 0, scale: 0.78 })),
  };
}

function text(x, y, size, colour, words, weight = 700, anchor) {
  const a = anchor ? ` text-anchor="${anchor}"` : "";
  return `<text x="${x}" y="${y}" font-family="Georgia, Gelasio, serif" font-weight="${weight}" font-size="${size}" fill="${colour}"${a}>${words.replace(/&/g, "&amp;")}</text>`;
}

const CHARS = " &-,.abcdefghijklmnopqrstuvwxyzABCDEHMRST";
const ADVANCE = {
  700: [254, 799, 379, 328, 328, 596, 646, 531, 663, 572, 393, 577, 680, 354, 346, 632, 344, 1016, 690, 636, 658, 648, 520, 513, 397, 677, 567, 863, 588, 562, 525, 758, 757, 715, 834, 721, 913, 1023, 797, 649, 684],
  400: [241, 710, 374, 270, 270, 504, 560, 454, 574, 483, 325, 509, 582, 293, 292, 536, 286, 881, 591, 539, 571, 560, 410, 432, 345, 575, 497, 737, 505, 492, 444, 671, 654, 642, 749, 653, 815, 927, 702, 561, 619],
};

function em(words, weight = 700) {
  return [...words].reduce((sum, c) => {
    const k = CHARS.indexOf(c);
    if (k < 0) throw new Error(`no Georgia advance for "${c}": add it to ADVANCE in mark.js`);
    return sum + ADVANCE[weight][k];
  }, 0) / 1000;
}

const FIRST = "Rural Mobility", SECOND = "Centre of Excellence";
const STRAPLINE = "Supporting better transport for rural communities";
const X = 114;

const twoLine = (x = X, y = 46, anchor) => [text(x, y, 38, COLOUR.c, FIRST, 700, anchor), text(x, y + 36, 28, COLOUR.a, SECOND, 400, anchor)];
const NAME_W = Math.max(em(FIRST) * 38, em(SECOND, 400) * 28);

function guides() {
  const x = 4 * RING.stop, mark = base(COLOUR).join("");
  const left = 4 - x, top = 4 - x, w = X + NAME_W + x - left, h = 92 + 2 * x;
  const dash = `fill="none" stroke="${COLOUR.c}" stroke-width="1" stroke-dasharray="4 3"`;
  const legend = `<rect x="${left}" y="${top}" width="${x}" height="${x}" ${dash}/>` + text(left + x / 2, top + x / 2 + 4, 11, COLOUR.c, "x", 400, "middle");
  const body = [`<rect x="${left}" y="${top}" width="${w.toFixed(0)}" height="${h}" ${dash}/>`, legend, `<g id="mark">${mark}</g>`, ...twoLine()];
  return svg([`<g transform="translate(${30 - left},${20 - top})">${body.join("")}</g>`], { w: Math.round(w + 60), h: h + 40 });
}

function lockups() {
  const mark = `<g id="mark">${base(COLOUR).join("")}</g>`;
  const size = 26, gap = em(FIRST) + em(" ");
  const line = [mark, text(X, 59, size, COLOUR.c, FIRST), text(X + gap * size, 59, size, COLOUR.a, SECOND, 400)];
  const lineW = X + (gap + em(SECOND, 400)) * size;
  const strapW = X + Math.max(NAME_W, em(STRAPLINE, 400) * 15);
  const stackW = NAME_W + 12;
  const out = {
    "lockup-two-line": svg([mark, ...twoLine()], { w: Math.round(X + NAME_W + 12) }),
    "lockup-line": svg(line, { w: Math.round(lineW + 12) }),
    "lockup-stacked": svg([`<g id="mark" transform="translate(${f2(stackW / 2 - 50)},0)">${mark}</g>`, ...twoLine(stackW / 2, 138, "middle")], { w: Math.round(stackW), h: 184 }),
    "lockup-guides": guides(),
    "lockup-strapline": svg([mark, ...twoLine(X, 38), text(X + 1, 94, 15, COLOUR.c, STRAPLINE, 400)], { w: Math.round(strapW + 12) }),
  };
  const from = "from the Rural Mobility Centre of Excellence";
  THEMES.forEach((name, i) => {
    const m = `<g id="mark">${base(theme(i)).join("")}</g>`;
    const w = X + Math.max(em(name) * 34, em(from, 400) * 14);
    out[`theme-lockup-${i}`] = svg([m, text(X, 58, 34, COLOUR.c, name), text(X + 1, 82, 14, COLOUR.a, from, 400)], { w: Math.round(w + 12) });
  });
  return out;
}

export function outputs() {
  const out = {
    mark: svg(base(COLOUR)),
    mono: svg(base(MONO), { bg: MONO.bg }),
    "small-mark": svg(small(COLOUR)),
    "small-mono": svg(small(MONO), { bg: MONO.bg }),
  };
  THEMES.forEach((_, i) => (out[`theme-${i}`] = svg(base(theme(i)))));
  return { ...out, ...icons(), ...lockups() };
}
