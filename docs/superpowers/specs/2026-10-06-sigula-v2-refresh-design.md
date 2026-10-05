# sigula.dev — Sigula 2.0.1 Refresh + Layout Change (Design Spec)

**Date:** 2026-10-06
**Status:** Approved
**Supersedes (in part):** `docs/superpowers/specs/2026-10-04-sigula-dev-site-design.md`

## Goal

Regenerate the `sigula.dev` single-page site for **Sigula 2.0.1**:

1. Migrate off the breaking 2.0.1 API changes (`patch` command argument order,
   `Patch`/`View` shape, `isEqual`→`eq`, `repeat.compare`→`eq`, `act` node type).
2. Adopt 2.0.1 additions (`raw`, `list`, `frag`, `notify`, `sig(v,{eq})`, `patch` props form).
3. Refresh the page content to follow the structure of the 2.0.1 README, with a new
   **Demo** section (live Equation + Todos) immediately after Quick Start.
4. Remove the right-hand TOC column and re-center the layout.

## Non-goals

- No visual restyle: palette, fonts, and dark/light theme stay as-is.
- No routing, search, or i18n.
- No changes to the Sigula framework itself.

## A. Layout

Remove the right sidebar entirely. New shell:

- Sticky header unchanged (logo, version badge, `~4.5KB` badge, GitHub, theme toggle).
- Centered container `max-w-[1100px] mx-auto`, flex row: sticky left nav
  (`w-56`, hidden below `@3xl`, hamburger drawer on mobile) + `main` (`flex-1 min-w-0`).
  Content reads at ~820px.
- Delete `src/components/Toc.ts`, the `activeHeading` signal, the heading
  `IntersectionObserver`, `headingsBySection`, `SectionMeta.headings`, and all
  `data-heading` attributes. Left nav still highlights the active **section** via
  the existing `activeSection` scroll-spy.
- Header badges become `v2.0.1` and `~4.5KB`.

## B. API migration (breaking + new usage)

Exact 2.0.1 signatures (from `dist/sigula.d.ts` / `Reference.md`):

| 1.0.3 | 2.0.1 |
|---|---|
| `attr(source, key)` | `attr(key, source)` |
| `style(source, key)` | `style(key, source)` |
| `styleProperty(source, key)` | `styleProp(key, source)` |
| `toggleClass(source, token)` | `toggleClass(token, source)` |
| `toggleClasses(source, ...tokens)` | `toggleClasses(tokens[], source)` |
| `act(source, (node: Node, v) => …)` | `act(source, (el: Element, v) => …)` |
| `isEqual` | `eq` |
| `repeat({key, view, compare})` | `repeat({key, view, eq})` |
| `View = {type,node,bind?,childCommits?,live?}` | `View = {type,node,bind?,cleanBinds,boundary,children?}` |
| `Patch = {type,toPatchItems}` | `Patch = {type,toPatchItems,cleanBinds}` |
| `patch(...items)` | `patch(props, ...items)` **or** `patch(...items)` |

New capabilities adopted:

- **Primitive/Sig interpolation:** `${value}` and `${aSig}` are auto-coerced to a text
  view. Replace most `text(x)` with `${x}` (keep `text()` where an explicit view is clearer).
  Note `${null}`/`${undefined}` render as `"null"`/`"undefined"`, so conditional content uses
  `frag()` (renders nothing) rather than a bare nullish value.
- **`list(items, viewFn)`** for static arrays (tables, features, nav groups).
- **`frag(...views)`** for content-position composition and empty content.
- **`raw(htmlString)`** for unescaped HTML — used to implement `rich()`.
- **`patch({id, val, class, style, styleProp, on, ...attrs})`** props form.
- **`sig(v, {eq})`** custom comparator; **`Sig.notify()`** after in-place mutation.

## C. Content structure (mirrors the 2.0.1 README)

Nav groups and ordering:

- **Introduction:** Overview (hero) · Features · Installation · Quick Start · **Demo**
- **Concepts:** Core Concepts
- **Reference:** API Cheat Sheet · Reactivity · Templates · DOM bindings · Control flow ·
  Rendering · Low-level API
- **Appendix:** Errors · How it compares

Section content:

- **Overview** — badges, tagline, install command + copy, CTAs, and a compact highlighted
  reactive snippet (no live demo; the Equation demo moves to Demo).
- **Features** — 8 README feature bullets as cards.
- **Installation** — package-manager commands, ESM-only / side-effect-free note.
- **Quick Start** — the README's five steps (render, reactive, events/patch, components,
  lists) as prose + highlighted snippets.
- **Demo** — live Equation and Todos cards, each paired with its highlighted source
  (below).
