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
    'Conditionally renders one view or another. Whenever `sig` changes, `viewFn` is called with the new value, the previous view is torn down, and a new one is mounted in its place.',
  example: {code: "html`<div>${view(isEmpty, (v) => (v ? text('empty') : list))}</div>`;"},
};

const repeatEntry: ApiEntryProps = {
  anchorId: 'control-flow-repeat',
  name: 'repeat',
  signature: 'const repeat: <T>(sig: Sig<T[]>, prop: RepeatProp<T>) => View<T[]>;',
  description:
    'Keyed list rendering. Items are matched by `key`, then reused, moved, created, or removed as few DOM nodes as possible. `compare` defaults to `isEqual`. An empty array renders an empty-list marker.',
  table: {
    headers: ['RepeatProp field', 'Type', 'Description'],
    rows: [
      ['key', '(item: T) => string', 'Unique and stable identifier for an item.'],
      ['view', '(item: T) => AnyView', 'Builds the view for an item.'],
      ['compare', '(a: T, b: T) => boolean', 'Optional comparator; defaults to `isEqual`.'],
    ],
  },
};

const body = html`<div>
  ${ApiEntry(viewEntry)}${ApiEntry(repeatEntry)}
  <h3 class="mt-8 font-mono text-lg font-semibold text-[var(--text-h)]">Live example</h3>
  ${Todos()}
</div>`;

export const controlflow: SectionMeta = {
  id: 'control-flow',
  title: 'Control flow',
  group: 'Reference',
  headings: [
    {id: 'control-flow-view', title: 'view'},
    {id: 'control-flow-repeat', title: 'repeat'},
  ],
  render: () => headingSection('control-flow', 'Control flow', body),
};
