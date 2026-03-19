/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   "#080C14",
          secondary: "#0D1420",
          tertiary:  "#111827",
          elevated:  "#1a2235",
        },
        border: {
          subtle:  "#1e2d45",
          default: "#243552",
          strong:  "#2e4268",
        },
        text: {
          primary:   "#E8EDF5",
          secondary: "#8A9BB5",
          muted:     "#4A5A74",
        },
        green:  { DEFAULT: "#00D68F", bg: "rgba(0,214,143,0.1)",  border: "rgba(0,214,143,0.25)" },
        red:    { DEFAULT: "#FF4D6A", bg: "rgba(255,77,106,0.1)", border: "rgba(255,77,106,0.25)" },
        blue:   { DEFAULT: "#3D8EF0", bg: "rgba(61,142,240,0.1)", border: "rgba(61,142,240,0.25)" },
        amber:  { DEFAULT: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
        purple: { DEFAULT: "#A78BFA", bg: "rgba(167,139,250,0.1)",border: "rgba(167,139,250,0.25)" },
        teal:   { DEFAULT: "#2DD4BF", bg: "rgba(45,212,191,0.1)", border: "rgba(45,212,191,0.25)" },
        orange: { DEFAULT: "#FF8C00", bg: "rgba(255,140,0,0.1)",  border: "rgba(255,140,0,0.25)" },
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        sm:  "6px",
        md:  "9px",
        lg:  "12px",
        xl:  "16px",
        "2xl": "20px",
      },
      animation: {
        "ticker-scroll": "tickerScroll 30s linear infinite",
        "pulse-dot":     "pulseDot 2s ease-in-out infinite",
        "fade-up":       "fadeUp 0.4s ease forwards",
        "fade-in":       "fadeIn 0.3s ease forwards",
      },
      keyframes: {
        tickerScroll: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        pulseDot:     { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
        fadeUp:       { "0%": { opacity: 0, transform: "translateY(12px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        fadeIn:       { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
      },
    },
  },
  plugins: [],
};
