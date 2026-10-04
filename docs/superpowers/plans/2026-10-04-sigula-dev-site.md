# sigula.dev Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `sigula.dev` single-page marketing + documentation site, rendered entirely with the Sigula framework itself.

**Architecture:** A `sections` registry (array of `SectionMeta`) drives both the content and the left nav. Reusable primitives (`CodeBlock`, `ApiTable`, `ApiEntry`, `Callout`, `Badge`, `rich`) render docs. Reference sections are data arrays mapped through `buildApiSection`. Highlights: live Equation + Todos demos, scroll-spy nav, light/dark theme.

**Tech Stack:** TypeScript, Vite 8, UnoCSS (`presetWind4`, class dark mode), Sigula 1.0.3, highlight.js 11.

**Content sources:** Prose/descriptions are transcribed from the README at `https://raw.githubusercontent.com/sigulajs/sigula/main/README.md`. Signatures/API surface MUST match the installed `node_modules/.pnpm/sigula@1.0.3/node_modules/sigula/dist/sigula.d.ts` (it differs from the README: no `walkBoundary`; `Patch`/`View` shapes differ). When in doubt, the `.d.ts` wins.

**Verification model:** The repo has no test framework (spec explicitly scopes one out). Each task is verified with `pnpm build` (`tsc && vite build`) plus a browser check at the running Vite server. Run `pnpm exec tsc --noEmit` for a fast type check during development.

**Important Sigula constraints discovered from `sigula.d.ts` / README:**
- `html` interpolations MUST be a `View` (from `text`, `view`, `repeat`, `html`, `patch`) — never a raw string. Wrap dynamic strings in `text(...)`.
- `patch(...)` MUST be in attribute position; `text(...)`/`view(...)`/`repeat(...)` in content position.
- `html`'s template cache keys on call site; interpolation count per call site must be constant. Never build a variable number of `${}` slots in one literal — use `repeat` for lists.
- `html`` throws `E10`. Use `text('')` as the empty view.
- Lists/tables use `repeat(Sig<T[]>, {key, view})`; `key` must be unique.

---

## File Structure

```
index.html                     shell only: <div id="app"></div> + module script
src/
  main.ts                      entry: mount Layout, scroll-spy, hash restore
  theme.ts                     theme signal + apply/persist
  style.css                    CSS variables, .prose, nav/toc, hljs token theme
  scroll.ts                    scroll-spy + hash restore helpers
  components/
    rich.ts                    inline `code` markup -> View (fragment)
    Badge.ts                   pill
    Callout.ts                 note box
    CopyButton.ts              clipboard copy with feedback
    CodeBlock.ts               highlight.js wrapper
    ApiTable.ts                generic table
    ApiEntry.ts                name + signature + description + table + example
    Nav.ts                     grouped section links with active state
    Toc.ts                     right "On this page" list for active section
    Layout.ts                  header + 3-column shell + footer + mobile nav
    demos/Equation.ts          live Equation demo
    demos/Todos.ts             live Todos demo
  snippets/
    quickstart.txt             full Quick Start code sample (imported with ?raw)
  sections/
    types.ts                   Heading, SectionMeta
    api.ts                     buildApiSection + slug
    index.ts                   assembled sections + nav groups + headings map
    hero.ts features.ts quickstart.ts core.ts
    reactivity.ts templates.ts bindings.ts
    controlflow.ts rendering.ts lowlevel.ts errors.ts model.ts
```

---

## Task 1: Add highlight.js

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Install the dependency**

Run:
```bash
pnpm add highlight.js@^11.12.0
```
Expected: `highlight.js` appears under `dependencies`.

- [ ] **Step 2: Verify the project still builds**

Run:
```bash
pnpm build
```
Expected: completes with no errors (currently only the placeholder `main.ts`).

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add highlight.js"
```

---

## Task 2: Theme + global styles

**Files:**
- Create: `src/theme.ts`
- Modify: `src/style.css` (replace contents)
- Modify: `src/main.ts` (temporarily import styles + theme)

- [ ] **Step 1: Create `src/theme.ts`**

```ts
import {sig} from 'sigula';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'sigula-theme';

const readStored = (): Theme | undefined => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : undefined;
  } catch {
    return undefined;
  }
};

const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const theme = sig<Theme>(readStored() ?? systemTheme());

const apply = (value: Theme): void => {
  document.documentElement.classList.toggle('dark', value === 'dark');
  document.documentElement.style.colorScheme = value;
};

const persist = (value: Theme): void => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // storage unavailable; ignore
  }
};

export const setTheme = (value: Theme): void => {
  theme.update(value);
  apply(value);
  persist(value);
};

export const toggleTheme = (): void => {
  setTheme(theme.get() === 'dark' ? 'light' : 'dark');
};

apply(theme.get());

try {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (event) => {
      if (!readStored()) setTheme(event.matches ? 'dark' : 'light');
    });
} catch {
  // matchMedia unavailable; ignore
}
```

- [ ] **Step 2: Replace `src/style.css`**

```css
:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --bg-soft: #faf8fd;
  --border: #e5e4e7;
  --code-bg: #f4f3ec;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --social-bg: rgba(244, 243, 236, 0.5);
  --shadow: rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --heading: system-ui, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, SFMono-Regular, Consolas, monospace;

  font: 16px/1.6 var(--sans);
  color-scheme: light dark;
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.dark {
  --text: #9ca3af;
  --text-h: #f3f4f6;
  --bg: #16171d;
  --bg-soft: #1b1c23;
  --border: #2e303a;
  --code-bg: #1f2028;
  --accent: #c084fc;
  --accent-bg: rgba(192, 132, 252, 0.15);
  --accent-border: rgba(192, 132, 252, 0.5);
  --social-bg: rgba(47, 48, 58, 0.5);
  --shadow: rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--bg);
}

a {
  color: var(--accent);
}

.prose {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text);
}

.prose h2 {
  font-size: 30px;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 48px 0 16px;
  color: var(--text-h);
  scroll-margin-top: 88px;
}

.prose h3 {
  font-size: 22px;
  line-height: 1.3;
  margin: 36px 0 12px;
  color: var(--text-h);
  scroll-margin-top: 88px;
}

.prose p {
  margin: 16px 0;
}

.prose ul,
.prose ol {
  margin: 16px 0;
  padding-left: 1.4em;
}

.prose li {
  margin: 6px 0;
}

.prose strong {
  color: var(--text-h);
}

.prose code {
  font-family: var(--mono);
  font-size: 0.875em;
  background: var(--code-bg);
  color: var(--text-h);
  padding: 0.15em 0.4em;
  border-radius: 4px;
}

.prose a {
  text-decoration: none;
}

.prose a:hover {
  text-decoration: underline;
}

.nav-link,
.toc-link {
  display: block;
  border-radius: 6px;
  padding: 5px 12px;
  color: var(--text);
  text-decoration: none;
  font-size: 14px;
  line-height: 1.4;
  transition: background 0.15s, color 0.15s;
}

.nav-link:hover,
.toc-link:hover {
  background: var(--accent-bg);
  color: var(--text-h);
}

.nav-link.active {
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 600;
}

.toc-link.active {
  color: var(--accent);
}

.hljs {
  color: var(--text-h);
  background: transparent;
}

.hljs-comment,
.hljs-quote {
  color: #8a8f98;
  font-style: italic;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-section,
.hljs-link {
  color: #aa3bff;
}

.hljs-string,
.hljs-attr,
.hljs-template-tag,
.hljs-template-variable {
  color: #16a34a;
}

.hljs-number,
.hljs-built_in,
.hljs-type,
.hljs-params {
  color: #d97706;
}

.hljs-title,
.hljs-title.function_,
.hljs-name {
  color: #2563eb;
}

.hljs-tag {
  color: #6b7280;
}

.hljs-variable,
.hljs-regexp {
  color: #db2777;
}

.dark .hljs-keyword,
.dark .hljs-selector-tag,
.dark .hljs-literal,
.dark .hljs-section,
.dark .hljs-link {
  color: #c084fc;
}

.dark .hljs-string,
.dark .hljs-attr,
.dark .hljs-template-tag,
.dark .hljs-template-variable {
  color: #4ade80;
}

.dark .hljs-number,
.dark .hljs-built_in,
.dark .hljs-type,
.dark .hljs-params {
  color: #fbbf24;
}

.dark .hljs-title,
.dark .hljs-title.function_,
.dark .hljs-name {
  color: #60a5fa;
}

.dark .hljs-variable,
.dark .hljs-regexp {
  color: #f472b6;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}
```

