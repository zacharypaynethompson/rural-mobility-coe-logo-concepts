# Rural Mobility Centre of Excellence logo concepts

Plain ES modules, no packages, no build step for the page. The repo root is the GitHub Pages site.

## Commands

- `node build.js` writes every still from `mark.js` to `logos/`.
- `node test.js` checks the animation frames and the built files.
- `python3 -m http.server 8742` serves the page. Add `?t=3.2` to the URL to freeze the animation at that time.

## Rules

- Change a still in `mark.js`, then rebuild. `logos/` is output, committed.
- Change timing in `motion.js` and copy in `index.html`.
- Colours come from the palette roles in `mark.js`. `test.js` fails on any other hex.
- A new character in a lockup needs its width in `ADVANCE`.
- When `build.js` gains or loses an output, add or remove its link in `index.html`. `test.js` checks they match.
- Code carries no comments. Names and structure explain it, and the why goes in the README.

Run `node build.js && node test.js` before committing.
