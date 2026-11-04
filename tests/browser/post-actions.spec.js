import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const posts = JSON.parse(readFileSync(new URL('../../static/data/posts.json', import.meta.url), 'utf8'))
	.filter(post => ['001', '002'].includes(post.id));

// Testujeme skutečné hit testing a události prohlížeče. Mockované jsou jen
// systémové služby, jejichž dialogy nelze v automatizaci ovládat.
test.beforeEach(async ({ page }, testInfo) => {
	// Pro akce stačí dva skutečné příspěvky; neposíláme celou rostoucí databázi
	// v každém testu a nesvazujeme timeouty s její velikostí.
	await page.route('**/data/posts.json', route => route.fulfill({ json: posts }));
	await page.addInitScript(() => {
		window.flipHintStarts = 0;
		document.addEventListener('animationstart', event => {
			if (event.animationName.endsWith('flip-preview')) window.flipHintStarts++;
		});
		window.actionCalls = [];
		window.shareError = null;
		window.clipboardError = false;
		Object.defineProperty(navigator, 'share', {
			configurable: true,
			value: async (data) => {
				window.actionCalls.push({ type: 'share', data });
				if (window.shareError) throw new DOMException('test', window.shareError);
			}
		});
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: async (url) => {
				if (window.clipboardError) throw new Error('Clipboard denied');
				window.actionCalls.push({ type: 'copy', url });
			} }
		});
	});
	// Skutečná navigace do nové záložky, bez požadavku na GitHub nebo přihlášení.
	await page.context().route('https://github.com/**', (route) => route.fulfill({
		contentType: 'text/html', body: '<h1>Report</h1>'
	}));
	await page.goto('./?post=001');
	await expect(page.locator('.is-active .card-front')).toBeVisible();
	if (!/flip hint|actual flip|reduced motion/.test(testInfo.title)) {
		await page.locator('.is-active .card-stage').evaluate(async stage => {
			await Promise.all(stage.getAnimations().map(animation => animation.finished));
		});
	}
});

async function activate(locator, page, horizontal = 0.5) {
	await expect(locator).toBeVisible();
	const box = await locator.boundingBox();
	expect(box).not.toBeNull();
	const point = { x: box.x + box.width * horizontal, y: box.y + box.height / 2 };
	const hit = await locator.evaluate((element, point) => {
		const target = document.elementFromPoint(point.x, point.y);
		return { matches: element.contains(target), description: target?.outerHTML.slice(0, 250) };
	}, point);
	expect(hit.matches, `Another element intercepts pointer events: ${hit.description}`).toBe(true);
	// Souřadnice odpovídají klepnutí uživatele. Automatické scrollIntoView
	// v locator.tap může na 3D rubu spustit scroll-snap a kartu odsunout.
	if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await page.touchscreen.tap(point.x, point.y);
	else await page.mouse.click(point.x, point.y);
}

async function openMenu(page) {
	await activate(page.locator('.is-active .card-face[aria-hidden="false"]').getByRole('button', { name: 'Další možnosti' }), page);
	await expect(page.getByRole('menu')).toBeVisible();
	await expect(page.getByRole('menuitem', { name: 'Sdílet' })).toHaveCount(0);
	await expect(page.getByRole('menu').locator('.app-build-info')).toContainText('build');
	await page.getByRole('menu').evaluate(async menu => {
		await Promise.all(menu.getAnimations().map(animation => animation.finished));
	});
}

async function flip(page) {
	await activate(page.locator('.is-active .flip-btn'), page);
	await expect(page.locator('.is-active .card-back')).toHaveAttribute('aria-hidden', 'false');
	await page.locator('.is-active .card-stage').evaluate(async (stage) => {
		await Promise.all(stage.getAnimations().map(animation => animation.finished));
	});
}

test('flip hint plays on each active card and after reload until a real flip', async ({ page }) => {
	const stage = page.locator('.is-active .card-stage');
	await expect.poll(() => page.evaluate(() => window.flipHintStarts)).toBe(1);
	await stage.evaluate(async el => {
		await Promise.all(el.getAnimations().map(animation => animation.finished));
	});
	await expect(page.locator('.flip-hint')).toHaveCount(0);
	await page.locator('.feed-container').evaluate(el => { el.scrollTop = el.clientHeight; });
	await expect(page.locator('.post-card').nth(1)).toHaveClass(/is-active/);
	await expect.poll(() => page.evaluate(() => window.flipHintStarts)).toBe(2);
	await expect.poll(() => page.evaluate(() => sessionStorage.getItem('faakt:flip-hint-seen'))).toBeNull();
	await page.reload();
	await expect(page.locator('.is-active .card-front')).toBeVisible();
	await expect.poll(() => page.evaluate(() => window.flipHintStarts)).toBe(1);
	await expect.poll(() => page.evaluate(() => sessionStorage.getItem('faakt:flip-hint-seen'))).toBeNull();
});

test('flip hint returns in a new tab session', async ({ page, context }) => {
	await flip(page);
	await expect.poll(() => page.evaluate(() =>
		sessionStorage.getItem('faakt:flip-hint-seen')
	)).toBe('1');
	const url = page.url();
	await page.close();
	const nextPage = await context.newPage();
	await nextPage.route('**/data/posts.json', route => route.fulfill({ json: posts }));
	await nextPage.addInitScript(() => {
		window.flipHintStarts = 0;
		document.addEventListener('animationstart', event => {
			if (event.animationName.endsWith('flip-preview')) window.flipHintStarts++;
		});
	});
	await nextPage.goto(url);
	await expect.poll(() => nextPage.evaluate(() => window.flipHintStarts)).toBe(1);
});

