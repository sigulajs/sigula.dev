import {html, id, list, patch, text, type View} from 'sigula';
import {ApiEntry, type ApiEntryProps} from '../components/ApiEntry';

export type ApiEntryData = Omit<ApiEntryProps, 'anchorId'>;

export const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const buildApiSection = (
  sectionId: string,
  entries: ApiEntryData[],
): {render: () => View} => {
  const items = entries.map((entry) => ({
    anchorId: `${sectionId}-${slug(entry.name)}`,
    entry,
  }));
  return {
    render: (): View =>
      html`<div>
        ${list(items, (item) => ApiEntry({anchorId: item.anchorId, ...item.entry}))}
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
