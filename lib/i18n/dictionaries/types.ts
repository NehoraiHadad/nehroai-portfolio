/**
 * BIDI RULE — Terminal-voice & identifier strings:
 * Protocol tokens, file names, agent identifiers, version numbers, and status
 * codes (e.g. "STATUS: DELIVERED ✓", "TLS 1.3", "secure_channel.sh") stay
 * English-LTR in both locales and are wrapped in a .bidi-ltr island when
 * rendered inside an RTL context.  Human-readable sentences localize fully.
 * Examples of what stays LTR:   "NODE_CONFIGURATION", "TRANSMIT", "STATUS: DELIVERED ✓"
 * Examples of what localizes:   form labels, section descriptions, human confirmations.
 */

export type CaseStudyIconKey = 'podcast' | 'dashboard' | 'globe' | 'map' | 'book';

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
  a11y: {
    openMenu: string;
    closeMenu: string;
    closeDialog: string;
    chatInput: string;
    sendMessage: string;
    openChat: string;
    themeToggle: string;
    skipToContent: string;
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
    name: string;
    rotatingWords: string[];
    statusLabels: string[];
    titlePrefix: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  practice: {
    sectionMarker: string;
    title: string;
  };
  showcase: {
    sectionMarker: string;
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
      impact: string;
      dependencies: string;
    };
    actions: {
      liveSite: string;
      github: string;
    };
  };
  dossier: {
    sectionMarker: string;
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
    contact: {
      emailLabel: string;
      githubLabel: string;
      linkedinLabel: string;
      emailUrl: string;
      githubUrl: string;
      linkedinUrl: string;
    };
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
      errors: {
        invalid_name: string;
        invalid_email: string;
        message_too_long: string;
        not_configured: string;
        send_failed: string;
        rate_limited: string;
        unknown: string;
      };
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
  /** Owner contact constants — same shape used in Dossier & Footer chips */
  ownerContact: {
    email: string;
    /** https://github.com/NehoraiHadad */
    githubUrl: string;
    /** TODO: confirm LinkedIn slug — currently a placeholder */
    linkedinUrl: string;
  };
  caseStudies: CaseStudyContent[];
  skills: SkillGroupContent[];
}