- [ ] **Step 3: Update `src/main.ts` temporarily**

```ts
import 'virtual:uno.css';
import './style.css';
import './theme';
import {html, render} from 'sigula';

const appNode = document.querySelector('#app');
if (!appNode) throw new Error('#app not found');
render(html`<p style="padding: 2rem">theme check</p>`, appNode);
```

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: PASS. `tsc` may error on `import './theme'` under `noUncheckedSideEffectImports` — if so, change to `import './theme.ts'` (the tsconfig sets `allowImportingTsExtensions`).

- [ ] **Step 5: Manual check**

Run `pnpm dev` (already running at `http://localhost:5173`). Toggle OS theme; page background and text colors swap.
Expected: light and dark both render, purple accent link.

- [ ] **Step 6: Commit**

```bash
git add src/theme.ts src/style.css src/main.ts
git commit -m "feat: theme signal and global docs styles"
```

---

## Task 3: Rendering primitives

**Files:**
- Create: `src/components/rich.ts`
- Create: `src/components/Badge.ts`
- Create: `src/components/Callout.ts`
- Create: `src/components/CopyButton.ts`
- Create: `src/components/CodeBlock.ts`

- [ ] **Step 1: Create `src/components/rich.ts`**

```ts
import type {View} from 'sigula';

export const rich = (value: string): View => {
  const frag = document.createDocumentFragment();
  for (const part of value.split(/(`[^`]*`)/g)) {
    if (part === '') continue;
    if (part.length >= 2 && part.startsWith('`') && part.endsWith('`')) {
      const code = document.createElement('code');
      code.textContent = part.slice(1, -1);
      frag.appendChild(code);
    } else {
      frag.appendChild(document.createTextNode(part));
    }
  }
  if (!frag.firstChild) frag.appendChild(document.createTextNode(''));
  return {type: 'view', node: frag};
};
```

- [ ] **Step 2: Create `src/components/Badge.ts`**

```ts
import {html, text, type View} from 'sigula';

export const Badge = (label: string): View =>
  html`<span class="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--social-bg)] px-2 py-0.5 text-xs font-medium text-[var(--text-h)]">${text(label)}</span>`;
```

- [ ] **Step 3: Create `src/components/Callout.ts`**

```ts
import {html, text, type View} from 'sigula';
import {rich} from './rich';

export const Callout = (title: string, body: string): View =>
  html`<div class="my-5 rounded-lg border border-[var(--border)] border-l-4 border-l-[var(--accent)] bg-[var(--accent-bg)] p-4">
    <p class="mb-1 font-semibold text-[var(--text-h)]">${text(title)}</p>
    <p class="text-sm leading-relaxed text-[var(--text)]">${rich(body)}</p>
  </div>`;
```

- [ ] **Step 4: Create `src/components/CopyButton.ts`**

```ts
import {attr, html, on, patch, sig, text, view, type View} from 'sigula';

const copy = async (value: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    // fall through to legacy path
  }
  const area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand('copy');
  } catch {
    // ignore
  }
  area.remove();
};

export const CopyButton = (value: string, label = 'Copy'): View => {
  const copied = sig(false);
  const onClick = (): void => {
    void copy(value).then(() => {
      copied.update(true);
      window.setTimeout(() => copied.update(false), 1500);
    });
  };
  return html`<button
    type="button"
    ${patch(on('click', onClick), attr('aria-label', 'Copy to clipboard'))}
    class="shrink-0 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs text-[var(--text)] transition hover:border-[var(--accent-border)] hover:text-[var(--text-h)]"
  >${view(copied, (done) => text(done ? 'Copied!' : label))}</button>`;
};
```

- [ ] **Step 5: Create `src/components/CodeBlock.ts`**

```ts
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import {act, html, patch, text, type View} from 'sigula';
import {CopyButton} from './CopyButton';

let langsReady = false;

const ensureLangs = (): void => {
  if (langsReady) return;
  hljs.registerLanguage('typescript', typescript);
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('xml', xml);
  hljs.registerLanguage('html', xml);
  hljs.registerLanguage('bash', bash);
  hljs.registerLanguage('json', json);
  langsReady = true;
};

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const highlight = (code: string, lang: string): string => {
  ensureLangs();
  try {
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(code, {language: lang, ignoreIllegals: true}).value;
    }
  } catch {
    // fall back to escaped source
  }
  return escapeHtml(code);
};

export interface CodeBlockProps {
  code: string;
  lang?: string;
  filename?: string;
}

export const CodeBlock = ({
  code,
  lang = 'typescript',
  filename,
}: CodeBlockProps): View => {
  const source = code.trim();
  const highlighted = highlight(source, lang);
  const title = filename ?? lang;
  return html`<div class="my-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--code-bg)]">
    <div class="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2">
      <span class="font-mono text-xs text-[var(--text)]">${text(title)}</span>
      ${CopyButton(source, 'Copy')}
    </div>
    <pre class="overflow-x-auto p-4 text-[13px] leading-relaxed"><code class="hljs" ${patch(act(highlighted, (node, value) => { node.innerHTML = String(value); }))}></code></pre>
  </div>`;
};
```

- [ ] **Step 6: Build**

Run: `pnpm exec tsc --noEmit`
Expected: PASS. If highlight.js subpath imports have no type declarations, create `src/hljs.d.ts`:
```ts
declare module 'highlight.js/lib/core';
declare module 'highlight.js/lib/languages/*';
```
Then re-run and expect PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components
git commit -m "feat: rendering primitives (rich, badge, callout, copy, code block)"
```

---

## Task 4: API table + entry

**Files:**
- Create: `src/components/ApiTable.ts`
- Create: `src/components/ApiEntry.ts`

- [ ] **Step 1: Create `src/components/ApiTable.ts`**

```ts
import {html, repeat, sig, text, type View} from 'sigula';

export interface ApiTableData {
  headers: string[];
  rows: string[][];
}

export const ApiTable = ({headers, rows}: ApiTableData): View => {
  const head = sig(headers.map((value, index) => ({index, value})));
  const body = sig(rows.map((cells, index) => ({index, cells})));
  return html`<div class="my-4 overflow-x-auto rounded-lg border border-[var(--border)]">
    <table class="w-full border-collapse text-left text-sm">
      <thead class="bg-[var(--bg-soft)]">
        <tr>
          ${repeat(head, {
            key: (item) => String(item.index),
            view: (item) => html`<th class="border-b border-[var(--border)] px-3 py-2 font-semibold text-[var(--text-h)]">${text(item.value)}</th>`,
          })}
        </tr>
      </thead>
      <tbody>
        ${repeat(body, {
          key: (item) => String(item.index),
          view: (row) => html`<tr class="border-b border-[var(--border)] align-top last:border-0">
            ${repeat(sig(row.cells.map((value, index) => ({index, value}))), {
              key: (item) => String(item.index),
              view: (cell) => html`<td class="px-3 py-2 text-[var(--text)]">${text(cell.value)}</td>`,
            })}
          </tr>`,
        })}
      </tbody>
    </table>
  </div>`;
};
```

