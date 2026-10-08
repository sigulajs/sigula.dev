import {html, raw, type View} from 'sigula';
import {CopyButton} from './CopyButton';

const MAX_LINES = 24;

export interface CodeBlockProps {
  /** Pre-highlighted HTML, e.g. from an `?raw&shiki=<lang>` import. */
  html: string;
  /** The raw source, used for the copy button and line count. */
  source: string;
  filename?: string;
}

// Static markup with data hooks; enhance.ts drives the collapse toggle and the
// copy button. Kept plain so the prerendered HTML is fully interactive-free.
export const CodeBlock = ({
  html: markup,
  source,
  filename,
}: CodeBlockProps): View => {
  const trimmed = source.trim();
  const lineCount = trimmed.split('\n').length;
  const collapsible = lineCount > MAX_LINES;
  return html`<div
    data-code-block
    class="my-5 scroll-mt-20 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--code-bg)]"
  >
    <div class="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2">
      <span class="font-mono text-xs text-[var(--text)]">${filename ?? ''}</span>
      ${CopyButton(trimmed, 'Copy')}
    </div>
    ${collapsible
      ? html`<div class="code-scroll code-collapsed">${raw(markup)}</div>
        <button
          type="button"
          data-code-toggle
          class="flex w-full items-center justify-center gap-1 border-t border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]"
        >
          <span data-when-collapsed>▾ Show more (${lineCount} lines)</span>
          <span data-when-expanded>▴ Show less</span>
        </button>`
      : html`<div class="code-scroll">${raw(markup)}</div>`}
  </div>`;
};
