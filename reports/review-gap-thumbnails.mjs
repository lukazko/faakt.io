import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const posts=JSON.parse(readFileSync('static/data/posts.json','utf8')).filter(p=>+p.id>=313&&+p.id<=352).sort((a,b)=>+a.id-+b.id);
const component=readFileSync('src/lib/components/CardGlow.svelte','utf8');
const colors=Function('return ('+component.match(/const glowColors = (\{[\s\S]*?\n\t\});/)[1]+')')();
const css=component.split('<style>')[1].split('</style>')[0];
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1280,height:1000}});
page.setDefaultNavigationTimeout(180000);
await page.route('**/data/posts.json',route=>route.fulfill({json:[posts[0]]}));
await page.goto('http://127.0.0.1:4192/faakt.io/?post=313',{waitUntil:'domcontentloaded'});
await page.locator('.card-face').first().waitFor();
const background=await page.locator('.card-face').first().evaluate(el=>getComputedStyle(el).backgroundImage);
mkdirSync('tmp/posts-gap-313-352/thumbnails',{recursive:true});
for(const size of [160,320])for(const glow of [false,true]){
 const chunks=size===320?[posts.slice(0,20),posts.slice(20)]:[posts];
 for(let index=0;index<chunks.length;index++){
 const html=chunks[index].map(p=>{const c=colors[p.illustration.palette];return `<section><span>${p.id}</span><div class="thumb" style="--glow-primary:${c[0]};--glow-secondary:${c[1]};--glow-accent:${c[2]}">${glow?'<div class="illustration-glow"></div>':''}<img src="http://127.0.0.1:4192/faakt.io/illustrations-ai/${p.id}.webp"></div></section>`;}).join('');
 await page.setContent(`<style>${css}body{margin:0;background:#101010;color:white;font:12px sans-serif;display:grid;grid-template-columns:repeat(4,${size}px)}section{width:${size}px}.thumb{width:${size}px;height:${size*9/16}px;position:relative;background-image:${background}}img{width:100%;height:100%;object-fit:contain;position:relative;z-index:1}</style>${html}`);
 await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
 await page.screenshot({path:`tmp/posts-gap-313-352/thumbnails/${size}-${glow?'glow':'base'}-${index}.png`,fullPage:true});
 }
}
await browser.close();writeFileSync('reports/illustrations-313-352-thumbnails.json',JSON.stringify({count:40,sizes:['160x90','320x180'],backgrounds:['actual computed card gradient','exact current CardGlow.svelte CSS'],background},null,2)+'\n');
console.log('40 illustrations rendered at both sizes on both actual backgrounds.');
