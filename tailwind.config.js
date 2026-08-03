/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Palette formalized from DESIGN.md's "Visual foundations" section.
      colors: {
        sand: '#F7F5EE',
        ink: {
          900: '#14170F',
        },
        olive: {
          50: '#F5F4EC',
          100: '#EAE8DA',
          200: '#D8D5C0',
          300: '#BFBB9E',
          400: '#9C9877',
          500: '#7A7860',
          600: '#5E5C49',
          700: '#48473A',
          800: '#33322A',
          900: '#1F1E19',
        },
        accent: {
          DEFAULT: '#D6F24C',
          hover: '#C2DE3A',
          active: '#AEC92C',
        },
        // Semantic tones from the Arreglao Design System (claude.ai/design
        // project cfff0ed2-f48c-4a74-9db2-1c85f5e2ec96) — used by Badge.
        success: { DEFAULT: '#3F8F5E', bg: '#E4F1E6' },
        warning: { DEFAULT: '#B8791B', bg: '#FAEED8' },
        danger: { DEFAULT: '#C1473B', bg: '#F8E6E3' },
        info: { DEFAULT: '#3D6FA3', bg: '#E4EDF6' },
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '20px',
        xl: '28px',
      },
      fontFamily: {
        sans: ['PlusJakartaSans_400Regular'],
        'sans-medium': ['PlusJakartaSans_500Medium'],
        'sans-semibold': ['PlusJakartaSans_600SemiBold'],
        'sans-bold': ['PlusJakartaSans_700Bold'],
        'sans-extrabold': ['PlusJakartaSans_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
