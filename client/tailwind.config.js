/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          void: {
            950: '#090b10',
            900: '#12151f',
            850: '#171b26',
            800: '#1c212e',
            700: '#2a3142',
            600: '#3c455c',
            500: '#4d576a',
            400: '#727e96',
            300: '#9ba3b4',
            200: '#bdc3cf',
            100: '#dce0e8',
            50: '#f1f3f7',
          },
          ember: {
            DEFAULT: '#f59e0b',
            glow: 'rgba(245, 158, 11, 0.15)',
            smolder: '#d9531e',
            flare: '#fbbf24',
            deep: '#9a3412',
          },
          ash: {
            DEFAULT: '#dc2626',
            glow: 'rgba(220, 38, 38, 0.15)',
            threat: '#ef4444',
            dark: '#7f1d1d',
            deep: '#450a0a',
          },
          steel: {
            DEFAULT: '#64748b',
            dim: '#475569',
            dark: '#334155',
          },
          triumph: {
            DEFAULT: '#10b981',
            glow: 'rgba(16, 185, 129, 0.15)',
            bright: '#34d399',
            deep: '#064e3b',
          },
          reclaim: {
            DEFAULT: '#06b6d4',
            glow: 'rgba(6, 182, 212, 0.15)',
            pulse: '#f97316',
            bright: '#22d3ee',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'forge-ember': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'forge-ember-lg': '0 0 35px -5px rgba(245, 158, 11, 0.5)',
        'forge-ember-inner': 'inset 0 1px 1px rgba(251, 191, 36, 0.6)',
        'forge-ash': '0 0 20px -3px rgba(220, 38, 38, 0.35)',
        'forge-triumph': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'forge-reclaim': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'forge-card': '0 8px 24px -4px rgba(0, 0, 0, 0.45)',
        'forge-surface': '0 1px 0 0 rgba(74, 85, 104, 0.4) inset, 0 8px 24px -4px rgba(0, 0, 0, 0.45)',
      },
      borderRadius: {
        'forge-xs': '4px',
        'forge-sm': '6px',
        'forge': '10px',
        'forge-md': '12px',
        'forge-lg': '16px',
        'forge-xl': '20px',
      },
      spacing: {
        'forge-xs': '4px',
        'forge-sm': '8px',
        'forge-md': '16px',
        'forge-lg': '24px',
        'forge-xl': '32px',
        'forge-2xl': '48px',
      },
      animation: {
        'forge-ember-pulse': 'forge-ember-pulse 2.5s infinite ease-in-out',
        'forge-ash-pulse': 'forge-ash-pulse 2s infinite ease-in-out',
        'forge-reclaim-pulse': 'forge-reclaim-pulse 2s infinite alternate ease-in-out',
        'forge-molten': 'forge-molten 3s infinite linear',
      },
      keyframes: {
        'forge-ember-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px -2px rgba(245, 158, 11, 0.35)' },
          '50%': { boxShadow: '0 0 25px 3px rgba(245, 158, 11, 0.65)' },
        },
        'forge-ash-pulse': {
          '0%, 100%': { opacity: '0.85', boxShadow: '0 0 12px -2px rgba(220, 38, 38, 0.3)' },
          '50%': { opacity: '1', boxShadow: '0 0 22px 2px rgba(220, 38, 38, 0.55)' },
        },
        'forge-reclaim-pulse': {
          '0%': { borderColor: '#f97316', boxShadow: '0 0 14px rgba(249, 115, 22, 0.3)' },
          '100%': { borderColor: '#06b6d4', boxShadow: '0 0 20px rgba(6, 182, 212, 0.45)' },
        },
        'forge-molten': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
    },
  },
  plugins: [],
}
