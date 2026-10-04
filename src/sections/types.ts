import type {View} from 'sigula';

export interface Heading {
  id: string;
  title: string;
}

export interface SectionMeta {
  id: string;
  title: string;
  group: string;
  headings: Heading[];
  render: () => View;
}
