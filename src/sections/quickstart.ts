import {html, type View} from 'sigula';
import {CodeBlock} from '../components/CodeBlock';
import source from '../snippets/quickstart.txt?raw';
import type {SectionMeta} from './types';

export const quickstart: SectionMeta = {
  id: 'quick-start',
  title: 'Quick Start',
  group: 'Introduction',
  headings: [{id: 'quick-start', title: 'Quick Start'}],
  render: (): View => html`<section id="quick-start" class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">Quick Start</h2>
    <p class="mt-3 leading-relaxed text-[var(--text)]">Install Sigula, create a signal-based view, and mount it into the DOM.</p>
    ${CodeBlock({code: source, lang: 'typescript', filename: 'main.ts'})}
    <p class="leading-relaxed text-[var(--text)]">Mount it with mark-up that contains an element with <code class="rounded bg-[var(--code-bg)] px-1.5 py-0.5 font-mono text-sm text-[var(--text-h)]">id="app"</code>.</p>
  </section>`,
};
