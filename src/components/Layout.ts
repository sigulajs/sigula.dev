import {html, list, type View} from 'sigula';
import type {SectionMeta} from '../sections';
import {Badge} from './Badge';
import {Nav} from './Nav';

export interface LayoutProps {
  sections: SectionMeta[];
}

const GitHubIcon = (): View =>
  html`<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`;

const SunIcon = (): View =>
  html`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`;

const MoonIcon = (): View =>
  html`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

// Both icons are always rendered; an inline <head> script (plus theme.ts) sets
// the `dark` class and CSS shows the matching one.
const ThemeToggle = (): View => html`<button
  type="button"
  data-theme-toggle
  aria-label="Toggle color theme"
  class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-h)] transition hover:border-[var(--accent-border)]"
>
  <span class="block dark:hidden">${SunIcon()}</span>
  <span class="hidden dark:block">${MoonIcon()}</span>
</button>`;

const Header = (): View => html`<header class="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]">
  <div class="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-3 px-4 @3xl:px-6">
    <button
      type="button"
      data-nav-open
      aria-label="Open navigation"
      aria-expanded="false"
      class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-h)] @3xl:hidden"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
    <a href="#overview" class="flex items-center gap-2">
      <img src="/favicon.svg" alt="" width="28" height="28" />
      <span class="font-semibold text-[var(--text-h)]">sigula</span>
    </a>
    ${Badge('v2.0.1')}
    ${Badge('~4.5KB')}
    <div class="ml-auto flex items-center gap-2">
      <a
        href="https://github.com/sigulajs/sigula"
        aria-label="GitHub repository"
        class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-h)] transition hover:border-[var(--accent-border)]"
      >${GitHubIcon()}</a>
      ${ThemeToggle()}
    </div>
  </div>
</header>`;

const MobileNav = (activeId: string): View => html`<div
  data-nav-drawer
  class="fixed inset-0 z-50 bg-black/40 md:hidden"
>
  <div data-nav-panel class="h-full w-64 overflow-y-auto bg-[var(--bg)] p-4">
    ${Nav(activeId)}
  </div>
</div>`;

export const Layout = ({sections}: LayoutProps): View => {
  const activeId = sections[0]?.id ?? '';
  const content = html`<div>
    ${list(sections, (section) => section.render())}
  </div>`;
  return html`<div>
    <div class="@container min-h-screen">
      ${Header()}
      <div class="mx-auto flex w-full max-w-[1100px] items-start gap-8 px-4 py-8 @3xl:px-6">
        <aside class="sticky top-14 hidden max-h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto @3xl:block">
          ${Nav(activeId)}
        </aside>
        <main class="min-w-0 flex-1">${content}</main>
      </div>
      <footer class="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text)]">
        <p>sigula — MIT License · zjh · <a href="https://github.com/sigulajs/sigula" class="hover:underline">GitHub</a></p>
      </footer>
    </div>
    ${MobileNav(activeId)}
  </div>`;
};
