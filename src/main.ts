import 'virtual:uno.css';
import './style.css';
import {render, sig} from 'sigula';
import {Layout} from './components/Layout';
import {restoreHash, setupScrollSpy} from './scroll';
import {sections} from './sections';
import './theme';

const appNode = document.querySelector('#app');
if (!appNode) throw new Error('#app not found');

const activeSection = sig(sections[0]?.id ?? '');
const activeHeading = sig('');
const dispose = render(
  Layout({sections, activeSection, activeHeading}),
  appNode,
);

// Reading layout (the scroll-spy's bounding rects, scrolling to a hash) before
// the page is fully loaded forces an early reflow and can cause a flash of
// unstyled content, so wait until load.
const start = (): void => {
  setupScrollSpy(activeSection, activeHeading);
  restoreHash();
};

if (document.readyState === 'complete') {
  start();
} else {
  window.addEventListener('load', start, {once: true});
}

window.addEventListener('beforeunload', dispose, {once: true});
