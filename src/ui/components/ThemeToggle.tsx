interface Props {
  theme: 'light' | 'dark' | 'aurora';
  onToggle: () => void;
}

const iconFor = (theme: Props['theme']) => {
  if (theme === 'dark') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
      </svg>
    );
  }

  if (theme === 'aurora') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
};

export const ThemeToggle = ({ theme, onToggle }: Props) => (
  <button
    onClick={onToggle}
    title="Change theme"
    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white/80 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
  >
    {iconFor(theme)}
  </button>
);
