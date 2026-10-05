import {html, type View} from 'sigula';
import {CodeBlock} from '../components/CodeBlock';
import type {SectionMeta} from './types';

const install = ['npm install sigula', 'pnpm add sigula', 'yarn add sigula'].join(
  '\n',
);

export const installation: SectionMeta = {
  id: 'installation',
  title: 'Installation',
  group: 'Introduction',
  render: (): View => html`<section id="installation" class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">Installation</h2>
    ${CodeBlock({code: install, lang: 'bash', filename: 'shell'})}
    <p class="leading-relaxed text-[var(--text)]">Sigula is ESM-only and ships type declarations. Importing the module is side-effect free; the DOM is only touched when you actually render.</p>
  </section>`,
};
