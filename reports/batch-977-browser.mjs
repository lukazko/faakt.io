import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const base=process.env.BATCH_TEST_BASE||'http://127.0.0.1:4200/faakt.io/';
let posts;
for(let attempt=0;attempt<120;attempt++){
 try{posts=await fetch(base+'data/posts.json',{signal:AbortSignal.timeout(3000)}).then(r=>r.json());break;}catch{}
 await new Promise(r=>setTimeout(r,500));
}
if(!posts)throw Error('Local preview did not start');
if(posts.length!==1006)throw Error('Wrong checkout or stale data');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
await page.emulateMedia({reducedMotion:'reduce'});
page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(60000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
mkdirSync('reports/batch-977-cards',{recursive:true});
const checks=[];
for(let id=977;id<=1006;id++){
 const post=posts.find(p=>p.id===String(id));
 await page.goto(base+'post/'+id+'/',{waitUntil:'domcontentloaded'});
 const front=page.locator('.is-active .card-front');
 await front.locator('h2').filter({hasText:post.title}).waitFor();
 await front.locator('img').evaluate(im=>im.decode());
 await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;}'});
 const metrics=await front.evaluate(el=>{
  const im=el.querySelector('img'),box=im.getBoundingClientRect();
  const canvas=document.createElement('canvas');canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;
  const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);const px=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let bottom=0;for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(px[(y*canvas.width+x)*4+3]>=16){bottom=y+1;break;}
  const scale=Math.min(box.width/canvas.width,box.height/canvas.height);
  const offset=(box.height-canvas.height*scale)/2;
  const hook=el.querySelector('.teaser').getBoundingClientRect();
  return {image:im.getAttribute('src'),visibleArtworkToHookGap:Math.round((hook.top-(box.top+offset+bottom*scale))*100)/100,
   flipButtonVisible:el.querySelector('.flip-btn').getBoundingClientRect().bottom<=innerHeight,
   hookComplete:!getComputedStyle(el.querySelector('.teaser')).webkitLineClamp||getComputedStyle(el.querySelector('.teaser')).webkitLineClamp==='none'};
 });
 if(metrics.image!=='/faakt.io/illustrations-ai/'+id+'.webp'||!metrics.flipButtonVisible)throw Error('Broken card '+id);
 await page.screenshot({path:'reports/batch-977-cards/'+id+'-glow.png'});
 await page.addStyleTag({content:'.illustration-glow{display:none!important;}'});
 await page.screenshot({path:'reports/batch-977-cards/'+id+'-base.png'});
 await front.locator('.flip-btn').click();
 const back=page.locator('.is-active .card-back');
 await back.locator('.post-body').waitFor({state:'visible'});
 const body=await back.locator('.post-body').innerHTML();
 if(!body.includes(post.content)) {
  const expected=post.content.replace(/<[^>]*>/g,'').replace(/\s+/g,'');
  const actual=(await back.locator('.post-body').textContent()).replace(/\s+/g,'');
  if(!actual.includes(expected))throw Error('Incomplete reverse '+id);
 }
 await back.locator('.source-toggle').click();
 const links=await back.locator('a[href^="http"]').evaluateAll(xs=>xs.map(x=>x.href));
 if(!post.sources.every(s=>links.includes(s.url)))throw Error('Missing sources '+id);
 checks.push({id:String(id),...metrics,reverseVerified:true,sourcesVerified:true});
 console.log('Verified '+id);
}
await page.setViewportSize({width:1440,height:1000});
await page.goto(base+'post/977/');await page.locator('.is-active .card-front img').evaluate(im=>im.decode());
await page.screenshot({path:'reports/batch-977-cards/desktop.png'});
await page.setViewportSize({width:390,height:500});await page.goto(base+'post/1006/');
await page.locator('.is-active .card-front h2').waitFor();
const low=await page.locator('.is-active .front-main').evaluate(el=>{
 el.scrollTop=el.scrollHeight;
 const box=el.getBoundingClientRect(),hook=el.querySelector('.teaser').getBoundingClientRect();
 return {scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,hookEndReachable:hook.bottom<=box.bottom+2};
});
if(!low.hookEndReachable)throw Error('Low viewport hides the end of the hook');
await page.screenshot({path:'reports/batch-977-cards/low.png'});
await browser.close();
writeFileSync('reports/batch-977-local-validation.json',JSON.stringify({base,records:posts.length,cards:checks,runtimeErrors:errors,lowViewport:low},null,2)+'\n');
if(errors.length)throw Error(errors.join('\n'));