- [ ] **Step 2: Create `src/components/ApiEntry.ts`**

```ts
import {html, id, patch, text, type View} from 'sigula';
import {ApiTable, type ApiTableData} from './ApiTable';
import {CodeBlock, type CodeBlockProps} from './CodeBlock';
import {rich} from './rich';

export interface ApiEntryProps {
  anchorId: string;
  name: string;
  signature?: string;
  description: string;
  table?: ApiTableData;
  example?: Omit<CodeBlockProps, 'filename'>;
}

export const ApiEntry = ({
  anchorId,
  name,
  signature,
  description,
  table,
  example,
}: ApiEntryProps): View => {
  const tableView = table ? ApiTable(table) : text('');
  const exampleView = example ? CodeBlock(example) : text('');
  return html`<div class="my-8 scroll-mt-24" ${patch(id(anchorId))} data-heading="">
    <h3 class="font-mono text-lg font-semibold text-[var(--text-h)]">${text(name)}</h3>
    ${signature ? CodeBlock({code: signature, lang: 'typescript'}) : text('')}
    <p class="mt-3 leading-relaxed text-[var(--text)]">${rich(description)}</p>
    ${tableView}
    ${exampleView}
  </div>`;
};
```

- [ ] **Step 3: Build**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/ApiTable.ts src/components/ApiEntry.ts
git commit -m "feat: API table and entry components"
```

---

## Task 5: Live Equation demo

**Files:**
- Create: `src/components/demos/Equation.ts`

- [ ] **Step 1: Create `src/components/demos/Equation.ts`**

```ts
import {compute, html, on, patch, sig, text, type Sig, type View} from 'sigula';

export const Equation = (): View => {
  const x = sig(0);
  const y = sig(1);
  const sum = compute({x, y}, (v) => v.x + v.y);
  const diff = compute({x, y}, (v) => v.x - v.y);
  const product = compute({x, y}, (v) => v.x * v.y);
  const quotient = compute({x, y}, (v) => (v.y === 0 ? Number.NaN : v.x / v.y));
  const squareDiff = compute({x, y}, (v) => v.x * v.x - v.y * v.y);

  const stepper = (label: string, value: Sig<number>): View => html`
    <div class="flex items-center justify-between gap-2">
      <span class="font-mono text-sm text-[var(--text-h)]">${text(label)} = ${text(value)}</span>
      <span class="flex gap-1">
        <button ${patch(on('click', () => value.trans((v) => v - 1)))} class="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--text-h)] transition hover:border-[var(--accent-border)]">-1</button>
        <button ${patch(on('click', () => value.trans((v) => v + 1)))} class="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--text-h)] transition hover:border-[var(--accent-border)]">+1</button>
      </span>
    </div>`;

  const row = (label: string, result: Sig<number>): View => html`
    <div class="flex items-baseline justify-between gap-3 border-b border-[var(--border)] py-1.5 last:border-0">
      <span class="text-sm text-[var(--text)]">${text(label)}</span>
      <span class="font-mono text-sm text-[var(--text-h)]">${text(result)}</span>
    </div>`;

  return html`<div class="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4 shadow-[var(--shadow)]">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="font-mono text-sm font-semibold text-[var(--text-h)]">Equation</h3>
      <span class="text-xs text-[var(--text)]">live · rendered with sigula</span>
    </div>
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

- [ ] **Step 2: Build**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Manual check**

Temporarily render `${Equation()}` from `main.ts` and confirm +/- updates all derived values live in the browser.
Expected: sum/difference/product/quotient/x²-y² all update; quotient shows `NaN` at y=0.

- [ ] **Step 4: Commit**

```bash
git add src/components/demos/Equation.ts
git commit -m "feat: live Equation demo"
```

---

## Task 6: Live Todos demo

**Files:**
- Create: `src/components/demos/Todos.ts`

- [ ] **Step 1: Create `src/components/demos/Todos.ts`**

```ts
import {
  compute,
  html,
  on,
  patch,
  repeat,
  sig,
  style,
  text,
  val,
  view,
  type Sig,
  type View,
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
        return v.todos.filter((item) => !item.done.get());
      case 'done':
        return v.todos.filter((item) => item.done.get());
      default:
        return v.todos;
    }
  });

  const isEmpty = compute(visible, (v) => v.length === 0);

  const addTodo = (event: Event): void => {
    event.preventDefault();
    const value = input.get().trim();
    if (!value) return;
    todos.trans((items) => [
      ...items,
      {id: Date.now(), text: value, done: sig(false)},
    ]);
    input.update('');
  };

  const remove = (id: number): void => {
    todos.trans((items) => items.filter((item) => item.id !== id));
  };

  const itemView = (item: Todo): View => html`<li class="flex items-center justify-between gap-2 border-b border-[var(--border)] py-1.5 last:border-0">
    <label class="flex items-center gap-2">
      <input type="checkbox" ${patch(on('change', () => item.done.trans((v) => !v)))} />
      <span ${patch(style(compute(item.done, (v): string => (v ? 'line-through' : 'none')), 'textDecoration'))}>${text(item.text)}</span>
    </label>
    <button ${patch(on('click', () => remove(item.id)))} class="rounded-md px-2 text-[var(--text)] transition hover:text-[var(--accent)]">×</button>
  </li>`;

  const filterButton = (value: 'all' | 'active' | 'done'): View => html`<button ${patch(on('click', () => filter.update(value)))} class="rounded-md border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text)] capitalize transition hover:border-[var(--accent-border)]">${text(value)}</button>`;

  return html`<div class="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4">
    <h3 class="mb-3 font-mono text-sm font-semibold text-[var(--text-h)]">Todos</h3>
    <form ${patch(on('submit', addTodo))} class="flex gap-2">
      <input ${patch(
        val(input),
        on('input', (event) => {
          const target = event.target;
          if (target instanceof HTMLInputElement) input.update(target.value);
        }),
      )} placeholder="What needs doing?" class="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent-border)]" />
      <button class="rounded-md bg-[var(--accent)] px-3 py-1 text-sm font-medium text-white transition hover:opacity-90">Add</button>
    </form>
    <div class="my-3 flex gap-1">
      ${filterButton('all')}${filterButton('active')}${filterButton('done')}
    </div>
    ${view(isEmpty, (empty) =>
      empty
        ? html`<p class="py-4 text-center text-sm text-[var(--text)]">Nothing here yet.</p>`
        : html`<ul>
            ${repeat(visible, {
              key: (item) => String(item.id),
              view: (item) => itemView(item),
            })}
          </ul>`,
    )}
  </div>`;
};
```

- [ ] **Step 2: Build**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Manual check**

Temporarily render `${Todos()}` from `main.ts`. Add items, toggle done (line-through), filter all/active/done, remove.
Expected: list and empty state behave as in the README.

- [ ] **Step 4: Commit**

```bash
git add src/components/demos/Todos.ts
git commit -m "feat: live Todos demo"
```

---

## Task 7: Section infrastructure + intro sections

**Files:**
- Create: `src/sections/types.ts`
- Create: `src/sections/api.ts`
- Create: `src/sections/hero.ts`
- Create: `src/sections/features.ts`
- Create: `src/snippets/quickstart.txt`
- Create: `src/sections/quickstart.ts`
- Create: `src/sections/core.ts`

- [ ] **Step 1: Create `src/sections/types.ts`**

```ts
import type {View} from 'sigula';

export interface Heading {
  id: string;
  title: string;
}

export interface SectionMeta {
  id: string;
  title: string;
  group: string;
  headings: Heading[];
  render: () => View;
}
```

- [ ] **Step 2: Create `src/sections/api.ts`**

```ts
import {html, repeat, sig, type View} from 'sigula';
import {ApiEntry, type ApiEntryProps} from '../components/ApiEntry';
import type {Heading} from './types';

