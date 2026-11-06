import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { illustrationLayoutPlugin } from './scripts/illustration-layout.mjs';
import packageJson from './package.json' with { type: 'json' };

const buildId = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

export default defineConfig({
	plugins: [illustrationLayoutPlugin(), sveltekit()],
	define: {
		__APP_VERSION__: JSON.stringify(packageJson.version),
		__APP_BUILD_ID__: JSON.stringify(buildId)
	}
});
