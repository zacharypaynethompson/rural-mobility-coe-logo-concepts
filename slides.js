const slides = Array.from(document.querySelectorAll("section.slide"));
const ids = slides.map((s) => s.id);
document.documentElement.classList.add("deck");

const bar = document.createElement("nav");
bar.className = "deck-nav";
bar.setAttribute("aria-label", "Slides");
bar.innerHTML = [
  `<button type="button" data-step="-1" aria-label="Previous slide">&larr;</button>`,
  ...slides.map((s) => `<a class="title" href="#${s.id}">${s.dataset.title}</a>`),
  `<span class="count"></span>`,
  `<button type="button" data-step="1" aria-label="Next slide">&rarr;</button>`,
].join("");
document.body.append(bar);

const links = Array.from(bar.querySelectorAll("a.title"));
const [back, forward] = bar.querySelectorAll("button");
const count = bar.querySelector(".count");

const index = () => Math.max(0, ids.indexOf(location.hash.slice(1)));
const move = (k) => {
  location.hash = ids[Math.min(ids.length - 1, Math.max(0, k))];
};

let shown = null;
function show() {
  const k = index();
  slides.forEach((s, j) => s.classList.toggle("current", j === k));
  links.forEach((a, j) => {
    if (j === k) a.setAttribute("aria-current", "step");
    else a.removeAttribute("aria-current");
  });
  count.textContent = `${k + 1} / ${slides.length}`;
  back.disabled = k === 0;
  forward.disabled = k === slides.length - 1;
  if (shown !== null && shown !== k) {
    slides[k].tabIndex = -1;
    slides[k].focus({ preventScroll: true });
  }
  shown = k;
}

bar.addEventListener("click", (e) => {
  const step = e.target.closest("[data-step]");
  if (step) move(index() + Number(step.dataset.step));
});
addEventListener("hashchange", show);
show();

const STEPS = { ArrowRight: 1, PageDown: 1, ArrowLeft: -1, PageUp: -1 };
addEventListener("keydown", (e) => {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key in STEPS) move(index() + STEPS[e.key]);
  else if (e.key === "Home") move(0);
  else if (e.key === "End") move(slides.length - 1);
  else return;
  e.preventDefault();
});

let swipe = null;
addEventListener("touchstart", (e) => {
  const [t] = e.touches;
  swipe = e.touches.length > 1 || e.target.closest("a, button") ? null : { x: t.clientX, y: t.clientY };
}, { passive: true });
addEventListener("touchend", (e) => {
  if (!swipe) return;
  const [t] = e.changedTouches;
  const dx = t.clientX - swipe.x, dy = t.clientY - swipe.y;
  swipe = null;
  if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy)) move(index() + Math.sign(-dx));
}, { passive: true });
