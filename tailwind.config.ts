import type { Config } from 'tailwindcss'

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bosque: { DEFAULT: token('bosque'), 900: token('bosque-900') },
        oliva: token('oliva'),
        salvia: token('salvia'),
        lino: token('lino'),
        papel: token('papel'),
        kraft: token('kraft'),
        canela: token('canela'),
        arcilla: token('arcilla'),
        tinta: { DEFAULT: token('tinta'), suave: token('tinta-suave') },
        linea: token('linea'),
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        hoja: '0 1px 0 rgb(var(--tinta) / 0.04), 0 8px 24px -12px rgb(var(--bosque) / 0.25)',
      },
      keyframes: {
        brotar: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        brotar: 'brotar 420ms cubic-bezier(0.2, 0.7, 0.2, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
