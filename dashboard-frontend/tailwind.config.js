/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0B0F17',
        panel: '#141B29',
        elevated: '#1B2436',
        line: '#26314A',
        muted: '#7C8BA8',
        text: '#E7ECF7',
        signal: {
          high: '#FF5470',
          medium: '#FFB020',
          low: '#2DD4BF',
          amber: '#F5A623',
        },
        accent: {
          blue: '#3B82F6',
          green: '#22C55E',
          orange: '#F59E0B',
          red: '#EF4444',
          purple: '#8B5CF6',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
