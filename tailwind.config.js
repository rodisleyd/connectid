/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    blue: '#3E4095',
                    gold: '#CE8F64',
                }
            }
        },
    },
    plugins: [],
}
