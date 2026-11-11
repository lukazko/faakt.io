import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const allPosts = JSON.parse(readFileSync(new URL('../../static/data/posts.json', import.meta.url), 'utf8'));
const posts = [...allPosts.filter(post => post.category === 'historie').slice(0, 45),
	...allPosts.filter(post => post.category !== 'historie').slice(0, 25)];

for (const index of [5, 23, 42]) {
	test(`clearing category at card ${index + 1} keeps that post at the start`, async ({ page }) => {
		await page.route('**/data/posts.json', route => route.fulfill({ json: posts }));
		await page.goto('./?category=historie');
		const feed = page.locator('.feed-container');
		await expect(page.locator('.card-wrapper')).toHaveCount(20);
		for (let batch = 1; batch <= Math.floor(index / 20); batch++) {
			await feed.evaluate(el => { el.style.scrollBehavior = 'auto'; el.scrollTop = el.scrollHeight; });
			await page.getByRole('button', { name: 'Nee, dej mi víc!' }).click();
			await expect(page.locator('.card-wrapper')).toHaveCount(Math.min((batch + 1) * 20, 45));
		}
		await feed.evaluate((el, index) => {
			el.style.scrollBehavior = 'auto';
			el.scrollTop = index * parseFloat(el.style.getPropertyValue('--feed-step'));
		}, index);
		const title = await page.locator('.card-wrapper').nth(index).locator('.card-front h1, .card-front h2').textContent();
		await expect(page.locator('.is-active .card-front')).toContainText(title);
		// Prohlížeč může scroll po zkrácení DOM doručit před odloženým
		// resetem. Vynutíme i toto pořadí událostí, nezávisle na rychlosti stroje.
		if (index >= 20) await page.evaluate(() => {
			document.querySelector('.header-category').addEventListener('click', () => {
				const original = window.requestAnimationFrame;
				const oldTop = document.querySelector('.feed-container').scrollTop;
				let pending = true;
				window.requestAnimationFrame = callback => original.call(window, time => {
					if (pending && !document.querySelector('.header-category')) {
						pending = false;
						window.requestAnimationFrame = original;
						const feed = document.querySelector('.feed-container');
						feed.scrollTop = oldTop;
						feed.dispatchEvent(new Event('scroll'));
					}
					callback(time);
				});
			}, { capture: true, once: true });
		});
		await page.locator('.header-category').click();
		await expect(page).not.toHaveURL(/category=/);
		await expect(page.locator('.card-wrapper')).toHaveCount(20);
		await expect(page.locator('.card-wrapper').first()).toContainText(title);
		await expect.poll(() => feed.evaluate(el => el.scrollTop)).toBe(0);
		await expect(page.locator('.is-active .card-front')).toContainText(title);
		await expect(page.locator('.progress-bar')).toHaveAttribute('style', 'width: 0%;');
	});
}
