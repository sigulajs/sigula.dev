import {html} from 'sigula';
import {ApiEntry, type ApiEntryProps} from '../components/ApiEntry';
import {Todos} from '../components/demos/Todos';
import {headingSection} from './api';
import type {SectionMeta} from './types';

const viewEntry: ApiEntryProps = {
  anchorId: 'control-flow-view',
  name: 'view',
  signature: 'const view: <T>(sig: Sig<T>, viewFn: (val: T) => AnyView) => View<T>;',
  description:
    'Conditionally renders one view or another. Whenever `sig` changes, `viewFn` runs with the new value, the previous view is torn down, and a new one is mounted in its place.',
  example: {code: "html`<div>${view(isEmpty, (v) => (v ? text('empty') : list))}</div>`;"},
};

const repeatEntry: ApiEntryProps = {
  anchorId: 'control-flow-repeat',
  name: 'repeat',
  signature: 'const repeat: <T>(sig: Sig<T[]>, prop: RepeatProp<T>) => View<T[]>;',
  description:
    'Keyed list rendering. Items are matched by `key`, then reused, moved, created, or removed as few DOM nodes as possible. `eq` defaults to the deep comparator. An empty array renders an empty-list marker.',
  table: {
    headers: ['RepeatProp field', 'Type', 'Description'],
    rows: [
      ['key', '(item: T) => string', 'Unique and stable identifier for an item.'],
      ['view', '(item: T) => AnyView', 'Builds the view for an item.'],
      ['eq', '(a: T, b: T) => boolean', 'Optional item comparator; defaults to `eq`.'],
    ],
  },
};

const listEntry: ApiEntryProps = {
  anchorId: 'control-flow-list',
  name: 'list',
  signature:
    'const list: <T>(items: readonly T[], viewFn: (item: T, index: number) => AnyView) => View;',
  description:
    'Renders a fixed array in order. `viewFn` is called once per item with the item and its 0-based index; there is no keying, reconciliation, or reactive source. An empty array renders an empty-list marker.',
  example: {code: "html`<ul>${list(items, (item, i) => html`<li>${i}: ${text(item)}</li>`)}</ul>`;"},
};

const fragEntry: ApiEntryProps = {
  anchorId: 'control-flow-frag',
  name: 'frag',
  signature: 'const frag: (...views: AnyView[]) => View;',
  description:
    "Composes several views into one content-position view. The views' nodes are inserted as flat siblings, in order, with no wrapper element; nested fragments flatten. `frag()` with no arguments renders nothing.",
  example: {code: "html`<div>${frag(text('a'), html`<b>${text('b')}</b>`)}</div>`;"},
};

const body = html`<div>
  ${ApiEntry(viewEntry)}${ApiEntry(repeatEntry)}${ApiEntry(listEntry)}${ApiEntry(fragEntry)}
  <h3 class="mt-8 font-mono text-lg font-semibold text-[var(--text-h)]">Live example</h3>
  ${Todos()}
</div>`;

export const controlflow: SectionMeta = {
  id: 'control-flow',
  title: 'Control flow',
  group: 'Reference',
  render: () => headingSection('control-flow', 'Control flow', body),
};
