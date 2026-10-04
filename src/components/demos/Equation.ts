import {compute, html, on, patch, sig, text, type Sig, type View} from 'sigula';

export const Equation = (): View => {
  const x = sig(0);
  const y = sig(1);
  const sum = compute({x, y}, (v) => v.x + v.y);
  const diff = compute({x, y}, (v) => v.x - v.y);
  const product = compute({x, y}, (v) => v.x * v.y);
  const quotient = compute({x, y}, (v) => (v.y === 0 ? Number.NaN : v.x / v.y));
  const squareDiff = compute({x, y}, (v) => v.x * v.x - v.y * v.y);

  const stepper = (label: string, value: Sig<number>): View => html`
    <div class="flex items-center justify-between gap-2">
      <span class="font-mono text-sm text-[var(--text-h)]">${text(label)} = ${text(value)}</span>
      <span class="flex gap-1">
        <button ${patch(on('click', () => value.trans((v) => v - 1)))} class="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--text-h)] transition hover:border-[var(--accent-border)]">-1</button>
        <button ${patch(on('click', () => value.trans((v) => v + 1)))} class="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--text-h)] transition hover:border-[var(--accent-border)]">+1</button>
      </span>
    </div>`;

  const row = (label: string, result: Sig<number>): View => html`
    <div class="flex items-baseline justify-between gap-3 border-b border-[var(--border)] py-1.5 last:border-0">
      <span class="text-sm text-[var(--text)]">${text(label)}</span>
      <span class="font-mono text-sm text-[var(--text-h)]">${text(result)}</span>
    </div>`;

  return html`<div class="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4 shadow-[var(--shadow)]">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="font-mono text-sm font-semibold text-[var(--text-h)]">Equation</h3>
      <span class="text-xs text-[var(--text)]">live · rendered with sigula</span>
    </div>
    <div class="grid gap-2">
      ${stepper('x', x)}
      ${stepper('y', y)}
    </div>
    <div class="mt-4">
      ${row('sum: x + y', sum)}
      ${row('difference: x - y', diff)}
      ${row('product: x * y', product)}
      ${row('quotient: x / y', quotient)}
      ${row('x² - y²', squareDiff)}
    </div>
  </div>`;
};
