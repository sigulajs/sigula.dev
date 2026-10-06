import {html} from 'sigula';
import {ApiTable} from '../components/ApiTable';
import {headingSection} from './api';
import type {SectionMeta} from './types';

const body = html`<div>
  <p class="leading-relaxed text-[var(--text)]">All exports are named exports from sigula. This page is a quick map; the generated API reference has full signatures and TSDoc for every export.</p>
  <div class="not-prose my-5">
    <a href="https://github.com/sigulajs/sigula/blob/main/Reference.md" class="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-h)] transition hover:border-[var(--accent-border)]">Full API reference (Reference.md) →</a>
  </div>
  ${ApiTable({
    headers: ['Export', 'Kind', 'Returns'],
    rows: [
      ['`sig(v, opts?)`', 'state', '`Sig<T>`'],
      ['`compute(sig, fn)` / `compute(record, fn)`', 'derived', '`DerivedSig<T>`'],
      ['`html`', 'template', '`View`'],
      ['`text(source)`', 'template', '`View` (escaped text node)'],
      ['`raw(source)`', 'template', '`View` (unescaped HTML)'],
      ['`patch(props | …items)`', 'binding', '`Patch`'],
      ['`id`, `val`, `attr`, `style`, `styleProp`, `toggleClass`, `toggleClasses`, `on`, `act`', 'patch commands', '`ToPatchItem<T>`'],
      ['`view(sig, viewFn)`', 'control flow', '`View`'],
      ['`repeat(sig, {key, view, eq?})`', 'control flow', '`View`'],
      ['`list(items, viewFn)`', 'control flow', '`View` (static)'],
      ['`frag(...views)`', 'composition', '`View`'],
      ['`render(view | () => view, node)`', 'mounting', 'disposer `() => void`'],
      ['`createBind`, `removeBind`, `eq`, `toBoundary`, `walkBoundary`', 'low-level', '—'],
      ['`Sig`, `DerivedSig`, `View`, `Patch`, `Reactive<T>`, `Eq<T>`, `Equatable`', 'types', '—'],
    ],
  })}
</div>`;

export const cheatsheet: SectionMeta = {
  id: 'api-cheatsheet',
  title: 'API Cheat Sheet',
  group: 'Reference',
  render: () => headingSection('api-cheatsheet', 'API Cheat Sheet', body),
};
