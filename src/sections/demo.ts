import {html} from 'sigula';
import {CodeBlock} from '../components/CodeBlock';
import {Equation} from '../components/demos/Equation';
import {Todos} from '../components/demos/Todos';
import {headingSection} from './api';
import type {SectionMeta} from './types';

const equationSnippet = [
  'const x = sig(0);',
  'const y = sig(1);',
  'const sum = compute({x, y}, (v) => v.x + v.y);',
].join('\n');

const todosSnippet = [
  'item.done.trans((v) => !v);',
  'todos.notify(); // re-run dependents after mutating a nested signal',
].join('\n');

const body = html`<div class="grid gap-6 @4xl:grid-cols-2">
  <div>
    ${Equation()}
    ${CodeBlock({code: equationSnippet, lang: 'typescript', filename: 'equation.ts'})}
  </div>
  <div>
    ${Todos()}
    ${CodeBlock({code: todosSnippet, lang: 'typescript', filename: 'todos.ts'})}
  </div>
</div>`;

export const demo: SectionMeta = {
  id: 'demo',
  title: 'Demo',
  group: 'Introduction',
  render: () => headingSection('demo', 'Demo', body),
};
