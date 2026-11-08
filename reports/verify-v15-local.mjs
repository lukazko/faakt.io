import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const base = 'http://127.0.0.1:4195/faakt.io/';
const posts = await fetch(base+'data/posts.json', {signal:AbortSignal.timeout(15000)}).then(r=>r.json());
if (posts.length !== 946) throw Error('Wrong or stale checkout');
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:390,height:844}});
await page.emulateMedia({reducedMotion:'reduce'});
page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(120000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
mkdirSync('reports/v15-cards',{recursive:true});
const selectedIds=process.argv[2] ? process.argv[2].split(',').map(Number) : Array.from({length:30},(_,i)=>i+353);
const checks=[];
for(const id of selectedIds){
 const post=posts.find(p=>p.id===String(id));
 await page.goto(base+`?order=id&post=${id}`,{waitUntil:'domcontentloaded'});
 const front=page.locator('.is-active .card-front');
 await front.locator('h2').filter({hasText:post.title}).waitFor();
 await front.locator('img').evaluate(im=>im.decode());
 await page.addStyleTag({content:'*,*::before,*::after {animation:none !important;transition:none !important;}'});
 const metrics=await front.evaluate(el=>{
  const im=el.querySelector('img'),box=im.getBoundingClientRect(),art=el.querySelector('.front-art').getBoundingClientRect();
  const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;
  const ctx=c.getContext('2d');ctx.drawImage(im,0,0);const px=ctx.getImageData(0,0,c.width,c.height).data;
  let top=c.height,bottom=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(px[(y*c.width+x)*4+3]>=16){top=Math.min(top,y);bottom=y+1;break;}
  const scale=Math.min(box.width/c.width,box.height/c.height);
  const offset=(box.height-c.height*scale)/2;
  const hook=el.querySelector('.teaser').getBoundingClientRect();
  return {image:im.getAttribute('src'),width:box.width,height:box.height,frameHeight:art.height,alphaTop:top,alphaBottom:bottom,visibleArtworkToHookGap:Math.round((hook.top-(box.top+offset+bottom*scale))*100)/100,
   flipButtonVisible:el.querySelector('.flip-btn').getBoundingClientRect().bottom<=innerHeight};
 });
 if(metrics.image!==`/faakt.io/illustrations-ai/${id}.webp`||!metrics.flipButtonVisible)throw Error(`Broken card ${id}`);
 await page.screenshot({path:`reports/v15-cards/${id}.png`});
 await front.locator('.flip-btn').click();
 const back=page.locator('.is-active .card-back');
 await back.locator('.post-body').waitFor({state:'visible'});
 const text=await back.textContent();
 if(!text.includes(post.title))throw Error(`Wrong reverse ${id}`);
 await back.locator('.source-toggle').click();
 const links=await back.locator('a[href^="http"]').evaluateAll(xs=>xs.map(x=>x.href));
 if(!post.sources.every(s=>links.includes(s.url)))throw Error(`Missing sources ${id}`);
 checks.push({id:String(id),...metrics,reverseVerified:true,sourcesVerified:true});
 console.log(`Verified card ${id}`);
}
await page.goto(base+'?category=sport&post=378',{waitUntil:'domcontentloaded'});
await page.getByRole('button',{name:'Zrušit filtr kategorie Sport'}).waitFor();
if(await page.locator('.card-front .category-badge').count()!==5)throw Error('Wrong sport filter');
await page.reload();await page.getByRole('button',{name:'Zrušit filtr kategorie Sport'}).waitFor();
await page.screenshot({path:'reports/v15-cards/sport.png'});
await page.getByRole('button',{name:'Zrušit filtr kategorie Sport'}).click();
if(new URL(page.url()).searchParams.has('category'))throw Error('Category reset failed');
await page.locator('.is-active .card-front').getByRole('button',{name:'Další možnosti'}).click();
const version=await page.locator('.is-active .card-front .app-build-info').textContent();
if(!version.startsWith('v1.5.0'))throw Error('Wrong application version');
await browser.close();
let cards=checks;
if(selectedIds.length<30){
 const previous=JSON.parse(readFileSync('reports/v15-local-validation.json','utf8'));
 cards=previous.cards.map(card=>checks.find(check=>check.id===card.id)??card);
}
writeFileSync('reports/v15-local-validation.json',JSON.stringify({base,records:posts.length,cards,runtimeErrors:errors,sportFilter:true,version},null,2)+'\n');
if(errors.length)throw Error(errors.join('\n'));
