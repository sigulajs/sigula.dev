import {html, repeat, sig, text, type View} from 'sigula';

export interface ApiTableData {
  headers: string[];
  rows: string[][];
}

export const ApiTable = ({headers, rows}: ApiTableData): View => {
  const head = sig(headers.map((value, index) => ({index, value})));
  const body = sig(rows.map((cells, index) => ({index, cells})));
  return html`<div class="my-4 overflow-x-auto rounded-lg border border-[var(--border)]">
    <table class="w-full border-collapse text-left text-sm">
      <thead class="bg-[var(--bg-soft)]">
        <tr>
          ${repeat(head, {
            key: (item) => String(item.index),
            view: (item) => html`<th class="border-b border-[var(--border)] px-3 py-2 font-semibold text-[var(--text-h)]">${text(item.value)}</th>`,
          })}
        </tr>
      </thead>
      <tbody>
        ${repeat(body, {
          key: (item) => String(item.index),
          view: (row) => html`<tr class="border-b border-[var(--border)] align-top last:border-0">
            ${repeat(sig(row.cells.map((value, index) => ({index, value}))), {
              key: (item) => String(item.index),
              view: (cell) => html`<td class="px-3 py-2 text-[var(--text)]">${text(cell.value)}</td>`,
            })}
          </tr>`,
        })}
      </tbody>
    </table>
  </div>`;
};
