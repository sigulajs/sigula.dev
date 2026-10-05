import {html, repeat, sig, text, type View} from 'sigula';
import type {SectionMeta} from './types';

const featureItems: {title: string; body: string}[] = [
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
      ${repeat(sig(featureItems), {
        key: (feature) => feature.title,
        view: (feature) => html`<div class="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4">
          <h3 class="mb-1 font-semibold text-[var(--text-h)]">${text(feature.title)}</h3>
          <p class="text-sm leading-relaxed text-[var(--text)]">${text(feature.body)}</p>
        </div>`,
      })}
    </div>
  </section>`,
};
