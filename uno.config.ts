import {defineConfig, presetWind4, transformerVariantGroup} from 'unocss';

export default defineConfig({
  presets: [
    presetWind4({
      dark: 'class',
      preflights: {reset: true, theme: {mode: 'on-demand'}},
    }),
  ],
  transformers: [transformerVariantGroup()],
  content: {
    // The client build only pulls in src/client.ts, so the section modules are
    // never part of Vite's module graph. Scan them from disk instead.
    filesystem: ['src/**/*.{ts,html}', 'index.html'],
    pipeline: {
      include: [
        // 1. Scan your main app files (including .ts)
        /\.(vue|svelte|html|jsx|tsx|ts|js)$/,
      ],
      exclude: ['node_modules', 'dist', '.git'],
    },
  },
});
