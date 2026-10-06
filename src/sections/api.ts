import {html, id, patch, text, type View} from 'sigula';

export const headingSection = (
  sectionId: string,
  title: string,
  body: View,
): View =>
  html`<section ${patch(id(sectionId))} class="scroll-mt-24 pt-12">
    <h2 class="text-3xl font-semibold tracking-tight text-[var(--text-h)]">${text(title)}</h2>
    <div class="mt-4">${body}</div>
  </section>`;
