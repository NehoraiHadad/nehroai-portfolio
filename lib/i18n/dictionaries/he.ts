import type { AppDictionary } from './types';

export const heDictionary: AppDictionary = {
  locale: {
    code: 'he',
    direction: 'rtl',
  },
  meta: {
    title: 'תיק עבודות של AI Solution Architect',
    description:
      'תיק עבודות ברמת גימור גבוהה של AI Solution Architect, עם תצוגת פרויקטים agentic, ניטור תשתיות neural ו-dossier מקצועי',
  },
  navigation: {
    eyebrow: 'Nehorai Hadad // מהנדס AI, מפתח Full-Stack',
    links: {
      practice: 'סטאק',
      showcase: 'פרויקטים',
    },
    contactCta: 'צור קשר',
  },
  hero: {
    rotatingWords: ['סוכנים.', 'תהליכי עבודה.', 'ממשקים.', 'מערכות.'],
    statusLabel: 'System.Status: מקוון',
    titlePrefix: 'בונה',
    subtitle: 'מפתח Full-Stack עם התמחות ב-AI. אני בונה agents, workflows ומערכות web.',
    primaryCta: 'לראות מה בניתי',
    secondaryCta: 'הורד קורות חיים',
  },
  practice: {
    title: 'סטאק',
  },
  showcase: {
    title: 'פרויקטים נבחרים',
    description: 'לחץ על כל node כדי לראות את פרטי המימוש, הקישור החי וקוד המקור.',
    hint: 'גרור, בצע זום, ולחץ על node',
    orchestratorLabel: 'Nehorai // Builder',
    shippingLabel: 'באוויר',
    drawerTitle: 'תצורת Node',
    fields: {
      nodeId: 'מזהה Node',
      status: 'סטטוס',
      deployed: 'באוויר',
      projectName: 'שם הפרויקט',
      description: 'תיאור',
      challenge: 'אתגר',
      solution: 'פתרון',
      dependencies: 'תלויות',
    },
    actions: {
      liveSite: 'פתח אתר חי',
      github: 'צפה ב-GitHub',
    },
  },
  dossier: {
    sectionLabel: '04 — יצירת קשר',
    availability: 'זמין · היברידי / Remote',
    titleLines: ['פתוח', 'להזדמנויות'],
    titleHighlight: 'הנכונות.',
    description: 'תפקידי Full-Stack + AI. בונים מוצרי AI, אוטומציה או תשתית web מודרנית? בואו נדבר.',
    stackLines: [
      { tag: 'AI', stack: 'LangGraph · AgentCore · MCP · RAG' },
      { tag: 'WEB', stack: 'Next.js · React · TypeScript · Python' },
      { tag: 'INFRA', stack: 'Oracle Cloud · Docker · PM2 · On-prem' },
    ],
    resumeCta: 'הורד קורות חיים',
    resumeFile: '/Nehorai Hadad CV - SW (HE).pdf',
    resumeDownloadName: 'Nehorai Hadad CV - SW (HE).pdf',
    terminalFileName: 'secure_channel.sh',
    securityLabel: 'TLS 1.3',
    initLines: [
      '> מאתחל ערוץ מאובטח...',
      '> מקים מנהרה מוצפנת...',
      '> הערוץ מוכן.',
    ],
    progressLabels: {
      encrypting: '> מצפין את המטען...',
      transmitting: '> משדר...',
      encryptingHint: '  מאבטח את ההודעה שלך...',
      transmittingHint: '  מנתב אל nehoraihadad.com...',
    },
    success: {
      delivered: 'STATUS: נמסר ✓',
      eta: 'RESPONSE_ETA: 24–48H',
      title: 'תודה, ההודעה התקבלה.',
      description: 'אחזור אליך בתוך יום או יומיים.',
    },
    form: {
      nameLabel: 'שם_השולח',
      emailLabel: 'אימייל_השולח',
      messageLabel: 'גוף_ההודעה',
      namePlaceholder: 'השם שלך',
      emailPlaceholder: 'you@company.com',
      messagePlaceholder: 'כתוב הודעה...',
      submitLabel: 'שגר',
      errorPrefix: '> שגיאה: ',
    },
  },
  assistant: {
    title: 'NEHORAI // עוזר',
    matrixTitle: 'MATRIX // UPLINK',
    quickPrompts: ['מה הסטאק הטכנולוגי שלך?', 'הצג לי את הפרויקטים שלך', 'איך אפשר לעבוד יחד?'],
    initialMessages: [
      { type: 'system', content: 'המערכת אותחלה. ה-Orchestrator פעיל.' },
      {
        type: 'agent',
        agentName: 'PortfolioAgent',
        content: 'היי. אני עוזר קטן שיכול לענות על שאלות לגבי ה-stack של Nehorai, הפרויקטים שלו ואיך אפשר ליצור איתו קשר.',
      },
    ],
    clearedMessage: 'זיכרון המערכת נוקה. ה-Orchestrator אותחל מחדש.',
    helpMessage: 'פקודות זמינות: /clear, /help, /download_cv, /matrix',
    downloadMessage: '> Orchestrator: מתחיל העברת קובץ מאובטחת... [Nehorai Hadad CV - SW (HE).pdf]',
    matrixMessage: 'תתעורר, Neo... ה-Matrix מחזיקה בך.',
    analyzingMessage: '> Orchestrator: מנתח כוונה...',
    routingMessage: '> Orchestrator: מנתב אל {agentName}...',
    inputPlaceholder: 'שאל את ה-Orchestrator...',
    matrixInputPlaceholder: 'הכנס פקודה...',
    agentNames: {
      portfolio: 'PortfolioAgent',
      showcase: 'ShowcaseAgent',
      tech: 'TechAgent',
      contact: 'CommAgent',
    },
    responses: {
      default:
        'אני יכול לענות על שאלות לגבי ה-stack של Nehorai, הפרויקטים שלו ואיך ליצור איתו קשר. נסה לשאול על הטכנולוגיות שלו, הפרויקטים שלו או על עבודה משותפת.',
      showcase:
        'מוצגים ארבעה פרויקטים: Podcasto (Telegram → פודקאסטים בקריינות AI על AWS), Agendo (דשבורד self-hosted לריבוי agents), ושני אתרי לקוח חיים — ykl.org.il ו-judah-brigade.vercel.app. גלול לאזור הפרויקטים הנבחרים כדי לראות את הפרטים.',
      tech:
        'ה-stack היומיומי: Next.js 15/16 + TypeScript בפרונט, Node ו-Python בבק, PostgreSQL/pgvector לנתונים, AWS Lambda/SQS/DynamoDB לפייפליינים, ו-LangGraph / AWS AgentCore / MCP ל-agents. מתחת לכל זה יש שמונה שנות ניסיון עם Linux on-prem.',
      contact:
        'Email: nehorai.hadad@gmail.com. מחפש תפקידי Full-Stack או AI Engineer בישראל — Hybrid או Remote, שניהם מתאימים.',
    },
  },
  footer: {
    copyrightTemplate: '© {year} Nehor.ai. כל הזכויות שמורות.',
  },
  caseStudies: [
    {
      id: 'podcasto',
      title: 'Podcasto',
      description:
        'הופך ערוצי חדשות ב-Telegram לפודקאסטים בקריינות AI שנשלחים באימייל. צינור אודיו שמחולק ל-chunks על AWS — Lambda, SQS, DynamoDB, SES — עם Google Gemini 2.5 Flash TTS.',
      impact:
        'עיבוד פרקים מהיר פי 7 וכ-84% פחות עלות בניסיונות חוזרים לעומת הגישה המונוליתית המקורית.',
      tags: ['AWS Lambda', 'SQS', 'DynamoDB', 'Gemini TTS', 'Next.js 15'],
      icon: 'podcast',
      details: {
        challenge: 'יצירת אודיו בבת אחת הייתה איטית ושבירה, וכשל אחד הפיל פרק שלם.',
        solution:
          'כל פרק פוצל ל-chunks מקביליים שמעובדים ב-Lambdas מבודדים וממוזגים בהמשך. תקלות נשארות מבודדות; retries מריצים מחדש רק את ה-chunk שנכשל.',
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
        'דשבורד self-hosted לתזמור agents לקידוד AI — Claude, Codex, Gemini — מממשק יחיד בסגנון Kanban עם אינטגרציית MCP.',
      impact: 'מבטל את הצורך ללהטט בין כמה CLIs; agents משתפים לוח משימות ומתאמים דרך MCP.',
      tags: ['Next.js 16', 'TypeScript', 'PostgreSQL 17', 'MCP'],
      icon: 'dashboard',
      details: {
        challenge:
          'עבודה עם כמה CLIs לקידוד AI גורמת לאובדן state, להעתקה ידנית של context, ולהיעדר לוח משימות משותף.',
        solution:
          'אפליקציית Next.js 16 שמגלה אוטומטית CLIs מותקנים של agents, עוטפת אותם ב-Kanban מגובה PostgreSQL ובטרמינלים חיים לסשנים, וחושפת את הכול דרך MCP כדי ש-agents יוכלו לתאם.',
        architecture: ['Next.js 16', 'TypeScript (strict)', 'PostgreSQL 17', 'Docker', 'PM2', 'Model Context Protocol'],
        githubUrl: 'https://github.com/NehoraiHadad/agendo',
      },
    },
    {
      id: 'ykl',
      title: "Yeshiva Ketana Ma'ale Hever",
      description:
        'אתר Full-Stack לישיבה עם ניהול תוכן, גלריית מדיה וממשק רספונסיבי בגישת Hebrew-first. נמסר ללקוח משלם.',
      impact: 'באוויר ב-ykl.org.il — הפנים הציבוריות של המוסד.',
      tags: ['Next.js', 'TypeScript', 'Tailwind'],
      icon: 'globe',
      details: {
        challenge: 'הישיבה הייתה צריכה אתר מודרני, Hebrew-first, שהצוות שלה יוכל לעדכן בלי מפתח.',
        solution:
          'Next.js + Tailwind עם מודל תוכן opinionated וזרימת אדמין שמותאמת לעורכים לא טכניים.',
        architecture: ['Next.js', 'TypeScript', 'Tailwind CSS'],
        liveUrl: 'https://ykl.org.il',
        githubUrl: 'https://github.com/NehoraiHadad/ykl',
      },
    },
    {
      id: 'judah-brigade',
      title: 'Be-Shvil Yehuda',
      description:
        'אתר לקהילת Judah Brigade עם מדריכי טיולים, נקודות עניין ותוכן שנבנה לגלישה mobile-first בשטח.',
      impact: 'באוויר ובשימוש של הקהילה.',
      tags: ['Next.js 15', 'TypeScript', 'Tailwind'],
      icon: 'map',
      details: {
        challenge:
          'תוכן הקהילה היה מפוזר בין קבוצות צ׳אט ומסמכים; החברים היו צריכים מקום אחד לחקור אתרים ומסלולים.',
        solution:
          'אתר Next.js בגישת mobile-first עם תוכן מובנה, גלישה מודעת-מפה וביצועים ידידותיים לעבודה offline.',
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
      items: ['AWS (Lambda, SQS, SES, DynamoDB)', 'Docker + PM2', '8 years of on-prem datacenter', 'Server hardware & physical infra'],
    },
  ],
};
