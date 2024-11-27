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
				'light-cyan': 'hsl(180, 57%, 75%)',
				'cyan': 'hsl(180, 66%, 49%)',
				'gray': 'hsl(0, 0%, 75%)',
				'red': 'hsl(0, 87%, 67%)'
			},
			backgroundImage: {
				'bg-shorten-mobile': 'url(./src/assets/bg-shorten-mobile.svg)',
				'bg-shorten-desktop': 'url(./src/assets/bg-shorten-desktop.svg)',
				'bg-boost-mobile': 'url(./src/assets/bg-boost-mobile.svg)',
				'bg-boost-desktop': 'url(./src/assets/bg-boost-desktop.svg)'
			},
			animation: {
				fadeIn: 'fadeIn 0.5s ease-in',
				fadeOut: 'fadeOut 0.5s ease-in-out'
			},
			keyframes: (_theme) => ({
				fadeIn: {
				  '0%': { opacity: 0 },
				  '100%': { opacity: 1 }
				},
				fadeOut: {
					'0%': { opacity: 1, display: 'block' },
					'100%': { opacity: 0, display: 'none' }
				}
			}),
		},
	},
	plugins: [],
}
