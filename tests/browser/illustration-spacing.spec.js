import { test, expect } from '@playwright/test';

for (const id of ['313', '524', '820', '212']) {
	test(`illustration ${id} keeps readable artwork and a compact hook gap`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto(`./?post=${id}`);
		const card = page.locator('.is-active .card-front');
		await expect(card.locator('img')).toBeVisible();
		await card.locator('img').evaluate(img => img.decode());
		await page.locator('.is-active .card-stage').evaluate(el => el.getAnimations({ subtree: true }).forEach(a => a.finish()));
		const bounds = await card.evaluate(el => {
			const art = el.querySelector('.front-art');
			const image = el.querySelector('img');
			const box = image.getBoundingClientRect();
			const canvas = document.createElement('canvas');
			canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
			const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
			const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
			let top = canvas.height, bottom = 0;
			for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
				if (pixels[(y * canvas.width + x) * 4 + 3] >= 16) { top = Math.min(top, y); bottom = y + 1; break; }
			}
			const scale = Math.min(box.width / canvas.width, box.height / canvas.height);
			const offset = getComputedStyle(image).objectPosition === '50% 0%' ? 0 : (box.height - canvas.height * scale) / 2;
			const hook = el.querySelector('.teaser').getBoundingClientRect();
			const title = el.querySelector('.title').getBoundingClientRect();
			return { gap: hook.top - (box.top + offset + bottom * scale), titleGap: box.top + offset + top * scale - title.bottom,
				frame: art.getBoundingClientRect().height, scale, opacity: getComputedStyle(image).opacity };
		});
		expect(bounds.gap).toBeGreaterThanOrEqual(12);
		expect(bounds.gap).toBeLessThan(30);
		expect(bounds.titleGap).toBeGreaterThanOrEqual(12);
		expect(bounds.scale).toBeGreaterThan(0.2);
	});
}