export type ApiEntryData = Omit<ApiEntryProps, 'anchorId'>;

export const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const buildApiSection = (
  sectionId: string,
  entries: ApiEntryData[],
): {headings: Heading[]; render: () => View} => {
  const items = entries.map((entry) => ({
    anchorId: `${sectionId}-${slug(entry.name)}`,
    entry,
  }));
  return {
    headings: items.map((item) => ({
      id: item.anchorId,
      title: item.entry.name,
    })),
    render: (): View =>
      html`<div>
        ${repeat(sig(items), {
          key: (item) => item.anchorId,
          view: (item) => ApiEntry({anchorId: item.anchorId, ...item.entry}),
        })}
      </div>`,
  };
};
```

- [ ] **Step 3: Create `src/sections/hero.ts`**

```ts
import {html, type View} from 'sigula';
import {Badge} from '../components/Badge';
import {CopyButton} from '../components/CopyButton';
import {Equation} from '../components/demos/Equation';
import type {SectionMeta} from './types';

export const hero: SectionMeta = {
  id: 'overview',
  title: 'Overview',
  group: 'Introduction',
  headings: [{id: 'overview', title: 'Sigula'}],
  render: (): View => html`<section id="overview" class="scroll-mt-24 pt-4">
    <div class="grid items-start gap-10 @4xl:grid-cols-2">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          ${Badge('v1.0.3')}
          ${Badge('~4.0KB gzipped')}
          ${Badge('No virtual DOM')}
        </div>
        <h1 class="mt-4 text-4xl font-semibold tracking-tight text-[var(--text-h)] @3xl:text-5xl">
          Tiny web framework with fine-grained signal reactivity
        </h1>
        <p class="mt-4 text-lg leading-relaxed text-[var(--text)]">
          A minimal, signal-based web framework with fine-grained reactivity.
          No virtual DOM — just direct, minimal updates to the real DOM.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="#quick-start" class="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">Get started</a>
          <a href="https://github.com/sigulajs/sigula" class="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-h)] transition hover:border-[var(--accent-border)]">GitHub</a>
        </div>
        <div class="mt-6 flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--code-bg)] px-4 py-3">
          <code class="font-mono text-sm text-[var(--text-h)]">npm install sigula</code>
          ${CopyButton('npm install sigula')}
        </div>
      </div>
      <div>${Equation()}</div>
    </div>
  </section>`,
};
```

- [ ] **Step 4: Create `src/sections/features.ts`**

```ts
import {html, repeat, sig, text, type View} from 'sigula';
import type {SectionMeta} from './types';

const features: {title: string; body: string}[] = [
  {
    title: 'Fine-grained reactivity',
    body: 'When state changes, only the DOM nodes that depend on it are updated — not the whole component tree.',
  },
  {
    title: 'Declarative signals',
    body: 'Describe data sources with signals, then bind them precisely to the DOM, to effects, or to other signals.',
  },
  {
    title: 'No virtual DOM',
    body: 'No diffing, no VNodes. Direct real DOM operations with minimal runtime overhead.',
  },
  {
    title: 'Minimal HTML templates',
    body: 'Native string templates. No custom compiler, no DSL — just JavaScript strings with editor support.',
  },
  {
    title: 'Batched, coalesced updates',
    body: 'Writes queue in a microtask, so a signal touched many times before the flush runs its bindings once.',
  },
  {
    title: 'Ultra small',
    body: 'Around 4.0KB minified and gzipped, with a tiny API surface and full type inference.',
  },
];

