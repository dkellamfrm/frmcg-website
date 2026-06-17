/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: '#152B4F',
        'frm-blue': '#2FA4E7',
        'frm-green-dark': '#1B7A3D',
        'frm-green': '#8DC63F',
        'frm-gray': '#4A5568',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
