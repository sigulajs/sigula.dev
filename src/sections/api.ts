import {html, repeat, sig, type View} from 'sigula';
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
