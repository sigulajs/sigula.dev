import {
  compute,
  html,
  on,
  patch,
  repeat,
  sig,
  style,
  type Sig,
  type View,
  val,
  view,
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

  const visible = compute({todos, filter}, (v) => {
    switch (v.filter) {
      case 'active':
        return v.todos.filter((t) => !t.done.get());
      case 'done':
        return v.todos.filter((t) => t.done.get());
      default:
        return v.todos;
    }
  });

  const isEmpty = compute(visible, (v) => v.length <= 0);

  const add = (event: Event): void => {
    event.preventDefault();
    if (!input.get().trim()) return;
    todos.trans((items) => [
      ...items,
      {id: Date.now(), text: input.get().trim(), done: sig(false)},
    ]);
    input.update('');
  };

  const remove = (id: number): void => {
    todos.trans((items) => items.filter((item) => item.id !== id));
  };

  const toggle = (item: Todo): void => {
    item.done.trans((v) => !v);
    todos.notify();
  };

  const itemView = (item: Todo): View => html`<li class="flex items-center justify-between gap-2 border-b border-[var(--border)] py-1.5 last:border-0">
    <span
      ${patch(
        on('click', () => toggle(item)),
        style('textDecoration', compute(item.done, (v): string => (v ? 'line-through' : 'none'))),
      )}
      class="cursor-pointer select-none"
    >${item.text}</span>
    <button ${patch(on('click', () => remove(item.id)))} class="rounded-md px-2 text-[var(--text)] transition hover:text-[var(--accent)]">×</button>
  </li>`;

  const filterButton = (value: 'all' | 'active' | 'done'): View => html`<button type="button" ${patch(on('click', () => filter.update(value)))} class="rounded-md border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text)] capitalize transition hover:border-[var(--accent-border)]">${value}</button>`;

  return html`<div class="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4">
    <form ${patch(on('submit', add))} class="flex gap-2">
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
            ${repeat(visible, {key: (item) => String(item.id), view: (item) => itemView(item)})}
          </ul>`,
    )}
  </div>`;
};
