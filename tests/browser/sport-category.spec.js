import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const posts = JSON.parse(readFileSync(new URL('../../static/data/posts.json', import.meta.url), 'utf8'))
	.filter(post => ['1', '378', '379', '380', '381', '382'].includes(post.id));

test('Sport category survives refresh and returns to the mixed feed', async ({ page }) => {
	await page.route('**/data/posts.json', route => route.fulfill({ json: posts }));
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('./?category=sport&post=378');
	const front = page.locator('.is-active .card-front');
	await expect(front).toContainText(posts.find(post => post.id === '378').title);
	await expect(page.getByRole('button', { name: 'Zrušit filtr kategorie Sport' })).toBeVisible();
	await expect(page.locator('.card-front .category-badge')).toHaveCount(5);
	for (const badge of await page.locator('.card-front .category-badge').all()) {
		await expect(badge).toContainText('Sport');
	}
	await page.reload();
	await expect(front).toContainText(posts.find(post => post.id === '378').title);
	await page.getByRole('button', { name: 'Zrušit filtr kategorie Sport' }).click();
	await expect(page).not.toHaveURL(/category=/);
	await expect(front).toContainText(posts.find(post => post.id === '378').title);
	await expect(page.locator('.card-front .category-badge')).toHaveCount(6);
	await front.getByRole('button', { name: /Sport/ }).click();
	await expect(page).toHaveURL(/category=sport/);
	await expect(page.locator('.card-front .category-badge')).toHaveCount(5);
});
