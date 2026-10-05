# sigula.dev — Sigula 2.0.1 Refresh + Layout Change Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Regenerate `sigula.dev` for Sigula 2.0.1 — migrate the breaking API, adopt new helpers, mirror the 2.0.1 README structure with a live Demo section, and remove the right-hand TOC column.

**Architecture:** A static `sections` registry drives both content and the left nav. The shell becomes a centered 2-column layout (sticky left nav + content), dropping the right aside and all heading/TOC machinery. Reference sections stay data-driven via `buildApiSection`. New idioms (`list`, `frag`, `raw`, primitive interpolation, props-form `patch`) replace boilerplate.

**Tech Stack:** TypeScript, Vite 8, UnoCSS, Sigula 2.0.1, highlight.js.

**Authoritative sources:**
- Installed types: `node_modules/.pnpm/sigula@2.0.1/node_modules/sigula/dist/sigula.d.ts`
- README: `https://raw.githubusercontent.com/sigulajs/sigula/main/README.md`
- API reference: `https://raw.githubusercontent.com/sigulajs/sigula/main/Reference.md`
- Official examples: `examples/quickstart`, `examples/equation`, `examples/filtertodos`

**Verification model:** no test framework (spec excludes one). Each task ends with `pnpm exec tsc --noEmit` and `pnpm build` passing; browser checks are manual at `http://localhost:5173`.

**2.0.1 key constraints:**
- Keyed patch commands are **key-first**: `attr(key, source)`, `style(key, source)`, `styleProp(key, source)`, `toggleClass(token, source)`, `toggleClasses(tokens[], source)`. `id(source)`, `val(source)`, `act(source, fn)`, `on(type, listener, options?)` stay source-first.
- `patch(props, ...items)` accepts a `PatchProps` object (keys: `id`, `val`, `class`, `style`, `styleProp`, `on`, else attribute; `undefined` skipped).
- `View` now requires `cleanBinds` and `boundary` — do **not** hand-build a `View` literal; use `frag`, `raw`, `text`, `html`, `list`, `view`, `repeat`.
- `html` auto-coerces non-View/Patch content (including `Sig` and primitives) via `text`, but `null`/`undefined` render as the strings `"null"`/`"undefined"` — use `frag()` for empty content.
- `isEqual` → `eq`; `repeat`'s `compare` → `eq`; `act`'s node is `Element`.
- New: `raw(string | Sig<string>)`, `list(items, viewFn)`, `frag(...views)`, `Sig.notify()`, `sig(v, {eq})`.

---

## File map

Create:
- `src/sections/installation.ts`
- `src/sections/demo.ts`
- `src/sections/concepts.ts`
- `src/sections/cheatsheet.ts`
- `src/sections/compare.ts`

Delete (Task 9):
- `src/components/Toc.ts` (Task 2)
- `src/sections/core.ts`, `src/sections/model.ts` (Task 9, after `concepts.ts` exists)

Modify: `src/scroll.ts`, `src/main.ts`, `src/components/Layout.ts`, `Nav.ts`, `ApiTable.ts`,
`ApiEntry.ts`, `CopyButton.ts`, `CodeBlock.ts`, `rich.ts`, `demos/Equation.ts`,
`demos/Todos.ts`, `src/sections/types.ts`, `api.ts`, `hero.ts`, `features.ts`,
`quickstart.ts`, `reactivity.ts`, `templates.ts`, `bindings.ts`, `controlflow.ts`,
`rendering.ts`, `lowlevel.ts`, `errors.ts`, `index.ts`, `src/snippets/quickstart.txt`.

---

## Task 1: Restore a green build on Sigula 2.0.1

**Files:**
- Modify: `src/components/rich.ts`, `src/components/Nav.ts`, `src/components/Toc.ts`, `src/components/CopyButton.ts`, `src/components/CodeBlock.ts`, `src/components/demos/Todos.ts`

- [ ] **Step 1: Rewrite `src/components/rich.ts` with `raw`**

```ts
import {raw, type AnyView} from 'sigula';

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const rich = (value: string): AnyView =>
  raw(
    escapeHtml(value).replace(
      /`([^`]*)`/g,
      '<code class="rounded bg-[var(--code-bg)] px-1 py-0.5 font-mono text-[0.9em] text-[var(--text-h)]">$1</code>',
    ),
  );
```

- [ ] **Step 2: Fix `Nav.ts` command argument order**

Change line 27-28 to key-first:
```ts
                ${patch(
                  attr('href', `#${item.id}`),
                  toggleClass('active', compute(active, (id) => id === item.id)),
                )}
