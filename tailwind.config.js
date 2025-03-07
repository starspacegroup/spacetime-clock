/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        "foreground": "hsla(var(--foreground))",
        "background": "hsla(var(--background))",
        "primary": "hsla(var(--primary))",
        "secondary": "hsla(var(--secondary))",
        "accent": "hsla(var(--accent))",
        "link-blue": "hsla(var(--link-blue))",
        "daytime": "hsla(var(--daytime))",
        "nighttime": "hsla(var(--nighttime))",
        "sun": "hsla(var(--sun))",
        "summer": "hsla(var(--summer))",
        "winter": "hsla(var(--winter))",
        "year-progress": "hsla(var(--year-progress))",
      },
    },
  },
  plugins: [
    require("@designbycode/tailwindcss-conic-gradient"),
  ],
};
