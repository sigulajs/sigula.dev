import {buildApiSection, headingSection, type ApiEntryData} from './api';
import type {SectionMeta} from './types';

const entries: ApiEntryData[] = [
  {
    name: 'patch',
    signature:
      'function patch(props: PatchProps, ...items: ToAnyPatchItem[]): Patch;\nfunction patch(...toPatchItems: ToAnyPatchItem[]): Patch;',
    description:
      'Declares one or more bindings to apply to the same element; must be interpolated in an attribute position. The first argument may be a `PatchProps` object, desugared into commands in key order, optionally followed by command items. Each command receives a plain value (applied once) or a `Sig` (applied on mount and re-applied on change).',
    example: {
      code: "html`<input ${patch({val: name, placeholder: 'name'})} />`;\nhtml`<input ${patch(val(name), attr('name', placeholder))} />`;",
    },
  },
  {
    name: 'PatchProps',
    description:
      'Object form for `patch`, desugared into commands in key order: `id`, `val`, `class` (per entry, via `toggleClass`), `style` (per entry, via `style`), `styleProp` (per entry), `on` (per entry), and any other key via `attr`. A key whose value is `undefined` is skipped.',
    table: {
      headers: ['Key', 'Type', 'Applies'],
      rows: [
        ['id', 'Reactive<string>', "Sets the element's `id`."],
        ['val', 'Reactive<string>', "Sets the element's `value` property."],
        ['class', 'Record<string, Reactive<boolean>>', 'Toggles each class from the truthiness of its value.'],
        ['style', 'Partial<Record<WritableStyleKey, Reactive<string>>>', 'Sets inline style properties by typed name.'],
        ['styleProp', 'Record<string, Reactive<string>>', 'Sets style properties via `setProperty` (custom properties, untyped names).'],
        ['on', '{[K in keyof HTMLElementEventMap]?: (ev) => void}', 'Registers DOM event listeners.'],
        ['[attr: string]', 'unknown', 'Any other key is set as an attribute via `attr`.'],
      ],
    },
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
    signature: 'const attr: <T>(key: string, source: T | Sig<T>) => ToPatchItem<T>;',
    description:
      'Sets attribute `key` from `source`. Note the argument order: key first, value second. Use this for boolean/ARIA/data attributes.',
  },
  {
    name: 'style',
    signature: 'const style: <T>(key: WritableStyleKey, source: T | Sig<T>) => ToPatchItem<T>;',
    description: 'Sets an inline style property by typed name.',
    example: {code: "html`<span ${patch(style('color', color))}>text</span>`;"},
  },
  {
    name: 'styleProp',
    signature: 'const styleProp: <T>(key: string, source: T | Sig<T>) => ToPatchItem<T>;',
    description:
      'Sets a style property via `CSSStyleDeclaration.setProperty`; use this for custom properties (`--my-var`) or untyped names.',
    example: {code: "html`<div ${patch(styleProp('--size', size))}></div>`;"},
  },
  {
    name: 'toggleClass',
    signature: 'const toggleClass: <T>(token: string, source: T | Sig<T>) => ToPatchItem<T>;',
    description: 'Toggles a single class from the truthiness of the value.',
  },
  {
    name: 'toggleClasses',
    signature: 'const toggleClasses: <T>(tokens: readonly string[], source: T | Sig<T>) => ToPatchItem<T>;',
    description: 'Toggles several classes from one value.',
  },
  {
    name: 'act',
    signature:
      'type ActFn<T> = (elem: Element, val?: T) => void;\nconst act: <T>(source: T | Sig<T>, fn: ActFn<T>) => ToPatchItem<T>;',
    description:
      'Runs arbitrary code with the bound element and value; runs on mount and again on change. The escape hatch for anything the built-in commands do not cover.',
    example: {code: "html`<canvas ${patch(act(frame, (el, v) => draw(el, v)))}></canvas>`;"},
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
    name: 'Patch / PatchItem types',
    signature:
      "interface Patch {\n  type: 'patch';\n  toPatchItems: ToAnyPatchItem[];\n  cleanBinds: () => void;\n}\n\ninterface PatchContext extends CmdContext {\n  node: Node;\n  extra?: unknown[];\n}\n\ninterface PatchItem<T> {\n  source: T | Sig<T>;\n  context: PatchContext;\n  cmd: Cmd<T, PatchContext>;\n}\n\ntype ToPatchItem<T> = (el: Element) => PatchItem<T>;\ntype AnyPatchItem = PatchItem<any>;\ntype ToAnyPatchItem = (el: Element) => AnyPatchItem;",
    description:
      '`ToPatchItem` defers reading the target element until mount. `patch` collects these factories into a single `Patch`; `cleanBinds` detaches the bindings created when the patch was committed.',
  },
  {
    name: 'WritableStyleKey',
    signature:
      'type WritableStyleKey = { [K in keyof CSSStyleDeclaration]: CSSStyleDeclaration[K] extends string ? K : never; }[keyof CSSStyleDeclaration];',
    description: 'The union of `CSSStyleDeclaration` keys whose values are strings.',
  },
];

const built = buildApiSection('bindings', entries);

export const bindings: SectionMeta = {
  id: 'bindings',
  title: 'DOM bindings',
  group: 'Reference',
  render: () => headingSection('bindings', 'DOM bindings', built.render()),
};