```

- [ ] **Step 3: Fix `Toc.ts` command argument order** (deleted in Task 2, but must compile now)

```ts
                  ${patch(
                    attr('href', `#${item.id}`),
                    toggleClass('active', compute(activeHeading, (id) => id === item.id)),
                  )}
```

- [ ] **Step 4: Fix `CopyButton.ts`**

```ts
    ${patch(on('click', onClick), attr('aria-label', 'Copy to clipboard'))}
```

- [ ] **Step 5: Fix `CodeBlock.ts` act callback** (`act` node is now `Element`)

```ts
    <pre class="overflow-x-auto p-4 text-[13px] leading-relaxed"><code class="hljs" ${patch(act(highlighted, (el, value) => { el.innerHTML = String(value); }))}></code></pre>
```

- [ ] **Step 6: Fix `demos/Todos.ts` style order**

Change the `itemView` span patch to:
```ts
      <span ${patch(style('textDecoration', compute(item.done, (v): string => (v ? 'line-through' : 'none'))))}>${text(item.text)}</span>
```

- [ ] **Step 7: Verify**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: exit 0 with no errors.

- [ ] **Step 8: Commit**

```bash
git add src/components
git commit -m "fix: migrate shared components to sigula 2.0.1 API"
```

---

## Task 2: Layout — remove the right column and TOC machinery

**Files:**
- Delete: `src/components/Toc.ts`
- Modify: `src/components/Layout.ts`, `src/main.ts`, `src/scroll.ts`, `src/sections/types.ts`, `src/sections/api.ts`, `src/sections/index.ts`, `src/components/ApiEntry.ts`, `src/sections/hero.ts`, `src/sections/features.ts`, `src/sections/quickstart.ts`, `src/sections/core.ts`

- [ ] **Step 1: Simplify `src/scroll.ts`** (section-only spy)

```ts
import type {Sig} from 'sigula';

export const setupScrollSpy = (activeSection: Sig<string>): void => {
  if (!('IntersectionObserver' in window)) return;

  const sections = document.querySelectorAll<HTMLElement>('main section[id]');
  const options: IntersectionObserverInit = {
    rootMargin: '-15% 0px -75% 0px',
    threshold: 0,
  };

  const pickFirst = (
    entries: IntersectionObserverEntry[],
  ): IntersectionObserverEntry | undefined =>
    entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

  const observer = new IntersectionObserver((entries) => {
    const first = pickFirst(entries);
    if (first) activeSection.update(first.target.id);
  }, options);
  for (const section of sections) observer.observe(section);
};

export const restoreHash = (): void => {
  const {hash} = window.location;
  if (!hash) return;
  const target = document.getElementById(hash.slice(1));
  if (target) {
    requestAnimationFrame(() => target.scrollIntoView());
  }
};
```

- [ ] **Step 2: Update `src/main.ts`** — drop `activeHeading`

```ts
import 'virtual:uno.css';
import './style.css';
import {render, sig} from 'sigula';
import {Layout} from './components/Layout';
import {restoreHash, setupScrollSpy} from './scroll';
import {sections} from './sections';
import './theme';

const appNode = document.querySelector('#app');
if (!appNode) throw new Error('#app not found');

const activeSection = sig(sections[0]?.id ?? '');
const dispose = render(Layout({sections, activeSection}), appNode);

setupScrollSpy(activeSection);
restoreHash();

window.addEventListener('beforeunload', dispose, {once: true});
```

- [ ] **Step 3: Update `src/components/Layout.ts`**

- Remove `import {Toc} from './Toc';`
- `LayoutProps` becomes `{sections: SectionMeta[]; activeSection: Sig<string>}`; update the `Layout` signature.
- Return centered 2-column shell:

```ts
  return html`<div>
    <div class="@container min-h-screen">
      ${Header(mobileOpen)}
      <div class="mx-auto flex w-full max-w-[1100px] items-start gap-8 px-4 py-8 @3xl:px-6">
        <aside class="sticky top-14 hidden max-h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto @3xl:block">
          ${Nav(activeSection)}
        </aside>
        <main class="min-w-0 flex-1">${content}</main>
      </div>
      <footer class="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text)]">
        <p>sigula — MIT License · zjh · <a href="https://github.com/sigulajs/sigula" class="hover:underline">GitHub</a></p>
      </footer>
    </div>
    ${MobileNav(mobileOpen, activeSection)}
  </div>`;
