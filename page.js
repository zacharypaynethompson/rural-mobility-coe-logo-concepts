import { COLOUR, draw } from "./mark.js";
import { DESTINATIONS, WHOLE } from "./motion.js";

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FROZEN = new URLSearchParams(location.search).get("t");

const stage = document.getElementById("journey");
const caption = document.getElementById("destination");
const buttons = [...document.querySelectorAll("#destinations button")];

function show(s, name) {
  stage.innerHTML = draw(COLOUR, s).join("");
  caption.textContent = name ?? " ";
  buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.textContent === name)));
}

let raf = null;
function play(anim, name = (t) => anim.caption?.(t)) {
  cancelAnimationFrame(raf);
  if (REDUCED) return show(anim.at(anim.duration), null);
  let start = null;
  const frame = (now) => {
    start ??= now;
    const t = Math.min((now - start) / 1000, anim.duration);
    show(anim.at(t), t < anim.duration ? name(t) : null);
    raf = t < anim.duration ? requestAnimationFrame(frame) : null;
  };
  raf = requestAnimationFrame(frame);
}

if (FROZEN !== null) {
  const t = Number(FROZEN);
  show(WHOLE.at(t), WHOLE.caption(t));
} else {
  show(WHOLE.at(REDUCED ? WHOLE.duration : 0), null);
  new IntersectionObserver((entries, observer) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      play(WHOLE);
    }
  }, { threshold: 0.5 }).observe(stage);
  document.getElementById("replay").addEventListener("click", () => play(WHOLE));
  buttons.forEach((b) => {
    const destination = DESTINATIONS.find((s) => s.name === b.textContent);
    b.addEventListener("click", () => play(destination, () => destination.name));
  });
}
