import type {View} from 'sigula';

export type SectionGroup = 'Introduction' | 'Concepts' | 'Reference' | 'Appendix';

export interface SectionMeta {
  id: string;
  title: string;
  group: SectionGroup;
  render: () => View;
}
