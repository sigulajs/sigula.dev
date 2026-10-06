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

const templates = code([
  "const sigItem  = sig('signal item');",
  "const strItem  = 'string data';",
  'const numItem  = 2026;',
  '',
  'html`<p>${sigItem} / ${strItem} / ${numItem}</p>`;',
  "html`<button ${patch(on('click', handler))}>Go</button>`;",
  "html`<article>${raw('<strong>Trusted</strong> HTML')}</article>`;",
]);

const patching = code([
  "html`<input ${patch({id: 'name', val: name, placeholder: 'Your name'})} />`",
  '',
  "html`<input ${patch(val(name), attr('placeholder', placeholder))} />`",
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
  <p class="leading-relaxed text-[var(--text)]">Equality is deep by default: <code>update</code> compares with <code>eq</code>, delegating to <code>a.equals(b)</code> when the value implements <code>Equatable</code>. <code>sig(v, {eq})</code> accepts a custom comparator.</p>
  <p class="leading-relaxed text-[var(--text)]">In-place mutation needs <code>notify()</code>. Sigula does not proxy your objects, so mutating a held array or object is invisible to <code>update</code>:</p>
  ${CodeBlock({code: mutation, lang: 'typescript'})}

  <h3 id="concepts-bindings" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">Bindings: the unit of reactivity</h3>
  <p class="leading-relaxed text-[var(--text)]">A binding is a three-field record — the entire reactive primitive. Fine-grained is literal: <code>text(name)</code> creates a bind whose <code>context</code> is one text node and whose <code>cmd</code> writes to it.</p>
  ${CodeBlock({code: bindings, lang: 'typescript'})}

  <h3 id="concepts-derived" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">Derived signals: compute</h3>
  <p class="leading-relaxed text-[var(--text)]"><code>compute</code> returns a <code>DerivedSig&lt;T&gt;</code>, a <code>Sig</code> you cannot write to. Derived signals are lazy about upstream: they detach from their sources when they lose their last consumer and re-link once when a consumer returns.</p>
  ${CodeBlock({code: derived, lang: 'typescript'})}

  <h3 id="concepts-templates" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">Templates: html</h3>
  <p class="leading-relaxed text-[var(--text)]"><code>html</code> is a tagged template over native HTML strings. Content positions take a <code>View</code>, <code>text</code>, <code>raw</code>, a <code>Sig</code>, or any primitive; attribute positions take a <code>Patch</code> from <code>patch(...)</code>. Anything else in a content position is coerced with <code>text()</code>.</p>
  ${CodeBlock({code: templates, lang: 'typescript'})}
  <p class="leading-relaxed text-[var(--text)]">Templates are cached per call site, keyed by the mix of patch/view slots, so repeated renders skip parsing. One <code>Patch</code> per element: combine commands into a single <code>patch(...)</code> call.</p>

  <h3 id="concepts-patch" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">Patching an element: patch</h3>
  <p class="leading-relaxed text-[var(--text)]"><code>patch</code> declares bindings for one element, as a props object, a list of command items, or both.</p>
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

  <h3 id="concepts-control-flow" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">Control flow</h3>
  <p class="leading-relaxed text-[var(--text)]">Four helpers, all returning a <code>View</code>: <code>view(sig, viewFn)</code> swaps conditions; <code>repeat(sig, {key, view, eq?})</code> is a keyed list; <code>list(items, viewFn)</code> renders a static array once; <code>frag(...views)</code> composes siblings with no wrapper.</p>
  ${CodeBlock({code: controlflow, lang: 'typescript'})}

  <h3 id="concepts-boundaries" class="mt-12 text-xl font-semibold text-[var(--text-h)] scroll-mt-24">Boundaries and teardown</h3>
  <p class="leading-relaxed text-[var(--text)]">A <code>View</code> occupies a contiguous range of sibling nodes, described by <code>boundary(): {start, end}</code>. Teardown is explicit and recursive.</p>
  ${CodeBlock({code: teardown, lang: 'typescript'})}

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
