export type CaseStudyIconKey = 'podcast' | 'dashboard' | 'globe' | 'map';

export interface CaseStudyContent {
  id: string;
  title: string;
  description: string;
  impact: string;
  tags: string[];
  icon: CaseStudyIconKey;
  details?: {
    challenge: string;
    solution: string;
    architecture: string[];
    githubUrl?: string;
    liveUrl?: string;
  };
}

export interface SkillGroupContent {
  category: string;
  items: string[];
}

export interface AssistantSeedMessage {
  type: 'system' | 'agent';
  content: string;
  agentName?: string;
}

export interface AppDictionary {
  locale: {
    code: 'en' | 'he';
    direction: 'ltr' | 'rtl';
  };
  meta: {
    title: string;
    description: string;
  };
  navigation: {
    eyebrow: string;
    links: {
      practice: string;
      showcase: string;
    };
    contactCta: string;
  };
  hero: {
    rotatingWords: string[];
    statusLabels: string[];
    titlePrefix: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  practice: {
    title: string;
  };
  showcase: {
    title: string;
    description: string;
    hint: string;
    orchestratorLabel: string;
    shippingLabel: string;
    drawerTitle: string;
    fields: {
      nodeId: string;
      status: string;
      deployed: string;
      projectName: string;
      description: string;
      challenge: string;
      solution: string;
      dependencies: string;
    };
    actions: {
      liveSite: string;
      github: string;
    };
  };
  dossier: {
    sectionLabel: string;
    availability: string;
    titleLines: [string, string];
    titleHighlight: string;
    description: string;
    stackLines: Array<{
      tag: string;
      stack: string;
    }>;
    resumeCta: string;
    resumeFile: string;
    resumeDownloadName: string;
    terminalFileName: string;
    securityLabel: string;
    initLines: string[];
    progressLabels: {
      encrypting: string;
      transmitting: string;
      encryptingHint: string;
      transmittingHint: string;
    };
    success: {
      delivered: string;
      eta: string;
      title: string;
      description: string;
    };
    form: {
      nameLabel: string;
      emailLabel: string;
      messageLabel: string;
      namePlaceholder: string;
      emailPlaceholder: string;
      messagePlaceholder: string;
      submitLabel: string;
      errorPrefix: string;
    };
  };
  assistant: {
    title: string;
    matrixTitle: string;
    quickPrompts: string[];
    initialMessages: AssistantSeedMessage[];
    clearedMessage: string;
    helpMessage: string;
    downloadMessage: string;
    matrixMessage: string;
    analyzingMessage: string;
    routingMessage: string;
    inputPlaceholder: string;
    matrixInputPlaceholder: string;
    agentNames: {
      portfolio: string;
      showcase: string;
      tech: string;
      contact: string;
    };
    intentKeywords: {
      commands: {
        clear: string[];
        help: string[];
        download: string[];
        matrix: string[];
      };
      routing: {
        showcase: string[];
        tech: string[];
        contact: string[];
      };
    };
    responses: {
      default: string;
      showcase: string;
      tech: string;
      contact: string;
    };
  };
  footer: {
    copyrightTemplate: string;
  };
  caseStudies: CaseStudyContent[];
  skills: SkillGroupContent[];
}
