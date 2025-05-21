/** @type {import('tailwindcss').Config} */
const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");

module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1f2123',
        accent: '#f39237',
        bg: '#131516',
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "meteor-effect": "meteor 5s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        shimmer: {
          from: {
            backgroundPosition: "0 0",
          },
          to: {
            backgroundPosition: "-200% 0",
          },
        },
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: 1 },
          "70%": { opacity: 1 },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: 0,
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      backgroundImage: {
        "dot-pattern": "radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)",
        "dot-pattern-white": "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)",
      },
    },
  },
  plugins: [addVariablesForColors, addDotPattern],
} 

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
 
  addBase({
    ":root": newVars,
  });
}

// This plugin adds dot pattern utilities to Tailwind
function addDotPattern({ addUtilities }) {
  addUtilities({
    ".bg-dot-black": {
      backgroundImage: "radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)",
      backgroundSize: "25px 25px",
    },
    ".bg-dot-white": {
      backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)",
      backgroundSize: "25px 25px",
    },
  });
} 