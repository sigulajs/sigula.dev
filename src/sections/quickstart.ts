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

export const quickstart: SectionMeta = {
  id: 'quick-start',
  title: 'Quick Start',
  group: 'Introduction',
  render: (): View => html`<section id="quick-start" class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">Quick Start</h2>
    <h3 class="mt-6 text-xl font-semibold text-[var(--text-h)]">1. Render something</h3>
    ${CodeBlock({code: step1, lang: 'typescript', filename: 'main.ts'})}
    <p class="leading-relaxed text-[var(--text)]">html returns a View — a real DocumentFragment plus the metadata Sigula needs to update it later. render(view, node) appends it and returns a disposer.</p>
    <h3 class="mt-6 text-xl font-semibold text-[var(--text-h)]">2. Make it reactive</h3>
    ${CodeBlock({code: step2, lang: 'typescript', filename: 'main.ts'})}
    <p class="leading-relaxed text-[var(--text)]">A Sig interpolated in a content position is upgraded to a text() view automatically, so ${'${name}'} and ${'${text(name)}'} are equivalent.</p>
    <h3 class="mt-6 text-xl font-semibold text-[var(--text-h)]">3. Handle events and patch attributes</h3>
    ${CodeBlock({code: step3, lang: 'typescript', filename: 'main.ts'})}
    <h3 class="mt-6 text-xl font-semibold text-[var(--text-h)]">4. Split into components</h3>
    ${CodeBlock({code: step4, lang: 'typescript', filename: 'counter.ts'})}
    <h3 class="mt-6 text-xl font-semibold text-[var(--text-h)]">5. Render lists conditionally</h3>
    ${CodeBlock({code: source, lang: 'typescript', filename: 'todos.ts'})}
  </section>`,
};
