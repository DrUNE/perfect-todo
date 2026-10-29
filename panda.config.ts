import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  preflight: true,
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