```

- Header badges: `${Badge('v2.0.1')}` `${Badge('~4.5KB')}`.

- [ ] **Step 4: Delete `src/components/Toc.ts`**

```bash
git rm src/components/Toc.ts
```

- [ ] **Step 5: Make `headings` optional and remove dead TOC metadata**

In `src/sections/types.ts`, change `headings: Heading[];` to `headings?: Heading[];`.

In `src/sections/index.ts`, delete the `headingsBySection` export and its `Heading` import usage.

Remove every `data-heading=""` attribute:

```bash
rg -l 'data-heading' src
# remove the attribute text in each listed file
```
Files include `src/components/ApiEntry.ts`, `src/sections/api.ts`, `hero.ts`, `features.ts`, `quickstart.ts`, `core.ts`.

- [ ] **Step 6: Verify**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: exit 0.

- [ ] **Step 7: Manual check**

Confirm at `:5173` there is no right column, the content is centered beside the left nav, and the active nav link still updates on scroll.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: remove right TOC column and center the layout"
```

---

## Task 3: Rewrite the demos with 2.0.1 idioms

**Files:**
- Modify: `src/components/demos/Equation.ts`, `src/components/demos/Todos.ts`

- [ ] **Step 1: Rewrite `src/components/demos/Equation.ts`**

```ts
import {compute, html, on, patch, sig, type Sig, type View} from 'sigula';

export const Equation = (): View => {
  const x = sig(0);
  const y = sig(1);
  const s = {x, y};
  const sum = compute(s, (v) => v.x + v.y);
  const diff = compute(s, (v) => v.x - v.y);
  const product = compute(s, (v) => v.x * v.y);
  const quotient = compute(s, (v) => (v.y === 0 ? Number.NaN : v.x / v.y));
  const squareDiff = compute(s, (v) => v.x * v.x - v.y * v.y);

  const stepper = (label: string, value: Sig<number>): View => html`
    <div class="flex items-center justify-between gap-2">
      <span class="font-mono text-sm text-[var(--text-h)]">${label} = ${value}</span>
      <span class="flex gap-1">
        <button ${patch(on('click', () => value.trans((v) => v - 1)))} class="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--text-h)] transition hover:border-[var(--accent-border)]">-1</button>
        <button ${patch(on('click', () => value.trans((v) => v + 1)))} class="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--text-h)] transition hover:border-[var(--accent-border)]">+1</button>
      </span>
    </div>`;

  const row = (label: string, result: Sig<number>): View => html`
    <div class="flex items-baseline justify-between gap-3 border-b border-[var(--border)] py-1.5 last:border-0">
      <span class="text-sm text-[var(--text)]">${label}</span>
      <span class="font-mono text-sm text-[var(--text-h)]">${result}</span>
    </div>`;

  return html`<div class="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4">
    <div class="grid gap-2">
      ${stepper('x', x)}
      ${stepper('y', y)}
    </div>
    <div class="mt-4">
      ${row('sum: x + y', sum)}
      ${row('difference: x - y', diff)}
      ${row('product: x * y', product)}
      ${row('quotient: x / y', quotient)}
      ${row('x² - y²', squareDiff)}
    </div>
  </div>`;
};
```

Note: `stepper`/`row` are called with `label` (string) interpolated as `${label}` — allowed in 2.0.1.

- [ ] **Step 2: Rewrite `src/components/demos/Todos.ts`** (official filtertodos, restyled)

```ts
import {
  compute,
  html,
  on,
  patch,
  repeat,
  sig,
  style,
  type Sig,
  type View,
  val,
  view,
} from 'sigula';

interface Todo {
  id: number;
  text: string;
  done: Sig<boolean>;
}

export const Todos = (): View => {
  const input = sig('');
  const todos = sig<Todo[]>([]);
  const filter = sig<'all' | 'active' | 'done'>('all');

  const visible = compute({todos, filter}, (v) => {
    switch (v.filter) {
      case 'active':
        return v.todos.filter((t) => !t.done.get());
      case 'done':
        return v.todos.filter((t) => t.done.get());
      default:
        return v.todos;
    }
  });

  const isEmpty = compute(visible, (v) => v.length <= 0);

  const add = (event: Event): void => {
    event.preventDefault();
    if (!input.get().trim()) return;
    todos.trans((items) => [
      ...items,
      {id: Date.now(), text: input.get().trim(), done: sig(false)},
    ]);
    input.update('');
  };

  const remove = (id: number): void => {
    todos.trans((items) => items.filter((item) => item.id !== id));
  };

  const toggle = (item: Todo): void => {
    item.done.trans((v) => !v);
    todos.notify();
  };

  const itemView = (item: Todo): View => html`<li class="flex items-center justify-between gap-2 border-b border-[var(--border)] py-1.5 last:border-0">
    <span
      ${patch(
        on('click', () => toggle(item)),
        style('textDecoration', compute(item.done, (v): string => (v ? 'line-through' : 'none'))),
      )}
      class="cursor-pointer select-none"
    >${item.text}</span>
    <button ${patch(on('click', () => remove(item.id)))} class="rounded-md px-2 text-[var(--text)] transition hover:text-[var(--accent)]">×</button>
  </li>`;

  const filterButton = (value: 'all' | 'active' | 'done'): View => html`<button type="button" ${patch(on('click', () => filter.update(value)))} class="rounded-md border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text)] capitalize transition hover:border-[var(--accent-border)]">${value}</button>`;

  return html`<div class="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4">
    <form ${patch(on('submit', add))} class="flex gap-2">
      <input ${patch(
        val(input),
        on('input', (event) => {
          const target = event.target;
          if (target instanceof HTMLInputElement) input.update(target.value);
        }),
      )} placeholder="What needs doing?" class="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent-border)]" />
      <button type="submit" class="rounded-md bg-[var(--accent)] px-3 py-1 text-sm font-medium text-white transition hover:opacity-90">Add</button>
    </form>
    <div class="my-3 flex gap-1">
      ${filterButton('all')}${filterButton('active')}${filterButton('done')}
    </div>
    ${view(isEmpty, (empty) =>
      empty
        ? html`<p class="py-4 text-center text-sm text-[var(--text)]">Nothing here yet.</p>`
        : html`<ul>
            ${repeat(visible, {key: (item) => String(item.id), view: (item) => itemView(item)})}
          </ul>`,
    )}
  </div>`;
};
```

