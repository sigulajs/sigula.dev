import {frag, html, type View} from 'sigula';

// Rendered statically; enhance.ts wires the click and reads the text from the
// hidden sibling, so the markup works without JavaScript as plain text.
export const CopyButton = (value: string, label = 'Copy'): View =>
  frag(
    html`<button
      type="button"
      data-copy
      aria-label="Copy to clipboard"
      class="shrink-0 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs text-[var(--text)] transition hover:border-[var(--accent-border)] hover:text-[var(--text-h)]"
    ><span data-copy-label>${label}</span></button>`,
    html`<span hidden data-copy-source>${value}</span>`,
  );
