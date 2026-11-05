import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {STYLE} from '../skills/faakt-illustrations/scripts/prompt.mjs';
const posts=JSON.parse(readFileSync('reports/new-posts-897-926.json','utf8'));
const jobs=posts.map(p=>{
 const m=p.illustration, metadata={};
 for(const key of ['concept','primary_subject','secondary_subjects','visual_keywords','composition_hints','scene_type','mood','palette']) metadata[key]=m[key];
 metadata.visual_keywords=m.visual_keywords.filter(x=>![m.primary_subject,...m.secondary_subjects].includes(x));
 const prompt=`${STYLE}\nMetadata: ${JSON.stringify(metadata)}`;
 return {id:p.id,prompt,promptHash:createHash('sha256').update(prompt).digest('hex'),metadataHash:createHash('sha256').update(JSON.stringify(m)).digest('hex'),image:`/illustrations-ai/${p.id}.webp`};
});
writeFileSync('reports/illustrations-897-926-prepared.json',JSON.stringify({cached:[],jobs},null,2)+'\n');
console.log(JSON.stringify({jobs:jobs.length}));
