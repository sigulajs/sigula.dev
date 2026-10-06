import {html} from 'sigula';
import {CodeBlock} from '../components/CodeBlock';
import {Equation} from '../components/demos/Equation';
import {Todos} from '../components/demos/Todos';
import equationSource from '../components/demos/Equation.ts?raw';
import todosSource from '../components/demos/Todos.ts?raw';
import {headingSection} from './api';
import type {SectionMeta} from './types';

const body = html`<div>
  <h3 id="demo-equation" class="mt-8 text-2xl font-semibold text-[var(--text-h)] scroll-mt-24">Equation</h3>
  ${CodeBlock({code: equationSource, lang: 'typescript', filename: 'Equation.ts'})}
  <div class="mt-5 grid items-start gap-6 @4xl:grid-cols-2">
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">How it works</p>
      <ol class="mt-3 list-decimal space-y-2 pl-6 text-sm leading-relaxed text-[var(--text)]">
        <li><strong class="text-[var(--text-h)]">State.</strong> Two writable signals, <code>x</code> and <code>y</code>, hold the inputs.</li>
        <li><strong class="text-[var(--text-h)]">Derive.</strong> <code>compute({x, y}, …)</code> produces sum, difference, product, quotient and x² − y². Each derived signal recomputes only when <code>x</code> or <code>y</code> changes.</li>
        <li><strong class="text-[var(--text-h)]">Bind.</strong> Every result is interpolated into the template, so Sigula keeps a binding from the signal to that exact text node.</li>
        <li><strong class="text-[var(--text-h)]">Update.</strong> The +1 / −1 buttons call <code>x.trans</code> / <code>y.trans</code> to write a new value; queued bindings then update only the affected nodes.</li>
      </ol>
    </div>
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Live demo</p>
      <div class="mt-3">${Equation()}</div>
    </div>
  </div>

  <h3 id="demo-todos" class="mt-12 text-2xl font-semibold text-[var(--text-h)] scroll-mt-24">Todos</h3>
  ${CodeBlock({code: todosSource, lang: 'typescript', filename: 'Todos.ts'})}
  <div class="mt-5 grid items-start gap-6 @4xl:grid-cols-2">
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">How it works</p>
      <ol class="mt-3 list-decimal space-y-2 pl-6 text-sm leading-relaxed text-[var(--text)]">
        <li><strong class="text-[var(--text-h)]">State.</strong> <code>input</code>, <code>todos</code>, and <code>filter</code> are signals, and each todo's <code>done</code> flag is itself a signal.</li>
        <li><strong class="text-[var(--text-h)]">Derive.</strong> <code>visible = compute({todos, filter}, …)</code> filters the list, and <code>isEmpty = compute(visible, …)</code> drives the empty state.</li>
        <li><strong class="text-[var(--text-h)]">Mutate.</strong> Adding and removing replace the <code>todos</code> array via <code>trans</code>; toggling a todo flips its <code>done</code> signal and calls <code>todos.notify()</code> so the derived list recomputes.</li>
        <li><strong class="text-[var(--text-h)]">Render.</strong> <code>view(isEmpty)</code> swaps between the empty message and the list, and <code>repeat</code> keys items by <code>id</code> so only the necessary nodes move.</li>
      </ol>
    </div>
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Live demo</p>
      <div class="mt-3">${Todos()}</div>
    </div>
  </div>
</div>`;

export const demo: SectionMeta = {
  id: 'demo',
  title: 'Demo',
  group: 'Introduction',
  subs: [
    {id: 'demo-equation', title: 'Equation'},
    {id: 'demo-todos', title: 'Todos'},
  ],
  render: () => headingSection('demo', 'Demo', body),
};
