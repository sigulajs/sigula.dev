import type {View} from 'sigula';

export type SectionGroup = 'Introduction' | 'Concepts' | 'Reference' | 'Appendix';

export interface NavSub {
  id: string;
  title: string;
}

export interface SectionMeta {
  id: string;
  title: string;
  group: SectionGroup;
  subs?: NavSub[];
  render: () => View;
}
