import type { BrandProfile, QuoteLanguage } from './types';

// Brand profile shown on the quote-preview header. Editable in Settings and
// persisted per user. Defaults use the CORRECT localized spelling of the name —
// note the repo dir is `nehroai-portfolio` (a historical typo); never reproduce
// that in branding copy. The English default is "Nehorai Hadad" and the Hebrew
// default is "נהוראי חדד".

const BRAND_PREFIX = 'nehorai:admin:brand:';

function brandKey(email: string): string {
  return `${BRAND_PREFIX}${email.toLowerCase()}`;
}

export function defaultBrandProfile(language: QuoteLanguage): BrandProfile {
  const isHe = language === 'he';
  return {
    name: isHe ? 'נהוראי חדד' : 'Nehorai Hadad',
    tagline: isHe ? 'הנדסת AI ומערכות סוכנים' : 'AI & Agentic Systems Engineering',
    email: 'nehorai.hadad@gmail.com',
    phone: '',
    address: '',
    logoUrl: '',
  };
}

export function loadBrandProfile(email: string, language: QuoteLanguage): BrandProfile {
  const fallback = defaultBrandProfile(language);
  try {
    const raw = window.localStorage.getItem(brandKey(email));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<BrandProfile>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function saveBrandProfile(email: string, profile: BrandProfile): void {
  try {
    window.localStorage.setItem(brandKey(email), JSON.stringify(profile));
  } catch {
    // Storage unavailable — silently no-op (the in-memory form state still works).
  }
}
