import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const posts = JSON.parse(readFileSync(new URL('../../static/data/posts.json', import.meta.url), 'utf8')).slice(0, 45);

test('progress reaches 100% on load more and updates for the next batch', async ({ page }) => {
	await page.route('**/data/posts.json', route => route.fulfill({ json: posts }));
	await page.goto('./?order=id');
	const progress = page.locator('.progress-bar');
	await expect(page.locator('.card-front')).toHaveCount(20);
	await expect(progress).toHaveAttribute('style', 'width: 0%');
	await page.locator('.feed-container').evaluate(el => {
		el.style.scrollBehavior = 'auto';
		el.scrollTop = el.scrollHeight;
	});
	await expect(progress).toHaveAttribute('style', 'width: 100%');
	await expect(page.locator('.dev-post-badge')).toContainText('konec');
	await page.getByRole('button', { name: 'Nee, dej mi víc!' }).click();
	await expect(page.locator('.card-front')).toHaveCount(40);
	await expect(progress).toHaveAttribute('style', 'width: 50%');
	await page.locator('.feed-container').evaluate(el => { el.scrollTop = 0; });
	await expect(progress).toHaveAttribute('style', 'width: 0%');
});
