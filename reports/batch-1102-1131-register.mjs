import fs from 'node:fs';
import { createHash } from 'node:crypto';
const prefix='reports/batch-1102-1131';
const drafts=JSON.parse(fs.readFileSync(prefix+'-drafts.json','utf8'));
const inputs=JSON.parse(fs.readFileSync(prefix+'-images.json','utf8'));
const stats=JSON.parse(fs.readFileSync(prefix+'-art-validation.json','utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex');
const file='static/illustrations-ai/manifest.json';
const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
for(const p of drafts){
 if(manifest.some(e=>e.id===p.id))throw Error('Existing manifest entry '+p.id);
 const input=inputs.find(e=>e.id===p.id),stat=stats.find(e=>e.id===p.id);
 const submittedMetadata=JSON.parse((input.originalPrompt??input.prompt).split('\nMetadata: ')[1]);
 const entry={id:p.id,metadata:p.illustration,image:`/illustrations-ai/${p.id}.webp`,prompt:input.prompt,
  promptHash:sha(input.prompt),metadataHash:sha(JSON.stringify(p.illustration)),submittedMetadata,
  generationMethod:input.generationMethod,imageSha256:sha(fs.readFileSync(`static/illustrations-ai/${p.id}.webp`)),source:input.source,
  review:{status:'pending-card-review',sizes:['160x90','320x180'],alphaBounds:stat.bounds,
   background:'RGBA WebP 640x360; four corners alpha 0; centered without cropping; base gradient and exact current CardGlow inspected.',
   meaning:p.illustration.concept}};
 if(input.originalPrompt){entry.attempts=[{source:input.previousSource,prompt:input.originalPrompt,result:input.replacementReason},{source:input.source,prompt:input.prompt,result:'Targeted correction inspected at full size; thumbnail and card review follows.'}];entry.replacementReason=input.replacementReason;}
 manifest.push(entry);
}
fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
const component='src/lib/components/PostIllustration.svelte';
let source=fs.readFileSync(component,'utf8');
source=source.replace('const generatedIds = new Set([','const generatedIds = new Set([\n\t\t'+drafts.map(p=>`'${p.id}'`).join(', ')+',');
fs.writeFileSync(component,source);
console.log(`Registered ${drafts.length} assets; preserved ${manifest.length-drafts.length} existing entries.`);
