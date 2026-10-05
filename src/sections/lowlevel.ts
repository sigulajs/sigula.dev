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
      'Wraps a node in a `Boundary`. A `DocumentFragment` spans its first and last child; any other node covers itself. Throws `E2` on an empty fragment.',
  },
  {
    name: 'walkBoundary',
    signature: 'const walkBoundary: (b: Boundary, fn: (node: Node) => void) => void;',
    description: 'Visits every node from `b.start` through `b.end`.',
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
      'A `Cmd` is the unit of work a binding runs: it receives the current value and context.',
  },
  {
    name: 'at',
    signature: 'const at: <T>(arr: T[], index: number) => T;',
    description: 'Reads `arr[index]`, throwing `E1:<index>` when it is out of range.',
  },
  {
    name: 'err',
    signature: 'function err(code: string): never;',
    description:
      'Throws an `Error` whose message is the short `code` (for example `E2` or `E11:1:2`). The full text for each code lives in the Errors section, so string tables stay out of the bundle.',
  },
];

const built = buildApiSection('low-level', entries);

export const lowlevel: SectionMeta = {
  id: 'low-level',
  title: 'Low-level API',
  group: 'Reference',
  render: () => headingSection('low-level', 'Low-level API', built.render()),
};
