# sigula.dev — Site Design Spec

**Date:** 2026-10-04
**Status:** Approved

## Goal

Build the `sigula.dev` site as a single-page marketing + documentation page for the
Sigula web framework, rendered entirely with Sigula itself (dogfooding) and styled
with UnoCSS. Content is derived from the Sigula README.

## Scope

- Single page: a landing hero followed by the full API/reference documentation.
- Built with Sigula's own API (`html`, `text`, `view`, `repeat`, `patch`, `compute`, `sig`, `render`).
- Live interactive demos: the README Equation calculator (hero) and Todos app (Control flow).
- Light + dark theme, purple accent (`#aa3bff`), responsive three-column layout.
- Syntax-highlighted code samples via highlight.js.

Out of scope: multi-page/hash routing, search, i18n, test framework, deployment config.

## Layout

Three-column shell preserved from the existing `index.html`, rendered by Sigula:

- **Header** (sticky): logo mark + "sigula" wordmark, version badge, `~4.0KB` badge,
  GitHub link, light/dark toggle.
- **Left nav** (`w-56`, hidden below `@3xl`): grouped links to every section, sticky.
  Active section highlighted by scroll-spy. Below `@3xl`, a hamburger opens a slide-over nav.
- **Center main** (`min-w-0 flex-1`): hero + all documentation sections.
- **Right TOC** (`w-64`, hidden below `@5xl`): "On this page" heading list for the section in view.
- **Footer**: MIT license, GitHub link, author.

`index.html` is reduced to `<div id="app"></div>` and the module script; the shell is
built in Sigula.

## Content

Sections, in order, each with a nav entry:

1. **Hero** — name, tagline ("Tiny web framework with fine-grained signal reactivity"),
   install command with copy button, primary CTAs, live Equation demo.
2. **Features** — card grid from the README feature list.
3. **Quick Start** — full Equation code sample + run instructions.
4. **Core Concepts** — fine-grained updates (live counter mini-demo), declarative signal
   sources + precise bindings, no virtual DOM, minimal HTML templates, ultra small.
5. **Reactivity** — `sig`, `Sig<T>`, `DerivedSig<T>`, `compute`, `isEqual`, `Equatable`,
   `createBind`/`removeBind`.
6. **Templates** — `html`, `text`, `View`/`AnyView`, `replaceWithView`.
7. **DOM bindings** — `patch`, `id`, `val`, `attr`, `style`, `styleProperty`,
   `toggleClass`, `toggleClasses`, `act`, `on`, patch types.
8. **Control flow** — `view`, `repeat`, plus live Todos demo.
9. **Rendering** — `render`.
10. **Low-level API** — `Boundary`, `toBoundary`, `walkBoundary`, `removeBoundary`,
    `replaceWithNode`, `Cmd`/`AnyCmd`/`CmdContext`.
11. **Errors** — code table (`E1`–`E12`).
12. **Reactivity model** — batched/coalesced list.
13. **Footer** — MIT LICENSE, GitHub, author.

API tables and signatures are reproduced from the README.

## File Structure

```
src/
  main.ts                 entry: import styles, render(Layout(), #app)
  theme.ts                theme signal + apply/persist (localStorage + prefers-color-scheme)
  components/
    Layout.ts             header + 3-col shell + footer + mobile nav
    Nav.ts                left nav, scroll-spy active state
    Toc.ts                right "on this page" list
    CodeBlock.ts          highlight.js wrapper (pre/code)
    ApiTable.ts           generic props/signature table
    ApiEntry.ts           name + signature + description + optional table
    Callout.ts            note/warning box
    Badge.ts              small pill
    CopyButton.ts         copies install/snippet text
    demos/Equation.ts     live Equation demo
    demos/Todos.ts        live Todos demo
  sections/
    index.ts              registry: {id, title, group, render}
    hero.ts features.ts quickstart.ts core.ts reactivity.ts templates.ts
    bindings.ts controlflow.ts rendering.ts lowlevel.ts errors.ts model.ts
  style.css               existing vars + .prose prose styles + hljs token theme
```

`main.ts` composes nav and content by iterating the section registry in
`sections/index.ts`. Adding a section is one file plus one registry entry.

## Reactivity & Data Flow

Signals owned by the shell:

- `theme: Sig<'light' | 'dark'>` — drives the `dark` class on `<html>` and persists to `localStorage`.
- `activeSection: Sig<string>` — updated by the scroll-spy, drives nav + TOC highlight.
- `mobileNavOpen: Sig<boolean>` — controls the slide-over.
- `copied: Sig<boolean>` (or per-button) — transient copy feedback.

Scroll-spy: one `IntersectionObserver` observes every section heading and calls
`activeSection.update(id)`. Nav/TOC items highlight via `patch(toggleClass(compute(...), ...))`
or `view(activeSection, ...)`.

Demos own their local signals, matching the README:

- Equation: `x`, `y` writable signals; `compute` for sum/diff/product/quotient/squares.
- Todos: `input`, `todos`, `filter`; `compute` for visibleTodos/isEmpty; `repeat` for the list.

Static documentation content uses `html`/`text`/`repeat`; code samples render through `CodeBlock`.

## Styling

- Import `src/style.css` (currently unused) alongside `virtual:uno.css` in `main.ts`.
- Reuse the existing CSS variables and light/dark palette; accent `#aa3bff`.
- Set `dark` class on `<html>` so UnoCSS `dark:` variants and `presetWind4` (`dark: 'class'`) apply.
  Default follows `prefers-color-scheme`; the toggle persists the user's choice.
- Add a `.prose` block in `style.css` for headings, paragraphs, links, inline code, lists,
  tables, and callouts.
- Add custom `hljs-*` token colors driven by the same CSS variables so highlighting matches
  both themes, avoiding importing two highlight.js theme stylesheets.
- Responsive behavior via the existing container queries and `@3xl`/`@5xl` breakpoints.
- Existing demo assets: `src/assets/` (hero.png, typescript.svg, vite.svg) may be used where
  appropriate; `public/icons.svg` supplies the GitHub/social symbols.

## Errors & Edge Cases

- Loading with a `#hash` scrolls to the target section after mount.
- `navigator.clipboard` unavailable → copy falls back gracefully (e.g. select text or no-op)
  and the "copied" state resets after a short delay.
- highlight.js unknown/absent language → `plaintext`, never throws.
- `localStorage` blocked → fall back to system preference.
- No `IntersectionObserver` → anchors still work, only active highlighting is absent.

## Verification

- `pnpm build` (`tsc && vite build`) passes with no type errors.
- Manual check against Vite at `http://localhost:5173`: nav anchors, scroll-spy, theme toggle,
  Equation demo, Todos demo, mobile nav, light and dark rendering.
- Check for and run a Biome command if one is configured before finalizing formatting.

## Open Questions

None.

## License

MIT.
