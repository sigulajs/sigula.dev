import {html, id, patch, type View} from 'sigula';

export const headingSection = (
  sectionId: string,
  title: string,
  body: View,
): View =>
  html`<section ${patch(id(sectionId))} class="scroll-mt-24 pt-20">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">${title}</h2>
    <div class="mt-4">${body}</div>
  </section>`;
