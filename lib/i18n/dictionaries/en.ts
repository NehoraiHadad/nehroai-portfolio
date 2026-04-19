import type { AppDictionary } from './types';

export const enDictionary: AppDictionary = {
  locale: {
    code: 'en',
    direction: 'ltr',
  },
  meta: {
    title: 'AI Solution Architect Portfolio',
    description:
      'High-fidelity AI Solution Architect portfolio featuring agentic showcase, neural infrastructure monitoring, and strategic dossier',
  },
  navigation: {
    eyebrow: 'Nehorai Hadad // AI Engineer, Full-Stack Builder',
    links: {
      practice: 'Stack',
      showcase: 'Projects',
    },
    contactCta: 'Contact',
  },
  hero: {
    rotatingWords: ['Agents.', 'Workflows.', 'Interfaces.', 'Systems.'],
    statusLabel: 'System.Status: Online',
    titlePrefix: 'Engineering',
    subtitle: 'AI engineer with infrastructure depth. I build agents, workflows, and full-stack web systems.',
    primaryCta: 'See what I ship',
    secondaryCta: 'Download Resume',
  },
  practice: {
    title: 'Stack',
  },
  showcase: {
    title: 'Selected Projects',
    description: 'Click any node for the build details, the live link, and the source.',
    hint: 'Pan, zoom, click a node',
    orchestratorLabel: 'Nehorai // Builder',
    shippingLabel: 'SHIPPING',
    drawerTitle: 'NODE_CONFIGURATION',
    fields: {
      nodeId: 'Node ID',
      status: 'Status',
      deployed: 'Deployed',
      projectName: 'Project Name',
      description: 'Description',
      challenge: 'Parameters.Challenge',
      solution: 'Parameters.Solution',
      dependencies: 'Dependencies',
    },
    actions: {
      liveSite: 'Open live site',
      github: 'View on GitHub',
    },
  },
  dossier: {
    sectionLabel: '04 — CONTACT',
    availability: 'Available · Hybrid / Remote',
    titleLines: ['Open to', 'the right'],
    titleHighlight: 'opportunity.',
    description: "Full-stack + AI roles. Building AI products, automation, or modern web infrastructure? Let's talk.",
    stackLines: [
      { tag: 'AI', stack: 'LangGraph · AgentCore · MCP · RAG' },
      { tag: 'WEB', stack: 'Next.js · React · TypeScript · Python' },
      { tag: 'INFRA', stack: 'Oracle Cloud · Docker · PM2 · On-prem' },
    ],
    resumeCta: 'Download Resume',
    resumeFile: '/Nehorai Hadad CV - SW.pdf',
    resumeDownloadName: 'Nehorai Hadad CV - SW.pdf',
    terminalFileName: 'secure_channel.sh',
    securityLabel: 'TLS 1.3',
    initLines: [
      '> INITIALIZING SECURE CHANNEL...',
      '> ESTABLISHING ENCRYPTED TUNNEL...',
      '> CHANNEL READY.',
    ],
    progressLabels: {
      encrypting: '> ENCRYPTING PAYLOAD...',
      transmitting: '> TRANSMITTING...',
      encryptingHint: '  securing your message...',
      transmittingHint: '  routing to nehoraihadad.com...',
    },
    success: {
      delivered: 'STATUS: DELIVERED ✓',
      eta: 'RESPONSE_ETA: 24–48H',
      title: 'Thanks — message received.',
      description: "I'll reply within a day or two.",
    },
    form: {
      nameLabel: 'SENDER_NAME',
      emailLabel: 'SENDER_EMAIL',
      messageLabel: 'MESSAGE_BODY',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'you@company.com',
      messagePlaceholder: 'Enter transmission data...',
      submitLabel: 'TRANSMIT',
      errorPrefix: '> ERR: ',
    },
  },
  assistant: {
    title: 'NEHORAI // ASSISTANT',
    matrixTitle: 'MATRIX // UPLINK',
    quickPrompts: ["What's your tech stack?", 'Show me your projects', 'How can we work together?'],
    initialMessages: [
      { type: 'system', content: 'System initialized. Orchestrator online.' },
      {
        type: 'agent',
        agentName: 'PortfolioAgent',
        content: "Hi. I'm a small assistant that can answer questions about Nehorai's stack, projects, and how to reach him.",
      },
    ],
    clearedMessage: 'System memory cleared. Orchestrator re-initialized.',
    helpMessage: 'Available commands: /clear, /help, /download_cv, /matrix',
    downloadMessage: '> Orchestrator: Initiating secure file transfer... [Nehorai Hadad CV - SW.pdf]',
    matrixMessage: 'Wake up, Neo... The Matrix has you.',
    analyzingMessage: '> Orchestrator: Analyzing intent...',
    routingMessage: '> Orchestrator: Routing to {agentName}...',
    inputPlaceholder: 'Ask the orchestrator...',
    matrixInputPlaceholder: 'Enter command...',
    agentNames: {
      portfolio: 'PortfolioAgent',
      showcase: 'ShowcaseAgent',
      tech: 'TechAgent',
      contact: 'CommAgent',
    },
    responses: {
      default:
        "I can answer questions about Nehorai's stack, projects, or how to reach him. Try asking about his tech, his projects, or working together.",
      showcase:
        'Four projects are featured: Podcasto (Telegram → AI podcasts on AWS), Agendo (self-hosted multi-agent dashboard), and two live client sites — ykl.org.il and judah-brigade.vercel.app. Scroll to Selected Projects for the details.',
      tech:
        'Day-to-day stack: Next.js 15/16 + TypeScript on the front, Node and Python on the back, PostgreSQL/pgvector for data, AWS Lambda/SQS/DynamoDB for pipelines, and LangGraph / AWS AgentCore / MCP for agents. Eight years of on-prem Linux underneath it all.',
      contact:
        'Email: nehorai.hadad@gmail.com. Looking for full-stack or AI-engineer roles in Israel — hybrid or remote both work.',
    },
  },
  footer: {
    copyrightTemplate: '© {year} Nehor.ai. All rights reserved.',
  },
  caseStudies: [
    {
      id: 'podcasto',
      title: 'Podcasto',
      description:
        'Turns Telegram news channels into AI-narrated podcasts delivered by email. Chunked audio pipeline on AWS — Lambda, SQS, DynamoDB, SES — with Google Gemini 2.5 Flash TTS.',
      impact:
        '7× faster episode processing and ~84% lower cost on retries vs. the original monolithic approach.',
      tags: ['AWS Lambda', 'SQS', 'DynamoDB', 'Gemini TTS', 'Next.js 15'],
      icon: 'podcast',
      details: {
        challenge: 'Single-shot audio generation was slow and fragile — one failure killed a whole episode.',
        solution:
          'Split each episode into parallel chunks processed by isolated Lambdas, merged downstream. Failures stay contained; retries only re-run the broken chunk.',
        architecture: [
          'Next.js 15',
          'React 19',
          'Supabase + Drizzle ORM',
          'AWS Lambda (Python)',
          'SQS',
          'DynamoDB',
          'SES',
          'Gemini 2.5 Flash TTS',
          'CloudWatch',
        ],
        liveUrl: 'https://podcasto.org',
        githubUrl: 'https://github.com/NehoraiHadad/Podcasto',
      },
    },
    {
      id: 'agendo',
      title: 'Agendo',
      description:
        'Self-hosted dashboard for orchestrating AI coding agents — Claude, Codex, Gemini — from a single Kanban-style interface with MCP integration.',
      impact: 'Removes the need to juggle multiple CLIs; agents share a task board and coordinate via MCP.',
      tags: ['Next.js 16', 'TypeScript', 'PostgreSQL 17', 'MCP'],
      icon: 'dashboard',
      details: {
        challenge:
          'Working with multiple AI coding CLIs means losing state, copy-pasting context, and no shared task board.',
        solution:
          'A Next.js 16 app that auto-discovers installed agent CLIs, wraps them with a PostgreSQL-backed Kanban and live session terminals, and exposes everything over MCP so agents can coordinate.',
        architecture: ['Next.js 16', 'TypeScript (strict)', 'PostgreSQL 17', 'Docker', 'PM2', 'Model Context Protocol'],
        githubUrl: 'https://github.com/NehoraiHadad/agendo',
      },
    },
    {
      id: 'ykl',
      title: "Yeshiva Ketana Ma'ale Hever",
      description:
        'Full-stack website for a yeshiva — content management, media gallery, Hebrew-first responsive UI. Shipped for a paying client.',
      impact: "Live at ykl.org.il — the institution's public face.",
      tags: ['Next.js', 'TypeScript', 'Tailwind'],
      icon: 'globe',
      details: {
        challenge: 'The yeshiva needed a modern, Hebrew-first site their staff could update without a developer.',
        solution:
          'Next.js + Tailwind with an opinionated content model and an admin flow tuned for non-technical editors.',
        architecture: ['Next.js', 'TypeScript', 'Tailwind CSS'],
        liveUrl: 'https://ykl.org.il',
        githubUrl: 'https://github.com/NehoraiHadad/ykl',
      },
    },
    {
      id: 'judah-brigade',
      title: 'Be-Shvil Yehuda',
      description:
        'Website for the Judah Brigade community — trip guides, points of interest, and content built for mobile-first browsing in the field.',
      impact: 'Live and in use by the community.',
      tags: ['Next.js 15', 'TypeScript', 'Tailwind'],
      icon: 'map',
      details: {
        challenge:
          'Community content was scattered across chat groups and docs; members needed one place to explore sites and routes.',
        solution:
          'Mobile-first Next.js site with structured content, map-aware browsing, and offline-friendly performance.',
        architecture: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Vercel'],
        liveUrl: 'https://judah-brigade.vercel.app',
        githubUrl: 'https://github.com/NehoraiHadad/Judah-Brigade',
      },
    },
  ],
  skills: [
    { category: 'AI & Agents', items: ['LangGraph', 'AWS AgentCore', 'Strands Agents SDK', 'MCP', 'RAG + pgvector'] },
    { category: 'Full-Stack Web', items: ['Next.js 15/16', 'React 19', 'TypeScript', 'Tailwind + shadcn/ui'] },
    { category: 'Backend & Data', items: ['Node.js', 'Python', 'PostgreSQL', 'Supabase + Drizzle'] },
    {
      category: 'Cloud & Infra',
      items: ['AWS (Lambda, SQS, SES, DynamoDB)', 'Docker + PM2', '8 yrs on-prem datacenter', 'Server hardware & physical infra'],
    },
  ],
};
