import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
const drafts=JSON.parse(fs.readFileSync('reports/batch-1042-1071-drafts.json','utf8'));
const out='reports/batch-1042-1071-review';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1040,height:1510},deviceScaleFactor:1});
page.setDefaultNavigationTimeout(120000);
page.setDefaultTimeout(60000);
const colors={blue_gold:['#4285db','#e2ad45','#6570ce'],green_copper:['#49ac7c','#d18350','#399caa'],indigo_cyan:['#7560d4','#35c4d5','#4b83d9'],monochrome_cool:['#638fbe','#8e83b4','#59a9b3'],monochrome_warm:['#bd855b','#d6b578','#b47286'],teal_amber:['#27aaa6','#e5a13e','#4d82ba'],terracotta_cream:['#d16f50','#dfbf80','#b77995'],violet_coral:['#9657d2','#e37e79','#617ed0']};
if(process.argv.includes('--art')){
  for(let start=0;start<drafts.length;start+=7){
    const rows=drafts.slice(start,start+7).map(p=>{
      const [a,b,c]=colors[p.illustration.palette];
      const src=pathToFileURL(path.resolve(`static/illustrations-ai/${p.id}.webp`)).href;
      return `<section><h3>${p.id} · ${p.title}</h3><div class="row">${[320,320,160,160].map((w,i)=>`<div class="surface" style="width:${w}px;height:${w*9/16}px">${i%2?`<div class="glow" style="--a:${a};--b:${b};--c:${c}"></div>`:''}<img src="${src}"></div>`).join('')}</div></section>`;
    }).join('');
    const html=`<!doctype html><meta charset="utf-8"><style>body{margin:12px;background:#252525;color:#fff;font:14px sans-serif}h3{margin:5px 0}.row{display:flex;gap:8px;align-items:center}section{margin-bottom:14px}.surface{position:relative;background:linear-gradient(180deg,#141414,#0d0d0d)}img{position:relative;width:100%;height:100%}.glow{position:absolute;inset:0;opacity:.10;background:radial-gradient(ellipse 80% 56% at 0% 0%,var(--a),transparent 100%),radial-gradient(ellipse 68% 48% at 100% 0%,var(--b),transparent 100%),radial-gradient(ellipse 74% 54% at 100% 100%,var(--c),transparent 100%),radial-gradient(ellipse 62% 45% at 0% 100%,var(--a),transparent 100%)}</style>${rows}`;
    fs.writeFileSync(`${out}/art-${start/7+1}.html`,html);
    await page.goto(pathToFileURL(path.resolve(`${out}/art-${start/7+1}.html`)).href);
    await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
    await page.screenshot({path:`${out}/art-${start/7+1}.png`,fullPage:true});
  }
  console.log('Created five sheets: each asset at 320×180 and 160×90, base gradient and exact current CardGlow.');
}else{
  const base=process.env.FAAKT_REVIEW_URL??'http://127.0.0.1:5182/faakt.io/';
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const rows=[];
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const p of drafts){
    // Navigate a real post URL and use the real dataset, never route-mocked data.
    await page.goto(base+`post/${p.id}/`,{waitUntil:'networkidle'});
    const front=page.locator('.is-active .card-front');
    await front.locator('h1,h2,h3').first().waitFor();
    const img=front.locator('img');
    await page.waitForFunction(id=>{const img=document.querySelector('.is-active .card-front img');return img?.src.endsWith(`/illustrations-ai/${id}.webp`)&&img.complete&&img.naturalWidth>0;},p.id);
    await img.evaluate(el=>el.decode());
    const src=await img.getAttribute('src');
    if(!src.endsWith(`/illustrations-ai/${p.id}.webp`))throw Error(`Wrong asset ${p.id}: ${src}`);
    const title=await front.locator('h1,h2,h3').first().textContent();
    if(title.trim()!==p.title)throw Error(`Wrong title ${p.id}: ${title}`);
    const expected=p.content.match(/^<p>(.*?)<\/p>/s)[1].replace(/<[^>]*>/g,'');
    if((await front.locator('.teaser').textContent()).trim()!==expected)throw Error(`Wrong hook ${p.id}`);
    const metrics=await front.evaluate(el=>{
      const img=el.querySelector('img'),r=img.getBoundingClientRect(),t=el.querySelector('.teaser').getBoundingClientRect(),frame=el.querySelector('.front-art').getBoundingClientRect();
      const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
      const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      let bottom=0;for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>=16)bottom=y+1;
      const scale=Math.min(r.width/canvas.width,r.height/canvas.height),position=getComputedStyle(img).objectPosition;
      const offset=position.endsWith('0%')&&!position.endsWith('50%')?0:(r.height-canvas.height*scale)/2;
      const visibleBottom=Math.min(frame.bottom,r.top+offset+bottom*scale);
      return {image:{width:r.width,height:r.height,top:r.top,bottom:r.bottom},frameGap:t.top-frame.bottom,visibleGap:t.top-visibleBottom,alphaBottom:bottom,hookHeight:t.height,hookScrollHeight:el.querySelector('.teaser').scrollHeight};
    });
    await front.screenshot({path:`${out}/card-${p.id}-glow.png`});
    const css=await page.addStyleTag({content:'.illustration-glow{display:none!important}'});
    await front.screenshot({path:`${out}/card-${p.id}-base.png`});await css.evaluate(el=>el.remove());
    await front.locator('.flip-btn').click();
    const back=page.locator('.is-active .card-back');
    await page.waitForFunction(()=>document.querySelector('.is-active .card-back')?.getAttribute('aria-hidden')==='false');
    await back.locator('.source-toggle').click();
    const links=await back.locator('a[target="_blank"]').evaluateAll(as=>as.map(a=>a.href));
    for(const source of p.sources)if(!links.some(url=>url===new URL(source.url).href))throw Error(`Missing source ${p.id}: ${source.url}`);
    const body=await back.textContent();
    if(!body.includes(p.content.replace(/<[^>]*>/g,'').slice(-45)))throw Error(`Missing complete body ${p.id}`);
    rows.push({id:p.id,title,src,metrics,flipped:true,sources:links});
  }
  await page.setViewportSize({width:390,height:500});
  await page.goto(base+'post/1056/',{waitUntil:'networkidle'});
  const front=page.locator('.is-active .card-front'),main=front.locator('.front-main');
  await main.evaluate(el=>el.scrollTop=el.scrollHeight);
  const low=await front.evaluate(el=>({textBottom:el.querySelector('.teaser').getBoundingClientRect().bottom,mainBottom:el.querySelector('.front-main').getBoundingClientRect().bottom,buttonTop:el.querySelector('.flip-btn').getBoundingClientRect().top,scrollTop:el.querySelector('.front-main').scrollTop}));
  if(low.textBottom>low.mainBottom+1||low.mainBottom>low.buttonTop+1)throw Error('Low viewport hides hook or actions');
  await front.screenshot({path:`${out}/low.png`});await front.locator('.flip-btn').click();
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'post/1042/',{waitUntil:'networkidle'});await page.screenshot({path:`${out}/desktop.png`});
  fs.writeFileSync('reports/batch-1042-1071-local-validation.json',JSON.stringify({base,rows,low,errors},null,2)+'\n');
  if(errors.length)throw Error(errors.join('\n'));
  console.log(`Reviewed ${rows.length} real mobile cards, flips, complete text, sources, low and desktop viewports; no runtime errors.`);
}
await browser.close();
