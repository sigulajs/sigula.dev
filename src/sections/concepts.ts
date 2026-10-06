import {html, type View} from 'sigula';
import {ApiTable} from '../components/ApiTable';
import {CodeBlock} from '../components/CodeBlock';
import {headingSection} from './api';
import type {SectionMeta} from './types';

const code = (lines: string[]): string => lines.join('\n');

const row = (name: string, desc: string, role: string): View =>
  html`<div class="flex items-baseline gap-4 px-4 py-3">
    <span class="w-16 shrink-0 font-mono text-sm font-semibold text-[var(--text-h)]">${name}</span>
    <span class="min-w-0 flex-1 text-sm leading-relaxed text-[var(--text)]">${desc}</span>
    <span class="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">${role}</span>
  </div>`;

const signals = code([
  'const count = sig(0);',
  '',
  'count.get();              // 0 — read the current value',
  'count.update(1);          // set; dependents notified only if not deeply equal',
  'count.update(1);          // no-op: deeply equal, nothing is scheduled',
  'count.forceUpdate(1);     // set and always notify (even when equal)',
  'count.trans((v) => v + 1);// apply a function to the current value',
  'count.notify();           // re-run dependents without changing the value',
]);

const mutation = code([
  "const items = sig<string[]>([]);",
  "items.get().push('a');   // value object mutated, no write detected",
  'items.notify();          // ← tell dependents to re-run',
]);

const bindInterface = code([
  'interface Bind<T, C> {',
  '  sig: Sig<T>;                    // what it observes',
  '  context: C;                     // where the result goes (a text node, an element, …)',
  '  cmd: (val: T, ctx: C) => void;  // what to do with the new value',
  '  removed: boolean;',
  '  queued?: boolean;',
  '}',
]);

const bindings = code([
  "const name = sig('Alice');",
  'const v = text(name);   // Bind{ sig: name, context: {node: <Text>}, cmd: textCmd }',
  '',
  "name.update('Bob');     // → textCmd('Bob', {node}) → that one node changes",
]);

const derived = code([
  'const x = sig(1);',
  'const doubled = compute(x, (v) => v * 2);          // from one signal',
  '',
  'const sum = compute({x, y}, (v) => v.x + v.y);     // from a record of signals',
]);

const coercion = code([
  "const sigItem  = sig('signal item');",
  "const strItem  = 'string data';",
  'const numItem  = 2026;',
  "const htmlItem = html`<span>Html Span Element</span>`;",
  '',
  'render(',
  '  html`<p>${sigItem} / ${strItem} / ${numItem}</p>',
  '       <div>${htmlItem}</div>',
  "       <div>${raw('<strong>Trusted</strong> HTML')}</div>`,",
  '  app,',
  ');',
  '',
  "sigItem.update('string with <strong>markup</strong>'); // stays escaped — renders as text",
]);

const patching = code([
  "html`<input ${patch({id: 'name', val: name, placeholder: 'Your name'})} />`",
  '',
  "html`<input ${patch(val(name), attr('placeholder', placeholder))} />`",
]);

const patchValues = code([
  'const disabled = sig(false);',
  "const label = 'Submit';",
  '',
  "html`<button ${patch(attr('disabled', disabled), attr('aria-label', label))}>Go</button>`",
  '//                     ↑ reactive                     ↑ static',
]);

const controlflow = code([
  "${view(isEmpty, (empty) => (empty ? text('empty') : listView))}",
  '',
  '${repeat(todos, {',
  '  key: (t) => t.id.toString(),',
  '  view: (t) => html`<li>${t.text}</li>`,',
  '  eq: (a, b) => a.id === b.id && a.text === b.text,',
  '})}',
]);

const teardown = code([
  'const dispose = render(App(), app);',
  'dispose();   // removeBoundary(view.boundary()) + view.cleanBinds()',
]);

const queue = code([
  'sig0.update(a);   // ┐',
  'sig1.update(b);   // ├── one microtask',
  'sig2.update(c);   // ┘',
  '',
  'sig.update(1); sig.update(2); sig.update(3);',
  '// → each dependent binding runs ONCE, against 3',
]);

