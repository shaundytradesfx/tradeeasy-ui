/** @type {import('tailwindcss').Config} */
const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");

module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1f2123',
          light: '#2a2d2f',
          dark: '#18191a'
        },
        accent: {
          DEFAULT: '#f39237',
          hover: '#f5a45c',
          active: '#e17f20'
        },
        background: {
          DEFAULT: '#131516',
          card: '#1a1c1e',
          hover: '#1f2123'
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a4a8',
          disabled: '#6b7280'
        },
        border: {
          DEFAULT: '#2a2d2f',
          focus: '#3b4044'
        },
        success: {
          DEFAULT: '#10b981',
          light: '#34d399'
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#f87171'
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24'
        }
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.0125em' }],
        base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.0125em' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.05em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.05em' }],
      },
      spacing: {
        px: '1px',
        0: '0',
        0.5: '0.125rem',
        1: '0.25rem',
        1.5: '0.375rem',
        2: '0.5rem',
        2.5: '0.625rem',
        3: '0.75rem',
        3.5: '0.875rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
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