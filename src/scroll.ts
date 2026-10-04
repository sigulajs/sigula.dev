import type {Sig} from 'sigula';
import {headingsBySection} from './sections';

export const setupScrollSpy = (
  activeSection: Sig<string>,
  activeHeading: Sig<string>,
): void => {
  if (!('IntersectionObserver' in window)) return;

  const tocIds = new Set(
    Object.values(headingsBySection)
      .flat()
      .map((heading) => heading.id),
  );

  const sections = document.querySelectorAll<HTMLElement>('main section[id]');
  const headings = document.querySelectorAll<HTMLElement>(
    'main [id][data-heading]',
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
  for (const section of sections) sectionObserver.observe(section);

  const headingObserver = new IntersectionObserver((entries) => {
    const first = pickFirst(entries);
    if (first && tocIds.has(first.target.id)) {
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
