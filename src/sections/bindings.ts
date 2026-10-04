import {buildApiSection, headingSection, type ApiEntryData} from './api';
import type {SectionMeta} from './types';

const entries: ApiEntryData[] = [
  {
    name: 'patch',
    signature: 'const patch: (...toPatchItems: ToAnyPatchItem[]) => Patch;',
    description:
      'Declares one or more bindings to apply to the same element. Must be interpolated in an attribute position. Each command (`id`, `val`, `attr`, ...) receives either a plain value (applied once) or a `Sig` (applied on mount and re-applied on change).',
    example: {code: "html`<input ${patch(val(name), attr(placeholder, 'name'))} />`;"},
  },
  {
    name: 'id',
    signature: 'const id: <T>(source: T | Sig<T>) => ToPatchItem<T>;',
    description: "Sets the element's `id`.",
  },
  {
    name: 'val',
    signature: 'const val: <T>(source: T | Sig<T>) => ToPatchItem<T>;',
    description: "Sets the element's `value` property (form controls).",
  },
  {
    name: 'attr',
    signature: 'const attr: <T>(source: T | Sig<T>, key: string) => ToPatchItem<T>;',
    description:
      'Sets attribute `key` from `source`. Note the argument order: value first, key second. Use this for boolean/ARIA/data attributes.',
  },
  {
    name: 'style',
    signature: 'const style: <T>(source: T | Sig<T>, key: WritableStyleKey) => ToPatchItem<T>;',
    description: 'Sets an inline style property by typed name.',
    example: {code: "html`<span ${patch(style(color, 'color'))}>text</span>`;"},
  },
  {
    name: 'styleProperty',
    signature: 'const styleProperty: <T>(source: T | Sig<T>, key: string) => ToPatchItem<T>;',
    description:
      'Sets a style property via `CSSStyleDeclaration.setProperty`. Use this for custom properties (`--my-var`) or untyped names.',
    example: {code: "html`<div ${patch(styleProperty(size, '--size'))}></div>`;"},
  },
  {
    name: 'toggleClass',
    signature: 'const toggleClass: <T>(source: T | Sig<T>, token: string) => ToPatchItem<T>;',
    description: 'Toggles a single class from the truthiness of the value.',
  },
  {
    name: 'toggleClasses',
    signature: 'const toggleClasses: <T>(source: T | Sig<T>, ...tokens: string[]) => ToPatchItem<T>;',
    description: 'Toggles several classes from one value.',
  },
  {
    name: 'act',
    signature:
      'type ActFn<T> = (node: Node, val?: T) => void;\nconst act: <T>(source: T | Sig<T>, fn: ActFn<T>) => ToPatchItem<T>;',
    description:
      'Runs arbitrary code with the bound node and value; runs on mount and again on change. The escape hatch for anything the built-in commands do not cover.',
    example: {code: "html`<canvas ${patch(act(frame, (node, v) => draw(node, v)))}></canvas>`;"},
  },
  {
    name: 'on',
    signature:
      "const on: <K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions) => ToPatchItem<(this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown>;",
    description:
      'Adds a DOM event listener. The listener is registered once at mount; it is not a reactive source, so combine it with `sig` writes to drive updates.',
    example: {code: "html`<button ${patch(on('click', () => count.trans((v) => v + 1)))}>+1</button>`;"},
  },
  {
    name: 'Patch types',
    signature:
      "interface PatchContext extends CmdContext {\n  node: Node;\n  extra?: unknown[];\n}\n\ninterface PatchItem<T> {\n  source: T | Sig<T>;\n  context: PatchContext;\n  cmd: Cmd<T, PatchContext>;\n}\n\ntype ToPatchItem<T> = (el: Element) => PatchItem<T>;\ntype AnyPatchItem = PatchItem<any>;\ntype ToAnyPatchItem = (el: Element) => AnyPatchItem;\n\ninterface Patch {\n  type: 'patch';\n  toPatchItems: ToAnyPatchItem[];\n}",
    description:
      '`ToPatchItem` defers reading the target element until mount. `patch` collects these factories into a single `Patch`.',
  },
];

const built = buildApiSection('bindings', entries);

export const bindings: SectionMeta = {
  id: 'bindings',
  title: 'DOM bindings',
  group: 'Reference',
  headings: built.headings,
  render: () => headingSection('bindings', 'DOM bindings', built.render()),
};
