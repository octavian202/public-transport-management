/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          800: "hsl(var(--primary))",
          500: "hsl(var(--secondary))",
        },
        orange: {
          500: "hsl(var(--accent))",
          600: "hsl(25 95% 50%)",
        },
        slate: {
          50: "hsl(var(--light))",
        },
        gray: {
          900: "hsl(var(--dark))",
        },
      },
    },
  },
  plugins: [],
};
