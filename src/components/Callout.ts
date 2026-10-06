import {html, type View} from 'sigula';
import {rich} from './rich';

export const Callout = (title: string, body: string): View =>
  html`<div class="my-5 rounded-lg border border-[var(--border)] border-l-4 border-l-[var(--accent)] bg-[var(--accent-bg)] p-4">
    <p class="mb-1 font-semibold text-[var(--text-h)]">${title}</p>
    <p class="text-sm leading-relaxed text-[var(--text)]">${rich(body)}</p>
  </div>`;
