import {html, type View} from 'sigula';
import {CodeBlock} from '../components/CodeBlock';
import source from '../snippets/quickstart.txt?raw';
import type {SectionMeta} from './types';

const step1 = [
  "import {html, render} from 'sigula';",
  '',
  "const app = document.querySelector('#app')!;",
  '',
  'render(html`<h1>Hello, world!</h1>`, app);',
].join('\n');

const step2 = [
  "const name = sig('Alice');",
  '',
  'render(html`<h1>Hello, ${name}!</h1>`, app);',
  '',
  "name.update('Bob'); // only the text node changes",
].join('\n');

const step3 = [
  'const count = sig(0);',
  "const color = compute(count, (v) => (v >= 0 ? 'green' : 'red'));",
  '',
  "html`<p ${patch(style('color', color))}>${text(count)}</p>`;",
].join('\n');

const step4 = [
  'const Counter = (initial: number): View => {',
  '  const count = sig(initial);',
  '  return html`<div>',
  '    <span>${count}</span>',
  "    <button ${patch(on('click', () => count.trans((v) => v + 1)))}>+1</button>",
  '  </div>`;',
  '};',
].join('\n');

const step6 = [
  "import {compute, html, sig, text, view} from 'sigula';",
  '',
  'const count = sig(0);',
  'const isEmpty = compute(count, (v) => v === 0);',
  '',
  'html`<div>${view(isEmpty, (empty) =>',
  "  empty ? text('nothing yet') : html`<p>count: ${count}</p>`,",
  ')}</div>`;',
].join('\n');

export const quickstart: SectionMeta = {
  id: 'quick-start',
  title: 'Quick Start',
  group: 'Introduction',
  subs: [
    {id: 'quickstart-1', title: '1. Render something'},
    {id: 'quickstart-2', title: '2. Make it reactive'},
    {id: 'quickstart-3', title: '3. Events & attributes'},
    {id: 'quickstart-4', title: '4. Components'},
    {id: 'quickstart-5', title: '5. Render lists'},
    {id: 'quickstart-6', title: '6. Control flow'},
  ],
  render: (): View => html`<section id="quick-start" class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">Quick Start</h2>

    <h3 id="quickstart-1" class="mt-6 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">1. Render something</h3>
    ${CodeBlock({code: step1, lang: 'typescript', filename: 'main.ts'})}
    <p class="leading-relaxed text-[var(--text)]">html is a tagged template: it parses the string into a real DOM fragment and returns a View. render(view, node) appends that fragment to the element you pass and returns a disposer, so a mounted tree can be torn down completely later.</p>

    <h3 id="quickstart-2" class="mt-6 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">2. Make it reactive</h3>
    ${CodeBlock({code: step2, lang: 'typescript', filename: 'main.ts'})}
    <p class="leading-relaxed text-[var(--text)]">sig creates a signal — a value container. Interpolating a signal in a content position upgrades it to a text() view automatically, so ${'${name}'} and ${'${text(name)}'} are equivalent. When name.update('Bob') runs, Sigula writes to just that text node and touches nothing else.</p>

    <h3 id="quickstart-3" class="mt-6 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">3. Handle events and patch attributes</h3>
    ${CodeBlock({code: step3, lang: 'typescript', filename: 'main.ts'})}
    <p class="leading-relaxed text-[var(--text)]">Text belongs in a content position, but dynamic attributes belong in an attribute position and must be wrapped in patch(...). Here compute derives color from count, and style('color', color) keeps the inline style in sync. on('click', …) registers the listener once at mount; writing to a signal inside it is what drives updates.</p>

    <h3 id="quickstart-4" class="mt-6 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">4. Split into components</h3>
    ${CodeBlock({code: step4, lang: 'typescript', filename: 'counter.ts'})}
    <p class="leading-relaxed text-[var(--text)]">There is no component class, lifecycle, or registration — a component is just a function that returns a View. Because the function body runs exactly once, sig(initial) is the local state; there are no hooks and no re-run semantics to reason about.</p>

    <h3 id="quickstart-5" class="mt-6 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">5. Render lists</h3>
    ${CodeBlock({code: source, lang: 'typescript', filename: 'lists.ts'})}
    <p class="leading-relaxed text-[var(--text)]">Use list(items, viewFn) for a fixed array: it calls viewFn once per item and appends the results, with no keying or reconciliation. Use repeat(sig, {key, view}) for a reactive array: it matches items by key and reuses, moves, creates, or removes as few DOM nodes as possible.</p>

    <h3 id="quickstart-6" class="mt-6 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">6. Control flow</h3>
    ${CodeBlock({code: step6, lang: 'typescript', filename: 'conditional.ts'})}
    <p class="leading-relaxed text-[var(--text)]">compute turns one signal into another: here isEmpty is derived from count. view(sig, viewFn) then swaps the rendered view whenever that signal changes — when count becomes non-zero the empty message is replaced with the paragraph, and the old view is torn down.</p>
  </section>`,
};
