import UnoCSS from 'unocss/vite';
import {defineConfig, type Plugin} from 'vite';
import {shikiRaw} from './vite-plugin-shiki.ts';

// Vite injects the entry stylesheet after the module script. Because the script
// is deferred, it can run and force layout before the stylesheet has applied,
// which triggers Firefox's "layout was forced before the page was fully loaded"
// warning (and a possible flash of unstyled content). Emit the stylesheet <link>
// before the script so the script waits for it.
const cssBeforeScript = (): Plugin => ({
  name: 'css-before-script',
  enforce: 'post',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      const stylesheet = html.match(/<link[^>]+rel="stylesheet"[^>]*>/)?.[0];
      if (!stylesheet) return html;
      return html
        .replace(stylesheet, '')
        .replace(/(\s*)(<script[^>]+type="module")/, `$1${stylesheet}$1$2`);
    },
  },
});

export default defineConfig({
  plugins: [shikiRaw(), UnoCSS(), cssBeforeScript()],
  resolve: {
    preserveSymlinks: true,
  },
});