- [ ] **Step 3: Verify + commit**

Run: `pnpm exec tsc --noEmit && pnpm build`
```bash
git add src/components/demos
git commit -m "feat: rewrite demos with sigula 2.0.1 idioms"
```

---

## Task 4: Intro sections — Installation, Demo, and refreshed Hero/Features/Quick Start

**Files:**
- Create: `src/sections/installation.ts`, `src/sections/demo.ts`
- Modify: `src/sections/hero.ts`, `src/sections/features.ts`, `src/sections/quickstart.ts`, `src/snippets/quickstart.txt`, `src/sections/types.ts` (add `'Concepts'` to `SectionGroup`)

- [ ] **Step 1: Extend the group union** in `src/sections/types.ts`

```ts
export type SectionGroup = 'Introduction' | 'Concepts' | 'Reference' | 'Appendix';
```

- [ ] **Step 2: Create `src/sections/installation.ts`**

```ts
import {html, type View} from 'sigula';
import {CodeBlock} from '../components/CodeBlock';
import type {SectionMeta} from './types';

export const installation: SectionMeta = {
  id: 'installation',
  title: 'Installation',
  group: 'Introduction',
  render: (): View => html`<section id="installation" class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">Installation</h2>
    ${CodeBlock({code: 'npm install sigula\npnpm add sigula\nyarn add sigula', lang: 'bash', filename: 'shell'})}
    <p class="leading-relaxed text-[var(--text)]">Sigula is ESM-only and ships type declarations. Importing the module is side-effect free; the DOM is only touched when you actually render.</p>
  </section>`,
};
```

- [ ] **Step 3: Create `src/sections/demo.ts`**

```ts
import {html, type View} from 'sigula';
import {CodeBlock} from '../components/CodeBlock';
import {Equation} from '../components/demos/Equation';
import {Todos} from '../components/demos/Todos';
import {headingSection} from './api';
import type {SectionMeta} from './types';

const body = html`<div class="grid gap-6 @4xl:grid-cols-2">
  <div>
    ${Equation()}
    ${CodeBlock({code: `const x = sig(0);\nconst y = sig(1);\nconst sum = compute({x, y}, (v) => v.x + v.y);`, lang: 'typescript'})}
  </div>
  <div>
    ${Todos()}
    ${CodeBlock({code: `todos.notify(); // after mutating a nested signal`, lang: 'typescript'})}
  </div>
</div>`;

export const demo: SectionMeta = {
  id: 'demo',
  title: 'Demo',
  group: 'Introduction',
  render: () => headingSection('demo', 'Demo', body),
};
```

(The short snippets are orientation; the full demo sources are the official examples and need not be inlined.)

- [ ] **Step 4: Rewrite `src/sections/hero.ts`**

Hero: badges `v2.0.1`, `~4.5KB gzipped`, `No virtual DOM`; h1 tagline; intro paragraph; install command + `CopyButton`; CTAs (Get started → `#quick-start`, GitHub); a compact highlighted reactive snippet instead of the live demo.

