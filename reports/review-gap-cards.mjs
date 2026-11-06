import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const posts=JSON.parse(readFileSync('static/data/posts.json','utf8')).filter(p=>Number(p.id)>=313&&Number(p.id)<=352).sort((a,b)=>Number(a.id)-Number(b.id));
if(posts.length!==40)throw Error('Missing imported posts');
const url='http://127.0.0.1:4192/faakt.io/';
mkdirSync('tmp/posts-gap-313-352/cards',{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
page.setDefaultTimeout(90_000);
page.setDefaultNavigationTimeout(180_000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/data/posts.json',route=>route.fulfill({json:posts}));
const metrics=[];
for(const post of posts){
 await page.goto(`${url}?order=id&post=${post.id}`,{waitUntil:'domcontentloaded'});
 await page.addStyleTag({content:'* { animation: none !important; transition: none !important; }'});
 const card=page.locator('article').filter({has:page.locator('h2.title').filter({hasText:post.title})});
 await card.waitFor();await card.scrollIntoViewIfNeeded();
 await card.locator('img.post-illustration').evaluate(async image=>await image.decode());
 const m=await card.evaluate(el=>{const img=el.querySelector('img.post-illustration'),art=img.getBoundingClientRect(),hook=el.querySelector('.teaser').getBoundingClientRect(),title=el.querySelector('h2');return {title:title.textContent,image:img.getAttribute('src'),naturalWidth:img.naturalWidth,imageCss:{x:art.x,y:art.y,width:art.width,height:art.height},hookTop:hook.top,titleOverflow:title.scrollHeight>title.clientHeight+1,hookOverflow:el.querySelector('.teaser').scrollHeight>el.querySelector('.teaser').clientHeight+1,glowVisible:!!el.querySelector('.illustration-glow')};});
 if(m.title!==post.title||m.naturalWidth!==640||m.titleOverflow)throw Error('Invalid card '+post.id);
 await page.screenshot({path:`tmp/posts-gap-313-352/cards/${post.id}-glow.png`});
 await page.addStyleTag({content:'.illustration-glow { display: none !important; }'});
 await page.screenshot({path:`tmp/posts-gap-313-352/cards/${post.id}-base.png`});
 await card.locator('.card-front .flip-btn').click();
 if(await card.locator('.card-back').getAttribute('aria-hidden')!=='false')throw Error('Cannot flip '+post.id);
 await card.locator('.source-toggle').click();
 await card.locator('.source-list a').first().waitFor();
 const links=await card.locator('.card-back a[href^="http"]').evaluateAll(els=>els.map(el=>el.href));
 for(const source of post.sources)if(!links.includes(source.url))throw Error('Missing source '+post.id);
 metrics.push({...m,id:post.id,flipWorks:true,sourceLinks:links});
}
// Verify the final user link with the real complete dataset and no request interception.
await page.unroute('**/data/posts.json');
await page.goto(`${url}?order=id&post=313`,{waitUntil:'domcontentloaded'});
if(!await page.locator('.is-active').textContent().then(t=>t.includes(posts[0].title)))throw Error('First-post URL failed');
await browser.close();if(errors.length)throw Error(errors.join('\n'));
writeFileSync('reports/illustrations-313-352-card-layout.json',JSON.stringify(metrics,null,2)+'\n');
console.log(JSON.stringify({cards:metrics.length,backgrounds:['base','glow'],flipChecks:metrics.length,sourceChecks:40,errors,url:url+'?order=id&post=313'}));
