import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const outputDirectory = process.env.BUILD_DIR ?? 'build';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: outputDirectory,
			assets: outputDirectory,
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		paths: {
			base: '/faakt.io'
		},
		prerender: {
			handleHttpError: 'warn'
		}
	}
};

export default config;