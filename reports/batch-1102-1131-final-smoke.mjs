import { chromium } from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
const base='http://127.0.0.1:5187/faakt.io/';
for(const id of ['1131','1102']){
 await page.goto(base+`post/${id}/`,{waitUntil:'networkidle'});
 await page.waitForFunction(id=>{const p=document.querySelector('.is-active .card-front img');return p?.src.endsWith(`/illustrations-ai/${id}.webp`)&&p.complete&&p.naturalWidth===640},id);
}
const data=await page.evaluate(async base=>{
 const posts=await(await fetch(base+'data/posts.json')).json();
 const manifest=await(await fetch(base+'illustrations-ai/manifest.json')).json();
 return {posts:posts.length,newAccepted:manifest.filter(p=>Number(p.id)>=1102&&p.review?.status==='accepted').length,title:document.querySelector('.is-active h2')?.textContent};
},base);
if(data.posts!==1131||data.newAccepted!==30||errors.length)throw Error(JSON.stringify({data,errors}));
await page.screenshot({path:'reports/batch-1102-1131-review/final-preview.png'});
fs.writeFileSync('reports/batch-1102-1131-final-smoke.json',JSON.stringify({base,data,errors},null,2)+'\n');
console.log('Final browser preview:',data,errors);
await browser.close();
