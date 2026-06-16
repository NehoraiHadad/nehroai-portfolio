import { ElementType } from 'react';

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  impact: string;
  tags: string[];
  icon: ElementType;
  tier?: 'featured' | 'compact';
  details?: {
    challenge: string;
    solution: string;
    architecture: string[];
    githubUrl?: string;
    liveUrl?: string;
  };
}

export interface SkillGroup {
  category: string;
  items: string[];
}
