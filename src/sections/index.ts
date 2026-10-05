import {bindings} from './bindings';
import {controlflow} from './controlflow';
import {core} from './core';
import {errors} from './errors';
import {features} from './features';
import {hero} from './hero';
import {lowlevel} from './lowlevel';
import {model} from './model';
import {quickstart} from './quickstart';
import {reactivity} from './reactivity';
import {rendering} from './rendering';
import {templates} from './templates';
import type {SectionGroup, SectionMeta} from './types';

export type {SectionMeta} from './types';

export const sections: SectionMeta[] = [
  hero,
  features,
  quickstart,
  core,
  reactivity,
  templates,
  bindings,
  controlflow,
  rendering,
  lowlevel,
  errors,
  model,
];

export interface NavGroup {
  name: SectionGroup;
  items: SectionMeta[];
}

const groupOrder: SectionGroup[] = ['Introduction', 'Reference', 'Appendix'];

export const navGroups: NavGroup[] = groupOrder
  .map((name) => ({
    name,
    items: sections.filter((section) => section.group === name),
  }))
  .filter((group) => group.items.length > 0);
