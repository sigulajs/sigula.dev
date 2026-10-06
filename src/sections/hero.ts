import {html, type View} from 'sigula';
import {Badge} from '../components/Badge';
import type {SectionMeta} from './types';

export const hero: SectionMeta = {
  id: 'overview',
  title: 'Overview',
  group: 'Introduction',
  render: (): View => html`<section id="overview" class="scroll-mt-24 pt-4">
    <div class="flex flex-wrap items-center gap-2">
      ${Badge('v2.0.1')}
      ${Badge('~4.5KB gzipped')}
      ${Badge('No virtual DOM')}
    </div>
    <h1 class="mt-4 text-4xl font-semibold tracking-tight text-[var(--text-h)] @3xl:text-5xl"><span class="bg-gradient-to-r from-[var(--text-h)] to-[var(--accent)] bg-clip-text text-transparent">Tiny web framework</span><br class="hidden sm:block">
    <span>with fine-grained signal reactivity</span></h1>
    <p class="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--text)]">A minimal, signal-based web framework with fine-grained reactivity. No virtual DOM — just direct, minimal updates to the real DOM.</p>
    <div class="mt-6 flex flex-wrap gap-3">
      <a href="#quick-start" class="rounded-lg bg-gradient-to-r from-[var(--accent-strong)] to-[var(--accent-strong-to)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">Get started</a>
      <a href="https://github.com/sigulajs/sigula" class="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-h)] transition hover:border-[var(--accent-border)]">GitHub</a>
    </div>
  </section>`,
};
