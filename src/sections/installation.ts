import {
  compute,
  html,
  list,
  on,
  patch,
  sig,
  toggleClass,
  view,
  type View,
} from 'sigula';
import {CopyButton} from '../components/CopyButton';
import type {SectionMeta} from './types';

const managers = ['pnpm', 'npm', 'yarn', 'bun'] as const;
type Manager = (typeof managers)[number];

const commands: Record<Manager, string> = {
  pnpm: 'pnpm add sigula',
  npm: 'npm install sigula',
  yarn: 'yarn add sigula',
  bun: 'bun add sigula',
};

const InstallTabs = (): View => {
  const active = sig<Manager>('pnpm');
  return html`<div class="my-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--code-bg)]">
    <div class="flex items-center gap-1 border-b border-[var(--border)] px-2 py-1.5">
      ${list(managers, (manager) => html`<button type="button" ${patch(on('click', () => active.update(manager)), toggleClass('active', compute(active, (current) => current === manager)))} class="tab-btn">${manager}</button>`)}
    </div>
    ${view(active, (manager) => html`<div class="flex items-center justify-between gap-3 px-4 py-3">
      <code class="font-mono text-sm text-[var(--text-h)]">${commands[manager]}</code>
      ${CopyButton(commands[manager])}
    </div>`)}
  </div>`;
};

export const installation: SectionMeta = {
  id: 'installation',
  title: 'Installation',
  group: 'Introduction',
  render: (): View => html`<section id="installation" class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">Installation</h2>
    ${InstallTabs()}
    <p class="leading-relaxed text-[var(--text)]">Sigula is ESM-only and ships type declarations. Importing the module is side-effect free; the DOM is only touched when you actually render.</p>
  </section>`,
};
