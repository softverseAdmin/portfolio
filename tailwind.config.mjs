/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'deep-black': '#0a0a0a',
        'rich-black': '#1a1a1a',
        'charcoal': '#2a2a2a',
        'gold': '#d4af37',
        'amber': '#f0c14b',
        'soft-gold': '#e6d5b8',
        'warm-white': '#f5f5f0',
        'dark-gold': '#b8923a',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #d4af37, #f0c14b)',
        'gradient-dark': 'linear-gradient(180deg, #0a0a0a, #1a1a1a)',
      },
    },
  },
  plugins: [],
};