export const features: SectionMeta = {
  id: 'features',
  title: 'Features',
  group: 'Introduction',
  headings: [{id: 'features', title: 'Features'}],
  render: (): View => html`<section id="features" class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">Features</h2>
    <div class="mt-6 grid gap-4 @3xl:grid-cols-2">
      ${repeat(sig(features), {
        key: (feature) => feature.title,
        view: (feature) => html`<div class="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4">
          <h3 class="mb-1 font-semibold text-[var(--text-h)]">${text(feature.title)}</h3>
          <p class="text-sm leading-relaxed text-[var(--text)]">${text(feature.body)}</p>
        </div>`,
      })}
    </div>
  </section>`,
};
```

- [ ] **Step 5: Create the Quick Start snippet and section**

First create `src/snippets/quickstart.txt` containing, verbatim, the Equation `App` example from the README "Quick Start" section (from `import {compute, html, ...` through `render(Equation(), appNode);`). A plain `.txt` file avoids escaping backticks and `${}` inside a TS string, and Vite's `?raw` import returns it as text.

Then create `src/sections/quickstart.ts`:

```ts
import {html, type View} from 'sigula';
import {CodeBlock} from '../components/CodeBlock';
import source from '../snippets/quickstart.txt?raw';
import type {SectionMeta} from './types';

export const quickstart: SectionMeta = {
  id: 'quick-start',
  title: 'Quick Start',
  group: 'Introduction',
  headings: [{id: 'quick-start', title: 'Quick Start'}],
  render: (): View => html`<section id="quick-start" data-heading="" class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">Quick Start</h2>
    <p class="mt-3 leading-relaxed text-[var(--text)]">Install Sigula, create a signal-based view, and mount it into the DOM.</p>
    ${CodeBlock({code: source, lang: 'typescript', filename: 'main.ts'})}
    <p class="leading-relaxed text-[var(--text)]">Mount it with mark-up that contains an element with <code class="rounded bg-[var(--code-bg)] px-1.5 py-0.5 font-mono text-sm text-[var(--text-h)]">id="app"</code>.</p>
  </section>`,
};
```

`vite/client` (already in `tsconfig.types`) declares the `*?raw` module, so no extra typing is needed.

- [ ] **Step 6: Create `src/sections/core.ts`**

Includes the core-concepts prose plus a small inline counter demo. Use this structure (fill prose from README "Core Concepts"):

```ts
import {compute, html, on, patch, sig, text, type View} from 'sigula';
import {Callout} from '../components/Callout';
import type {SectionMeta} from './types';

const Counter = (): View => {
  const count = sig(0);
  return html`<div class="my-4 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4">
    <button ${patch(on('click', () => count.trans((v) => v - 1)))} class="rounded-md border border-[var(--border)] px-3 py-1 text-[var(--text-h)] transition hover:border-[var(--accent-border)]">-</button>
    <span class="font-mono text-2xl text-[var(--text-h)]">${text(count)}</span>
    <button ${patch(on('click', () => count.trans((v) => v + 1)))} class="rounded-md border border-[var(--border)] px-3 py-1 text-[var(--text-h)] transition hover:border-[var(--accent-border)]">+</button>
    <span class="text-sm text-[var(--text)]">double: ${text(compute(count, (v) => v * 2))}</span>
  </div>`;
};

export const core: SectionMeta = {
  id: 'core-concepts',
  title: 'Core Concepts',
  group: 'Introduction',
  headings: [
    {id: 'fine-grained', title: 'Fine-grained updates'},
    {id: 'declarative', title: 'Declarative bindings'},
    {id: 'no-vdom', title: 'No virtual DOM'},
    {id: 'templates', title: 'Minimal templates'},
    {id: 'small', title: 'Ultra small'},
  ],
  render: (): View => html`<section id="core-concepts" class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">Core Concepts</h2>
    <h3 id="fine-grained" class="scroll-mt-24 text-xl font-semibold text-[var(--text-h)]">Fine-grained updates to the real DOM</h3>
    <p class="mt-2 leading-relaxed text-[var(--text)]">Signals hold state. Only the exact text node that depends on a signal is updated when it changes; everything else stays untouched.</p>
    ${Counter()}
    <h3 id="declarative" class="scroll-mt-24 text-xl font-semibold text-[var(--text-h)]">Declarative signal sources + precise bindings</h3>
    <p class="mt-2 leading-relaxed text-[var(--text)]">Signals are the single source of truth; every view and side effect derives from them.</p>
    <h3 id="no-vdom" class="scroll-mt-24 text-xl font-semibold text-[var(--text-h)]">No virtual DOM</h3>
    <p class="mt-2 leading-relaxed text-[var(--text)]">Mount establishes direct subscriptions between signals and DOM nodes; changes go straight to the node.</p>
    <h3 id="templates" class="scroll-mt-24 text-xl font-semibold text-[var(--text-h)]">Minimal HTML templates</h3>
    <p class="mt-2 leading-relaxed text-[var(--text)]">Templates are plain JavaScript string templates, cached per call site.</p>
    <h3 id="small" class="scroll-mt-24 text-xl font-semibold text-[var(--text-h)]">Ultra small</h3>
    <p class="mt-2 leading-relaxed text-[var(--text)]">Around 4.0KB minified and gzipped.</p>
    ${Callout('Version note', 'This site documents the installed `sigula@1.0.3` surface. Where the README differs, the shipped types are authoritative.')}
  </section>`,
};
```

- [ ] **Step 7: Build**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/sections src/snippets
git commit -m "feat: section infrastructure and intro sections"
```

---

## Task 8: Reference sections (reactivity, templates, bindings)

**Files:**
- Create: `src/sections/reactivity.ts`
- Create: `src/sections/templates.ts`
- Create: `src/sections/bindings.ts`

Each uses `buildApiSection`. Signatures come from `sigula.d.ts`; descriptions/tables from the README. Complete the `entries` data for each. The Reactivity module is shown in full; follow the same shape for the other two.

- [ ] **Step 1: Create `src/sections/reactivity.ts`**

```ts
import {buildApiSection, headingSection, type ApiEntryData} from './api';
import type {SectionMeta} from './types';

const entries: ApiEntryData[] = [
  {
    name: 'sig',
    signature:
      'const sig: <T>(v: T) => Sig<T>;',
    description:
      'Creates a writable signal holding `v`. Read it with `get`, set it with `update`, or transform it with `trans`.',
    example: {
      code: `const count = sig(0);\ncount.get(); // 0\ncount.update(1); // schedules dependents`,
    },
  },
  {
    name: 'Sig<T>',
    description:
      'The core reactive value. Writes are batched into a microtask and coalesced per binding.',
    table: {
      headers: ['Member', 'Signature', 'Description'],
      rows: [
        ['get', '(): T', 'Reads the current value.'],
        ['update', '(v: T): void', 'Sets the value and notifies dependents only when `isEqual(v, current)` is false.'],
        ['forceUpdate', '(v: T): void', 'Sets the value and always notifies dependents, even when deeply equal.'],
        ['trans', '(fn: (v: T) => T): void', 'Applies `fn` to the current value via `update`, so an equal result is skipped.'],
        ['equals', '(other: unknown): boolean', 'Two `Sig`s are equal when their values are deeply equal.'],
        ['addBind', '<C>(bind: Bind<T, C>): void', 'Registers a binding. Prefer the `patch`/`text`/`view` APIs.'],
        ['removeBind', '<C>(bind: Bind<T, C>): void', 'Unregisters a binding; runs `cleanup()` when the last one goes away.'],
        ['getBinds', '(): Bind<T, CmdContext>[]', 'Returns the current bindings.'],
        ['cleanup', '(): void', 'Hook called when a signal loses all bindings. No-op on `Sig`.'],
      ],
    },
  },
  {
    name: 'DerivedSig<T>',
    description:
      'A signal produced by `compute`. It tracks its source bindings and detaches when it loses its last consumer, re-linking and recomputing when a consumer is added again.',
    table: {
      headers: ['Member', 'Signature', 'Description'],
      rows: [
        ['addFromBind', '<S, C>(bind: Bind<S, C>): void', 'Registers a source binding.'],
        ['addBind', '<C>(bind: Bind<T, C>): void', 'Registers a consumer; re-links and recomputes once if detached.'],
        ['cleanup', '(): void', 'Removes every source binding when there are no consumers.'],
      ],
    },
  },
  {
    name: 'compute',
    signature:
      'function compute<S, T>(source: Sig<S>, fn: (v: S) => T): DerivedSig<T>;\nfunction compute<S extends SigRecord, T>(source: S, fn: (v: ValRecord<S>) => T): DerivedSig<T>;',
    description:
      'Derives a signal from one source signal, or from a record of signals (whose values are passed as a matching record). Recomputes whenever any source changes.',
    example: {
      code: `const x = sig(1);\nconst y = sig(2);\n\nconst sum = compute({x, y}, (v) => v.x + v.y); // DerivedSig<number>\nconst doubled = compute(x, (v) => v * 2); // DerivedSig<number>`,
    },
    table: {
      headers: ['Supporting type', 'Definition'],
      rows: [
        ['SigRecord', '{ [key: string]: Sig<any>; }'],
        ['ValRecord<K>', '{ [P in keyof K]: K[P] extends Sig<infer U> ? U : never; }'],
      ],
    },
  },
  {
    name: 'isEqual',
    signature: 'const isEqual: <T>(a: T, b: T) => boolean;',
    description:
      'Deep structural equality over primitives, arrays, `Date`, `RegExp`, `Map`, `Set`, and plain objects. Defers to `a.equals(b)` when `a` implements `Equatable`. Two objects with different prototypes are never equal.',
  },
  {
    name: 'Equatable',
    signature: 'interface Equatable {\n  equals(other: unknown): boolean;\n}',
    description: 'Implement this on a value type to give `isEqual` custom semantics.',
  },
  {
    name: 'UnknownRecord',
    signature: 'type UnknownRecord = Record<string, unknown>;',
    description:
      'Convenience alias for an arbitrary string-keyed object, used by the equality and signal-record helpers.',
  },
  {
    name: 'createBind / removeBind',
    signature:
      'const createBind: <T, C extends CmdContext>(sig: Sig<T>, context: C, cmd: Cmd<T, C>) => Bind<T, C>;\nconst removeBind: <T, C extends CmdContext>(bind: Bind<T, C>) => void;',
    description:
      'Low-level bind management. `createBind` wires `cmd(sig.get(), context)` to run whenever `sig` changes; `removeBind` detaches it.',
    table: {
      headers: ['Bind field', 'Type'],
      rows: [
        ['sig', 'Sig<T>'],
        ['context', 'C'],
        ['cmd', 'Cmd<T, C>'],
        ['removed', 'boolean'],
        ['queued', 'boolean | undefined'],
      ],
    },
  },
];

const built = buildApiSection('reactivity', entries);

export const reactivity: SectionMeta = {
  id: 'reactivity',
  title: 'Reactivity',
  group: 'Reference',
  headings: built.headings,
  render: () => headingSection('reactivity', 'Reactivity', built.render()),
};
```

Import line at the top of the file:
```ts
import {buildApiSection, headingSection, type ApiEntryData} from './api';
import type {SectionMeta} from './types';
```

- [ ] **Step 2: Add a shared `headingSection` helper to `src/sections/api.ts`**

Update the existing `sigula` import in `api.ts` to include `id`, `patch`, and `text`, then append:

```ts
export const headingSection = (
  sectionId: string,
  title: string,
  body: View,
): View =>
  html`<section ${patch(id(sectionId))} data-heading="" class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">${text(title)}</h2>
    <div class="mt-4">${body}</div>
  </section>`;
