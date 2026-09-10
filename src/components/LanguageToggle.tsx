import { Languages } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

type LanguageToggleProps = {
  compact?: boolean;
};

export default function LanguageToggle({ compact = false }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();
  const nextLanguageLabel = language === 'it' ? 'EN' : 'IT';
  const ariaLabel = language === 'it' ? "Passa all'inglese" : 'Switch to Italian';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={ariaLabel}
      className={`flex items-center gap-2 rounded border border-white/10 bg-white/[0.05] text-xs font-semibold uppercase tracking-[0.12em] text-white/80 transition hover:border-astro-orange/45 hover:text-white ${
        compact ? 'h-9 px-2.5' : 'h-10 px-3'
      }`}
    >
      <Languages size={14} />
      <span>{nextLanguageLabel}</span>
    </button>
  );
}
