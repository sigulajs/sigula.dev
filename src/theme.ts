import {sig} from 'sigula';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'sigula-theme';

const readStored = (): Theme | undefined => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : undefined;
  } catch {
    return undefined;
  }
};

const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const theme = sig<Theme>(readStored() ?? systemTheme());

const apply = (value: Theme): void => {
  document.documentElement.classList.toggle('dark', value === 'dark');
  document.documentElement.style.colorScheme = value;
};

const persist = (value: Theme): void => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // storage unavailable; ignore
  }
};

export const setTheme = (value: Theme): void => {
  theme.update(value);
  apply(value);
  persist(value);
};

export const toggleTheme = (): void => {
  setTheme(theme.get() === 'dark' ? 'light' : 'dark');
};

apply(theme.get());

try {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (event) => {
      if (!readStored()) setTheme(event.matches ? 'dark' : 'light');
    });
} catch {
  // matchMedia unavailable; ignore
}
