/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bar-1": "bar 1s ease-in-out infinite",
        "bar-2": "bar 1s ease-in-out 0.15s infinite",
        "bar-3": "bar 1s ease-in-out 0.3s infinite",
        "bar-4": "bar 1s ease-in-out 0.45s infinite",
        "bar-5": "bar 1s ease-in-out 0.6s infinite",
      },
      keyframes: {
        bar: {
          "0%, 100%": { height: "4px" },
          "50%": { height: "24px" },
        },
      },
    },
  },
  plugins: [],
};
