import {attr, html, on, patch, sig, text, view, type View} from 'sigula';

const copy = async (value: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    // fall through to legacy path
  }
  const area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand('copy');
  } catch {
    // ignore
  }
  area.remove();
};

export const CopyButton = (value: string, label = 'Copy'): View => {
  const copied = sig(false);
  const onClick = (): void => {
    void copy(value).then(() => {
      copied.update(true);
      window.setTimeout(() => copied.update(false), 1500);
    });
  };
  return html`<button
    type="button"
    ${patch(on('click', onClick), attr('aria-label', 'Copy to clipboard'))}
    class="shrink-0 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs text-[var(--text)] transition hover:border-[var(--accent-border)] hover:text-[var(--text-h)]"
  >${view(copied, (done) => text(done ? 'Copied!' : label))}</button>`;
};
