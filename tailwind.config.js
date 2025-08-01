// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      backgroundColor: {
        'green-500-transparent': 'rgba(34, 197, 94, 0.5)', // green-500 con 50% opacidad
      }
    }
  },
  plugins: [],
}