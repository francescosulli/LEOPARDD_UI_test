import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        astro: {
          950: '#050505',
          900: '#11100e',
          800: '#1b1713',
          orange: '#ef7d17',
          flame: '#ff9b3d',
          cream: '#fff7ed',
          sand: '#d8c3a6',
          cyan: '#ef7d17',
          mint: '#ef7d17',
          amber: '#ff9b3d',
          red: '#ff4d6d',
        },
      },
      boxShadow: {
        glow: '0 0 38px rgba(239, 125, 23, 0.34)',
        'glow-red': '0 0 34px rgba(255, 77, 109, 0.36)',
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'radial-space':
          'radial-gradient(circle at 18% 18%, rgba(239,125,23,0.24), transparent 32%), radial-gradient(circle at 78% 10%, rgba(255,255,255,0.10), transparent 28%), linear-gradient(135deg, #050505 0%, #11100e 45%, #170f08 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
