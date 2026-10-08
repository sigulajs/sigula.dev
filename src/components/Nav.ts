import {attr, html, list, patch, repeat, sig, type View} from 'sigula';
import {type SectionMeta, navGroups} from '../sections';

// All sub-links are rendered; CSS reveals the ones under the active section, and
// enhance.ts toggles `active` as the reader scrolls.
export const Nav = (activeId: string): View =>
  html`<nav aria-label="Documentation">
    ${repeat(sig(navGroups), {
      key: (group) => group.name,
      view: (group) => html`<div class="mb-6">
        <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text)]">${group.name}</p>
        <ul>
          ${repeat(sig(group.items), {
            key: (item) => item.id,
            view: (item: SectionMeta) => html`<li>
              <a
                ${patch(
                  attr('href', `#${item.id}`),
                  attr('data-section-link', item.id),
                  attr('class', item.id === activeId ? 'nav-link active' : 'nav-link'),
                )}
              >${item.title}</a>
              <div class="nav-subs">
                ${list(item.subs ?? [], (sub) => html`<a
                  ${patch(
                    attr('href', `#${sub.id}`),
                    attr('data-heading-link', sub.id),
                  )}
                  class="nav-sub"
                >${sub.title}</a>`)}
              </div>
            </li>`,
          })}
        </ul>
      </div>`,
    })}
  </nav>`;
