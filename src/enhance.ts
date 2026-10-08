import {render, type View} from 'sigula';
import {Equation} from './components/demos/Equation';
import {Todos} from './components/demos/Todos';
import {restoreHash, setupScrollSpy} from './scroll';
import {toggleTheme} from './theme';

// Components that keep client-side state are re-rendered into their prerendered
// container; everything else is enhanced in place via one delegated listener.
const demos: Record<string, () => View> = {
  equation: Equation,
  todos: Todos,
};

const copyText = async (value: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    // fall through to the legacy path
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

const setNavOpen = (open: boolean): void => {
  document
    .querySelector('[data-nav-drawer]')
    ?.classList.toggle('open', open);
  document
    .querySelector('[data-nav-open]')
    ?.setAttribute('aria-expanded', String(open));
};

const toggleCode = (button: Element): void => {
  const block = button.closest('[data-code-block]');
  if (!block) return;
  const open = block.classList.toggle('code-open');
  block.querySelector('.code-scroll')?.classList.toggle('code-collapsed', !open);
  if (!open) {
    requestAnimationFrame(() =>
      block.scrollIntoView({block: 'start', behavior: 'smooth'}),
    );
  }
};

const copyFrom = (button: Element): void => {
  const value =
    button.parentElement?.querySelector('[data-copy-source]')?.textContent ?? '';
  const label = button.querySelector('[data-copy-label]');
  void copyText(value).then(() => {
    if (!label) return;
    const previous = label.textContent ?? 'Copy';
    label.textContent = 'Copied!';
    window.setTimeout(() => {
      label.textContent = previous;
    }, 1500);
  });
};

const activateTab = (button: Element): void => {
  const tabs = button.closest('[data-tabs]');
  if (!tabs) return;
  for (const tab of tabs.querySelectorAll('[data-tab]')) {
    tab.classList.toggle('active', tab === button);
  }
  const command = (button as HTMLElement).dataset.command ?? '';
  const code = tabs.querySelector('[data-tab-command]');
  if (code) code.textContent = command;
  const source = tabs.querySelector('[data-copy-source]');
  if (source) source.textContent = command;
};

const onClick = (event: MouseEvent): void => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  if (target.closest('[data-theme-toggle]')) {
    toggleTheme();
    return;
  }
  if (target.closest('[data-nav-open]')) {
    setNavOpen(true);
    return;
  }

  const drawer = target.closest('[data-nav-drawer]');
  if (drawer && (target === drawer || target.closest('a[href^="#"]'))) {
    setNavOpen(false);
    return;
  }

  const codeToggle = target.closest('[data-code-toggle]');
  if (codeToggle) {
    toggleCode(codeToggle);
    return;
  }

  const copyButton = target.closest('[data-copy]');
  if (copyButton) {
    copyFrom(copyButton);
    return;
  }

  const tab = target.closest('[data-tab]');
  if (tab) activateTab(tab);
};

const mountDemos = (): void => {
  for (const el of document.querySelectorAll<HTMLElement>('[data-demo]')) {
    const component = demos[el.dataset.demo ?? ''];
    if (!component) continue;
    el.replaceChildren();
    render(component(), el);
  }
};

export const setupClientInteractions = (): void => {
  document.addEventListener('click', onClick);
  setupScrollSpy();
  restoreHash();
  mountDemos();
};
