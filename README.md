# Rural Mobility Centre of Excellence logo concepts

Unofficial logo concepts for the [Rural Mobility Centre of Excellence](#sources), set up by Transport East. They show how a brand kit can be built in plain JavaScript, with no packages and no build step for the page. They aren't the Centre's branding and haven't been endorsed by Transport East.

Site: https://zacharypaynethompson.github.io/rural-mobility-coe-logo-concepts/

## Run

- `node build.js` writes every still to `logos/`.
- `node test.js` checks the animation and the built files.
- `python3 -m http.server 8742` serves the page. Add `?t=3.2` to the URL to freeze the animation at that time.

## Files

- `mark.js` draws every still as an SVG string, and `build.js` writes them to `logos/`.
- `motion.js` holds the animation's timing and has no DOM, so `test.js` can run it in Node.
- `page.js` draws the animation's frames, and `slides.js` shows the page one section at a time.
- `art/` holds the six placeholder pictograms.

## Sources

The themes, strapline and destinations come from the Centre's own material:

- [Rural Mobility Centre of Excellence](https://web.archive.org/web/20260817194210/https://www.transporteast.gov.uk/rural-transport-old-2/rural-mobility-centre-of-excellence/), Transport East (archived 17 August 2026). Its purpose, areas of activity and the heading "Supporting better transport for rural communities".
- [Rural Mobility Centre of Excellence slides](https://www.transporteast.gov.uk/wp-content/uploads/01-Rural-Centre-of-Excellence.pdf), Transport East (2024). The high-level themes, e.g., community transport, active travel, digital connectivity and accessibility, and "access to vital services - medical appointments, shops, education and work".
- [Future of Transport: supporting rural transport innovation](https://www.gov.uk/government/publications/future-of-transport-supporting-rural-transport-innovation), Department for Transport (October 2023), p56, on Transport East setting up the Centre.

## Licence

Code is [MIT](LICENSE). The logos in `logos/` and the pictograms in `art/` are [CC BY 4.0](LICENSE-ART).