```

The full `api.ts` import becomes:
```ts
import {html, id, patch, repeat, sig, text, type View} from 'sigula';
```

- [ ] **Step 3: Confirm `reactivity.ts` final shape**

The file should contain only: the two imports above, the `entries` array, `const built = buildApiSection('reactivity', entries);`, and the `reactivity` export. No stray imports after statements.

- [ ] **Step 4: Create `src/sections/templates.ts`**

Entries: `html`, `text`, `View<T, C> / AnyView`, `replaceWithView`. Signatures from `sigula.d.ts`:
- `html: (strs: TemplateStringsArray, ...items: (Patch | AnyView)[]) => View`
- `text: <T>(source: T | Sig<T>) => View<T, PatchContext>`
- `View` interface (type/ node / bind / childCommits / live), `AnyView`, `ViewContext`
- `replaceWithView: (old: Boundary, view: View) => Boundary`

Describe the two interpolation kinds, template caching, `E10`/`E11`/`E12`, and include a `text` example:
```ts
{ name: 'text', signature: 'const text: <T>(source: T | Sig<T>) => View<T, PatchContext>;', description: 'Creates a text-node view. With a `Sig` the text updates whenever the signal changes; with a plain value it is static.', example: { code: 'html`<span>${text(count)}</span>`;' } }
```
Use `headingSection('templates', 'Templates', built.render())`.

- [ ] **Step 5: Create `src/sections/bindings.ts`**

Entries: `patch`, `id`, `val`, `attr`, `style`, `styleProperty`, `toggleClass`, `toggleClasses`, `act`, `on`, `Patch types`. Signatures from `sigula.d.ts`. For `patch` include the example:
```ts
example: { code: 'html`<input ${patch(val(name), attr(placeholder, \\'name\\'))} />`;' }
```
Use `headingSection('bindings', 'DOM bindings', built.render())`.

- [ ] **Step 6: Build**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/sections/reactivity.ts src/sections/templates.ts src/sections/bindings.ts src/sections/api.ts
git commit -m "feat: reactivity, templates, and bindings reference sections"
```

---

## Task 9: Reference sections (control flow, rendering, low-level, errors, model)

**Files:**
- Create: `src/sections/controlflow.ts`
- Create: `src/sections/rendering.ts`
- Create: `src/sections/lowlevel.ts`
- Create: `src/sections/errors.ts`
- Create: `src/sections/model.ts`

- [ ] **Step 1: Create `src/sections/controlflow.ts`**

Entries: `view`, `repeat` (using `buildApiSection('control-flow', ...)`), then append the live `Todos()` demo below the entries. Since `buildApiSection` only renders entries, write the section manually:

```ts
import {html} from 'sigula';
import {Todos} from '../components/demos/Todos';
import {ApiEntry, type ApiEntryProps} from '../components/ApiEntry';
import {headingSection} from './api';
import type {SectionMeta} from './types';

const viewEntry: ApiEntryProps = {
  anchorId: 'control-flow-view',
  name: 'view',
  signature: 'const view: <T>(sig: Sig<T>, viewFn: (val: T) => AnyView) => View<T>;',
  description:
    'Conditionally renders one view or another. Whenever `sig` changes, `viewFn` is called with the new value, the previous view is torn down, and a new one is mounted in its place.',
  example: { code: "html`<div>${view(isEmpty, (v) => (v ? text('empty') : list))}</div>`;" },
};

const repeatEntry: ApiEntryProps = {
  anchorId: 'control-flow-repeat',
  name: 'repeat',
  signature: 'const repeat: <T>(sig: Sig<T[]>, prop: RepeatProp<T>) => View<T[]>;',
  description:
    'Keyed list rendering. Items are matched by `key`, then reused, moved, created, or removed as few DOM nodes as possible. `compare` defaults to `isEqual`. An empty array renders an empty-list marker.',
  table: {
    headers: ['RepeatProp field', 'Type', 'Description'],
    rows: [
      ['key', '(item: T) => string', 'Unique and stable identifier for an item.'],
      ['view', '(item: T) => AnyView', 'Builds the view for an item.'],
      ['compare', '(a: T, b: T) => boolean', 'Optional comparator; defaults to `isEqual`.'],
    ],
  },
};

const body = html`<div>
  ${ApiEntry(viewEntry)}${ApiEntry(repeatEntry)}
  <h3 class="mt-8 font-mono text-lg font-semibold text-[var(--text-h)]">Live example</h3>
  ${Todos()}
</div>`;

export const controlflow: SectionMeta = {
  id: 'control-flow',
  title: 'Control flow',
  group: 'Reference',
  headings: [
    {id: 'control-flow-view', title: 'view'},
    {id: 'control-flow-repeat', title: 'repeat'},
  ],
  render: () => headingSection('control-flow', 'Control flow', body),
};
```

- [ ] **Step 2: Create `src/sections/rendering.ts`**

```ts
import {buildApiSection, headingSection, type ApiEntryData} from './api';
import type {SectionMeta} from './types';

const renderEntry: ApiEntryData = {
  name: 'render',
  signature: 'const render: (viewArg: AnyView | (() => AnyView), node: Node) => () => void;',
  description:
    'Mounts a view into `node` by appending its node. Accepts a `View` or a factory that returns one. Returns a disposer that detaches every bind in the tree and removes the nodes from `node`; calling the disposer twice is a no-op.',
  example: {
    code: "const dispose = render(App(), document.querySelector('#app')!);\ndispose();",
  },
};

const built = buildApiSection('rendering', [renderEntry]);

export const rendering: SectionMeta = {
  id: 'rendering',
  title: 'Rendering',
  group: 'Reference',
  headings: built.headings,
  render: () => headingSection('rendering', 'Rendering', built.render()),
};
```

- [ ] **Step 3: Create `src/sections/lowlevel.ts`**

```ts
import {buildApiSection, headingSection, type ApiEntryData} from './api';
import type {SectionMeta} from './types';

const entries: ApiEntryData[] = [
  {
    name: 'Boundary',
    signature: 'interface Boundary {\n  start: Node;\n  end: Node;\n}',
    description: 'An inclusive range of sibling nodes (`start` through `end`).',
  },
  {
    name: 'toBoundary',
    signature: 'const toBoundary: (node: Node) => Boundary;',
    description:
      'Wraps a node in a `Boundary`. For a `DocumentFragment` the boundary spans its first and last child; otherwise it covers the node itself. Throws `E2` on an empty fragment.',
  },
  {
    name: 'removeBoundary',
    signature: 'const removeBoundary: (b: Boundary) => void;',
    description: 'Removes every node in the boundary. A no-op if the boundary has no parent.',
  },
  {
    name: 'replaceWithNode',
    signature: 'const replaceWithNode: (old: Boundary, node: Node) => Boundary;',
    description:
      'Replaces an entire boundary with `node` and returns the new boundary. Throws `E3` if `old` has no parent.',
  },
  {
    name: 'Cmd / AnyCmd / CmdContext',
    signature:
      'interface CmdContext {\n  [key: string]: unknown;\n}\ntype Cmd<T, C extends CmdContext> = (val: T, context: C) => void;\ntype AnyCmd = Cmd<any, any>;',
    description:
      'A `Cmd` is the unit of work a binding runs: it receives the current signal value and its context.',
  },
];

const built = buildApiSection('low-level', entries);

export const lowlevel: SectionMeta = {
  id: 'low-level',
  title: 'Low-level API',
  group: 'Reference',
  headings: built.headings,
  render: () => headingSection('low-level', 'Low-level API', built.render()),
};
```

- [ ] **Step 4: Create `src/sections/errors.ts`**

Manual section: prose + a `headingSection`-style wrapper with a table of error codes (from README "Errors"):

