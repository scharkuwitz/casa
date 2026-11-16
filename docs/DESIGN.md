# Frontend design system

Modeled on **Wikipedia (Vector-style) only**, with a modern finish rather than a pixel copy. Tokens live in `src/app/globals.css`. (MyAnimeList and Fandom references were dropped on 2026-11-16.)

| Aspect       | Decision                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout       | Sticky white top bar (serif wordmark, user, sign out); left "Navigation" sidebar; content as an article card. Sidebar becomes a top row below `md` |
| Headings     | Source Serif 4; h1/h2 regular weight with a 1px bottom rule (`--rule`); h3/h4 Inter semibold                                                       |
| Body / UI    | Inter, 15px base, line-height 1.65                                                                                                                 |
| Links        | Wikipedia blue `#3366cc` (dark `#88a3e8`), underline on hover only                                                                                 |
| Page tabs    | Wikipedia "Article / Talk" style underline tabs (List / Gantt), action link on the right                                                           |
| Infobox      | Right-hand `--infobox` panel with tinted title row and label/value rows for todo metadata; stacks under content on mobile                          |
| Tables       | Rounded bordered wrapper (`overflow-x-auto`), muted header row, zebra rows, hover tint                                                             |
| Modern touch | 8px radius (cards 12px), soft card shadow (`--shadow-card`), pill status badges, soft off-white page behind white content card                     |
| Dark mode    | Wikipedia night palette (`#101418` page, `#151a20` cards, `#eaecf0` text), `.dark` class, no shadows                                               |
| Status       | TODO gray, IN_PROGRESS blue, DONE green, CANCELLED red; tinted pill badges (`bg-status-*/12`) and Gantt bars                                       |

Status: first applied 2026-11-16; `src/app/(app)/design-preview/page.tsx` is a temporary static preview (delete once approved).
