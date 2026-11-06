import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const posts = JSON.parse(readFileSync('reports/posts-2026-11-05.json', 'utf8'));
mkdirSync('tmp/imagegen-batch-957/cards', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.route('**/data/posts.json', route => route.fulfill({ json: posts }));
const metrics = [];
for (const post of posts) {
  await page.goto(`http://127.0.0.1:4190/faakt.io/?order=id&post=${post.id}`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; }' });
  const card = page.locator('article').filter({ has: page.locator('h2.title').filter({ hasText: post.title }) });
  await card.waitFor();
  await card.scrollIntoViewIfNeeded();
  const img = card.locator('img.post-illustration');
  await img.evaluate(async image => { await image.decode(); });
  const m = await card.evaluate(el => {
    const img = el.querySelector('img.post-illustration');
    const art = img.getBoundingClientRect(), hook = el.querySelector('.teaser').getBoundingClientRect();
    const title = el.querySelector('h2');
    return { title: title.textContent, image: img.getAttribute('src'), naturalWidth: img.naturalWidth,
      imageCss: { x: art.x, y: art.y, width: art.width, height: art.height }, hookTop: hook.top,
      titleOverflow: title.scrollHeight > title.clientHeight + 1,
      glowVisible: !!el.querySelector('.illustration-glow') };
  });
  if (m.title !== post.title || m.naturalWidth !== 640) throw new Error(`Broken card ${post.id}`);
  await page.screenshot({ path: `tmp/imagegen-batch-957/cards/${post.id}-glow.png` });
  await page.addStyleTag({ content: '.illustration-glow { display: none !important; }' });
  await page.screenshot({ path: `tmp/imagegen-batch-957/cards/${post.id}-base.png` });
  await card.locator('.card-front .flip-btn').click();
  await page.waitForTimeout(50);
  if (await card.locator('.card-back').getAttribute('aria-hidden') !== 'false') throw new Error(`Cannot flip ${post.id}`);
  m.id = post.id; m.flipWorks = true;
  metrics.push(m);
}
await browser.close();
if (errors.length) throw new Error(errors.join('\n'));
writeFileSync('reports/illustrations-957-976-card-layout.json', JSON.stringify(metrics, null, 2) + '\n');
console.log(JSON.stringify({ cards: metrics.length, backgrounds: ['base', 'glow'], flipChecks: metrics.length, errors }));
