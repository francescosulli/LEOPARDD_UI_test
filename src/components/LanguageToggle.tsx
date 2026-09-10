import { Languages } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

type LanguageToggleProps = {
  compact?: boolean;
};

export default function LanguageToggle({ compact = false }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();
  const ariaLabel = language === 'it' ? "Passa all'inglese (Switch to English)" : 'Passa all\'italiano (Switch to Italian)';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={ariaLabel}
      className={`pointer-events-auto flex cursor-pointer items-center gap-2 rounded border border-white/10 bg-white/[0.05] text-xs font-semibold uppercase tracking-[0.12em] text-white/80 transition hover:border-astro-orange/55 hover:bg-white/[0.1] hover:text-white active:scale-95 ${
        compact ? 'h-9 px-2.5' : 'h-10 px-3'
      }`}
    >
      <Languages size={14} className="text-astro-orange" />
      <span className="flex items-center gap-1">
        <span className={language === 'it' ? 'font-bold text-astro-orange' : 'text-white/40'}>IT</span>
        <span className="text-white/25">/</span>
        <span className={language === 'en' ? 'font-bold text-astro-orange' : 'text-white/40'}>EN</span>
      </span>
    </button>
  );
}
