import type {View} from 'sigula';

export type SectionGroup = 'Introduction' | 'Reference' | 'Appendix';

export interface Heading {
  id: string;
  title: string;
}

export interface SectionMeta {
  id: string;
  title: string;
  group: SectionGroup;
  headings: Heading[];
  render: () => View;
}
