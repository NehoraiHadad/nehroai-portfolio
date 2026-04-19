import { Assistant, Inter, Space_Grotesk } from 'next/font/google';

export const appSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

export const appDisplay = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

export const appHebrew = Assistant({
  subsets: ['hebrew', 'latin'],
  display: 'swap',
  variable: '--font-hebrew',
  fallback: ['Arial', 'system-ui', 'sans-serif'],
});

export const fontVariables = `${appSans.variable} ${appDisplay.variable} ${appHebrew.variable}`;
