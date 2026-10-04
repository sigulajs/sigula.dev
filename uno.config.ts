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
    pipeline: {
      include: [
        // 1. Scan your main app files (including .ts)
        /\.(vue|svelte|html|jsx|tsx|ts|js)$/,
      ],
      exclude: ['node_modules', 'dist', '.git'],
    },
  },
});
