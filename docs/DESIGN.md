# Frontend design system

"Ink and red stamp": a flat, compact, square-cornered reading UI in the spirit of Wikipedia and the movie/anime/manga wikis (dense tables, hairline rules, text-first navigation). Tokens live in `src/app/globals.css`. Replaces the earlier blue, rounded "modernised Wikipedia" look (issue #3).

| Aspect     | Decision                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Language   | UI text is Mongolian (`<html lang="mn">`). Strings live next to their components; shared ones in `lib/todo-ui.ts`, `lib/validation.ts`, `server/*`     |
| Branding   | Title "Вектор календар", subtitle "Ажлын төлөвлөгөө, явцын хяналтын самбар" (top bar, login, page `<title>`)                                           |
| Type       | IBM Plex Sans only (`latin` + `cyrillic` subsets, 400/500/600). 14px base, 1.5 line height. Headings are semibold: h1 1.3rem, h2 1.05rem, h3 0.95rem   |
| Palette    | Neutral paper `#f6f6f5`, ink `#1e1e1c`, single accent crimson `#9c2233` (links `#8a1c2b`), hairline rules `#b5b3ad`. No blue hues anywhere             |
| Dark mode  | `.dark` class (not wired to a toggle yet): `#161615` page, `#e6e4e0` text, accent `#d4515f`, links `#e8808b`, `color-scheme: dark`                     |
| Status     | TODO grey, IN_PROGRESS amber, DONE green, CANCELLED plum; shown as outlined square badges and as Gantt bar fills                                       |
| Surfaces   | No cards, no shadows, no fills: navigation and content sit directly on the page; the only structure is 1px rules and an infobox outline on todo detail |
| Radius     | All radius tokens are 1-2px; no pills or circles (category dots are squares). Gantt chrome is flattened in `globals.css`                               |
| Navigation | Plain text links in a left column (top row on mobile); the active link has a 2px crimson left border and semibold text                                 |
| Tables     | No outer border, no zebra; muted small header with a rule, row rules, faint hover tint, 1.5 / 2 spacing units of padding                               |
| Controls   | 28px high (`h-7`), 2px radius, primary button is solid crimson, destructive is outlined                                                                |
| Dates      | `YYYY-MM-DD` everywhere (compact, unambiguous)                                                                                                         |

Known limitation: frappe-gantt formats month names through `Intl` with `language: "mn"`; browsers without Mongolian locale data (e.g. the headless Chromium used for screenshots) fall back to English month names.
