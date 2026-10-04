import type {View} from 'sigula';

export const rich = (value: string): View => {
  const frag = document.createDocumentFragment();
  for (const part of value.split(/(`[^`]*`)/g)) {
    if (part === '') continue;
    if (part.length >= 2 && part.startsWith('`') && part.endsWith('`')) {
      const code = document.createElement('code');
      code.textContent = part.slice(1, -1);
      frag.appendChild(code);
    } else {
      frag.appendChild(document.createTextNode(part));
    }
  }
  if (!frag.firstChild) frag.appendChild(document.createTextNode(''));
  return {type: 'view', node: frag};
};
