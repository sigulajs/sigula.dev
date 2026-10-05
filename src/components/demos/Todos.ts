import {
  act,
  compute,
  html,
  on,
  patch,
  repeat,
  sig,
  style,
  text,
  val,
  view,
  type Sig,
  type View,
} from 'sigula';

interface Todo {
  id: number;
  text: string;
  done: Sig<boolean>;
}

export const Todos = (): View => {
  const input = sig('');
  const todos = sig<Todo[]>([]);
  const filter = sig<'all' | 'active' | 'done'>('all');
  const revision = sig(0);
  let nextId = 0;

  const visible = compute({todos, filter, revision}, (v) => {
    switch (v.filter) {
      case 'active':
        return v.todos.filter((item) => !item.done.get());
      case 'done':
        return v.todos.filter((item) => item.done.get());
      default:
        return v.todos;
    }
  });

  const isEmpty = compute(visible, (v) => v.length === 0);

  const addTodo = (event: Event): void => {
    event.preventDefault();
    const value = input.get().trim();
    if (!value) return;
    todos.trans((items) => [
      ...items,
      {id: nextId++, text: value, done: sig(false)},
    ]);
    input.update('');
  };

  const remove = (id: number): void => {
    todos.trans((items) => items.filter((item) => item.id !== id));
  };

  const toggle = (item: Todo): void => {
    item.done.trans((v) => !v);
    revision.trans((r) => r + 1);
  };

  const itemView = (item: Todo): View => html`<li class="flex items-center justify-between gap-2 border-b border-[var(--border)] py-1.5 last:border-0">
    <label class="flex items-center gap-2">
      <input type="checkbox" ${patch(
        act(item.done, (node, value) => {
          if (node instanceof HTMLInputElement) node.checked = Boolean(value);
        }),
        on('change', () => toggle(item)),
      )} />
      <span ${patch(style('textDecoration', compute(item.done, (v): string => (v ? 'line-through' : 'none'))))}>${text(item.text)}</span>
    </label>
    <button ${patch(on('click', () => remove(item.id)))} class="rounded-md px-2 text-[var(--text)] transition hover:text-[var(--accent)]">×</button>
  </li>`;

  const filterButton = (value: 'all' | 'active' | 'done'): View => html`<button type="button" ${patch(on('click', () => filter.update(value)))} class="rounded-md border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text)] capitalize transition hover:border-[var(--accent-border)]">${text(value)}</button>`;

  return html`<div class="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4">
    <h3 class="mb-3 font-mono text-sm font-semibold text-[var(--text-h)]">Todos</h3>
    <form ${patch(on('submit', addTodo))} class="flex gap-2">
      <input ${patch(
        val(input),
        on('input', (event) => {
          const target = event.target;
          if (target instanceof HTMLInputElement) input.update(target.value);
        }),
      )} placeholder="What needs doing?" class="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-sm text-[var(--text-h)] outline-none focus:border-[var(--accent-border)]" />
      <button type="submit" class="rounded-md bg-[var(--accent)] px-3 py-1 text-sm font-medium text-white transition hover:opacity-90">Add</button>
    </form>
    <div class="my-3 flex gap-1">
      ${filterButton('all')}${filterButton('active')}${filterButton('done')}
    </div>
    ${view(isEmpty, (empty) =>
      empty
        ? html`<p class="py-4 text-center text-sm text-[var(--text)]">Nothing here yet.</p>`
        : html`<ul>
            ${repeat(visible, {
              key: (item) => String(item.id),
              view: (item) => itemView(item),
            })}
          </ul>`,
    )}
  </div>`;
};
