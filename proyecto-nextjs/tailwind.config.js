/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f5fa',
          100: '#e0ecf5',
          500: '#1d4ed8',
          800: '#1e3a8a',
          900: '#0f172a',
          950: '#0a0f1d',
        }
      }
    },
  },
  plugins: [],
}