- **Core Concepts** — architecture-at-a-glance, Signals (`sig`, `notify`), Bindings,
  Derived (`compute`), Templates (`html`/`text`/`raw`), Patching (`patch`), Control flow
  (`view`/`repeat`/`list`/`frag`), Boundaries and teardown, The update queue, and
  "What Sigula deliberately does not have".
- **API Cheat Sheet** — the README export table.
- **Reference detail** — data-driven entries built from `Reference.md`: Reactivity
  (`sig`, `compute`, `Sig`, `DerivedSig`, `eq`, `Equatable`, `Eq`, `Reactive`,
  `createBind`/`removeBind`), Templates (`html`, `text`, `raw`, `View`, `ChildView`,
  `replaceWithView`), DOM bindings (`patch`, `PatchProps`, `id`, `val`, `attr`, `style`,
  `styleProp`, `toggleClass`, `toggleClasses`, `on`, `act`, `Patch`/`PatchItem`/
  `ToPatchItem` types), Control flow (`view`, `repeat`, `list`, `frag`), Rendering
  (`render`), Low-level API (`Boundary`, `toBoundary`, `walkBoundary`, `removeBoundary`,
  `replaceWithNode`, `Cmd`/`CmdContext`/`AnyCmd`, `at`, `err`).
- **Errors** — E1–E12 table (accurate for 2.0.1); E4 wording uses `styleProp`.
- **How it compares** — the README comparison table (Sigula/Lit/Solid/React).

`src/snippets/quickstart.txt` is re-synced to the 2.0.1 `examples/quickstart` source.

## D. Demos

Both live demos are rewritten from the official 2.0.1 examples and restyled:

- **Equation** (`examples/equation`): `x`/`y` signals, derived `sum`/`product`/`diff`/
  `quotient`/squares, `+1`/`-1` buttons; uses primitive interpolation.
- **Todos** (`examples/filtertodos`): `done: Sig<boolean>` per item, `todos.notify()` on
  toggle (no `revision` hack), key-first `style('textDecoration', …)`, `view(isEmpty, …)`
  + `repeat`. Rendered compactly to fit the site.

## E. File map

Create:
- `src/sections/installation.ts`
- `src/sections/demo.ts`
- `src/sections/concepts.ts`
- `src/sections/cheatsheet.ts`
- `src/sections/compare.ts`

Delete:
- `src/components/Toc.ts`
- `src/sections/core.ts` (replaced by `concepts.ts`)
- `src/sections/model.ts` (folded into Core Concepts → update queue)

Modify:
- `src/theme.ts` (no change expected), `src/style.css` (center-layout helpers if needed)
- `src/scroll.ts` (section-only scroll-spy; drop `activeHeading`)
- `src/main.ts` (drop `activeHeading`)
- `src/components/Layout.ts` (remove right aside/Toc; center; badges)
- `src/components/Nav.ts` (key-first `attr`/`toggleClass`; `list`)
- `src/components/ApiTable.ts` (use `list` + primitive interpolation)
- `src/components/ApiEntry.ts` (drop `data-heading`; primitive interpolation)
- `src/components/CopyButton.ts` (`attr('aria-label', …)`)
- `src/components/CodeBlock.ts` (`act` element, no cast)
- `src/components/rich.ts` (rebuild with `raw`)
- `src/components/demos/Equation.ts`, `src/components/demos/Todos.ts`
- `src/sections/types.ts` (`SectionGroup` union; drop `headings`)
- `src/sections/api.ts` (`buildApiSection` returns `() => View`; `headingSection` keeps id)
- `src/sections/hero.ts`, `features.ts`, `quickstart.ts`, `reactivity.ts`, `templates.ts`,
  `bindings.ts`, `controlflow.ts`, `rendering.ts`, `lowlevel.ts`, `errors.ts`, `index.ts`
- `src/snippets/quickstart.txt`

## F. Data flow

- Shell signals: `theme`, `activeSection`, `mobileOpen`. `activeHeading` is removed.
- `scroll.ts` observes `main section[id]` only and updates `activeSection`.
- Sections remain static; the section registry drives nav + content.

## G. Error handling / edge cases

- Conditional content uses `frag()` (not `null`, which renders `"null"`).
- `raw()` is fed only pre-escaped strings (via `rich`, which escapes then marks inline code).
- Preserve: hash restore, theme persistence, clipboard fallback, mobile drawer close-on-nav,
  highlight.js unknown-language fallback.

## H. Verification

- `pnpm exec tsc --noEmit` and `pnpm build` pass.
- Dev server at `http://localhost:5173`: left-nav + centered content (no right column),
  Demo interactivity (Equation math, Todos add/toggle/filter/remove/empty), theme toggle,
  mobile drawer, deep links (`/#reactivity-compute`), no console errors.
- No test framework (unchanged). Spec + plan live in `docs/superpowers/`.
