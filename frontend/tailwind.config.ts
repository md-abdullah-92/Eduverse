import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
    fontFamily: {
      playfair: ['var(--font-playfair)', 'serif'],
      worksans: ['var(--font-worksans)', 'sans-serif'],
      raleway: ['var(--font-raleway)', 'sans-serif'],
    },
  },
  },
  plugins: [typography],
};

export default config;
