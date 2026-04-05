/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mos-green': {
          DEFAULT: '#00873c',
          light: '#00a84d',
          dark: '#006b30',
        },
        'accent': {
          DEFAULT: '#FF5722', // 例：鮮やかなオレンジ
          light: '#FF7043',
          dark: '#E64A19',
        },
      },
      spacing: {
        'responsive-px': 'clamp(1rem, 4vw, 2rem)',
      },
    },
  },
  safelist: [
    // タグ関連のクラスを明示的に含める
    'px-7',
    'py-3',
    'text-sm',
    'text-base',
    'font-bold',
    'rounded-full',
    'border-2',
    'shadow-md',
    'gap-2',
    'gap-4',
    'flex',
    'items-center',
    'bg-gradient-to-r',
    'from-amber-100',
    'to-amber-50',
    'text-amber-900',
    'border-amber-300',
    'from-blue-100',
    'to-blue-50',
    'text-blue-900',
    'border-blue-300',
  ],
  plugins: [],
}

