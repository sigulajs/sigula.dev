import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import {html, raw, text, type View} from 'sigula';
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
  return html`<div class="my-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--code-bg)]">
    <div class="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2">
      <span class="font-mono text-xs text-[var(--text)]">${text(title)}</span>
      ${CopyButton(source, 'Copy')}
    </div>
    <pre class="overflow-x-auto p-4 text-[13px] leading-relaxed"><code class="hljs">${raw(highlighted)}</code></pre>
  </div>`;
};