```ts
import {html, type View} from 'sigula';
import {Badge} from '../components/Badge';
import {CodeBlock} from '../components/CodeBlock';
import {CopyButton} from '../components/CopyButton';
import type {SectionMeta} from './types';

const snippet = `import {html, on, patch, render, sig} from 'sigula';

const count = sig(0);

render(
  html\`<p>\${count}</p>
       <button \${patch(on('click', () => count.trans((v) => v + 1)))}>+1</button>\`,
  document.querySelector('#app')!,
);`;

export const hero: SectionMeta = {
  id: 'overview',
  title: 'Overview',
  group: 'Introduction',
  render: (): View => html`<section id="overview" class="scroll-mt-24 pt-4">
    <div class="flex flex-wrap items-center gap-2">
      ${Badge('v2.0.1')}
      ${Badge('~4.5KB gzipped')}
      ${Badge('No virtual DOM')}
    </div>
    <h1 class="mt-4 text-4xl font-semibold tracking-tight text-[var(--text-h)] @3xl:text-5xl">Tiny web framework with fine-grained signal reactivity</h1>
    <p class="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--text)]">A minimal, signal-based web framework with fine-grained reactivity. No virtual DOM — just direct, minimal updates to the real DOM.</p>
    <div class="mt-6 flex flex-wrap gap-3">
      <a href="#quick-start" class="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">Get started</a>
      <a href="https://github.com/sigulajs/sigula" class="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-h)] transition hover:border-[var(--accent-border)]">GitHub</a>
    </div>
    <div class="mt-6 flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--code-bg)] px-4 py-3">
      <code class="font-mono text-sm text-[var(--text-h)]">npm install sigula</code>
      ${CopyButton('npm install sigula')}
    </div>
    <div class="mt-6 max-w-3xl">${CodeBlock({code: snippet, lang: 'typescript', filename: 'main.ts'})}</div>
  </section>`,
};
```

- [ ] **Step 5: Rewrite `src/sections/features.ts`**

Use the 8 README feature bullets, rendered with `list`:

```ts
import {html, list, type View} from 'sigula';
import type {SectionMeta} from './types';

const items: {title: string; body: string}[] = [
  {title: 'Fine-grained signal reactivity', body: 'When a signal changes, only the DOM nodes that depend on it are updated — not the whole component tree.'},
  {title: 'Declarative sources + precise bindings', body: 'Describe state with signals, then bind them precisely to a text node, an attribute, or an effect.'},
  {title: 'No virtual DOM', body: 'No VNodes, no diffing, no reconciliation pass. Direct real DOM operations.'},
  {title: 'Native string templates', body: 'html is a tagged template over plain JavaScript strings. No compiler, no JSX transform.'},
  {title: 'Batched, coalesced updates', body: 'Writes queue in a microtask; a signal touched many times before the flush runs each dependent binding once, against the final value.'},
  {title: 'Ultra small', body: 'Around 4.5KB minified and gzipped, with an API surface you can read in one sitting.'},
  {title: 'TypeScript first', body: 'Full type inference for signals, template bindings, and patch commands.'},
  {title: 'Zero tooling', body: 'ESM-only, sideEffects: false, no build step required to author components.'},
];

export const features: SectionMeta = {
  id: 'features',
  title: 'Features',
  group: 'Introduction',
  render: (): View => html`<section id="features" class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">Features</h2>
    <div class="mt-6 grid gap-4 @3xl:grid-cols-2">
      ${list(items, (item) => html`<div class="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4">
        <h3 class="mb-1 font-semibold text-[var(--text-h)]">${item.title}</h3>
        <p class="text-sm leading-relaxed text-[var(--text)]">${item.body}</p>
      </div>`)}
    </div>
  </section>`,
};
```

- [ ] **Step 6: Rewrite `src/sections/quickstart.ts`** (five steps) and re-sync the snippet

`src/snippets/quickstart.txt` becomes the README's "Quick Start → 5. Render lists conditionally" example (the reactive Todos), transcribed from the README.

`quickstart.ts` renders the five steps as prose + `CodeBlock`s:

```ts
import {html, type View} from 'sigula';
import {CodeBlock} from '../components/CodeBlock';
import source from '../snippets/quickstart.txt?raw';
import type {SectionMeta} from './types';

export const quickstart: SectionMeta = {
  id: 'quick-start',
  title: 'Quick Start',
  group: 'Introduction',
  render: (): View => html`<section id="quick-start" class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">Quick Start</h2>
    <h3 class="mt-6 text-xl font-semibold text-[var(--text-h)]">1. Render something</h3>
    ${CodeBlock({code: `import {html, render} from 'sigula';\n\nconst app = document.querySelector('#app')!;\n\nrender(html\`<h1>Hello, world!</h1>\`, app);`, lang: 'typescript'})}
    <p class="leading-relaxed text-[var(--text)]">html returns a View — a real DocumentFragment plus the metadata Sigula needs to update it later. render(view, node) appends it and returns a disposer.</p>
    <h3 class="mt-6 text-xl font-semibold text-[var(--text-h)]">2. Make it reactive</h3>
    ${CodeBlock({code: `const name = sig('Alice');\n\nrender(html\`<h1>Hello, \${name}!</h1>\`, app);\n\nname.update('Bob'); // only the text node changes`, lang: 'typescript'})}
    <p class="leading-relaxed text-[var(--text)]">A Sig interpolated in a content position is upgraded to a text() view automatically, so \${name} and \${text(name)} are equivalent.</p>
    <h3 class="mt-6 text-xl font-semibold text-[var(--text-h)]">3. Handle events and patch attributes</h3>
    ${CodeBlock({code: `const count = sig(0);\nconst color = compute(count, (v) => (v >= 0 ? 'green' : 'red'));\n\nhtml\`<p \${patch(style('color', color))}>\${text(count)}</p>\`;`, lang: 'typescript'})}
    <h3 class="mt-6 text-xl font-semibold text-[var(--text-h)]">4. Split into components</h3>
    ${CodeBlock({code: `const Counter = (initial: number): View => {\n  const count = sig(initial);\n  return html\`<div>\n    <span>\${count}</span>\n    <button \${patch(on('click', () => count.trans((v) => v + 1)))}>+1</button>\n  </div>\`;\n};`, lang: 'typescript'})}
    <h3 class="mt-6 text-xl font-semibold text-[var(--text-h)]">5. Render lists conditionally</h3>
    ${CodeBlock({code: source, lang: 'typescript', filename: 'main.ts'})}
  </section>`,
};
```

