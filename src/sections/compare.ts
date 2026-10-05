import {html} from 'sigula';
import {ApiTable} from '../components/ApiTable';
import {rich} from '../components/rich';
import {headingSection} from './api';
import type {SectionMeta} from './types';

const body = html`<div>
  ${ApiTable({
    headers: ['', 'Sigula', 'Lit', 'Solid', 'React'],
    rows: [
      ['Update model', 'Signal → bind → DOM node', 'Property → render() → part commit', 'Signal → compiled DOM', 'Component re-render → VDOM diff'],
      ['Compiler required', 'No', 'No', 'Yes (JSX/babel)', 'Yes (JSX)'],
      ['Component re-runs', 'Never', 'On property change', 'Never', 'On every state change'],
      ['Approx. size', '~4.5KB min+gzip', '~5KB', '~7KB', '— (much larger runtime)'],
      ['Templating', 'Native tagged templates', 'Tagged templates', 'JSX', 'JSX'],
      ['Standard Web Components', 'No (any DOM node)', 'Yes', 'No', 'No'],
    ],
  })}
  <p class="mt-4 text-sm italic text-[var(--text)]">${rich('Size figures are each project\'s own published claim, measured with different tooling and feature sets — treat them as an order of magnitude, not a benchmark.')}</p>
</div>`;

export const compare: SectionMeta = {
  id: 'compare',
  title: 'How it compares',
  group: 'Appendix',
  render: () => headingSection('compare', 'How it compares', body),
};
