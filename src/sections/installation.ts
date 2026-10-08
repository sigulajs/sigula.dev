import {attr, html, list, patch, type View} from 'sigula';
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

// Static tabs carrying their command in `data-command`; enhance.ts swaps the
// active tab, the visible command, and the copy source.
const InstallTabs = (): View => html`<div
  data-tabs
  class="my-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--code-bg)]"
>
  <div class="flex items-center gap-1 border-b border-[var(--border)] px-2 py-1.5">
    ${list(managers, (manager) => html`<button
      type="button"
      ${patch(
        attr('data-tab', manager),
        attr('data-command', commands[manager]),
        attr('class', manager === 'pnpm' ? 'tab-btn active' : 'tab-btn'),
      )}
    >${manager}</button>`)}
  </div>
  <div class="flex items-center justify-between gap-3 px-4 py-3">
    <code data-tab-command class="font-mono text-sm text-[var(--text-h)]">${commands.pnpm}</code>
    ${CopyButton(commands.pnpm)}
  </div>
</div>`;

export const installation: SectionMeta = {
  id: 'installation',
  title: 'Installation',
  group: 'Introduction',
  render: (): View => html`<section id="installation" class="scroll-mt-24 pt-20">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">Installation</h2>
    ${InstallTabs()}
    <p class="leading-relaxed text-[var(--text)]">Sigula is ESM-only and ships type declarations. Importing the module is side-effect free; the DOM is only touched when you actually render.</p>
  </section>`,
};