test('actual flip cancels the hint', async ({ page }) => {
	await flip(page);
	await expect.poll(() => page.evaluate(() => sessionStorage.getItem('faakt:flip-hint-seen'))).toBe('1');
	await expect(page.locator('.flip-hint')).toHaveCount(0);
	await page.locator('.feed-container').evaluate(el => { el.scrollTop = el.clientHeight; });
	await expect(page.locator('.post-card').nth(1)).toHaveClass(/is-active/);
	await expect(page.locator('.flip-hint')).toHaveCount(0);
	await expect(page.locator('.is-active .card-stage')).toHaveCSS('animation-name', 'none');
	await page.reload();
	await expect(page.locator('.is-active .card-front')).toBeVisible();
	await expect(page.locator('.flip-hint')).toHaveCount(0);
});

test('reduced motion skips the hint', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.evaluate(() => sessionStorage.clear());
	await page.reload();
	await expect(page.locator('.is-active .card-front')).toBeVisible();
	await expect(page.locator('.flip-hint')).toHaveCount(0);
	await flip(page);
});

for (const side of ['front', 'back']) {
	for (const isolated of [false, true]) {
		test(`${side}: share and report work with ${isolated ? 'isolated' : 'normal'} scrolling layer`, async ({ page }) => {
			if (isolated) {
				// Mobilní scrollování může vytvořit vlastní stacking context. Tento
				// deterministický ekvivalent reprodukuje překryv nad celým feedem.
				await page.addStyleTag({ content: '.feed-container { isolation: isolate; }' });
			}
			if (side === 'back') await flip(page);
			await activate(page.getByRole('button', { name: 'Sdílet', exact: true }), page);
			await expect.poll(() => page.evaluate(() => window.actionCalls)).toEqual([
				{ type: 'share', data: { url: 'http://127.0.0.1:4175/faakt.io/?post=001', title: posts.find(post => post.id === '001').title } }
			]);
			await expect(page.getByRole('menu')).toHaveCount(0);
			await openMenu(page);
			const popupPromise = page.waitForEvent('popup');
			await activate(page.getByRole('menuitem', { name: 'Nahlásit problém' }), page);
			const popup = await popupPromise;
			await expect(popup).toHaveURL(/https:\/\/github.com\/lukazko\/faakt.io\/issues\/new\?/);
			const url = new URL(popup.url());
			expect(url.searchParams.get('template')).toBe('report-post.yml');
			expect(url.searchParams.get('body')).toContain('**ID příspěvku:** 001');
			expect(url.searchParams.get('body')).toContain('http://127.0.0.1:4175/faakt.io/?post=001');
			// Kontext po testu zavře i popup; některé WebKity při explicitním
			// close nové záložky zbytečně čekají na návrat fokusu.
		});
	}

	test(`${side}: outside click closes menu without flipping card`, async ({ page }) => {
		if (side === 'back') await flip(page);
		await openMenu(page);
		await activate(page.locator(`.is-active .card-${side} h2`), page, 0.05);
		await expect(page.getByRole('menu')).toHaveCount(0);
		await expect(page.locator(`.is-active .card-${side}`)).toHaveAttribute('aria-hidden', 'false');
		await openMenu(page);
		// Prázdný okraj mimo kartu musí také zavřít nabídku.
		if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await page.touchscreen.tap(5, 300);
		else await page.mouse.click(5, 300);
		await expect(page.getByRole('menu')).toHaveCount(0);
	});
}

for (const mode of ['unavailable', 'denied', 'cancelled', 'clipboard-denied']) {
	test(`share fallback: ${mode}`, async ({ page }) => {
		await page.evaluate((mode) => {
			if (mode === 'unavailable') Object.defineProperty(navigator, 'share', { value: undefined });
			else window.shareError = mode === 'cancelled' ? 'AbortError' : 'NotAllowedError';
			window.clipboardError = mode === 'clipboard-denied';
		}, mode);
		const dialogPromise = mode === 'clipboard-denied' ? page.waitForEvent('dialog').then(async (dialog) => {
			expect(dialog.type()).toBe('prompt');
			expect(dialog.defaultValue()).toBe('http://127.0.0.1:4175/faakt.io/?post=001');
			await dialog.dismiss();
		}) : null;
		await activate(page.getByRole('button', { name: 'Sdílet', exact: true }), page);
		if (dialogPromise) {
			await dialogPromise;
		} else if (mode === 'cancelled') {
			await expect.poll(() => page.evaluate(() => window.actionCalls.map(c => c.type))).toEqual(['share']);
			await expect(page.locator('#toast')).not.toHaveClass(/visible/);
		} else {
			await expect.poll(() => page.evaluate(() => window.actionCalls.filter(c => c.type === 'copy'))).toEqual([
				{ type: 'copy', url: 'http://127.0.0.1:4175/faakt.io/?post=001' }
			]);
			await expect(page.locator('#toast')).toHaveText('Odkaz zkopírován do schránky');
			await expect(page.locator('#toast')).toHaveClass(/visible/);
		}
	});
}
