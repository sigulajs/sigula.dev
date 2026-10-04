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
