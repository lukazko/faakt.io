import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests/browser',
	fullyParallel: true,
	workers: 2,
	forbidOnly: !!process.env.CI,
	retries: 0,
	timeout: 60_000,
	expect: { timeout: 15_000 },
	use: {
		baseURL: 'http://127.0.0.1:4175/faakt.io/',
		trace: 'retain-on-failure'
	},
	projects: [
		{ name: 'android-chromium', use: { ...devices['Pixel 7'] } },
		{ name: 'iphone-webkit', use: { ...devices['iPhone 13'] } },
		{ name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } }
	],
	webServer: {
		timeout: 180_000,
		command: process.env.TEST_PRODUCTION
			? 'npm run preview -- --host 127.0.0.1 --port 4175 --strictPort'
			: 'npm run dev -- --host 127.0.0.1 --port 4175 --strictPort',
		url: 'http://127.0.0.1:4175/faakt.io/',
		reuseExistingServer: false
	}
});
