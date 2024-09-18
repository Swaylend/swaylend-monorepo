import type { Config } from 'tailwindcss';
const { fontFamily } = require('tailwindcss/defaultTheme');

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    fontSize: {
      '2xl': [
        '48px',
        {
          lineHeight: '58px',
        },
      ],
      xl: [
        '30px',
        {
          lineHeight: '36px',
        },
      ],
      lg: [
        '18px',
        {
          lineHeight: '27px',
        },
      ],
      md: [
        '16px',
        {
          lineHeight: '24px',
        },
      ],
      sm: [
        '14px',
        {
          lineHeight: '21px',
        },
      ],
      xs: [
        '12px',
        {
          lineHeight: '12px',
        },
      ],
    },
    extend: {
      fontFamily: {
        sans: ['Inter var', ...fontFamily.sans],
      },
      colors: {
        neutral0: '#8D021F',
        neutral1: '#8D021F',
        neutral2: '#8D021F',
        neutral3: '#8D021F',
        neutral4: '#8D021F',
        neutral5: '#8D021F',
        neutral6: '#8D021F',
        neutral7: '#8D021F',
        neutral8: '#8D021F',
        primary01: '#8D021F',
        primary02: '#8D021F',
        primary03: '#8D021F',
        secondary1: '#8D021F',
        secondary2: '#8D021F',
        secondary3: '#8D021F',
        lavender: '#DFE5FA',
        moon: '#8D98AF',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        purple: '#8B5CF6',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
