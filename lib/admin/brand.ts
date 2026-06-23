import type { BrandProfile, QuoteLanguage } from './types';

// Default brand profile shown on the quote-preview header when the user hasn't
// saved one yet. Persistence now lives in the database (lib/admin/db/queries.ts:
// getBrand/saveBrand); this file only provides the localized default. Defaults
// use the CORRECT spelling of the name — the repo dir `nehroai-portfolio` is a
// historical typo; never reproduce it in branding copy. English default is
// "Nehorai Hadad", Hebrew default is "נהוראי חדד".

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
