import {buildApiSection, headingSection, type ApiEntryData} from './api';
import type {SectionMeta} from './types';

const entries: ApiEntryData[] = [
  {
    name: 'sig',
    signature: 'const sig: <T>(v: T, opts?: {eq?: Eq<T>}) => Sig<T>;',
    description:
      'Creates a writable signal holding `v`. `opts.eq` overrides the comparator used by `update`.',
    example: {
      code: 'const count = sig(0);\ncount.get();     // 0\ncount.update(1); // schedules dependents',
    },
  },
  {
    name: 'compute',
    signature:
      'function compute<S, T>(source: Sig<S>, fn: (v: S) => T): DerivedSig<T>;\nfunction compute<S extends SigRecord, T>(source: S, fn: (v: ValRecord<S>) => T): DerivedSig<T>;',
    description:
      'Derives a signal from one source signal, or from a record of signals whose values are passed as a matching record. The result recomputes whenever a source changes.',
    example: {
      code: 'const doubled = compute(x, (v) => v * 2);\nconst sum = compute({x, y}, (v) => v.x + v.y);',
    },
  },
  {
    name: 'Sig<T>',
    description:
      'The core reactive value. A `Sig` holds a value and a set of bindings that run when it changes; writes are queued and coalesced in a microtask.',
    table: {
      headers: ['Member', 'Signature', 'Description'],
      rows: [
        ['get', '(): T', 'Reads the current value.'],
        ['update', '(v: T): void', 'Sets the value and notifies dependents only when `eq(v, current)` is false.'],
        ['forceUpdate', '(v: T): void', 'Sets the value and always notifies dependents, even when deeply equal.'],
        ['trans', '(fn: (v: T) => T): void', 'Applies `fn` to the current value via `update`, so an equal result is skipped.'],
        ['notify', '(): void', 'Enqueues dependents without changing the value; use after in-place mutation.'],
        ['equals', '(other: unknown): boolean', '`Equatable` implementation; two `Sig`s are equal when their values are deeply equal.'],
        ['addBind', '<C extends CmdContext>(bind: Bind<T, C>): void', 'Registers a binding. Prefer `createBind` or the `patch`/`text`/`view` APIs.'],
        ['removeBind', '<C extends CmdContext>(bind: Bind<T, C>): void', 'Unregisters a binding; runs `cleanup()` when the last one goes away.'],
        ['getBinds', '(): Bind<T, CmdContext>[]', 'Returns the current bindings.'],
        ['cleanup', '(): void', 'Overridable hook called when a signal loses all bindings. No-op on `Sig`.'],
      ],
    },
  },
  {
    name: 'DerivedSig<T>',
    description:
      'A `Sig` produced by `compute`. It tracks its source bindings and detaches when it loses its last consumer, then re-links and recomputes once when a consumer returns.',
    table: {
      headers: ['Member', 'Signature', 'Description'],
      rows: [
        ['addFromBind', '<S, C extends CmdContext>(bind: Bind<S, C>): void', 'Registers a source binding.'],
        ['addBind', '<C extends CmdContext>(bind: Bind<T, C>): void', 'Registers a consumer; re-links to sources and recomputes once if detached.'],
        ['cleanup', '(): void', 'Removes every source binding when the derived signal has no consumers.'],
      ],
    },
  },
  {
    name: 'eq',
    signature: 'const eq: <T>(a: T, b: T) => boolean;',
    description:
      'Deep structural equality over primitives, arrays, `Date`, `RegExp`, `Map`, `Set`, and plain objects. Defers to `a.equals(b)` when `a` implements `Equatable`. The default comparator for `Sig.update` and `repeat`. Values with different prototypes are never equal.',
  },
  {
    name: 'Equatable',
    signature: 'interface Equatable {\n  equals(other: unknown): boolean;\n}',
    description: 'Implement this on a value type to give `eq` custom equality semantics.',
  },
  {
    name: 'Eq<T>',
    signature: 'type Eq<T> = (a: T, b: T) => boolean;',
    description: 'A value equality function.',
  },
  {
    name: 'Reactive<T>',
    signature: 'type Reactive<T> = T | Sig<T> | undefined;',
    description: 'A value that may be plain, a `Sig`, or `undefined`. Used by the `patch` props form.',
  },
  {
    name: 'UnknownRecord',
    signature: 'type UnknownRecord = Record<string, unknown>;',
    description: 'Convenience alias for an arbitrary string-keyed object.',
  },
  {
    name: 'SigRecord',
    signature: 'interface SigRecord {\n  [key: string]: Sig<any>;\n}',
    description: 'A record whose values are signals, used by the record overload of `compute`.',
  },
  {
    name: 'ValRecord<K>',
    signature:
      'type ValRecord<K extends SigRecord> = { [P in keyof K]: K[P] extends Sig<infer U> ? U : never; };',
    description: "Maps a `SigRecord` to a record of the signals' values.",
  },
  {
    name: 'createBind / removeBind',
    signature:
      'const createBind: <T, C extends CmdContext>(sig: Sig<T>, context: C, cmd: Cmd<T, C>) => Bind<T, C>;\nconst removeBind: <T, C extends CmdContext>(bind: Bind<T, C>) => void;',
    description:
      'Wires `cmd(sig.get(), context)` to run whenever `sig` changes; `removeBind` detaches it and marks it removed so queued runs are skipped.',
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
  render: () => headingSection('reactivity', 'Reactivity', built.render()),
};
