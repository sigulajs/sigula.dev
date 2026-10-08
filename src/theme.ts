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

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

const systemTheme = (): Theme => (darkQuery.matches ? 'dark' : 'light');

const persist = (value: Theme): void => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // storage unavailable; ignore
  }
};

const apply = (value: Theme): void => {
  document.documentElement.classList.toggle('dark', value === 'dark');
  document.documentElement.style.colorScheme = value;
};

let current: Theme = readStored() ?? systemTheme();

export const setTheme = (value: Theme): void => {
  current = value;
  apply(value);
  persist(value);
};

export const toggleTheme = (): void => {
  setTheme(current === 'dark' ? 'light' : 'dark');
};

// Apply the resolved theme on load; an inline <head> script sets the class even
// earlier to avoid a flash of the wrong theme.
apply(current);

try {
  darkQuery.addEventListener('change', (event) => {
    if (readStored()) return;
    setTheme(event.matches ? 'dark' : 'light');
  });
} catch {
  // matchMedia unavailable; ignore
}