```ts
import {html} from 'sigula';
import {ApiTable} from '../components/ApiTable';
import {headingSection} from './api';
import type {SectionMeta} from './types';

const body = html`<div>
  <p class="leading-relaxed text-[var(--text)]">Runtime errors carry a short code in `message` instead of a sentence. Codes with arguments are colon-separated.</p>
  ${ApiTable({
    headers: ['Code', 'Thrown by', 'Meaning'],
    rows: [
      ['E1:<index>', 'at', 'Array index out of range.'],
      ['E2', 'toBoundary', 'Cannot build a boundary from an empty fragment.'],
      ['E3', 'replaceWithNode', 'The old boundary has no parentNode.'],
      ['E4', 'patch', 'A keyed command (attr, style, styleProperty, toggleClass) was given no key.'],
      ['E5', 'patch', 'act was given no function.'],
      ['E6', 'patch', 'on was given no event type.'],
      ['E7', 'repeat', 'The rendered items have no parent node.'],
      ['E8', 'repeat', 'The temporary start/end fences were removed mid-update.'],
      ['E9', 'repeat', 'There is no node after the fence to move before.'],
      ['E10', 'html', 'The template is empty.'],
      ['E11:<expected>:<got>', 'html', 'Interpolation count does not match the template slots.'],
      ['E12', 'html', 'Unmatched interpolation; patch() must be in attribute position.'],
    ],
  })}
</div>`;

export const errors: SectionMeta = {
  id: 'errors',
  title: 'Errors',
  group: 'Appendix',
  headings: [{id: 'errors', title: 'Errors'}],
  render: () => headingSection('errors', 'Errors', body),
};
```

- [ ] **Step 5: Create `src/sections/model.ts`**

Manual section (group `Appendix`). Create `src/sections/model.ts`:

```ts
import {html, repeat, sig, text, type View} from 'sigula';
import {headingSection} from './api';
import type {SectionMeta} from './types';

const bullets: string[] = [
  'Batched: when a signal changes, its bindings are queued, not run synchronously.',
  'Coalesced per binding: a binding written to multiple times before the microtask flush runs once, reading the final value.',
  '`update` skips work when the new value is deeply equal; `forceUpdate` always notifies.',
  'Error isolation: a throwing binding does not stop the queue — the error is logged as `console.error("[Queue] task failed:", error, bind)`.',
  'Deep equality by default: `update`, `compute`, and `repeat` compare with `isEqual`.',
];

const body = html`<ul class="list-disc pl-6">
  ${repeat(sig(bullets), {
    key: (bullet) => bullet,
    view: (bullet) => html`<li class="my-1 text-[var(--text)]">${text(bullet)}</li>`,
  })}
</ul>`;

export const model: SectionMeta = {
  id: 'reactivity-model',
  title: 'Reactivity model',
  group: 'Appendix',
  headings: [{id: 'reactivity-model', title: 'Reactivity model'}],
  render: (): View => headingSection('reactivity-model', 'Reactivity model', body),
};
```

- [ ] **Step 6: Build**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/sections
git commit -m "feat: control flow, rendering, low-level, errors, and model sections"
```

---

## Task 10: Section registry

**Files:**
- Create: `src/sections/index.ts`

- [ ] **Step 1: Create `src/sections/index.ts`**

```ts
import {bindings} from './bindings';
import {controlflow} from './controlflow';
import {core} from './core';
import {errors} from './errors';
import {features} from './features';
import {hero} from './hero';
import {lowlevel} from './lowlevel';
import {model} from './model';
import {quickstart} from './quickstart';
import {reactivity} from './reactivity';
import {rendering} from './rendering';
import {templates} from './templates';
import type {SectionMeta} from './types';

export type {Heading, SectionMeta} from './types';

export const sections: SectionMeta[] = [
  hero,
  features,
  quickstart,
  core,
  reactivity,
  templates,
  bindings,
  controlflow,
  rendering,
  lowlevel,
  errors,
  model,
];

export interface NavGroup {
  name: string;
  items: SectionMeta[];
}

const groupOrder = ['Introduction', 'Reference', 'Appendix'];

export const navGroups: NavGroup[] = groupOrder
  .map((name) => ({
    name,
    items: sections.filter((section) => section.group === name),
  }))
  .filter((group) => group.items.length > 0);

export const headingsBySection: Record<string, {id: string; title: string}[]> =
  Object.fromEntries(sections.map((section) => [section.id, section.headings]));
```

- [ ] **Step 2: Build**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/sections/index.ts
git commit -m "feat: assemble section registry"
```

---

## Task 11: Nav + Toc

**Files:**
- Create: `src/components/Nav.ts`
- Create: `src/components/Toc.ts`

- [ ] **Step 1: Create `src/components/Nav.ts`**

```ts
import {attr, compute, html, patch, repeat, sig, text, toggleClass, type Sig, type View} from 'sigula';
import {navGroups} from '../sections';
import type {SectionMeta} from '../sections';

export const Nav = (active: Sig<string>): View =>
  html`<nav aria-label="Documentation">
    ${repeat(sig(navGroups), {
      key: (group) => group.name,
      view: (group) => html`<div class="mb-6">
        <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text)]">${text(group.name)}</p>
        <ul>
          ${repeat(sig(group.items), {
            key: (item) => item.id,
            view: (item: SectionMeta) => html`<li>
              <a
                ${patch(
                  attr(`#${item.id}`, 'href'),
                  toggleClass(compute(active, (id) => id === item.id), 'active'),
                )}
                class="nav-link"
              >${text(item.title)}</a>
            </li>`,
          })}
        </ul>
      </div>`,
    })}
  </nav>`;
```

Note: `attr(\`#${item.id}\`, 'href')` interpolates a value into a patch command argument, which is fine (it is not an `html` template slot). The `class="nav-link"` is static.

- [ ] **Step 2: Create `src/components/Toc.ts`**

```ts
import {attr, compute, html, patch, repeat, sig, text, toggleClass, view, type Sig, type View} from 'sigula';
import {headingsBySection} from '../sections';

export const Toc = (active: Sig<string>, activeHeading: Sig<string>): View => {
  const headings = compute(active, (id) => headingsBySection[id] ?? []);
  return html`<nav aria-label="On this page">
    <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text)]">On this page</p>
    ${view(headings, (items) =>
      items.length === 0
        ? html`<p class="px-3 text-sm text-[var(--text)]">—</p>`
        : html`<ul>
            ${repeat(sig(items), {
              key: (item) => item.id,
              view: (item) => html`<li>
                <a
                  ${patch(
                    attr(`#${item.id}`, 'href'),
                    toggleClass(compute(activeHeading, (id) => id === item.id), 'active'),
                  )}
                  class="toc-link"
                >${text(item.title)}</a>
              </li>`,
            })}
          </ul>`,
    )}
  </nav>`;
};
```

`active` selects which section's headings to show; `activeHeading` (a separate signal fed by the scroll-spy on `[data-heading]` elements) highlights the current entry.

- [ ] **Step 3: Build**

Run: `pnpm exec tsc --noEmit`
Expected: PASS. If `toggleClass`'s token `'active'` is flagged, it is fine (plain string).

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.ts src/components/Toc.ts
git commit -m "feat: navigation and table of contents"
```

---

## Task 12: Layout + scroll-spy

**Files:**
- Create: `src/scroll.ts`
- Create: `src/components/Layout.ts`

- [ ] **Step 1: Create `src/scroll.ts`**

```ts
import type {Sig} from 'sigula';

export const setupScrollSpy = (
  activeSection: Sig<string>,
  activeHeading: Sig<string>,
): void => {
  if (!('IntersectionObserver' in window)) return;

  const sections = document.querySelectorAll<HTMLElement>('main section[id]');
  const headings = document.querySelectorAll<HTMLElement>(
    'main [id][data-heading]',
  );

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        );
      const first = visible[0];
      if (first) activeSection.update(first.target.id);
    },
    {rootMargin: '-15% 0px -75% 0px', threshold: 0},
  );
  for (const section of sections) sectionObserver.observe(section);

  const headingObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        );
      const first = visible[0];
      if (first) activeHeading.update(first.target.id);
    },
    {rootMargin: '-15% 0px -75% 0px', threshold: 0},
  );
  for (const heading of headings) headingObserver.observe(heading);
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

