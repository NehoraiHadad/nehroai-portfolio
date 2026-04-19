import { BookOpen, Globe, LayoutDashboard, Map, Podcast } from 'lucide-react';
import type { ElementType } from 'react';
import type { CaseStudyIconKey } from './i18n/dictionaries/types';

export const caseStudyIcons: Record<CaseStudyIconKey, ElementType> = {
  podcast: Podcast,
  dashboard: LayoutDashboard,
  globe: Globe,
  map: Map,
  book: BookOpen,
};
