import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const posts = JSON.parse(readFileSync(new URL('../../static/data/posts.json', import.meta.url), 'utf8'));
const post = posts.find(post => post.id === '417');
const hook = post.content.match(/^<p>(.*?)<\/p>/s)[1].replace(/<[^>]*>/g, '');

for (const viewport of [{ width: 390, height: 844 }, { width: 360, height: 540 }]) {
	test(`whole hook remains readable at ${viewport.width}×${viewport.height}`, async ({ page }) => {
		await page.setViewportSize(viewport);
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.route('**/data/posts.json', route => route.fulfill({ json: [post] }));
		await page.goto('./?post=417');
		const front = page.locator('.is-active .card-front');
		const main = front.locator('.front-main');
		const teaser = front.locator('.teaser');
		await expect(teaser).toHaveText(hook);
		await expect(front.locator('img')).toBeVisible();
		await front.locator('img').evaluate(img => img.decode());
		const text = await teaser.evaluate(el => ({
			height: el.clientHeight, fullHeight: el.scrollHeight,
			clamp: getComputedStyle(el).webkitLineClamp
		}));
		expect(text.fullHeight).toBeLessThanOrEqual(text.height + 1);
		expect(['none', 'unset', '']).toContain(text.clamp);
		if (viewport.height === 540) {
			expect(await main.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
			await main.focus();
			await page.keyboard.press('End');
			await expect.poll(() => main.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
		}
		await main.evaluate(el => { el.scrollTop = el.scrollHeight; });
		const bounds = await front.evaluate(el => ({
			text: el.querySelector('.teaser').getBoundingClientRect().bottom,
			main: el.querySelector('.front-main').getBoundingClientRect().bottom,
			button: el.querySelector('.flip-btn').getBoundingClientRect().top
		}));
		expect(bounds.text).toBeLessThanOrEqual(bounds.main + 1);
		expect(bounds.main).toBeLessThanOrEqual(bounds.button);
		await front.locator('.flip-btn').click();
		await expect(page.locator('.is-active .card-back')).toHaveAttribute('aria-hidden', 'false');
	});
}

test('stored hooks never end with an ellipsis', () => {
	for (const post of posts) {
		const first = post.content.match(/^<p>(.*?)<\/p>/s)[1].replace(/<[^>]*>/g, '').trim();
		expect(first, `hook ${post.id}`).not.toMatch(/(?:\.{3}|\u2026)[”"»']?$/);
	}
});
