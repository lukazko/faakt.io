import fs from 'node:fs';
import { createHash } from 'node:crypto';
const prefix='reports/batch-1042-1071';
const drafts=JSON.parse(fs.readFileSync(prefix+'-drafts.json','utf8'));
const inputs=JSON.parse(fs.readFileSync(prefix+'-images.json','utf8'));
const stats=JSON.parse(fs.readFileSync(prefix+'-art-validation.json','utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex');
const file='static/illustrations-ai/manifest.json';
const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
for(const p of drafts){
  if(manifest.some(e=>e.id===p.id))throw Error('Existing manifest entry '+p.id);
  const input=inputs.find(e=>e.id===p.id),stat=stats.find(e=>e.id===p.id);
  const prompt=input.editPrompt??input.prompt;
  const entry={id:p.id,metadata:p.illustration,image:`/illustrations-ai/${p.id}.webp`,prompt,
    promptHash:sha(prompt),metadataHash:sha(JSON.stringify(p.illustration)),generationMethod:input.generationMethod,
    imageSha256:sha(fs.readFileSync(`static/illustrations-ai/${p.id}.webp`)),source:input.source,
    review:{status:'pending-visual-review',sizes:['160x90','320x180'],alphaBounds:stat.bounds,
      background:'RGBA WebP 640x360; all four corners alpha 0; balanced fitting without visible cropping.',
      meaning:p.illustration.concept}};
  if(input.editPrompt){entry.attempts=[{source:input.previousSource,prompt:input.prompt,result:'Historical anachronism in British helmet; retained first WebP in reports.'},{source:input.source,prompt:input.editPrompt,result:'British 1914 cloth cap restored.'}];entry.replacementReason=input.replacementReason;}
  manifest.push(entry);
}
fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
const component='src/lib/components/PostIllustration.svelte';
let source=fs.readFileSync(component,'utf8');
source=source.replace('const generatedIds = new Set([','const generatedIds = new Set([\n\t\t'+drafts.map(p=>`'${p.id}'`).join(', ')+',');
fs.writeFileSync(component,source);
let review=fs.readFileSync('reports/v152-review.mjs','utf8').replaceAll('v152','batch-1042-1071').replaceAll('post/1010/','post/1056/').replaceAll('post/1007/','post/1042/');
fs.writeFileSync(prefix+'-review.mjs',review);
console.log(`Registered ${drafts.length} new assets; prior ${manifest.length-drafts.length} manifest entries preserved.`);
