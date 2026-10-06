import {cheatsheet} from './cheatsheet';
import {compare} from './compare';
import {concepts} from './concepts';
import {demo} from './demo';
import {errors} from './errors';
import {features} from './features';
import {hero} from './hero';
import {installation} from './installation';
import {quickstart} from './quickstart';
import type {SectionGroup, SectionMeta} from './types';

export type {SectionMeta} from './types';

export const sections: SectionMeta[] = [
  hero,
  features,
  installation,
  quickstart,
  demo,
  concepts,
  cheatsheet,
  errors,
  compare,
];

export interface NavGroup {
  name: SectionGroup;
  items: SectionMeta[];
}

const groupOrder: SectionGroup[] = [
  'Introduction',
  'Concepts',
  'Reference',
  'Appendix',
];

export const navGroups: NavGroup[] = groupOrder
  .map((name) => ({
    name,
    items: sections.filter((section) => section.group === name),
  }))
  .filter((group) => group.items.length > 0);
