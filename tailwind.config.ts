import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1600px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', "sans-serif"],
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
        nanum: ['var(--font-eb-garamond)', 'serif'],
        serif: ['var(--font-eb-garamond)', 'serif'],
        'press-start': ['var(--font-press-start)', 'system-ui'],
      },
      spacing: {
        '82': '20.5rem',
        '92': '23rem',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}

export default config