Rule: every element whose `id` appears in a section's `headings` array carries `data-heading=""`. `ApiEntry` and `headingSection` already do this. Step 2 ensures the remaining intro sections do.

- [ ] **Step 2: Add `data-heading` to intro section roots**

In `src/sections/hero.ts`, `features.ts`, `quickstart.ts`, and `core.ts`, add the literal attribute `data-heading=""` to each `<section id="...">`. Example: `<section id="features" data-heading="" class="scroll-mt-24 pt-12">`. `controlflow.ts` (manual) needs it too; all `headingSection`-based sections already have it via the helper.

- [ ] **Step 3: Create `src/components/Layout.ts`**

```ts
import {compute, html, on, patch, repeat, sig, text, view, type Sig, type View} from 'sigula';
import {Badge} from './Badge';
import {Nav} from './Nav';
import {Toc} from './Toc';
import {theme, toggleTheme} from '../theme';
import type {SectionMeta} from '../sections';

export interface LayoutProps {
  sections: SectionMeta[];
  activeSection: Sig<string>;
  activeHeading: Sig<string>;
}

const GitHubIcon = (): View =>
  html`<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`;

const SunIcon = (): View =>
  html`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`;

const MoonIcon = (): View =>
  html`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

const ThemeToggle = (): View => {
  const isDark = compute(theme, (value) => value === 'dark');
  return html`<button
    type="button"
    ${patch(on('click', toggleTheme))}
    aria-label="Toggle color theme"
    class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-h)] transition hover:border-[var(--accent-border)]"
  >${view(isDark, (dark) => (dark ? MoonIcon() : SunIcon()))}</button>`;
};

const Header = (mobileOpen: Sig<boolean>): View => html`<header class="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]">
  <div class="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-3 px-4 @3xl:px-6">
    <button
      type="button"
      ${patch(on('click', () => mobileOpen.update(true)))}
      aria-label="Open navigation"
      class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-h)] @3xl:hidden"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
    <a href="#overview" class="flex items-center gap-2">
      <img src="/favicon.svg" alt="" width="22" height="22" />
      <span class="font-semibold text-[var(--text-h)]">sigula</span>
    </a>
    ${Badge('v1.0.3')}
    <div class="ml-auto flex items-center gap-2">
      <a
        href="https://github.com/sigulajs/sigula"
        aria-label="GitHub repository"
        class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-h)] transition hover:border-[var(--accent-border)]"
      >${GitHubIcon()}</a>
      ${ThemeToggle()}
    </div>
  </div>
</header>`;

const MobileNav = (open: Sig<boolean>, active: Sig<string>): View =>
  view(open, (isOpen) =>
    isOpen
      ? html`<div
          class="fixed inset-0 z-50 bg-black/40 @3xl:hidden"
          ${patch(on('click', () => open.update(false)))}
        >
          <div
            class="h-full w-64 overflow-y-auto bg-[var(--bg)] p-4"
            ${patch(on('click', (event) => event.stopPropagation()))}
          >
            ${Nav(active)}
          </div>
        </div>`
      : text(''),
  );

export const Layout = ({sections, activeSection, activeHeading}: LayoutProps): View => {
  const mobileOpen = sig(false);
  const content = html`<div>
    ${repeat(sig(sections), {
      key: (section) => section.id,
      view: (section) => section.render(),
    })}
  </div>`;
  return html`<div class="@container min-h-screen">
    ${Header(mobileOpen)}
    <div class="mx-auto flex w-full max-w-[1400px] items-start gap-6 px-4 py-8 @3xl:px-6">
      <aside class="sticky top-14 hidden max-h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto @3xl:block">
        ${Nav(activeSection)}
      </aside>
      <main class="min-w-0 flex-1">${content}</main>
      <aside class="sticky top-14 hidden max-h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto @5xl:block">
        ${Toc(activeSection, activeHeading)}
      </aside>
    </div>
    <footer class="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text)]">
      <p>sigula — MIT License · <a href="https://github.com/sigulajs/sigula" class="hover:underline">GitHub</a></p>
    </footer>
    ${MobileNav(mobileOpen, activeSection)}
  </div>`;
};
```

All `sigula` imports are consolidated into the single import statement shown at the top of `Layout.ts`.

- [ ] **Step 4: Build**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scroll.ts src/components/Layout.ts src/components/ApiEntry.ts src/sections
git commit -m "feat: layout, scroll-spy, and mobile navigation"
```

---

## Task 13: Wire up main.ts and index.html

**Files:**
- Modify: `src/main.ts`
- Modify: `index.html`

- [ ] **Step 1: Replace `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Sigula — a tiny web framework with fine-grained signal reactivity and no virtual DOM."
    />
    <title>Sigula — tiny web framework with fine-grained reactivity</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Replace `src/main.ts`**

```ts
import 'virtual:uno.css';
import './style.css';
import {html, render, sig} from 'sigula';
import {Layout} from './components/Layout';
import {restoreHash, setupScrollSpy} from './scroll';
import {sections} from './sections';
import './theme';

const appNode = document.querySelector('#app');
if (!appNode) throw new Error('#app not found');

const activeSection = sig(sections[0]?.id ?? '');
const activeHeading = sig('');
const dispose = render(
  Layout({sections, activeSection, activeHeading}),
  appNode,
);

setupScrollSpy(activeSection, activeHeading);
restoreHash();

window.addEventListener('beforeunload', dispose, {once: true});
```

The `sigula` import is a single statement.

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: `tsc` reports no errors; Vite production build succeeds.

- [ ] **Step 4: Commit**

```bash
git add index.html src/main.ts
git commit -m "feat: mount the full site"
```

---

## Task 14: Final verification

**Files:** none

- [ ] **Step 1: Type check and build**

Run:
```bash
pnpm exec tsc --noEmit && pnpm build
```
Expected: no errors.

- [ ] **Step 2: Browser checklist at `http://localhost:5173`**

- [ ] Hero renders with badges, install command, and the live Equation demo; +/- updates all values.
- [ ] Left nav shows Introduction / Reference / Appendix groups; clicking an entry scrolls to it.
- [ ] Scroll-spy: the active nav link and active TOC entry update as you scroll.
- [ ] Right TOC shows the active section's headings; hidden below `@5xl`.
- [ ] Features grid and Quick Start code block render with syntax colors and a working copy button.
- [ ] Todos demo: add, toggle (line-through), filter all/active/done, remove, empty state.
- [ ] Theme toggle switches light/dark, persists across reload, follows system when unset.
- [ ] Mobile (narrow the window below `@3xl`): hamburger opens the slide-over nav; overlay click closes it.
- [ ] Loading `/#reactivity-compute` scrolls to the entry.
- [ ] No console errors.

- [ ] **Step 3: Style check (no repo-wide formatter)**

There is no committed Biome config. Do NOT run a repo-wide `biome check --write`. Confirm the new files match the existing style: single quotes, semicolons, 2-space indentation, trailing commas where multiline.

- [ ] **Step 4: Final status**

```bash
git status --short
```
Expected: clean working tree (or only intended changes).

---

## Self-Review Notes

- **Spec coverage:** Layout (T12), content sections (T7–T9), demos (T5–T6, T12), theme (T2), highlighting (T3), scroll-spy (T12), hash restore (T12), responsive/mobile (T12), errors table (T9), verification (T14). All spec sections have tasks.
- **Deviation:** The plan adds `activeHeading` (a second signal) beyond the spec's `activeSection` to correctly highlight TOC entries; this is an implementation detail, not a scope change.
- **Known risk:** highlight.js subpath types (T3 Step 6 fallback) and UnoCSS container queries (already present in the scaffold, confirmed supported by `presetWind4`).