const body = html`<div>
  <h3 id="concepts-architecture" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">The whole architecture in one picture</h3>
  <div class="not-prose my-5 overflow-hidden rounded-xl border border-[var(--border)]">
    <div class="divide-y divide-[var(--border)]">
      ${row('Sig', 'holds a value + a list of Binds', 'state')}
      ${row('Bind', '{ sig, context, cmd }', 'the edge')}
      ${row('Cmd', '(value, context) => void', 'the work')}
      ${row('View', '{ node, boundary(), cleanBinds() }', 'DOM region')}
      ${row('Patch', 'deferred commands for one element', 'DOM region')}
      ${row('Queue', 'one global microtask, coalesced per Bind', 'scheduling')}
    </div>
  </div>
  <p class="leading-relaxed text-[var(--text)]">Everything else in the library is a convenience layer over these five pieces: a signal holds a value and a list of bindings; a binding is <code>{sig, context, cmd}</code>; a command does the work; a view is a DOM region; and a patch is a set of deferred commands for one element.</p>

  <h3 id="concepts-signals" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">Signals: sig</h3>
  <p class="leading-relaxed text-[var(--text)]">A <code>Sig&lt;T&gt;</code> is a value container that owns a list of bindings. It never touches the DOM itself.</p>
  ${CodeBlock({code: signals, lang: 'typescript'})}
  ${ApiTable({
    headers: ['Method', 'Purpose'],
    rows: [
      ['`get()`', 'Read the current value.'],
      ['`update(v)`', 'Write, skipping the notification when `eq(v, current)`.'],
      ['`forceUpdate(v)`', 'Write and always notify. Use after a structurally-equal-but-new value.'],
      ['`trans(fn)`', '`update(fn(current))` — the idiomatic way to derive the next state.'],
      ['`notify()`', 'Re-run dependents against the current value. Use after mutating a held object/array in place.'],
      ['`addBind` / `removeBind` / `getBinds`', 'Low-level binding management; prefer `createBind` or the template APIs.'],
    ],
  })}
  <p class="leading-relaxed text-[var(--text)]">Equality is deep by default: <code>update</code> compares with <code>eq</code>, delegating to <code>a.equals(b)</code> when the value implements <code>Equatable</code>. <code>sig(v, {eq})</code> accepts a custom comparator.</p>
  <p class="leading-relaxed text-[var(--text)]">In-place mutation needs <code>notify()</code>. Sigula does not proxy your objects, so mutating a held array or object is invisible to <code>update</code>:</p>
  ${CodeBlock({code: mutation, lang: 'typescript'})}

  <h3 id="concepts-bindings" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">Bindings: the unit of reactivity</h3>
  <p class="leading-relaxed text-[var(--text)]">A binding is a three-field record — the entire reactive primitive:</p>
  ${CodeBlock({code: bindInterface, lang: 'typescript'})}
  <p class="leading-relaxed text-[var(--text)]">So "fine-grained" is literal: <code>text(name)</code> creates a bind whose <code>context</code> is one <code>Text</code> node and whose <code>cmd</code> is <code>node.textContent = String(val)</code>. Nothing else in the tree is involved.</p>
  ${CodeBlock({code: bindings, lang: 'typescript'})}
  <p class="leading-relaxed text-[var(--text)]">Because a <code>Cmd</code> is just a function, the same model covers DOM writes, derived values, and arbitrary side effects — there is no separate <code>effect()</code>/<code>watch()</code> API to learn.</p>

  <h3 id="concepts-derived" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">Derived signals: compute</h3>
  <p class="leading-relaxed text-[var(--text)]"><code>compute</code> returns a <code>DerivedSig&lt;T&gt;</code>, a <code>Sig</code> you cannot write to. It has two overloads — one source signal, or a record of signals whose values arrive as a matching record. Derived signals compose: a <code>DerivedSig</code> is a valid source for another <code>compute</code> and a valid interpolation target.</p>
  ${CodeBlock({code: derived, lang: 'typescript'})}
  <p class="leading-relaxed text-[var(--text)]">Derived signals are lazy about upstream: they detach from their sources when they lose their last consumer (which happens whenever a <code>view()</code> subtree is hidden) and re-link and recompute once when a consumer returns — memory savings without manual disposal.</p>

  <h3 id="concepts-templates" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">Templates: html</h3>
  <p class="leading-relaxed text-[var(--text)]"><code>html</code> is a tagged template over native HTML strings — no compiler, no DSL, no JSX pragma. Interpolations fall into two positions, and the distinction is the one rule to memorize:</p>
  ${ApiTable({
    headers: ['Position', 'What goes there', 'Example'],
    rows: [
      ['Content (child slot)', 'a `View`, `text`, `raw`, a `Sig`, or any primitive', '<h1>${name}</h1>'],
      ['Attribute (inside a tag)', 'a `Patch` from `patch(...)`', '<input ${patch(val(name))} />'],
    ],
  })}
  <p class="leading-relaxed text-[var(--text)]">Anything interpolated in a content position that is not already a <code>View</code> or <code>Patch</code> is coerced with <code>text()</code>, i.e. escaped and rendered as <code>String(value)</code>:</p>
  ${CodeBlock({code: coercion, lang: 'typescript'})}
  <p class="leading-relaxed text-[var(--text)]"><strong class="text-[var(--text-h)]">How parsing works (and why it is fast).</strong> Every call site gets a random marker <code>@sig_&lt;rand&gt;</code>. Interpolations are written into the template string as an attribute marker for a <code>Patch</code> and a comment marker for a <code>View</code>, so parsing needs no regular expressions: Sigula walks the parsed fragment with a single <code>TreeWalker</code> and commits each marker in order.</p>
  <p class="leading-relaxed text-[var(--text)]">Two consequences worth knowing: <strong class="text-[var(--text-h)]">one <code>Patch</code> per element</strong> (combine commands into a single <code>patch(...)</code> call), and <strong class="text-[var(--text-h)]">templates are cached per call site</strong> (a <code>WeakMap</code> on the <code>TemplateStringsArray</code>, keyed by the mix of patch/view slots), so repeated renders skip parsing entirely.</p>

  <h3 id="concepts-patch" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">Patching an element: patch</h3>
  <p class="leading-relaxed text-[var(--text)]"><code>patch</code> declares bindings for one element, as a props object, a list of command items, or both. The props object handles <code>id</code>, <code>val</code>, <code>class</code>, <code>style</code>, <code>styleProp</code>, and <code>on</code>; any other key becomes an attribute, and a key whose value is <code>undefined</code> is skipped.</p>
  ${CodeBlock({code: patching, lang: 'typescript'})}
  ${ApiTable({
    headers: ['Command', 'What it does'],
    rows: [
      ['`id(source)`', 'Sets `element.id`.'],
      ['`val(source)`', 'Sets the `value` property (form controls).'],
      ['`attr(key, source)`', '`setAttribute(key, …)` — boolean/ARIA/data attributes.'],
      ['`style(key, source)`', 'Sets a typed inline style property.'],
      ['`styleProp(key, source)`', '`style.setProperty` — for `--custom-properties`.'],
      ['`toggleClass(token, source)`', 'Toggles one class from the truthiness of the value.'],
      ['`toggleClasses(tokens, source)`', 'Toggles several classes from one value.'],
      ['`on(type, listener, options?)`', '`addEventListener`.'],
      ['`act(source, fn)`', 'Escape hatch: run arbitrary code with `(element, value)`.'],
    ],
  })}
  <p class="leading-relaxed text-[var(--text)]">Every command takes a plain value (applied once at mount) or a <code>Sig</code> (applied at mount and re-applied on change):</p>
  ${CodeBlock({code: patchValues, lang: 'typescript'})}
  <p class="leading-relaxed text-[var(--text)]"><code>on</code> registers the listener once at mount; the listener itself is not a reactive source. Drive updates by writing to a signal inside it.</p>

  <h3 id="concepts-control-flow" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">Control flow</h3>
  <p class="leading-relaxed text-[var(--text)]">Four helpers, all returning a <code>View</code>:</p>
  ${ApiTable({
    headers: ['Helper', 'Use it for'],
    rows: [
      ['`view(sig, viewFn)`', 'Swap one view for another when `sig` changes (conditional rendering).'],
      ['`repeat(sig, {key, view, eq?})`', 'Keyed list rendering with minimal DOM reuse/moves.'],
      ['`list(items, viewFn)`', 'A static array rendered once — no keying, no reconciliation.'],
      ['`frag(...views)`', 'Compose several views as flat siblings with no wrapper element.'],
    ],
  })}
  ${CodeBlock({code: controlflow, lang: 'typescript'})}

  <h3 id="concepts-boundaries" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">Boundaries and teardown</h3>
  <p class="leading-relaxed text-[var(--text)]">A <code>View</code> occupies a contiguous range of sibling nodes, described by <code>boundary(): {start, end}</code> — this is how Sigula swaps or removes multi-node regions without a wrapper element or a virtual tree. The returned view is <code>{node, children, boundary(), cleanBinds()}</code>.</p>
  <p class="leading-relaxed text-[var(--text)]">Teardown is explicit and recursive:</p>
  ${CodeBlock({code: teardown, lang: 'typescript'})}
  <p class="leading-relaxed text-[var(--text)]"><code>cleanBinds()</code> detaches the view's own bind and, recursively, all child binds. When a <code>Sig</code> loses its last bind it calls <code>cleanup()</code>, so a subtree that is removed stops receiving updates immediately — no manual effect cleanup, no leak by default.</p>

  <h3 id="concepts-queue" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">The update queue</h3>
  <p class="leading-relaxed text-[var(--text)]">Writes never run synchronously. Every write pushes the signal's binds onto one global queue and schedules a single <code>queueMicrotask</code>.</p>
  <ul class="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--text)]">
    <li><strong class="text-[var(--text-h)]">Batched across signals</strong> — many writes, one flush.</li>
    <li><strong class="text-[var(--text-h)]">Coalesced per binding</strong> — each binding runs once and reads the newest value.</li>
    <li><strong class="text-[var(--text-h)]">Error-isolated</strong> — a throwing binding is logged and the rest of the queue still runs.</li>
  </ul>
  ${CodeBlock({code: queue, lang: 'typescript'})}

  <h3 id="concepts-not-included" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">What Sigula deliberately does not have</h3>
  ${ApiTable({
    headers: ['Not included', 'Why'],
    rows: [
      ['Virtual DOM / diffing', 'Updates are bound at mount time; there is nothing to diff.'],
      ['A component instance or lifecycle', 'A component is a function that returns a `View`, and it runs once.'],
      ['A compiler / build step', 'Templates are native tagged-template strings.'],
      ['A router, store, or SSR runtime', 'Out of scope. Sigula is the rendering and reactivity layer; bring your own.'],
      ['Proxy-based deep reactivity', 'Values are compared, not wrapped. Mutate in place and call `notify()`.'],
      ['Automatic dependency tracking', 'Bindings are explicit (`sig` → `cmd` → `target`), which keeps the runtime at ~4.5KB.'],
    ],
  })}
</div>`;

export const concepts: SectionMeta = {
  id: 'core-concepts',
  title: 'Core Concepts',
  group: 'Concepts',
  subs: [
    {id: 'concepts-architecture', title: 'Architecture'},
    {id: 'concepts-signals', title: 'Signals: sig'},
    {id: 'concepts-bindings', title: 'Bindings'},
    {id: 'concepts-derived', title: 'Derived: compute'},
    {id: 'concepts-templates', title: 'Templates: html'},
    {id: 'concepts-patch', title: 'Patching: patch'},
    {id: 'concepts-control-flow', title: 'Control flow'},
    {id: 'concepts-boundaries', title: 'Boundaries & teardown'},
    {id: 'concepts-queue', title: 'The update queue'},
    {id: 'concepts-not-included', title: 'What it omits'},
  ],
  render: (): View => headingSection('core-concepts', 'Core Concepts', body),
};
