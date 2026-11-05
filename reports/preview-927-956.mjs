import { chromium } from 'playwright';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const posts=JSON.parse(readFileSync('reports/new-posts-927-956.json','utf8')).map(({knowledge,...p})=>p);
const dir='tmp/imagegen-batch-927/cards';mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
page.setDefaultTimeout(120000);
await page.route('**/data/posts.json',r=>r.fulfill({json:posts}));
const records=[];
const selected=process.argv[2]?.split(',');
for(const p of posts.filter(p=>!selected||selected.includes(p.id))){
 await page.goto(`http://127.0.0.1:4189/faakt.io/?order=id&post=${p.id}`,{waitUntil:'domcontentloaded',timeout:180000});
 const card=page.locator(`#post-front-${p.id}`);await card.waitFor({state:'visible'});
 const image=card.locator('img.post-illustration');await image.waitFor();
 await image.evaluate(el=>el.decode());
 await card.screenshot({path:`${dir}/${p.id}.png`,animations:'disabled'});
 console.log(`Reviewed card ${p.id}`);
 records.push(await card.evaluate((el,id)=>{const image=el.querySelector('img'),art=el.querySelector('.front-art'),hook=el.querySelector('.teaser');const a=art.getBoundingClientRect(),i=image.getBoundingClientRect(),h=hook.getBoundingClientRect();return{id,image:{width:i.width,height:i.height,complete:image.complete,naturalWidth:image.naturalWidth},art:{y:a.y,height:a.height},hookY:h.y,cssGap:h.y-a.bottom};},p.id));
}
const layoutPath='reports/illustrations-927-956-card-layout.json';
const merged=selected?JSON.parse(readFileSync(layoutPath,'utf8')).map(r=>records.find(n=>n.id===r.id)??r):records;
writeFileSync(layoutPath,JSON.stringify(merged,null,2)+'\n');
await browser.close();console.log(JSON.stringify({screenshots:records.length}));
