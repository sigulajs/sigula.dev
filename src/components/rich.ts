import {raw, type AnyView} from 'sigula';

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const rich = (value: string): AnyView =>
  raw(
    escapeHtml(value).replace(
      /`([^`]*)`/g,
      '<code class="rounded bg-[var(--code-bg)] px-1 py-0.5 font-mono text-[0.9em] text-[var(--text-h)]">$1</code>',
    ),
  );
