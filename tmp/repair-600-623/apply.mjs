import fs from 'node:fs';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const mp='static/illustrations-ai/manifest.json';
const manifest=JSON.parse(fs.readFileSync(mp));
const baseline=Object.fromEntries(manifest.map(e=>[e.id,sha(fs.readFileSync('static'+e.image))]));
fs.writeFileSync('tmp/repair-600-623/baseline-hashes.json',JSON.stringify(baseline));
const meaning={
 '600':'A familiar STOP sign is understood by a driver who halts at the line: conventional symbol and its interpreted meaning. A selected broadly recognizable example of Peirce\'s symbol category; not an inventory of icon/index/symbol or a claim that sign and object are identical.',
 '623':'One horse, pig and hen share the same farmyard before a barn. Single scene accompanying Animal Farm, without revolutionary/tyrannical phases, arrows or an attempt to retell the complete plot.'
};
const report={status:'accepted',ids:['600','623'],method:'built-in image_gen; transparent_background=true; generation size/quality/cost controls unavailable',items:[]};
for(const id of report.ids){
 const e=manifest.find(e=>e.id===id),j=JSON.parse(fs.readFileSync(`tmp/repair-600-623/record-${id}.json`));
 const previous=structuredClone(e);
 previous.supersededReason=id==='600'?'User found shoe/footprint too indirect; replaced by familiar STOP sign and halted car.':'User requested one farm scene instead of full-story cycle.';
 previous.savedOriginal=`tmp/repair-600-623/${id}-before.webp`;
 fs.copyFileSync(`tmp/repair-600-623/${id}-new.webp`,'static'+e.image);
 Object.assign(e,{prompt:j.prompt,promptHash:sha(Buffer.from(j.prompt)),metadataHash:j.metadataHash,generationSource:j.generationSource,generationMetadata:j.generationMetadata,preparedOriginalPrompt:j.preparedOriginalPrompt,imageSha256:sha(fs.readFileSync('static'+e.image)),generationMethod:report.method,cached:true,previousVersion:previous,
 review:{status:'accepted',sizes:['160x90','320x180'],cornerAlpha:[0,0,0,0],background:'True-alpha RGBA WebP, visually compared before/after on dark card surface.',meaning:meaning[id],simplicity:'One coherent scene. Broad silhouettes; limited flat shading, with local details exceeding strict 5–8 shape target.',userRequestedReplacement:true}});
 report.items.push({id,image:e.image,promptHash:e.promptHash,imageSha256:e.imageSha256,previousImageSha256:previous.imageSha256,bytes:fs.statSync('static'+e.image).size,meaning:meaning[id]});
}
fs.writeFileSync(mp,JSON.stringify(manifest,null,2)+'\n');
const gp='reports/illustration-generation-623-866.json',g=JSON.parse(fs.readFileSync(gp));
g.bytes=g.completed.reduce((sum,id)=>sum+fs.statSync(`static/illustrations-ai/${id}.webp`).size,0);
g.subsequentReplacements=[...new Set([...(g.subsequentReplacements??[]),'623'])];
fs.writeFileSync(gp,JSON.stringify(g,null,2)+'\n');
const vp='reports/illustration-validation-623-866.json',v=JSON.parse(fs.readFileSync(vp));
v.scope='Historical validation checkpoint before user-requested replacements of 600 and 623';
v.subsequentValidation='reports/illustration-repair-600-623.json';
fs.writeFileSync(vp,JSON.stringify(v,null,2)+'\n');
report.currentBatch623to866Bytes=g.bytes;
fs.writeFileSync('reports/illustration-repair-600-623.json',JSON.stringify(report,null,2)+'\n');
const hp='docs/ilustrace-handoff.md';let h=fs.readFileSync(hp,'utf8');
const note='## Zjednodušení ilustrací 600 a 623\n\n`600` používá běžně srozumitelný symbol: červenou značku STOP a auto zastavené před čárou. Ilustruje dohodnutý znak a jeho pochopení; nevysvětluje všechny tři Peircovy kategorie. `623` ukazuje jedinou scénu s koněm, prasetem a slepicí před stodolou, bez šipek a dalších dějových fází. Obě náhrady byly porovnány s originály při 160×90 a 320×180 px na tmavé kartě. Jsou zapnuté v kartách i galerii, 640×360 RGBA WebP, alfa všech rohů 0; velikosti 19 702 a 29 816 B. Vestavěný image_gen použil skutečnou průhlednost bez dostupného řízení rozměrů, kvality a ceny generování. Přesné prompty, původní metadata, hashe i předchozí verze zachovává manifest. Články a metadata se nemění, počet zůstává 766 ilustrovaných příspěvků. Významovou a technickou kontrolu eviduje `reports/illustration-repair-600-623.json`.\n\n';
h=h.replace('<!-- batch-623-start -->',note+'<!-- batch-623-start -->');
h=h.replace(/Celá nová dávka má [\d\s\u00a0]+ B;/,'Celá nová dávka 623–866 má po náhradě 623 '+g.bytes.toLocaleString('cs-CZ')+' B;');
h=h.replace('Ostatní přijaté ilustrace se nepřegenerovaly.','Mimo výše uvedené uživatelské náhrady se ostatní přijaté ilustrace nepřegenerovaly.');
fs.writeFileSync(hp,h);
console.log(JSON.stringify(report));
