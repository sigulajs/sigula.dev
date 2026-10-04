import {buildApiSection, headingSection, type ApiEntryData} from './api';
import type {SectionMeta} from './types';

const entries: ApiEntryData[] = [
  {
    name: 'Boundary',
    signature: 'interface Boundary {\n  start: Node;\n  end: Node;\n}',
    description: 'An inclusive range of sibling nodes (`start` through `end`).',
  },
  {
    name: 'toBoundary',
    signature: 'const toBoundary: (node: Node) => Boundary;',
    description:
      'Wraps a node in a `Boundary`. For a `DocumentFragment` the boundary spans its first and last child; otherwise it covers the node itself. Throws `E2` on an empty fragment.',
  },
  {
    name: 'removeBoundary',
    signature: 'const removeBoundary: (b: Boundary) => void;',
    description: 'Removes every node in the boundary. A no-op if the boundary has no parent.',
  },
  {
    name: 'replaceWithNode',
    signature: 'const replaceWithNode: (old: Boundary, node: Node) => Boundary;',
    description:
      'Replaces an entire boundary with `node` and returns the new boundary. Throws `E3` if `old` has no parent.',
  },
  {
    name: 'Cmd / AnyCmd / CmdContext',
    signature:
      'interface CmdContext {\n  [key: string]: unknown;\n}\ntype Cmd<T, C extends CmdContext> = (val: T, context: C) => void;\ntype AnyCmd = Cmd<any, any>;',
    description:
      'A `Cmd` is the unit of work a binding runs: it receives the current signal value and its context.',
  },
];

const built = buildApiSection('low-level', entries);

export const lowlevel: SectionMeta = {
  id: 'low-level',
  title: 'Low-level API',
  group: 'Reference',
  headings: built.headings,
  render: () => headingSection('low-level', 'Low-level API', built.render()),
};
