import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Identidad de Proyecto Ingeniería
        ink: '#12232C',        // texto principal, tinta técnica
        paper: '#EEF3F5',      // papel de plano, fondo
        paperLine: '#D7E2E6',  // líneas de grilla del plano
        brand: {
          DEFAULT: '#2d5269',  // color de marca
          light: '#3f6c88',
          dark: '#1c384a',
        },
        rust: {
          DEFAULT: '#C1622E',  // acento: correlativas activas / "carga"
          light: '#E08A57',
          soft: '#F3D9C7',
        },
        support: '#5C8A72',    // verde apagado: "habilita a cursar" (hacia adelante)
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      backgroundImage: {
        blueprint:
          'linear-gradient(0deg, rgba(45,82,105,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(45,82,105,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '24px 24px',
      },
    },
  },
  plugins: [],
};
export default config;
