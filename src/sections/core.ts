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
    <h3 id="fine-grained" data-heading="" class="scroll-mt-24 text-xl font-semibold text-[var(--text-h)]">Fine-grained updates to the real DOM</h3>
    <p class="mt-2 leading-relaxed text-[var(--text)]">Signals hold state. Only the exact text node that depends on a signal is updated when it changes; everything else stays untouched.</p>
    ${Counter()}
    <h3 id="declarative" data-heading="" class="scroll-mt-24 text-xl font-semibold text-[var(--text-h)]">Declarative signal sources + precise bindings</h3>
    <p class="mt-2 leading-relaxed text-[var(--text)]">Signals are the single source of truth; every view and side effect derives from them.</p>
    <h3 id="no-vdom" data-heading="" class="scroll-mt-24 text-xl font-semibold text-[var(--text-h)]">No virtual DOM</h3>
    <p class="mt-2 leading-relaxed text-[var(--text)]">Mount establishes direct subscriptions between signals and DOM nodes; changes go straight to the node.</p>
    <h3 id="templates" data-heading="" class="scroll-mt-24 text-xl font-semibold text-[var(--text-h)]">Minimal HTML templates</h3>
    <p class="mt-2 leading-relaxed text-[var(--text)]">Templates are plain JavaScript string templates, cached per call site.</p>
    <h3 id="small" data-heading="" class="scroll-mt-24 text-xl font-semibold text-[var(--text-h)]">Ultra small</h3>
    <p class="mt-2 leading-relaxed text-[var(--text)]">Around 4.0KB minified and gzipped.</p>
    ${Callout('Version note', 'This site documents the installed `sigula@1.0.3` surface. Where the README differs, the shipped types are authoritative.')}
  </section>`,
};
