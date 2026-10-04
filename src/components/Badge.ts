import {html, text, type View} from 'sigula';

export const Badge = (label: string): View =>
  html`<span class="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--social-bg)] px-2 py-0.5 text-xs font-medium text-[var(--text-h)]">${text(label)}</span>`;
