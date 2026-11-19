import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const allPosts = JSON.parse(readFileSync(new URL('../../static/data/posts.json', import.meta.url), 'utf8'));

for (const category of [null, 'historie']) {
	for (const count of [0, 2, 20, 23]) {
		test(`${category ?? 'mixed'} feed shows its final state after ${count} posts`, async ({ page }) => {
			const pool = category ? allPosts.filter(post => post.category === category) : allPosts;
			const posts = pool.slice(0, count);
			// Include other categories to verify that exhaustion respects the filter.
			const data = category ? [...posts, allPosts.find(post => post.category !== category)] : posts;
			await page.route('**/data/posts.json', route => route.fulfill({ json: data }));
			await page.goto(category ? `./?category=${category}` : './');
			const feed = page.locator('.feed-container');
			const end = page.locator('.end-card');
			await expect(page.locator('.card-wrapper')).toHaveCount(Math.min(count, 20));
			await expect(end).toBeVisible();
			await feed.evaluate(el => { el.style.scrollBehavior = 'auto'; el.scrollTop = el.scrollHeight; });
			if (count > 20) {
				await expect(end).not.toContainText('Teď už víš úplně všechno.');
				await page.getByRole('button', { name: 'Nee, dej mi víc!' }).click();
				await expect(page.locator('.card-wrapper')).toHaveCount(count);
				// The new cards render before the feed scrolls to the first new card.
				await expect(page.locator('.loading-overlay')).toBeHidden();
				await expect(page.locator('.card-wrapper').nth(20).locator('.is-active')).toHaveCount(1);
				await feed.evaluate(el => { el.scrollTop = el.scrollHeight; });
			}
			if (category) {
				await expect(end.locator('.end-card-text')).toHaveText(count
					? 'To je vše z této kategorie.' : 'V této kategorii zatím žádné příspěvky nejsou.');
				await expect(end.getByRole('button', { name: 'Zpět na všechny kategorie' })).toHaveClass(/\bload-more-btn-outline\b/);
				await expect(end.locator('.load-more-text')).toHaveText('Zpět na všechny kategorie');
			} else {
				await expect(end).toHaveText('Teď už víš úplně všechno.');
				await expect(end.locator('button, a')).toHaveCount(0);
			}
			await expect(page.locator('.is-active')).toHaveCount(0);
			await expect.poll(() => end.evaluate(el => el.getBoundingClientRect().bottom <= window.innerHeight)).toBe(true);
			await expect(page.locator('.progress-bar')).toHaveAttribute('style', `width: ${count ? 100 : 0}%;`);
			if (count) {
				await feed.evaluate(el => {
					el.scrollTop -= parseFloat(el.style.getPropertyValue('--feed-step'));
				});
				await expect(page.locator('.card-wrapper').last().locator('.is-active')).toHaveCount(1);
			}
			if (category) {
				await feed.evaluate(el => { el.scrollTop = el.scrollHeight; });
				await end.getByRole('button', { name: 'Zpět na všechny kategorie' }).click();
				await expect(page).not.toHaveURL(/category=/);
				await expect(page.locator('.is-active')).toHaveCount(1);
				await expect.poll(() => feed.evaluate(el => el.scrollTop)).toBe(0);
			}
		});
	}
}
