import { REST } from "./mark.js";

const clamp = (t) => Math.min(1, Math.max(0, t));

const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  out: (t) => 1 - (1 - t) ** 3,
  back: (t) => 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2,
};

export const span = (t, a, b, e = ease.inOut) => e(clamp((t - a) / (b - a)));

const bump = (t, a, b) => Math.sin(clamp((t - a) / (b - a)) * Math.PI);

const RING_TIME = 0.6, SPOKE_START = 0.7, STAGGER = 0.12, SPOKE_TIME = 0.45, STOP_TIME = 0.25;
const COUNT = REST.reach.length;
const spokeStart = (k) => SPOKE_START + STAGGER * k;

export const DRAW = {
  duration: spokeStart(COUNT - 1) + SPOKE_TIME + STOP_TIME,
  at(t) {
    return {
      ...REST,
      ring: span(t, 0, RING_TIME),
      centre: span(t, 0.4, 0.75, ease.back),
      reach: REST.reach.map((_, k) => span(t, spokeStart(k), spokeStart(k) + SPOKE_TIME, ease.out)),
      stops: REST.stops.map((_, k) => span(t, spokeStart(k) + SPOKE_TIME, spokeStart(k) + SPOKE_TIME + STOP_TIME, ease.back)),
    };
  },
};

const BEAT = 1.6, PULSE = 0.35;

function beat(name, spoke) {
  return {
    name,
    spoke,
    duration: BEAT,
    at(u, before = REST.hl, alone = true) {
      if (alone && u >= BEAT) return REST;
      const to = span(u, 0, 0.5), from = span(u, 0.85, 1.25);
      const arrived = u >= 0.5;
      const stops = REST.stops.map((s, k) => (k === spoke ? s + 0.35 * bump(u, 0.5, 0.5 + PULSE) : s));
      return { ...REST, stops, hl: arrived ? spoke : before, trail: from < 1 ? { spoke, from, to } : null };
    },
  };
}

export const DESTINATIONS = [beat("Health", 1), beat("Education", 2), beat("Retail", 4), beat("Employment", 5)];

const REST_TIME = 0.6;
const beatStart = (j) => DRAW.duration + REST_TIME + BEAT * j;

export const WHOLE = {
  duration: beatStart(DESTINATIONS.length) + REST_TIME,
  at(t) {
    if (t < DRAW.duration) return DRAW.at(t);
    const j = Math.floor((t - beatStart(0)) / BEAT);
    if (j < 0 || j >= DESTINATIONS.length) return REST;
    return DESTINATIONS[j].at(t - beatStart(j), j ? DESTINATIONS[j - 1].spoke : REST.hl, false);
  },
  caption(t) {
    const j = Math.floor((t - beatStart(0)) / BEAT);
    return j >= 0 && j < DESTINATIONS.length ? DESTINATIONS[j].name : null;
  },
};
