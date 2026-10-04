import {buildApiSection, headingSection, type ApiEntryData} from './api';
import type {SectionMeta} from './types';

const entries: ApiEntryData[] = [
  {
    name: 'sig',
    signature: 'const sig: <T>(v: T) => Sig<T>;',
    description:
      'Creates a writable signal holding `v`. Read it with `get`, set it with `update`, or transform it with `trans`.',
    example: {
      code: 'const count = sig(0);\ncount.get(); // 0\ncount.update(1); // schedules dependents',
    },
  },
  {
    name: 'Sig<T>',
    description:
      'The core reactive value. Writes are batched into a microtask and coalesced per binding.',
    table: {
      headers: ['Member', 'Signature', 'Description'],
      rows: [
        ['get', '(): T', 'Reads the current value.'],
        ['update', '(v: T): void', 'Sets the value and notifies dependents only when `isEqual(v, current)` is false.'],
        ['forceUpdate', '(v: T): void', 'Sets the value and always notifies dependents, even when deeply equal.'],
        ['trans', '(fn: (v: T) => T): void', 'Applies `fn` to the current value via `update`, so an equal result is skipped.'],
        ['equals', '(other: unknown): boolean', 'Two `Sig`s are equal when their values are deeply equal.'],
        ['addBind', '<C>(bind: Bind<T, C>): void', 'Registers a binding. Prefer the `patch`/`text`/`view` APIs.'],
        ['removeBind', '<C>(bind: Bind<T, C>): void', 'Unregisters a binding; runs `cleanup()` when the last one goes away.'],
        ['getBinds', '(): Bind<T, CmdContext>[]', 'Returns the current bindings.'],
        ['cleanup', '(): void', 'Hook called when a signal loses all bindings. No-op on `Sig`.'],
      ],
    },
  },
  {
    name: 'DerivedSig<T>',
    description:
      'A signal produced by `compute`. It tracks its source bindings and detaches when it loses its last consumer, re-linking and recomputing when a consumer is added again.',
    table: {
      headers: ['Member', 'Signature', 'Description'],
      rows: [
        ['addFromBind', '<S, C>(bind: Bind<S, C>): void', 'Registers a source binding.'],
        ['addBind', '<C>(bind: Bind<T, C>): void', 'Registers a consumer; re-links and recomputes once if detached.'],
        ['cleanup', '(): void', 'Removes every source binding when there are no consumers.'],
      ],
    },
  },
  {
    name: 'compute',
    signature:
      'function compute<S, T>(source: Sig<S>, fn: (v: S) => T): DerivedSig<T>;\nfunction compute<S extends SigRecord, T>(source: S, fn: (v: ValRecord<S>) => T): DerivedSig<T>;',
    description:
      'Derives a signal from one source signal, or from a record of signals (whose values are passed as a matching record). Recomputes whenever any source changes.',
    example: {
      code: 'const x = sig(1);\nconst y = sig(2);\n\nconst sum = compute({x, y}, (v) => v.x + v.y); // DerivedSig<number>\nconst doubled = compute(x, (v) => v * 2); // DerivedSig<number>',
    },
    table: {
      headers: ['Supporting type', 'Definition'],
      rows: [
        ['SigRecord', '{ [key: string]: Sig<any>; }'],
        ['ValRecord<K>', '{ [P in keyof K]: K[P] extends Sig<infer U> ? U : never; }'],
      ],
    },
  },
  {
    name: 'isEqual',
    signature: 'const isEqual: <T>(a: T, b: T) => boolean;',
    description:
      'Deep structural equality over primitives, arrays, `Date`, `RegExp`, `Map`, `Set`, and plain objects. Defers to `a.equals(b)` when `a` implements `Equatable`. Two objects with different prototypes are never equal.',
  },
  {
    name: 'Equatable',
    signature: 'interface Equatable {\n  equals(other: unknown): boolean;\n}',
    description: 'Implement this on a value type to give `isEqual` custom semantics.',
  },
  {
    name: 'UnknownRecord',
    signature: 'type UnknownRecord = Record<string, unknown>;',
    description:
      'Convenience alias for an arbitrary string-keyed object, used by the equality and signal-record helpers.',
  },
  {
    name: 'createBind / removeBind',
    signature:
      'const createBind: <T, C extends CmdContext>(sig: Sig<T>, context: C, cmd: Cmd<T, C>) => Bind<T, C>;\nconst removeBind: <T, C extends CmdContext>(bind: Bind<T, C>) => void;',
    description:
      'Low-level bind management. `createBind` wires `cmd(sig.get(), context)` to run whenever `sig` changes; `removeBind` detaches it.',
    table: {
      headers: ['Bind field', 'Type'],
      rows: [
        ['sig', 'Sig<T>'],
        ['context', 'C'],
        ['cmd', 'Cmd<T, C>'],
        ['removed', 'boolean'],
        ['queued', 'boolean | undefined'],
      ],
    },
  },
];

const built = buildApiSection('reactivity', entries);

export const reactivity: SectionMeta = {
  id: 'reactivity',
  title: 'Reactivity',
  group: 'Reference',
  headings: built.headings,
  render: () => headingSection('reactivity', 'Reactivity', built.render()),
};
