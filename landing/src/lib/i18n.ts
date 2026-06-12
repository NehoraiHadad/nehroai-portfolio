/* ============================================================
   i18n — the single source of all user-facing copy, per locale.

   English lives at `/`, Hebrew at `/he/`. Adding a locale = one entry in
   STRINGS + one thin page under src/pages. Structural link data (href, icon,
   beat) stays in links.ts; only the words live here.
   ============================================================ */

export type Locale = "en" | "he";

export const LOCALES: Locale[] = ["en", "he"];
export const DEFAULT_LOCALE: Locale = "en";

/** Text direction for a locale. */
export const dirOf = (locale: Locale): "rtl" | "ltr" =>
  locale === "he" ? "rtl" : "ltr";

/** The "other" locale — used to point the language toggle the right way. */
export const otherLocale = (locale: Locale): Locale =>
  locale === "en" ? "he" : "en";

/** Root-relative URL for a locale's landing page. */
export const localeUrl = (locale: Locale): string =>
  locale === DEFAULT_LOCALE ? "/" : `/${locale}/`;

/** Translatable copy for one link card, keyed by its beat id in STRINGS.links. */
interface LinkCopy {
  kicker: string;
  label: string;
  description: string;
}

export interface UIStrings {
  /** <title> + og/twitter title. */
  metaTitle: string;
  /** <meta description> + og/twitter description. */
  metaDescription: string;
  /** Mono eyebrow above the headline. */
  eyebrow: string;
  /** The big display word. */
  headline: string;
  /** One-line intro under the headline. */
  lede: string;
  /** aria-label on the cards <nav>. */
  navLabel: string;
  /** aria-label on the mobile deck pager. */
  deckLabel: string;
  /** Accessible description of the looping character video. */
  videoLabel: string;
  /** Label of the link that switches to the OTHER language. */
  toggleLabel: string;
  /** aria-label of the language toggle link. */
  toggleAria: string;
  /** A/B intro vote widget (the corner pill + panel in Welcome.astro). */
  vote: {
    /** Collapsed corner pill that opens the panel. */
    pill: string;
    /** Question shown at the top of the panel. */
    question: string;
    /** aria-label of the v1/v2 segmented control. */
    segAria: string;
    /** The "cast my vote" button. */
    cast: string;
    /** Button label after the vote is locked in. */
    voted: string;
    /** Prefix on the tally right after voting. */
    thanks: string;
  };
  /** 404 page copy. */
  notFound: {
    title: string;
    message: string;
    back: string;
  };
  /** Card copy keyed by beat id (see links.ts / BEAT_MAP). */
  links: Record<string, LinkCopy>;
}

export const STRINGS: Record<Locale, UIStrings> = {
  en: {
    metaTitle: "Nehorai Hadad — Welcome",
    metaDescription:
      "Hi, I'm Nehorai. Pick a world to explore — starting with my AI portfolio.",
    eyebrow: "Nehorai Hadad",
    headline: "Welcome.",
    lede: "Hi — I'm Nehorai. Let me show you around.",
    navLabel: "Where to go next",
    deckLabel: "Choose a world",
    videoLabel: "Animated portrait of Nehorai welcoming you",
    toggleLabel: "עברית",
    toggleAria: "עבור לעברית — switch to Hebrew",
    vote: {
      pill: "A/B intro",
      question: "Two takes on the intro — which do you prefer?",
      segAria: "Choose intro version",
      cast: "Vote for this",
      voted: "Voted ✓",
      thanks: "Thanks!",
    },
    notFound: {
      title: "Lost in the grid.",
      message: "This page doesn't exist — but the worlds below do.",
      back: "Back home",
    },
    links: {
      portfolio: {
        kicker: "AI · Engineering",
        label: "Portfolio",
        description: "Projects, experiments, and the things I build with AI.",
      },
      github: {
        kicker: "Code · Open source",
        label: "GitHub",
        description: "The source behind the work — repos, experiments, commits.",
      },
      contact: {
        kicker: "Say hello",
        label: "Let's talk",
        description: "Got an idea or a role in mind? Message me on WhatsApp.",
      },
    },
  },
  he: {
    metaTitle: "נהוראי חדד — ברוכים הבאים",
    metaDescription:
      "היי, אני נהוראי. בחרו עולם לחקור — נתחיל מתיק העבודות שלי בבינה מלאכותית.",
    eyebrow: "נהוראי חדד",
    headline: "ברוכים הבאים.",
    lede: "היי — אני נהוראי. בואו אראה לכם מה יש כאן.",
    navLabel: "לאן ממשיכים",
    deckLabel: "בחרו עולם",
    videoLabel: "דמות מונפשת של נהוראי מקבלת אתכם בברכה",
    toggleLabel: "EN",
    toggleAria: "Switch to English — עבור לאנגלית",
    vote: {
      pill: "פתיח A/B",
      question: "שתי גרסאות לפתיח — איזו עדיפה בעיניכם?",
      segAria: "בחירת גרסת פתיח",
      cast: "הצביעו לזו",
      voted: "הצבעתם ✓",
      thanks: "תודה!",
    },
    notFound: {
      title: "הלכתם לאיבוד ברשת.",
      message: "העמוד הזה לא קיים — אבל העולמות למטה כן.",
      back: "חזרה הביתה",
    },
    links: {
      portfolio: {
        kicker: "בינה מלאכותית · הנדסה",
        label: "תיק עבודות",
        description: "פרויקטים, ניסויים, והדברים שאני בונה עם בינה מלאכותית.",
      },
      github: {
        kicker: "קוד · קוד פתוח",
        label: "גיטהאב",
        description: "מה שמאחורי העבודה — מאגרי קוד, ניסויים וקומיטים.",
      },
      contact: {
        kicker: "נעים להכיר",
        label: "בואו נדבר",
        description: "יש לכם רעיון או תפקיד בראש? כתבו לי בוואטסאפ.",
      },
    },
  },
};
