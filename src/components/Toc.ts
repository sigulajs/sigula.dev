import {
  attr,
  compute,
  html,
  patch,
  repeat,
  sig,
  text,
  toggleClass,
  view,
  type Sig,
  type View,
} from 'sigula';
import {headingsBySection} from '../sections';

export const Toc = (active: Sig<string>, activeHeading: Sig<string>): View => {
  const headings = compute(active, (id) => headingsBySection[id] ?? []);
  return html`<nav aria-label="On this page">
    <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text)]">On this page</p>
    ${view(headings, (items) =>
      items.length === 0
        ? html`<p class="px-3 text-sm text-[var(--text)]">—</p>`
        : html`<ul>
            ${repeat(sig(items), {
              key: (item) => item.id,
              view: (item) => html`<li>
                <a
                  ${patch(
                    attr(`#${item.id}`, 'href'),
                    toggleClass(compute(activeHeading, (id) => id === item.id), 'active'),
                  )}
                  class="toc-link"
                >${text(item.title)}</a>
              </li>`,
            })}
          </ul>`,
    )}
  </nav>`;
};
