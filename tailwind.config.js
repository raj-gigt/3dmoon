import flowbite from "flowbite-react/tailwind.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", flowbite.content],
  theme: {
    extend: {},
  },
  plugins: [flowbite.plugin],
};
