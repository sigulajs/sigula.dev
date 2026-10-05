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
const dispose = render(Layout({sections, activeSection}), appNode);

setupScrollSpy(activeSection);
restoreHash();

window.addEventListener('beforeunload', dispose, {once: true});
