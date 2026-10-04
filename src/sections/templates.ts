import {buildApiSection, headingSection, type ApiEntryData} from './api';
import type {SectionMeta} from './types';

const entries: ApiEntryData[] = [
  {
    name: 'html',
    signature: 'const html: (strs: TemplateStringsArray, ...items: (Patch | AnyView)[]) => View;',
    description:
      'Tagged template that parses native HTML and returns a `View`. Two kinds of interpolation are supported: a `View` (from `text`, `view`, `repeat`, or another `html`) fills a content position, and a `Patch` (from `patch(...)`) fills an attribute position. Templates are cached per call site.',
    example: {
      code: "html`<p>${text(label)}</p>`;\nhtml`<button ${patch(on('click', handler))}>Go</button>`;",
    },
  },
  {
    name: 'text',
    signature: 'const text: <T>(source: T | Sig<T>) => View<T, PatchContext>;',
    description:
      'Creates a text-node view. With a `Sig`, the text updates whenever the signal changes; with a plain value it is static.',
    example: {code: "html`<span>${text(count)}</span>`;"},
  },
  {
    name: 'View<T, C> / AnyView',
    signature:
      "interface View<T = unknown, C extends CmdContext = any> {\n  type: 'view';\n  node: Node;\n  bind?: Bind<T, C> | undefined;\n  childCommits?: Commit<unknown, CmdContext>[];\n  live?: () => Boundary | undefined;\n}\n\ntype AnyView = View<any, any>;",
    description:
      'The unit returned by `html`, `text`, `view`, and `repeat`. Its `node` is a DOM node or `DocumentFragment`.',
  },
  {
    name: 'replaceWithView',
    signature: 'const replaceWithView: (old: Boundary, view: View) => Boundary;',
    description:
      "Helper used by `view` and `repeat` to swap a mounted view: replaces an existing boundary with the view's node and returns the new boundary.",
  },
];

const built = buildApiSection('templates', entries);

export const templates: SectionMeta = {
  id: 'templates',
  title: 'Templates',
  group: 'Reference',
  headings: built.headings,
  render: () => headingSection('templates', 'Templates', built.render()),
};
