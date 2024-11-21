/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				'poppins': 'Poppins, sans-serif'
			},
			colors: {
				'very-dark-blue': 'hsl(255, 11%, 22%)',
				'very-dark-violet': 'hsl(260, 8%, 14%)',
				'grayish-violet': 'hsl(257, 7%, 63%)',
				'dark-violet': 'hsl(257, 27%, 26%)',
				'cyan': 'hsl(180, 66%, 49%)',
				'gray': 'hsl(0, 0%, 75%)',
				'red': 'hsl(0, 87%, 67%)'
			},
			backgroundImage: {
				'bg-shorten': `url(./src/assets/bg-shorten-mobile.svg)`
			}
		},
	},
	plugins: [],
}
