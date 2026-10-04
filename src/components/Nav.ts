import {
  attr,
  compute,
  html,
  patch,
  repeat,
  sig,
  text,
  toggleClass,
  type Sig,
  type View,
} from 'sigula';
import {type SectionMeta, navGroups} from '../sections';

export const Nav = (active: Sig<string>): View =>
  html`<nav aria-label="Documentation">
    ${repeat(sig(navGroups), {
      key: (group) => group.name,
      view: (group) => html`<div class="mb-6">
        <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text)]">${text(group.name)}</p>
        <ul>
          ${repeat(sig(group.items), {
            key: (item) => item.id,
            view: (item: SectionMeta) => html`<li>
              <a
                ${patch(
                  attr(`#${item.id}`, 'href'),
                  toggleClass(compute(active, (id) => id === item.id), 'active'),
                )}
                class="nav-link"
              >${text(item.title)}</a>
            </li>`,
          })}
        </ul>
      </div>`,
    })}
  </nav>`;
