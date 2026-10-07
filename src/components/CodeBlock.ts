import {
  act,
  compute,
  html,
  on,
  patch,
  raw,
  sig,
  text,
  toggleClass,
  view,
  type View,
} from 'sigula';
import {CopyButton} from './CopyButton';

const MAX_LINES = 24;

export interface CodeBlockProps {
  /** Pre-highlighted HTML, e.g. from an `?raw&shiki=<lang>` import. */
  html: string;
  /** The raw source, used for the copy button and line count. */
  source: string;
  filename?: string;
}

export const CodeBlock = ({
  html: markup,
  source,
  filename,
}: CodeBlockProps): View => {
  const trimmed = source.trim();
  const lineCount = trimmed.split('\n').length;
  const collapsible = lineCount > MAX_LINES;
  const expanded = sig(false);

  let root: Element | undefined;

  const wrapPatch = collapsible
    ? patch(toggleClass('code-collapsed', compute(expanded, (open) => !open)))
    : patch();

  const toggle = collapsible
    ? html`<button
        type="button"
        ${patch(
          on('click', () => {
            const willExpand = !expanded.get();
            expanded.update(willExpand);
            if (!willExpand) {
              requestAnimationFrame(() =>
                root?.scrollIntoView({block: 'start', behavior: 'smooth'}),
              );
            }
          }),
        )}
        class="flex w-full items-center justify-center gap-1 border-t border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]"
      >${view(expanded, (open) => text(open ? '▴ Show less' : `▾ Show more (${lineCount} lines)`))}</button>`
    : text('');

  return html`<div
    class="my-5 scroll-mt-20 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--code-bg)]"
    ${patch(act('', (el) => { root = el; }))}
  >
    <div class="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2">
      <span class="font-mono text-xs text-[var(--text)]">${filename ?? ''}</span>
      ${CopyButton(trimmed, 'Copy')}
    </div>
    <div class="code-scroll" ${wrapPatch}>${raw(markup)}</div>
    ${toggle}
  </div>`;
};
