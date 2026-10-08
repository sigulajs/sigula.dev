import {sig} from 'sigula';
import {Layout} from '../src/components/Layout';
import {sections} from '../src/sections';

// DOM globals (document, Node, …) are installed by the Vite plugin before this
// module is loaded. See `injectHtmlPlugin` in vite.config.ts.
export const prerender = (): string => {
  const activeSection = sig(sections[0]?.id ?? '');
  const activeHeading = sig('');
  const layout = Layout({sections, activeSection, activeHeading});
  const div = document.createElement('div');
  div.appendChild(layout.node);
  return div.innerHTML;
};
