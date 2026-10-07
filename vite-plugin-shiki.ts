import {readFile} from 'node:fs/promises';
import {createHighlighter, type Highlighter} from 'shiki';
import type {Plugin} from 'vite';

const THEMES = {light: 'github-light', dark: 'github-dark'};
const LANGS = ['typescript', 'javascript', 'html', 'bash', 'json', 'xml'];

let highlighterPromise: Promise<Highlighter> | undefined;

const getHighlighter = (): Promise<Highlighter> =>
  (highlighterPromise ??= createHighlighter({
    themes: Object.values(THEMES),
    langs: LANGS,
  }));

/**
 * Import code as pre-highlighted HTML: `import html from './demo.ts?raw&shiki=typescript'`.
 *
 * The default export is the highlighted HTML (dual `github-light`/`github-dark`
 * themes via the CSS `light-dark()` function, which follows `color-scheme`); the
 * named `source` export is the raw text. Highlighting happens at build time, so
 * Shiki never ships to the client.
 */
export const shikiRaw = (): Plugin => ({
  name: 'shiki-raw',
  enforce: 'pre',
  async load(id) {
    const queryStart = id.indexOf('?');
    if (queryStart === -1) return null;

    const params = new URLSearchParams(id.slice(queryStart + 1));
    if (!params.has('raw') || !params.has('shiki')) return null;

    const file = id.slice(0, queryStart);
    const lang = params.get('shiki') || 'text';
    const source = await readFile(file, 'utf8');

    const highlighter = await getHighlighter();
    const html = highlighter.codeToHtml(source, {
      lang,
      themes: THEMES,
      defaultColor: 'light-dark()',
    });

    return `export default ${JSON.stringify(html)};\nexport const source = ${JSON.stringify(source)};`;
  },
});
