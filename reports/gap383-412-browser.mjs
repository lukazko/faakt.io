import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const base=process.argv[2]??'http://127.0.0.1:4196/faakt.io/';
const posts=await fetch(base+'data/posts.json',{signal:AbortSignal.timeout(20000)}).then(r=>r.json());
if(posts.length!==976)throw Error('Wrong or stale checkout');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
await page.emulateMedia({reducedMotion:'reduce'});
page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(60000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
mkdirSync('reports/gap383-412-cards',{recursive:true});
const cards=[];
for(let id=383;id<=412;id++){
 const post=posts.find(p=>p.id===String(id));
 await page.goto(base+`post/${id}/`,{waitUntil:'domcontentloaded'});
 const front=page.locator('.is-active .card-front');
 await front.locator('h2').filter({hasText:post.title}).waitFor();
 await front.locator('img').evaluate(im=>im.decode());
 await page.evaluate(()=>document.fonts.ready);
 await page.addStyleTag({content:'*,*::before,*::after {animation:none !important;transition:none !important;}'});
 const metrics=await front.evaluate(el=>{
  const im=el.querySelector('img'),box=im.getBoundingClientRect(),art=el.querySelector('.front-art').getBoundingClientRect();
  const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;
  const ctx=c.getContext('2d');ctx.drawImage(im,0,0);const px=ctx.getImageData(0,0,c.width,c.height).data;
  let top=c.height,bottom=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(px[(y*c.width+x)*4+3]>=16){top=Math.min(top,y);bottom=y+1;break;}
  const scale=Math.min(box.width/c.width,box.height/c.height),offset=(box.height-c.height*scale)/2;
  const hook=el.querySelector('.teaser').getBoundingClientRect(),title=el.querySelector('h2').getBoundingClientRect();
  return {image:im.getAttribute('src'),width:box.width,height:box.height,frameHeight:art.height,alphaTop:top,alphaBottom:bottom,
   visibleArtworkToHookGap:Math.round((hook.top-(box.top+offset+bottom*scale))*100)/100,
   flipButtonVisible:el.querySelector('.flip-btn').getBoundingClientRect().bottom<=innerHeight,
   titleWithinCard:title.left>=el.getBoundingClientRect().left&&title.right<=el.getBoundingClientRect().right,
   hookWithinViewport:hook.bottom<=innerHeight};
 });
 if(metrics.image!==`/faakt.io/illustrations-ai/${id}.webp`||!metrics.flipButtonVisible||!metrics.titleWithinCard||!metrics.hookWithinViewport)throw Error(`Broken card ${id}: ${JSON.stringify(metrics)}`);
 await page.screenshot({path:`reports/gap383-412-cards/${id}.png`});
 const noGlow=await page.addStyleTag({content:'.illustration-glow {display:none !important;}'});
 await page.screenshot({path:`reports/gap383-412-cards/${id}-base.png`});
 await noGlow.evaluate(el=>el.remove());
 await front.locator('.flip-btn').click();
 const back=page.locator('.is-active .card-back');
 await back.locator('.post-body').waitFor({state:'visible'});
 if(!(await back.textContent()).includes(post.title))throw Error(`Wrong reverse ${id}`);
 await back.locator('.source-toggle').click();
 const links=await back.locator('a[href^="http"]').evaluateAll(xs=>xs.map(x=>x.href));
 if(!post.sources.every(s=>links.includes(s.url)))throw Error(`Missing source links ${id}`);
 cards.push({id:String(id),...metrics,reverseVerified:true,sourceLinksVerified:true});
 console.log(`Verified mobile card ${id}`);
}
await page.setViewportSize({width:1440,height:1000});
await page.goto(base+'post/383/',{waitUntil:'domcontentloaded'});
await page.locator('.is-active .card-front h2').filter({hasText:posts.find(p=>p.id==='383').title}).waitFor();
await page.screenshot({path:'reports/gap383-412-cards/desktop.png'});
await browser.close();
writeFileSync('reports/gap383-412-local-validation.json',JSON.stringify({base,records:posts.length,cards,runtimeErrors:errors,desktopVerified:true},null,2)+'\n');
if(errors.length)throw Error(errors.join('\n'));
console.log('All 30 cards: image, title, hook, reverse and source links verified.');