- [ ] **Step 7: Verify + commit**

Run: `pnpm exec tsc --noEmit && pnpm build`
```bash
git add src/sections/installation.ts src/sections/demo.ts src/sections/hero.ts src/sections/features.ts src/sections/quickstart.ts src/snippets/quickstart.txt src/sections/types.ts
git commit -m "feat: add installation and demo sections, refresh intro content"
```

---

## Task 5: Core Concepts section (README structure)

**Files:**
- Create: `src/sections/concepts.ts`

- [ ] **Step 1: Create `src/sections/concepts.ts`** with sub-headings mirroring the README "Core Concepts":

Sections and content (prose + `CodeBlock`s / a small live control-flow demo):
- Architecture at a glance — the five pieces (Sig/Bind/Cmd/View/Patch/Queue) as a `<pre>` diagram + prose.
- Signals: `sig` — `get`/`update`/`forceUpdate`/`trans`/`notify`; deep equality; `sig(v, {eq})`; in-place mutation needs `notify()`.
- Bindings — the three-field `Bind` record; `text(name)` example.
- Derived signals: `compute` — one-signal and record forms; lazy upstream.
- Templates: `html` — content vs attribute positions (table); `raw`/`text`; parsing/caching notes.
- Patching an element: `patch` — props form + command table; static vs reactive values.
- Control flow — `view`/`repeat`/`list`/`frag` table + examples.
- Boundaries and teardown — `boundary()` / `cleanBinds()` / `render` disposer.
- The update queue — batched/coalesced/error-isolated.
- What Sigula deliberately does not have — the README table.

Use `headingSection('core-concepts', 'Core Concepts', body)` and give each sub-heading an `id` (`concepts-architecture`, `concepts-signals`, …) so deep links work. Body built with `html` + `CodeBlock` + `ApiTable` for the tables. (No `data-heading`; the right TOC is gone.)

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: exit 0. (Not yet in the registry — that is Task 9.)

- [ ] **Step 3: Commit**

```bash
git add src/sections/concepts.ts
git commit -m "feat: add Core Concepts section"
```

---

## Task 6: API Cheat Sheet, Errors refresh, and How it compares

**Files:**
- Create: `src/sections/cheatsheet.ts`, `src/sections/compare.ts`
- Modify: `src/sections/errors.ts`

- [ ] **Step 1: Create `src/sections/cheatsheet.ts`** — the README export table via `ApiTable`:

Rows (Export | Kind | Returns): `sig(v, opts?)`, `compute(...)`, `html`, `text`, `raw`, `patch`, the patch commands row, `view`, `repeat`, `list`, `frag`, `render`, `createBind`/`removeBind`/`eq`/`toBoundary`/`walkBoundary`, types row. Wrap with `headingSection('api-cheatsheet', 'API Cheat Sheet', body)`.

