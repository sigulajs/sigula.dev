import {buildApiSection, headingSection, type ApiEntryData} from './api';
import type {SectionMeta} from './types';

const renderEntry: ApiEntryData = {
  name: 'render',
  signature: 'const render: (viewArg: AnyView | (() => AnyView), node: Node) => () => void;',
  description:
    'Mounts a view into `node` by appending its node. Accepts a `View` or a factory that returns one. Returns a disposer that detaches every bind in the tree and removes the nodes from `node`; calling the disposer twice is a no-op.',
  example: {
    code: "const dispose = render(App(), document.querySelector('#app')!);\ndispose();",
  },
};

const built = buildApiSection('rendering', [renderEntry]);

export const rendering: SectionMeta = {
  id: 'rendering',
  title: 'Rendering',
  group: 'Reference',
  render: () => headingSection('rendering', 'Rendering', built.render()),
};
