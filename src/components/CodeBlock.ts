import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
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
  type View,
  view,
} from 'sigula';
import {CopyButton} from './CopyButton';

let langsReady = false;

const ensureLangs = (): void => {
  if (langsReady) return;
  hljs.registerLanguage('typescript', typescript);
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('xml', xml);
  hljs.registerLanguage('html', xml);
  hljs.registerLanguage('bash', bash);
  hljs.registerLanguage('json', json);
  langsReady = true;
};

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const highlight = (code: string, lang: string): string => {
  ensureLangs();
  try {
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(code, {language: lang, ignoreIllegals: true}).value;
    }
  } catch {
    // fall back to escaped source
  }
  return escapeHtml(code);
};

const MAX_LINES = 24;

export interface CodeBlockProps {
  code: string;
  lang?: string;
  filename?: string;
}

export const CodeBlock = ({
  code,
  lang = 'typescript',
  filename,
}: CodeBlockProps): View => {
  const source = code.trim();
  const highlighted = highlight(source, lang);
  const title = filename ?? lang;

  const lineCount = source.split('\n').length;
  const collapsible = lineCount > MAX_LINES;
  const expanded = sig(false);

  let root: Element | undefined;

  const prePatch = collapsible
    ? patch(
        toggleClass(
          'code-collapsed',
          compute(expanded, (open) => !open),
        ),
      )
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
    ${patch(
      act('', (el) => {
        root = el;
      }),
    )}
  >
    <div class="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2">
      <span class="font-mono text-xs text-[var(--text)]">${title}</span>
      ${CopyButton(source, 'Copy')}
    </div>
    <pre class="whitespace-pre-wrap break-words p-4 text-[13px] leading-relaxed" ${prePatch}><code class="hljs">${raw(highlighted)}</code></pre>
    ${toggle}
  </div>`;
};
