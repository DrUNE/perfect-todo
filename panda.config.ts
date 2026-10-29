import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  preflight: false,
  include: ['./src/**/*.{ts,tsx}'],
  exclude: [],
  jsxFramework: 'react',
  outdir: 'styled-system',
  globalCss: {
    html: {
      textSizeAdjust: 'none',
    },
    body: {
      margin: 0,
      minHeight: '100vh',
      lineHeight: '1.5',
      color: 'rgba(0, 0, 0, 0.88)',
    },
    'html[data-theme="dark"] body': {
      color: 'rgba(255, 255, 255, 0.85)',
    },
    'h1, h2, h3, h4, button, input, label': {
      lineHeight: '1.1',
    },
    'h1, h2, h3, h4': {
      textWrap: 'balance',
    },
    'a:not([class])': {
      color: 'currentColor',
      textDecorationSkipInk: 'auto',
    },
    'img, picture': {
      display: 'block',
      maxWidth: '100%',
    },
    'input, button, textarea, select': {
      font: 'inherit',
    },
    'textarea:not([rows])': {
      minHeight: '10em',
    },
    ':target': {
      scrollMarginBlock: '5ex',
    },
  },
});
