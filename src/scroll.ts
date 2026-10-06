import type {Sig} from 'sigula';
import {sections} from './sections';

export const setupScrollSpy = (
  activeSection: Sig<string>,
  activeHeading: Sig<string>,
): void => {
  if (!('IntersectionObserver' in window)) return;

  const subIds = new Set(
    sections.flatMap((section) => (section.subs ?? []).map((sub) => sub.id)),
  );

  const options: IntersectionObserverInit = {
    rootMargin: '-15% 0px -75% 0px',
    threshold: 0,
  };

  const pickFirst = (
    entries: IntersectionObserverEntry[],
  ): IntersectionObserverEntry | undefined =>
    entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

  const sectionObserver = new IntersectionObserver((entries) => {
    const first = pickFirst(entries);
    if (first) activeSection.update(first.target.id);
  }, options);
  for (const section of document.querySelectorAll<HTMLElement>(
    'main section[id]',
  )) {
    sectionObserver.observe(section);
  }

  const headings = Array.from(
    document.querySelectorAll<HTMLElement>('main [id]'),
  ).filter((el) => subIds.has(el.id));
  const headingObserver = new IntersectionObserver((entries) => {
    const first = pickFirst(entries);
    if (first && subIds.has(first.target.id)) {
      activeHeading.update(first.target.id);
    }
  }, options);
  for (const heading of headings) headingObserver.observe(heading);
};

export const restoreHash = (): void => {
  const {hash} = window.location;
  if (!hash) return;
  const target = document.getElementById(hash.slice(1));
  if (target) {
    requestAnimationFrame(() => target.scrollIntoView());
  }
};
