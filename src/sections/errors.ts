import {html} from 'sigula';
import {ApiTable} from '../components/ApiTable';
import {rich} from '../components/rich';
import {headingSection} from './api';
import type {SectionMeta} from './types';

const body = html`<div>
  <p class="leading-relaxed text-[var(--text)]">${rich('Runtime errors carry a short code in `message` instead of a sentence. Codes with arguments are colon-separated.')}</p>
  ${ApiTable({
    headers: ['Code', 'Thrown by', 'Meaning'],
    rows: [
      ['E1:<index>', 'at', 'Array index out of range.'],
      ['E2', 'toBoundary', 'Cannot build a boundary from an empty fragment.'],
      ['E3', 'replaceWithNode', 'The old boundary has no `parentNode`.'],
      ['E4', 'patch', 'A keyed command (`attr`, `style`, `styleProp`, `toggleClass`) was given no key.'],
      ['E5', 'patch', '`act` was given no function.'],
      ['E6', 'patch', '`on` was given no event type.'],
      ['E7', 'repeat', 'The rendered items have no parent node.'],
      ['E8', 'repeat', 'The temporary start/end fences were removed mid-update.'],
      ['E9', 'repeat', 'There is no node after the fence to move before.'],
      ['E10', 'html', 'The template is empty.'],
      ['E11:<expected>:<got>', 'html', 'Interpolation count does not match the template slots.'],
      ['E12', 'html', 'Unmatched interpolation; `patch()` must be in attribute position.'],
    ],
  })}
</div>`;

export const errors: SectionMeta = {
  id: 'errors',
  title: 'Errors',
  group: 'Appendix',
  headings: [{id: 'errors', title: 'Errors'}],
  render: () => headingSection('errors', 'Errors', body),
};
