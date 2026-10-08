import {html, list, type View} from 'sigula';
import {rich} from './rich';

export interface ApiTableData {
  headers: string[];
  rows: string[][];
}

export const ApiTable = ({headers, rows}: ApiTableData): View =>
  html`<div class="my-4 overflow-x-auto rounded-lg border border-[var(--border)]">
    <table class="w-full border-collapse text-left text-sm">
      <thead class="bg-[var(--bg-soft)]">
        <tr>
          ${list(headers, (value) => html`<th scope="col" class="border-b border-[var(--border)] px-3 py-2 font-semibold text-[var(--text-h)]">${rich(value)}</th>`)}
        </tr>
      </thead>
      <tbody>
        ${list(rows, (cells) => html`<tr class="border-b border-[var(--border)] align-top last:border-0">
          ${list(cells, (value) => html`<td class="px-3 py-2 text-[var(--text)]">${rich(value)}</td>`)}
        </tr>`)}
      </tbody>
    </table>
  </div>`;
