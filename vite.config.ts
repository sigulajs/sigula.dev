import {GlobalWindow, PropertySymbol} from 'happy-dom';
import UnoCSS from 'unocss/vite';
import {createServer, defineConfig, type Plugin, type PluginOption} from 'vite';
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

// scripts/prerender.ts builds the page in-process, so the DOM globals Sigula
// relies on (document, Node, …) must exist before the module is evaluated.
// This mirrors @happy-dom/global-registrator without the extra dependency.
const IGNORE_GLOBALS = [
  'constructor',
  'undefined',
  'NaN',
  'global',
  'globalThis',
];
let domInstalled = false;
const installDom = (): void => {
  if (domInstalled) return;
  domInstalled = true;
  const window = new GlobalWindow({console: globalThis.console});

  for (const key of Object.keys(Object.getOwnPropertyDescriptors(window))) {
    if (IGNORE_GLOBALS.includes(key)) continue;
    const descriptor = Object.getOwnPropertyDescriptor(window, key);
    if (!descriptor || descriptor.value === undefined) continue;
    const existing = Object.getOwnPropertyDescriptor(globalThis, key);
    if (existing?.value === descriptor.value) continue;
    if (descriptor.value === window) {
      (window as unknown as Record<string, unknown>)[key] = globalThis;
      descriptor.value = globalThis;
    }
    Object.defineProperty(globalThis, key, {...descriptor, configurable: true});
  }

  for (const key of Object.getOwnPropertySymbols(window)) {
    const descriptor = Object.getOwnPropertyDescriptor(window, key);
    if (!descriptor || descriptor.value === undefined) continue;
    if (descriptor.value === window) {
      (window as unknown as Record<symbol, unknown>)[key] = globalThis;
      descriptor.value = globalThis;
    }
    Object.defineProperty(globalThis, key, {...descriptor, configurable: true});
  }

  (globalThis.document as unknown as Record<symbol, unknown>)[
    PropertySymbol.defaultView
  ] = globalThis;
};

type ModuleLoader = (url: string) => Promise<Record<string, unknown>>;

const renderPrerendered = async (
  load: ModuleLoader,
  reset?: () => void,
): Promise<string> => {
  installDom();
  // Sigula commits a View at most once, and the app builds module-level Views
  // (e.g. section bodies). Re-evaluate the modules so each render starts from
  // fresh instances instead of re-committing the previous ones.
  reset?.();
  const module = await load('/scripts/prerender.ts');
  const prerender = module.prerender;
  if (typeof prerender !== 'function') {
    throw new Error('scripts/prerender.ts must export a prerender() function');
  }
  return (prerender as () => string)();
};

const renderInTemporaryServer = async (): Promise<string> => {
  const server = await createServer({
    configFile: false,
    logLevel: 'silent',
    // Only the shiki plugin is needed to load the sections; UnoCSS would start
    // a filesystem watcher that keeps the build process alive.
    plugins: [shikiRaw()],
    resolve: {preserveSymlinks: true},
    server: {middlewareMode: true, watch: null},
  });
  try {
    return await renderPrerendered((url) => server.ssrLoadModule(url));
  } finally {
    await server.close();
  }
};

// Replaces the `<!--prerender-->` marker in index.html with the rendered body.
// Prerendering runs through Vite's SSR module graph so the `?raw&shiki=` plugin
// applies. In dev the project server is reused; during a client build there is
// no server, so a short-lived one is spun up for the render.
function injectHtmlPlugin(): PluginOption {
  return {
    name: 'vite-plugin-inject-html',
    transformIndexHtml: {
      order: 'post',
      async handler(html, ctx) {
        const {server} = ctx;
        const body = server
          ? await renderPrerendered(
              (url) => server.ssrLoadModule(url),
              () => server.environments.ssr.moduleGraph.invalidateAll(),
            )
          : await renderInTemporaryServer();
        return body ? html.replace('<!--prerender-->', body) : html;
      },
    },
  };
}

export default defineConfig({
  plugins: [shikiRaw(), UnoCSS(), cssBeforeScript(), injectHtmlPlugin()],
  resolve: {
    preserveSymlinks: true,
  },
});
