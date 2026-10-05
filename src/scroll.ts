import type {Sig} from 'sigula';

export const setupScrollSpy = (activeSection: Sig<string>): void => {
  if (!('IntersectionObserver' in window)) return;

  const sections = document.querySelectorAll<HTMLElement>('main section[id]');
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

  const observer = new IntersectionObserver((entries) => {
    const first = pickFirst(entries);
    if (first) activeSection.update(first.target.id);
  }, options);
  for (const section of sections) observer.observe(section);
};

export const restoreHash = (): void => {
  const {hash} = window.location;
  if (!hash) return;
  const target = document.getElementById(hash.slice(1));
  if (target) {
    requestAnimationFrame(() => target.scrollIntoView());
  }
};
