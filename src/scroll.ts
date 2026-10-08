const pickFirst = (
  entries: IntersectionObserverEntry[],
): IntersectionObserverEntry | undefined =>
  entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

const setActive = (
  selector: string,
  datasetKey: 'sectionLink' | 'headingLink',
  id: string,
): void => {
  for (const link of document.querySelectorAll<HTMLElement>(selector)) {
    link.classList.toggle('active', link.dataset[datasetKey] === id);
  }
};

// Progressive enhancement: no signals, just toggling `active` on the nav links
// that were prerendered (in both the sidebar and the mobile drawer).
export const setupScrollSpy = (): void => {
  if (!('IntersectionObserver' in window)) return;

  const subIds = new Set(
    Array.from(
      document.querySelectorAll<HTMLElement>('[data-heading-link]'),
    ).map((link) => link.dataset.headingLink ?? ''),
  );

  const options: IntersectionObserverInit = {
    rootMargin: '-15% 0px -75% 0px',
    threshold: 0,
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    const first = pickFirst(entries);
    if (first) setActive('[data-section-link]', 'sectionLink', first.target.id);
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
      setActive('[data-heading-link]', 'headingLink', first.target.id);
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
