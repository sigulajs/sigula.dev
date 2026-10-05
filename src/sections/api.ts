import {html, id, patch, repeat, sig, text, type View} from 'sigula';
import {ApiEntry, type ApiEntryProps} from '../components/ApiEntry';
import type {Heading} from './types';

export type ApiEntryData = Omit<ApiEntryProps, 'anchorId'>;

export const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const buildApiSection = (
  sectionId: string,
  entries: ApiEntryData[],
): {headings: Heading[]; render: () => View} => {
  const items = entries.map((entry) => ({
    anchorId: `${sectionId}-${slug(entry.name)}`,
    entry,
  }));
  return {
    headings: items.map((item) => ({
      id: item.anchorId,
      title: item.entry.name,
    })),
    render: (): View =>
      html`<div>
        ${repeat(sig(items), {
          key: (item) => item.anchorId,
          view: (item) => ApiEntry({anchorId: item.anchorId, ...item.entry}),
        })}
      </div>`,
  };
};

export const headingSection = (
  sectionId: string,
  title: string,
  body: View,
): View =>
  html`<section ${patch(id(sectionId))} class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">${text(title)}</h2>
    <div class="mt-4">${body}</div>
  </section>`;
