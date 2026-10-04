import {html, type View} from 'sigula';
import {Badge} from '../components/Badge';
import {CopyButton} from '../components/CopyButton';
import {Equation} from '../components/demos/Equation';
import type {SectionMeta} from './types';

export const hero: SectionMeta = {
  id: 'overview',
  title: 'Overview',
  group: 'Introduction',
  headings: [{id: 'overview', title: 'Sigula'}],
  render: (): View => html`<section id="overview" class="scroll-mt-24 pt-4">
    <div class="grid items-start gap-10 @4xl:grid-cols-2">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          ${Badge('v1.0.3')}
          ${Badge('~4.0KB gzipped')}
          ${Badge('No virtual DOM')}
        </div>
        <h1 class="mt-4 text-4xl font-semibold tracking-tight text-[var(--text-h)] @3xl:text-5xl">
          Tiny web framework with fine-grained signal reactivity
        </h1>
        <p class="mt-4 text-lg leading-relaxed text-[var(--text)]">
          A minimal, signal-based web framework with fine-grained reactivity.
          No virtual DOM — just direct, minimal updates to the real DOM.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="#quick-start" class="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">Get started</a>
          <a href="https://github.com/sigulajs/sigula" class="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-h)] transition hover:border-[var(--accent-border)]">GitHub</a>
        </div>
        <div class="mt-6 flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--code-bg)] px-4 py-3">
          <code class="font-mono text-sm text-[var(--text-h)]">npm install sigula</code>
          ${CopyButton('npm install sigula')}
        </div>
      </div>
      <div>${Equation()}</div>
    </div>
  </section>`,
};
