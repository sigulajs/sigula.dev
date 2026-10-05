import {buildApiSection, headingSection, type ApiEntryData} from './api';
import type {SectionMeta} from './types';

const entries: ApiEntryData[] = [
  {
    name: 'html',
    signature:
      'const html: (strs: TemplateStringsArray, ...rawItems: HtmlItem[]) => View;',
    description:
      'Tagged template that parses native HTML and returns a `View`. Three interpolation kinds: a `View` fills a content position; a `Patch` from `patch(...)` fills an attribute position; a plain value or `Sig` fills a content position as text (a `Sig` binds reactively, anything else becomes `String(value)`). Templates are cached per call site and throw `E10`/`E11`/`E12` on misuse.',
    example: {
      code: "html`<p>Hello, ${name}!</p>`;\nhtml`<button ${patch(on('click', handler))}>Go</button>`;",
    },
  },
  {
    name: 'text',
    signature: 'const text: <T>(source: T | Sig<T>) => View<T, PatchContext>;',
    description:
      'Creates a text-node view. With a `Sig`, the text updates whenever the signal changes; a plain value is static. Interpolating a `Sig` or primitive in a content position is equivalent to wrapping it in `text()`.',
    example: {code: 'html`<span>${text(count)}</span>`;'},
  },
  {
    name: 'raw',
    signature: 'const raw: (source: string | Sig<string>) => AnyView;',
    description:
      'Parses its value as HTML and mounts the resulting nodes with no wrapper element. Unlike `text`, the value is **not** escaped — only pass trusted HTML. A `Sig` re-parses and replaces the content on change; an empty string renders nothing.',
    example: {code: "html`<article>${raw(post.bodyHtml)}</article>`;"},
  },
  {
    name: 'View<T, C>',
    signature:
      "interface View<T = unknown, C extends CmdContext = any> {\n  type: 'view';\n  node: Node;\n  bind?: Bind<T, C> | undefined;\n  cleanBinds: () => void;\n  boundary: () => Boundary;\n  children?: ChildView[] | undefined;\n}",
    description:
      'The unit returned by `html`, `text`, `raw`, `view`, `repeat`, `list`, and `frag`. `node` is a DOM node or `DocumentFragment`; `boundary()` returns the nodes the view occupies; `cleanBinds()` detaches its bindings and, recursively, its children.',
  },
  {
    name: 'ChildView',
    signature: 'type ChildView = AnyView | Patch;',
    description:
      "An item that can occupy a slot in a view's children: a view or a patch.",
  },
  {
    name: 'replaceWithView',
    signature: 'const replaceWithView: (old: Boundary, view: View) => Boundary;',
    description:
      "Replaces an existing boundary with a view's node and returns the new boundary.",
  },
];

const built = buildApiSection('templates', entries);

export const templates: SectionMeta = {
  id: 'templates',
  title: 'Templates',
  group: 'Reference',
  render: () => headingSection('templates', 'Templates', built.render()),
};
