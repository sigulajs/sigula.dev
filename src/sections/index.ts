import {bindings} from './bindings';
import {cheatsheet} from './cheatsheet';
import {compare} from './compare';
import {concepts} from './concepts';
import {controlflow} from './controlflow';
import {demo} from './demo';
import {errors} from './errors';
import {features} from './features';
import {hero} from './hero';
import {installation} from './installation';
import {lowlevel} from './lowlevel';
import {quickstart} from './quickstart';
import {reactivity} from './reactivity';
import {rendering} from './rendering';
import {templates} from './templates';
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
  reactivity,
  templates,
  bindings,
  controlflow,
  rendering,
  lowlevel,
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
