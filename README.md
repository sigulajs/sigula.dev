# sigula.dev

The official website and documentation for [**Sigula**](https://github.com/sigulajs/sigula) — a tiny
web framework with fine-grained signal reactivity and no virtual DOM.

The site is a single page built **with Sigula itself** (dogfooding): the layout, navigation,
docs, and the live demos all run on the framework it documents.

## Stack

- **[Sigula](https://github.com/sigulajs/sigula) 2.0.1** — the framework under test, used for the
  entire UI (templates, signals, bindings, control flow).
- **Vite** — dev server and production bundler.
- **TypeScript** — strict mode.
- **UnoCSS** (`presetWind4`) — utility styling, with container queries and class-based dark mode.
- **Shiki** — syntax highlighting, precompiled to HTML at build time via a custom Vite plugin
  (`?raw&shiki=<lang>`), with dual `github-light`/`github-dark` themes.

## Getting started

Requirements: Node `^24.21.0` and pnpm `^12.8.1` (see `package.json` engines).

```sh
pnpm install
pnpm dev        # start the dev server (http://localhost:5173)
pnpm build      # type-check + production build into dist/
pnpm preview    # serve the production build
```

## Project structure

```
index.html            HTML shell — just <div id="app"> and the module entry
src/
  main.ts             entry: mounts <Layout>, wires the scroll-spy and hash restore
  theme.ts            light/dark theme signal (localStorage + prefers-color-scheme)
  scroll.ts           section scroll-spy + deep-link (#hash) restore
  style.css           CSS variables, prose + inline-code styles, hljs theme
  components/         reusable views: Layout, Nav, CodeBlock, ApiTable, Badge, demos, …
  sections/           one module per docs section + the registry that drives nav + content
  snippets/           raw code samples shown in code blocks (imported with ?raw&shiki=<lang>)
public/               favicon and static assets
docs/                 design specs, plans, and reports
```

### How the page is assembled

- `src/sections/<name>.ts` each export a `SectionMeta` (`id`, `title`, `group`, optional `subs`,
  and a `render(): View`).
- `src/sections/index.ts` collects them into `sections`, derives the nav groups, and is the single
  place to add a section.
- `src/components/Layout.ts` renders the shell (header, left nav, centered content, footer,
  mobile drawer).
- `src/components/CodeBlock.ts` highlights snippets and collapses long ones.

### Demos

The live demos are real Sigula components under `src/components/demos/` (`Equation`, `Todos`) and are
shown next to their own source via Vite's `?raw` import, so the code on the page is the code that runs.

## Links

- Framework repo: <https://github.com/sigulajs/sigula>
- Framework README: <https://github.com/sigulajs/sigula/blob/main/README.md>
- Full API reference: <https://github.com/sigulajs/sigula/blob/main/Reference.md>

## License

MIT
