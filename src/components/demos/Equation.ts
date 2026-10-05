import {compute, html, on, patch, sig, type Sig, type View} from 'sigula';

export const Equation = (): View => {
  const x = sig(0);
  const y = sig(1);
  const s = {x, y};
  const sum = compute(s, (v) => v.x + v.y);
  const diff = compute(s, (v) => v.x - v.y);
  const product = compute(s, (v) => v.x * v.y);
  const quotient = compute(s, (v) => (v.y === 0 ? Number.NaN : v.x / v.y));
  const squareDiff = compute(s, (v) => v.x * v.x - v.y * v.y);

  const stepper = (label: string, value: Sig<number>): View => html`
    <div class="flex items-center justify-between gap-2">
      <span class="font-mono text-sm text-[var(--text-h)]">${label} = ${value}</span>
      <span class="flex gap-1">
        <button ${patch(on('click', () => value.trans((v) => v - 1)))} class="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--text-h)] transition hover:border-[var(--accent-border)]">-1</button>
        <button ${patch(on('click', () => value.trans((v) => v + 1)))} class="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--text-h)] transition hover:border-[var(--accent-border)]">+1</button>
      </span>
    </div>`;

  const row = (label: string, result: Sig<number>): View => html`
    <div class="flex items-baseline justify-between gap-3 border-b border-[var(--border)] py-1.5 last:border-0">
      <span class="text-sm text-[var(--text)]">${label}</span>
      <span class="font-mono text-sm text-[var(--text-h)]">${result}</span>
    </div>`;

  return html`<div class="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4">
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
