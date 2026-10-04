import 'virtual:uno.css';
import './style.css';
import './theme';
import {html, render} from 'sigula';

const appNode = document.querySelector('#app');
if (!appNode) throw new Error('#app not found');
render(html`<p style="padding: 2rem">theme check</p>`, appNode);