- [ ] **Step 2: Update `src/sections/errors.ts`**

Change the E4 meaning to use `styleProp` instead of `styleProperty`:
```ts
      ['E4', 'patch', 'A keyed command (`attr`, `style`, `styleProp`, `toggleClass`) was given no key.'],
```
Everything else (E1–E12) is already accurate for 2.0.1.

- [ ] **Step 3: Create `src/sections/compare.ts`** — the README comparison table via `ApiTable`:

Headers: `''`, `Sigula`, `Lit`, `Solid`, `React`. Rows: update model, compiler required, component re-runs, approx size, templating, standard web components. Include the README's size-disclaimer italic note. Wrap with `headingSection('compare', 'How it compares', body)`.

- [ ] **Step 4: Verify + commit**

Run: `pnpm exec tsc --noEmit && pnpm build`
```bash
git add src/sections/cheatsheet.ts src/sections/compare.ts src/sections/errors.ts
git commit -m "feat: add cheat sheet and comparison sections, refresh errors"
```

---

## Task 7: Reference detail — Reactivity and Templates

**Files:**
- Modify: `src/sections/reactivity.ts`, `src/sections/templates.ts`, `src/sections/api.ts`

- [ ] **Step 1: Update `src/sections/api.ts`**

- `buildApiSection(sectionId, entries)` returns `{render: () => View}` (drop `headings`).
- Keep `headingSection(sectionId, title, body)`; drop `data-heading` if not already done.

```ts
export const buildApiSection = (
  sectionId: string,
  entries: ApiEntryData[],
): {render: () => View} => {
  const items = entries.map((entry) => ({
    anchorId: `${sectionId}-${slug(entry.name)}`,
    entry,
  }));
  return {
    render: (): View =>
      html`<div>
        ${list(items, (item) => ApiEntry({anchorId: item.anchorId, ...item.entry}))}
      </div>`,
  };
};
```

Use `list` (static data). Update the import to include `list`; drop `repeat`/`sig` if now unused.

- [ ] **Step 2: Rewrite `src/sections/reactivity.ts`** entries (signatures from `Reference.md`/`d.ts`):

`sig` (`const sig: <T>(v: T, opts?: {eq?: Eq<T>}) => Sig<T>;`), `compute` (both overloads), `Sig` (member table including `notify`), `DerivedSig`, `eq` (renamed from `isEqual`), `Equatable`, `Eq`, `Reactive`, `UnknownRecord`, `SigRecord`, `ValRecord`, `createBind`/`removeBind`. Render via `headingSection('reactivity', 'Reactivity', built.render())`.

- [ ] **Step 3: Rewrite `src/sections/templates.ts`** entries:

`html` (three interpolation kinds; `HtmlItem`), `text`, `raw` (**unescaped** warning), `View` (new shape with `cleanBinds`/`boundary`/`children`), `ChildView`, `replaceWithView`. Render via `headingSection('templates', 'Templates', built.render())`.

- [ ] **Step 4: Verify + commit**

Run: `pnpm exec tsc --noEmit && pnpm build`
```bash
git add src/sections/api.ts src/sections/reactivity.ts src/sections/templates.ts
git commit -m "feat: refresh reactivity and templates reference"
```

---

## Task 8: Reference detail — DOM bindings, Control flow, Rendering, Low-level API

**Files:**
- Modify: `src/sections/bindings.ts`, `src/sections/controlflow.ts`, `src/sections/rendering.ts`, `src/sections/lowlevel.ts`

- [ ] **Step 1: Rewrite `src/sections/bindings.ts`** entries (key-first signatures):

`patch` (props form + command form), `PatchProps` (member table), `id`, `val`, `attr` (`attr(key, source)`), `style` (`style(key, source)`), `styleProp`, `toggleClass` (`toggleClass(token, source)`), `toggleClasses`, `on`, `act` (`ActFn<T> = (elem: Element, val?: T)`), `Patch`/`PatchItem`/`ToPatchItem`/`AnyPatchItem`/`ToAnyPatchItem`, `PatchContext`, `WritableStyleKey`. Render via `headingSection('bindings', 'DOM bindings', built.render())`.

- [ ] **Step 2: Rewrite `src/sections/controlflow.ts`**

Entries: `view`, `repeat` (options table with `eq`), `list`, `frag`. Then append the live `${Todos()}` demo. Keep the manual composition pattern (entries via `ApiEntry` + demo). Render via `headingSection('control-flow', 'Control flow', body)`.

- [ ] **Step 3: Rewrite `src/sections/rendering.ts`** — single `render` entry (unchanged signature). Render via `headingSection('rendering', 'Rendering', built.render())`.

