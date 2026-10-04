import {html, id, patch, text, type View} from 'sigula';
import {ApiTable, type ApiTableData} from './ApiTable';
import {CodeBlock, type CodeBlockProps} from './CodeBlock';
import {rich} from './rich';

export interface ApiEntryProps {
  anchorId: string;
  name: string;
  signature?: string;
  description: string;
  table?: ApiTableData;
  example?: Omit<CodeBlockProps, 'filename'>;
}

export const ApiEntry = ({
  anchorId,
  name,
  signature,
  description,
  table,
  example,
}: ApiEntryProps): View => {
  const tableView = table ? ApiTable(table) : text('');
  const exampleView = example ? CodeBlock(example) : text('');
  return html`<div class="my-8 scroll-mt-24" ${patch(id(anchorId))} data-heading="">
    <h3 class="font-mono text-lg font-semibold text-[var(--text-h)]">${text(name)}</h3>
    ${signature ? CodeBlock({code: signature, lang: 'typescript'}) : text('')}
    <p class="mt-3 leading-relaxed text-[var(--text)]">${rich(description)}</p>
    ${tableView}
    ${exampleView}
  </div>`;
};
