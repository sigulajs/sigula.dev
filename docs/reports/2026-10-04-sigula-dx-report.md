# Sigula DX Report — Findings from Building `sigula.dev`

**Subject:** `sigula@1.0.3` (`dist/sigula.js` + source maps)
**Built with:** Vite 8, UnoCSS, TypeScript (strict)
**Date:** 2026-10-04
**Scope:** Developer-experience issues found while building the `sigula.dev` single-page
marketing/docs site entirely with Sigula. Every claim is grounded in the shipped
`node_modules/.pnpm/sigula@1.0.3/node_modules/sigula/dist` source (and its source maps) or
in the site's own code.

## Table of contents

1. [No automatic dependency tracking](#1-no-automatic-dependency-tracking)
2. [Interpolation ergonomics: primitives and empty content](#2-interpolation-ergonomics-primitives-and-empty-content)
3. [Static lists, fragments, and custom views](#3-static-lists-fragments-and-custom-views)
4. [`patch` ergonomics](#4-patch-ergonomics)
5. [Typing friction](#5-typing-friction)
6. [Runtime diagnostics and compile-time slot positions](#6-runtime-diagnostics-and-compile-time-slot-positions)
7. [Lifecycle: effects and listener teardown](#7-lifecycle-effects-and-listener-teardown)
8. [Comparator control and equality](#8-comparator-control-and-equality)
9. [README diverges from the shipped package](#9-readme-diverges-from-the-shipped-package)
10. [Miscellaneous](#10-miscellaneous)
- [Recommended sequencing](#recommended-sequencing)

## Priority summary

| # | Finding | Impact | Effort | Breaking? |
|---|---------|--------|--------|-----------|
| 1 | No automatic dependency tracking (`computed`/`effect`/`untrack`) | High | Med | No (additive) |
| 2 | Template interpolation: primitives + `nothing` | High | Low | No |
| 3 | Static `list()` / `fragment()` / documented custom views | High | Low | No |
| 4 | `patch`/`props` object form; `attr` order; `checked`/`prop` | High | Med | No (additive) |
| 5 | Typing friction (`ActFn` node, `view()` return invariance) | Med | Low | Semver-major for types |
| 6 | Dev diagnostics + compile-time slot-position checks | Med | Med | No |
| 7 | Lifecycle: `effect`/`onCleanup`; remove `on` listeners on teardown | Med | Med | No |
| 8 | Comparator control; `isEqual(NaN, NaN)`; deep-equality cost | Low | Low | No |
| 9 | README diverges from shipped 1.0.3 (errors, `walkBoundary`, `View`/`Patch`, Todos) | High (trust) | Low | No |
| 10 | Misc: HMR, SSR, context, `extra` internals | Low | Med/Low | No |

---

## 1. No automatic dependency tracking

**Symptom.** Derived values do not react to signals read *inside* the callback. This bit us
directly in the Todos demo; we had to invent a `revision` signal to force recomputation.

**Root cause.** `Sig.get()` is a plain field read, and the record form of `compute`
subscribes only to the keys of the source record:

```ts
// src/sig.bind.ts (shipped)
get(): T {
  return this._val;
} // no observer registration

// src/compute.ts (shipped)
for (const [k, s] of Object.entries(source)) {
  entries.push([k, s]);
  vals[k] = s.get();
}
for (const entry of entries) {
  target.addFromBind(createBind(entry[1], ctx, computeRecordCmd));
}
```

**What we had to write** (`src/components/demos/Todos.ts`):

```ts
const revision = sig(0);

const visible = compute({todos, filter, revision}, (v) => {
  // revision is a manual-invalidation hack
  switch (v.filter) {
    case 'active':
      return v.todos.filter((item) => !item.done.get()); // item.done is NOT tracked
    case 'done':
      return v.todos.filter((item) => item.done.get());
    default:
      return v.todos;
  }
});

const toggle = (item: Todo) => {
  item.done.trans((v) => !v);
  revision.trans((r) => r + 1); // manual invalidation
};
```

Note the README's own Todos example has the same latent bug.

**Proposed API (additive):**

```ts
export const computed = <T>(fn: () => T): DerivedSig<T>;
export const effect = (fn: () => void | (() => void)): () => void;
export const untrack = <T>(fn: () => T): T;

const visible = computed(() =>
  todos.get().filter((t) => {
    const f = filter.get();
    return f === 'active' ? !t.done.get() : f === 'done' ? t.done.get() : true;
  }),
);
```

**Implementation sketch.** A module-level observer stack; `get()` registers the read when an
observer is active:

```ts
const observers: DerivedSig<unknown>[] = [];

get(): T {
  const current = observers.at(-1);
  if (current) current.addFromBind(createBind(this, {}, () => {}));
  return this._val;
}

export const computed = <T>(fn: () => T): DerivedSig<T> => {
  const target = new DerivedSig(undefined as T);
  observers.push(target);
  try {
    target.forceUpdate(fn());
  } finally {
    observers.pop();
  }
  return target;
};
```

Keep `compute(source, fn)` as the explicit/faster path (no stack bookkeeping). `effect`
would use the same tracking but with `createBind` side-effects and a disposer. Also add
`untrack` for reads that must not subscribe.

---

## 2. Interpolation ergonomics: primitives and empty content

**Symptom A — primitives.** Only `Patch | AnyView` are accepted, so every dynamic string
needs `text(...)`:

```ts
// current (required)
html`<p>Hello, ${text(name)}!</p>`;
// desired
html`<p>Hello, ${name}!</p>`;
```

If a raw string slips through (e.g. untyped JavaScript), it is not committed at all: in
`html.ts`, `_toMark` treats anything that is not a `patch` as a comment marker, and
`wraps.forEach` only commits items whose `type` is `'patch'` or `'view'`, so the marker is
left in the DOM and the string is silently dropped.

**Symptom B — “nothing”.** There is no canonical empty view; absent content is written
`text('')` in `src/components/ApiEntry.ts`, `src/components/ApiTable.ts`, and
`src/components/Layout.ts` (MobileNav). Authors must know that trick.

**Proposed:**

```ts
export const nothing: View = {type: 'view', node: document.createTextNode('')};

// in html(): normalize items before _shape/_scan
const normalized = items.map((item) =>
  item == null || item === false
    ? nothing
    : typeof item === 'string' || typeof item === 'number'
      ? text(String(item))
      : item,
);
```

This also makes `view(sig, (v) => (v ? A : null))` and `repeat` callbacks returning `null`
Just Work.

**Bonus:** the README claims an empty tagged template throws `E10`; the shipped 1.0.3 parser
accepts zero-slot templates and returns an empty view, so even the documented escape hatch is
inaccurate. A named `nothing` removes the ambiguity.

---

## 3. Static lists, fragments, and custom views

**Symptom.** `repeat` demands `Sig<T[]>`, so every static list wraps data in a signal, even
nested inside a view callback:

```ts
// src/components/ApiTable.ts
const head = sig(headers.map((value, index) => ({index, value})));
const body = sig(rows.map((cells, index) => ({index, cells})));
// ...
repeat(sig(row.cells.map((value, index) => ({index, value}))), {
  key: (item) => String(item.index),
  view: (cell) => html`<td>${text(cell.value)}</td>`,
});
```

Custom content required hand-building the internal `View` shape:

```ts
// src/components/rich.ts
const frag = document.createDocumentFragment();
// ...append code/text nodes...
return {type: 'view', node: frag}; // relies on internal toBoundary fragment support
```

**Proposed (additive):**

```ts
// static, unkeyed list — no signal required
export const list = <T>(
  items: readonly T[],
  viewFn: (item: T, index: number) => AnyView,
): View;

// compose sibling views into one
export const fragment = (...views: AnyView[]): View;

// opt-in raw HTML (escape hatch; documented as unsafe for untrusted input)
export const raw = (htmlString: string): View;
```

Usage:

```ts
html`<ul>${list(featureItems, (f) => html`<li>${f.title}</li>`)}</ul>`;

const head = list(headers, (value) => html`<th scope="col">${value}</th>`);
```

`list` must carry child binds (like `html` does) so reactive cells keep updating; a correct
implementation reuses `commitView`/`Commit` rather than raw `appendChild`.

---

## 4. `patch` ergonomics

**Symptom A — verbosity.**

```ts
html`<input ${patch(val(name), attr(placeholder, 'name'), on('input', onChange))} />`;
```

**Symptom B — argument order caused a real bug.** `attr(source, key)` is the reverse of the
DOM/HTML convention. Our first version wrote `attr('aria-label', 'Copy to clipboard')`, which
called `setAttribute('Copy to clipboard', 'aria-label')` and threw `InvalidCharacterError` at
mount (`src/components/CopyButton.ts`).

**Symptom C — no property binding for `checked`.** `val` sets `.value`; checkbox state needed
an `act` plus a cast:

```ts
// src/components/demos/Todos.ts
patch(
  act(item.done, (node, value) => {
    if (node instanceof HTMLInputElement) node.checked = Boolean(value);
  }),
  on('change', () => toggle(item)),
);
```

**Proposed object form:**

```ts
type Reactive<T> = T | Sig<T>;

export interface Props {
  id?: Reactive<string>;
  class?: Record<string, Reactive<boolean>>; // reactive class map
  style?: Partial<Record<WritableStyleKey, Reactive<string>>>;
  on?: {[K in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[K]) => void};
  [attr: string]: unknown;
}
export const props = (p: Props): Patch;

// becomes
html`<input ${props({value: name, placeholder: 'name', on: {input: onChange}})} />`;
html`<span ${props({style: {color}, class: {on: active}})}>`;
html`<input type="checkbox" ${props({checked: done})} />`;
```

Alternatively (breaking but native-like): flip to `attr(key, value)` / `style(key, value)` and
add `prop(name, value)`. Recommended: keep the current exports and add `props` to avoid a
breaking change.

---

## 5. Typing friction

**Symptom A — `act` hands you a `Node`.** Patches only ever target elements (`patch.ts`
internally does `ctx.node as Element`), yet the public callback is `(node: Node, val?: T)`.
Every `act` needs a guard or cast:

```ts
// src/components/CodeBlock.ts
act(highlighted, (node, value) => {
  if (node instanceof HTMLElement) node.innerHTML = String(value);
});
```

Proposed:

```ts
export type ActFn<T> = (node: Element, val?: T) => void;
// and PatchContext.node: Element
```

**Symptom B — `view()` return type forced an `AnyView` cast.**

```ts
// src/view.ts (shipped)
export const view = <T>(sig: Sig<T>, viewFn: (val: T) => AnyView): View<T, ViewContext<T>>;

// src/components/Layout.ts (ours): MobileNav had to return AnyView
// because View<boolean, ViewContext<boolean>> is not assignable to View<unknown>
// under exactOptionalPropertyTypes.
```

Proposed: return `AnyView` from `view()`/`repeat()` (the concrete `T`/`C` add no value to
callers), or make `View.bind` covariant. This is a type-level change (may require a
minor/major bump), but removes casts.

---

## 6. Runtime diagnostics and compile-time slot positions

**Symptom.** There is no dev/prod error switch, and the README advertises `E1–E12` codes
that do not exist in 1.0.3 (it throws sentences such as
`html: unmatched interpolation; patch() must be in attribute position`). Placement mistakes
(`patch` in a content slot, a view in an attribute slot) are runtime-only, because the
signature is a flat `(Patch | AnyView)[]`:

```ts
export const html = (strs: TemplateStringsArray, ...items: (Patch | AnyView)[]): View;
```

**Proposed.**

- A `__DEV__` flag that throws verbose messages (including the template and slot index) while
  production keeps terse strings; unify with the README's code table.
- Compile-time position checking via branded slot types is hard with a rest parameter; a
  pragmatic middle ground is a lint rule / language-service plugin for `html` tagged
  templates that flags `patch` outside attribute positions and non-View content.

```ts
// error today (runtime only):
html`<p>${patch(on('click', fn))}</p>`; // E12 / "unmatched interpolation"
// goal: a red squiggle at edit time
```

---

## 7. Lifecycle: effects and listener teardown

**Symptom A — no `effect`/`onCleanup`.** The theme module manually applies and subscribes
(`src/theme.ts`), and the scroll-spy is hand-written DOM because there is no effect
primitive.

**Symptom B — `on()` listeners are never removed.** `cleanCommit` only removes signal binds:

```ts
// src/commit.ts
export const cleanCommit = (commit: Commit<unknown, CmdContext>) => {
  if (commit.binds) {
    // removeBind(...)
  }
  commit.children?.forEach((child) => cleanCommit(child));
  // no DOM event-listener teardown
};
```

For long-lived elements that survive `view()`/`repeat()` swaps, handlers accumulate; Vite HMR
also re-adds the theme listener.

**Proposed:**

```ts
export const effect = (fn: () => void | (() => void)): () => void;
export const onCleanup = (fn: () => void): void;
export const onMount = (fn: () => void | (() => void)): void;

// patch.ts onCmd: register a disposer in the commit tree
ctx.disposers ??= [];
ctx.disposers.push(() => node.removeEventListener(type, listener, options));
// cleanCommit() then runs disposers alongside removeBind
```

---

## 8. Comparator control and equality

**Symptom A — `isEqual(NaN, NaN) === false`,** so `text` re-writes needlessly. Our quotient
demo hits this at `y = 0`.

```ts
// src/components/demos/Equation.ts
const quotient = compute({x, y}, (v) => (v.y === 0 ? Number.NaN : v.x / v.y));
// NaN !== NaN → binding fires on every x change even though nothing changed
```

**Symptom B — deep equality is the only option;** `update`/`compute`/`repeat` deep-compare
arrays (`O(n)`), which can dominate for large lists.

**Proposed:**

```ts
export const sig = <T>(v: T, opts?: {equals?: (a: T, b: T) => boolean}): Sig<T>;
// and treat both-NaN as equal inside isEqual
if (Number.isNaN(a) && Number.isNaN(b)) return true;
```

(`repeat` already accepts `compare`, which is good.)

---

## 9. README diverges from the shipped package

Concrete mismatches found while building the reference docs:

| README | Shipped `1.0.3` |
|---|---|
| Errors `E1:<i>` … `E12` table | Descriptive strings (`"html: unmatched interpolation…"`); no codes |
| `walkBoundary` exported | Not exported |
| `View` has `type/node/bind/cleanBinds/boundary/children` | `type/node/bind?/childCommits?/live?`; no `cleanBinds` |
| `Patch` has `type/toPatchItems/cleanBinds` | `type/toPatchItems` only |
| Empty template throws `E10` | Zero-slot templates return an empty view |
| Todos example reactive to `done` toggles | Not reactive (see Finding 1) |

**Proposed:** generate docs/tests from `dist/sigula.d.ts`, add a CI job that type-checks and
unit-tests every README example, and version the docs with the package.

---

## 10. Miscellaneous

- **HMR:** `render()` returns a disposer but there is no guidance/helper for
  `import.meta.hot`; listeners/observers accumulate on HMR (we hit this with the theme media
  query).
- **SSR:** `text()` and `html()` build DOM eagerly at call time, so views cannot be
  constructed server-side. Acceptable for a tiny browser framework, but worth stating.
- **Context/provider:** no `createContext`/`provide`/`use`; larger apps thread signals through
  props.
- **`PatchContext.extra`** is an internal positional array; a typed command-args object would
  be friendlier for third-party commands.
- **`on` `this` typing** assumes `HTMLElement`; patches can target SVG or other elements.
- **`toggleClasses`** with zero tokens silently no-ops.

---

## Recommended sequencing

1. **Docs/trust first (9)** — cheap, high trust impact: reconcile README with `d.ts`, version
   it, add example tests.
2. **Additive DX (2, 3, 4)** — biggest day-to-day win with no breaking changes: primitives +
   `nothing`, `list`/`fragment`, `props` + `checked`/`prop`.
3. **Reactivity (1, 7)** — `computed`/`effect`/`untrack` + cleanup; this also fixes the README
   Todos example and removes manual invalidation.
4. **Typing + diagnostics (5, 6, 8, 10)** — land with the next minor/major.

## What worked well

Tiny surface area, fine-grained updates, the `patch`/`text` placement model, per-call-site
template caching (the `shape` bitmask correctly handles varying interpolation mixes), and
microtask batching/coalescing.