- [ ] **Step 4: Rewrite `src/sections/lowlevel.ts`** entries: `Boundary`, `toBoundary`, `walkBoundary`, `removeBoundary`, `replaceWithNode`, `Cmd`/`AnyCmd`/`CmdContext`, `at`, `err`. Render via `headingSection('low-level', 'Low-level API', built.render())`.

- [ ] **Step 5: Verify + commit**

Run: `pnpm exec tsc --noEmit && pnpm build`
```bash
git add src/sections/bindings.ts src/sections/controlflow.ts src/sections/rendering.ts src/sections/lowlevel.ts
git commit -m "feat: refresh DOM bindings, control flow, rendering, low-level reference"
```

---

## Task 9: Registry, remove old sections, drop `headings`

**Files:**
- Modify: `src/sections/index.ts`, `src/sections/types.ts`
- Delete: `src/sections/core.ts`, `src/sections/model.ts`

- [ ] **Step 1: Update `src/sections/types.ts`** — remove the `Heading` interface and the `headings` field:

```ts
import type {View} from 'sigula';

export type SectionGroup = 'Introduction' | 'Concepts' | 'Reference' | 'Appendix';

export interface SectionMeta {
  id: string;
  title: string;
  group: SectionGroup;
  render: () => View;
}
```

- [ ] **Step 2: Rewrite `src/sections/index.ts`**

```ts
import {bindings} from './bindings';
import {cheatsheet} from './cheatsheet';
import {compare} from './compare';
import {concepts} from './concepts';
import {controlflow} from './controlflow';
import {demo} from './demo';
import {errors} from './errors';
import {features} from './features';
import {hero} from './hero';
import {installation} from './installation';
import {lowlevel} from './lowlevel';
import {quickstart} from './quickstart';
import {reactivity} from './reactivity';
import {rendering} from './rendering';
import {templates} from './templates';
import type {SectionGroup, SectionMeta} from './types';

export type {SectionMeta} from './types';

export const sections: SectionMeta[] = [
  hero,
  features,
  installation,
  quickstart,
  demo,
  concepts,
  cheatsheet,
  reactivity,
  templates,
  bindings,
  controlflow,
  rendering,
  lowlevel,
  errors,
  compare,
];

export interface NavGroup {
  name: SectionGroup;
  items: SectionMeta[];
}

const groupOrder: SectionGroup[] = [
  'Introduction',
  'Concepts',
  'Reference',
  'Appendix',
];

export const navGroups: NavGroup[] = groupOrder
  .map((name) => ({name, items: sections.filter((section) => section.group === name)}))
  .filter((group) => group.items.length > 0);
```

- [ ] **Step 3: Delete old sections and remove leftover `headings` fields**

```bash
git rm src/sections/core.ts src/sections/model.ts
rg -n 'headings' src/sections   # remove any remaining `headings:` properties from section objects
```

- [ ] **Step 4: Verify**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: rebuild section registry for 2.0.1 structure"
```

---

## Task 10: Final verification

**Files:** none

- [ ] **Step 1: Type check and build**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: both exit 0; report asset sizes.

- [ ] **Step 2: Browser checklist at `http://localhost:5173`**

- [ ] No right column; centered content with sticky left nav.
- [ ] Nav groups: Introduction, Concepts, Reference, Appendix; active section highlights on scroll.
- [ ] Hero badges show `v2.0.1` and `~4.5KB`; install copy button works.
- [ ] Demo section: Equation +/- updates all values (`NaN` at y=0); Todos add/toggle(line-through)/filter/remove/empty.
- [ ] Quick Start code blocks highlight; copy works.
- [ ] Core Concepts sub-headings; API Cheat Sheet and comparison tables render.
- [ ] Theme toggle persists; mobile drawer opens and closes on nav selection.
- [ ] `/#reactivity-compute` and `/#control-flow-repeat` scroll to the right entries.
- [ ] No console errors.

- [ ] **Step 3: Confirm clean tree**

```bash
git status --short
```

---

## Self-Review Notes

- **Spec coverage:** layout (T2), migration (T1), new helpers (T3/T4/T7), content structure (T4–T9), demos (T3/T4), errors/compare (T6), verification (T10).
- **Ordering:** T1 restores a green build (the repo is red after the 2.0.1 install). T4–T8 add/rewrite sections without touching the registry; T9 flips the registry and deletes `core.ts`/`model.ts` last so the build never references a missing module.
- **Dead code:** `headings`/`Heading`/`data-heading`/`headingsBySection`/`Toc` are removed across T2 and T9.
- **Risk:** `raw()` in `rich()` is the only unescaped injection path; it escapes input first, so authored content is safe.
