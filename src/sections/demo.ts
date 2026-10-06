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
  <div class="mt-4 grid items-start gap-6 @4xl:grid-cols-2">
    <div>${CodeBlock({code: equationSource, lang: 'typescript', filename: 'Equation.ts'})}</div>
    <div>${Equation()}</div>
  </div>
  <ol class="mt-5 list-decimal space-y-2 pl-6 text-sm leading-relaxed text-[var(--text)]">
    <li><strong class="text-[var(--text-h)]">State.</strong> Two writable signals, x and y, hold the inputs.</li>
    <li><strong class="text-[var(--text-h)]">Derive.</strong> compute({x, y}, …) produces sum, difference, product, quotient and x² − y². Each derived signal recomputes only when x or y changes.</li>
    <li><strong class="text-[var(--text-h)]">Bind.</strong> Every result is interpolated into the template, so Sigula keeps a binding from the signal to that exact text node.</li>
    <li><strong class="text-[var(--text-h)]">Update.</strong> The +1 / −1 buttons call x.trans / y.trans to write a new value; queued bindings then update only the affected nodes.</li>
  </ol>

  <h3 id="demo-todos" class="mt-12 text-2xl font-semibold text-[var(--text-h)] scroll-mt-24">Todos</h3>
  <div class="mt-4 grid items-start gap-6 @4xl:grid-cols-2">
    <div>${CodeBlock({code: todosSource, lang: 'typescript', filename: 'Todos.ts'})}</div>
    <div>${Todos()}</div>
  </div>
  <ol class="mt-5 list-decimal space-y-2 pl-6 text-sm leading-relaxed text-[var(--text)]">
    <li><strong class="text-[var(--text-h)]">State.</strong> input, todos, and filter are signals, and each todo's done flag is itself a signal.</li>
    <li><strong class="text-[var(--text-h)]">Derive.</strong> visible = compute({todos, filter}, …) filters the list, and isEmpty = compute(visible, …) drives the empty state.</li>
    <li><strong class="text-[var(--text-h)]">Mutate.</strong> Adding and removing replace the todos array via trans; toggling a todo flips its done signal and calls todos.notify() so the derived list recomputes.</li>
    <li><strong class="text-[var(--text-h)]">Render.</strong> view(isEmpty) swaps between the empty message and the list, and repeat keys items by id so only the necessary nodes move.</li>
  </ol>
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
