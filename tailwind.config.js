/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-roboto-mono)'],
      },
      fontSize: {
        // Custom fluid font sizes using clamp()
        'xs': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.5' }],
        'sm': ['clamp(0.875rem, 0.8rem + 0.375vw, 1rem)', { lineHeight: '1.6' }],
        'base': ['clamp(1rem, 0.875rem + 0.5vw, 1.125rem)', { lineHeight: '1.75' }],
        'lg': ['clamp(1.125rem, 1rem + 0.625vw, 1.25rem)', { lineHeight: '1.75' }],
        'xl': ['clamp(1.25rem, 1.075rem + 0.875vw, 1.5rem)', { lineHeight: '1.75' }],
        '2xl': ['clamp(1.5rem, 1.25rem + 1.25vw, 2rem)', { lineHeight: '1.4' }],
        '3xl': ['clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)', { lineHeight: '1.3' }],
        '4xl': ['clamp(2.25rem, 1.75rem + 2.5vw, 3.5rem)', { lineHeight: '1.2' }],
        '5xl': ['clamp(3rem, 2rem + 5vw, 4.5rem)', { lineHeight: '1.1' }],
      },
      colors: {
        accent: {
          DEFAULT: '#06b6d4',
          light: '#22d3ee',
          dark: '#0891b2',
        },
        secondary: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed',
        },
        tertiary: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        'gradient-accent': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-accent': '0 10px 25px -5px rgba(6, 182, 212, 0.3), 0 4px 6px -2px rgba(6, 182, 212, 0.15)',
        'glow-secondary': '0 10px 25px -5px rgba(139, 92, 246, 0.3), 0 4px 6px -2px rgba(139, 92, 246, 0.15)',
        'glow-tertiary': '0 10px 25px -5px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.15)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.foreground'),
            '--tw-prose-headings': theme('colors.foreground'),
            '--tw-prose-links': theme('colors.accent.DEFAULT'),
            '--tw-prose-bold': theme('colors.foreground'),
            '--tw-prose-code': theme('colors.foreground'),
            '--tw-prose-quotes': theme('colors.gray.600'),
            maxWidth: '65ch',
            fontSize: 'inherit',
            lineHeight: '1.75',
            h1: {
              fontSize: 'clamp(2rem, 1.5rem + 2.5vw, 3rem)',
              fontWeight: '600',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
            },
            h2: {
              fontSize: 'clamp(1.75rem, 1.25rem + 2vw, 2.5rem)',
              fontWeight: '600',
              lineHeight: '1.15',
              letterSpacing: '-0.02em',
            },
            h3: {
              fontSize: 'clamp(1.5rem, 1rem + 1.5vw, 2rem)',
              fontWeight: '600',
              lineHeight: '1.2',
              letterSpacing: '-0.01em',
            },
            h4: {
              fontSize: 'clamp(1.25rem, 0.875rem + 1.25vw, 1.75rem)',
              fontWeight: '600',
              lineHeight: '1.3',
            },
            a: {
              color: theme('colors.accent.DEFAULT'),
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              '&:hover': {
                color: theme('colors.accent.light'),
              },
            },
            code: {
              backgroundColor: theme('colors.gray.100'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
        lg: {
          css: {
            fontSize: 'inherit',
            lineHeight: '1.75',
          },
        },
        invert: {
          css: {
            '--tw-prose-body': theme('colors.gray.300'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-links': theme('colors.accent.light'),
            '--tw-prose-bold': theme('colors.white'),
            '--tw-prose-code': theme('colors.white'),
            '--tw-prose-quotes': theme('colors.gray.400'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}