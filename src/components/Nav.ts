import {
  attr,
  compute,
  html,
  list,
  patch,
  repeat,
  sig,
  text,
  toggleClass,
  view,
  type Sig,
  type View,
} from 'sigula';
import {type SectionMeta, navGroups} from '../sections';

export const Nav = (active: Sig<string>, activeHeading: Sig<string>): View =>
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
                  toggleClass('active', compute(active, (id) => id === item.id)),
                )}
                class="nav-link"
              >${item.title}</a>
              ${view(compute(active, (id) => id === item.id), (isActive) =>
                isActive
                  ? list(item.subs ?? [], (sub) => html`<a
                      ${patch(
                        attr('href', `#${sub.id}`),
                        toggleClass('active', compute(activeHeading, (id) => id === sub.id)),
                      )}
                      class="nav-sub"
                    >${sub.title}</a>`)
                  : text(''),
              )}
            </li>`,
          })}
        </ul>
      </div>`,
    })}
  </nav>`;
