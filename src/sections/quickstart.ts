import {html, type View} from 'sigula';
import {CodeBlock} from '../components/CodeBlock';
import renderHtml, {
  source as renderSrc,
} from '../snippets/quickstart-render.txt?raw&shiki=typescript';
import reactiveHtml, {
  source as reactiveSrc,
} from '../snippets/quickstart-reactive.txt?raw&shiki=typescript';
import eventsHtml, {
  source as eventsSrc,
} from '../snippets/quickstart-events.txt?raw&shiki=typescript';
import componentHtml, {
  source as componentSrc,
} from '../snippets/quickstart-component.txt?raw&shiki=typescript';
import listsHtml, {
  source as listsSrc,
} from '../snippets/quickstart.txt?raw&shiki=typescript';
import controlflowHtml, {
  source as controlflowSrc,
} from '../snippets/quickstart-controlflow.txt?raw&shiki=typescript';
import type {SectionMeta} from './types';

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

    <h3 id="quickstart-1" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">1. Render something</h3>
    ${CodeBlock({html: renderHtml, source: renderSrc, filename: 'main.ts'})}
    <p class="leading-relaxed text-[var(--text)]"><code>html</code> is a tagged template: it parses the string into a real DOM fragment and returns a <code>View</code>. <code>render(view, node)</code> appends that fragment to the element you pass and returns a disposer, so a mounted tree can be torn down completely later.</p>
    <p class="mt-2 text-sm"><a href="#concepts-templates" class="text-[var(--accent)] hover:underline">Read more about templates →</a></p>

    <h3 id="quickstart-2" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">2. Make it reactive</h3>
    ${CodeBlock({html: reactiveHtml, source: reactiveSrc, filename: 'main.ts'})}
    <p class="leading-relaxed text-[var(--text)]"><code>sig</code> creates a signal — a value container. Interpolating a signal in a content position upgrades it to a <code>text()</code> view automatically, so <code>${'${name}'}</code> and <code>${'${text(name)}'}</code> are equivalent. When <code>name.update('Bob')</code> runs, Sigula writes to just that text node and touches nothing else.</p>
    <p class="mt-2 text-sm"><a href="#concepts-signals" class="text-[var(--accent)] hover:underline">Read more about signals →</a></p>

    <h3 id="quickstart-3" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">3. Handle events and patch attributes</h3>
    ${CodeBlock({html: eventsHtml, source: eventsSrc, filename: 'main.ts'})}
    <p class="leading-relaxed text-[var(--text)]">Text belongs in a content position, but dynamic attributes belong in an attribute position and must be wrapped in <code>patch(...)</code>. Here <code>compute</code> derives <code>color</code> from <code>count</code>, and <code>style('color', color)</code> keeps the inline style in sync. <code>on('click', …)</code> registers the listener once at mount; writing to a signal inside it is what drives updates.</p>
    <p class="mt-2 text-sm"><a href="#concepts-patch" class="text-[var(--accent)] hover:underline">Read more about patch →</a></p>

    <h3 id="quickstart-4" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">4. Split into components</h3>
    ${CodeBlock({html: componentHtml, source: componentSrc, filename: 'counter.ts'})}
    <p class="leading-relaxed text-[var(--text)]">There is no component class, lifecycle, or registration — a component is just a function that returns a <code>View</code>. Because the function body runs exactly once, <code>sig(initial)</code> is the local state; there are no hooks and no re-run semantics to reason about.</p>
    <p class="mt-2 text-sm"><a href="#concepts-architecture" class="text-[var(--accent)] hover:underline">Read more about the architecture →</a></p>

    <h3 id="quickstart-5" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">5. Render lists</h3>
    ${CodeBlock({html: listsHtml, source: listsSrc, filename: 'lists.ts'})}
    <p class="leading-relaxed text-[var(--text)]">Use <code>list(items, viewFn)</code> for a fixed array: it calls <code>viewFn</code> once per item and appends the results, with no keying or reconciliation. Use <code>repeat(sig, {key, view})</code> for a reactive array: it matches items by <code>key</code> and reuses, moves, creates, or removes as few DOM nodes as possible.</p>
    <p class="mt-2 text-sm"><a href="#concepts-control-flow" class="text-[var(--accent)] hover:underline">Read more about control flow →</a></p>

    <h3 id="quickstart-6" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">6. Control flow</h3>
    ${CodeBlock({html: controlflowHtml, source: controlflowSrc, filename: 'conditional.ts'})}
    <p class="leading-relaxed text-[var(--text)]"><code>compute</code> turns one signal into another: here <code>isEmpty</code> is derived from <code>count</code>. <code>view(sig, viewFn)</code> then swaps the rendered view whenever that signal changes — when <code>count</code> becomes non-zero the empty message is replaced with the paragraph, and the old view is torn down.</p>
    <p class="mt-2 text-sm"><a href="#concepts-derived" class="text-[var(--accent)] hover:underline">Read more about derived signals →</a></p>
  </section>`,
};
