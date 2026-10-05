import {html, list, type View} from 'sigula';
import type {SectionMeta} from './types';

const items: {title: string; body: string}[] = [
  {
    title: 'Fine-grained signal reactivity',
    body: 'When a signal changes, only the DOM nodes that depend on it are updated — not the whole component tree.',
  },
  {
    title: 'Declarative sources + precise bindings',
    body: 'Describe state with signals, then bind them precisely to a text node, an attribute, or an effect.',
  },
  {
    title: 'No virtual DOM',
    body: 'No VNodes, no diffing, no reconciliation pass. Direct real DOM operations.',
  },
  {
    title: 'Native string templates',
    body: 'html is a tagged template over plain JavaScript strings. No compiler, no JSX transform.',
  },
  {
    title: 'Batched, coalesced updates',
    body: 'Writes queue in a microtask; a signal touched many times before the flush runs each dependent binding once, against the final value.',
  },
  {
    title: 'Ultra small',
    body: 'Around 4.5KB minified and gzipped, with an API surface you can read in one sitting.',
  },
  {
    title: 'TypeScript first',
    body: 'Full type inference for signals, template bindings, and patch commands.',
  },
  {
    title: 'Zero tooling',
    body: 'ESM-only, sideEffects: false, no build step required to author components.',
  },
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
