import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(readFileSync(p,'utf8')),sha=b=>createHash('sha256').update(b).digest('hex');
const posts=read('reports/new-posts-927-956.json'),jobs=read('reports/illustrations-927-956-prepared.json').jobs;
const manifest=read('static/illustrations-ai/manifest.json');
const notes={
927:'Burst vat accompanies the brewery disaster; no reconstruction of the entire brewery or measured flood volume.',
928:'Period fishing boat accompanies the civilian victims; no precise surviving vessel is claimed.',
929:'Anonymous anxious driver accompanies the hypothetical case; no real crash, victim or legal conclusion is depicted.',
930:'Heap and isolated grain are symbolic accompaniment to vague boundaries, not a numerical threshold for heaphood.',
931:'Lifted gill cover accompanies fish respiration. This is not a flow-direction diagram or anatomical atlas.',
932:'Octopus with a cool-water cue accompanies the species research; internal RNA mechanisms are not depicted.',
933:'Metal drawing stylus touching paper accompanies silverpoint; the mark is metallic deposition, not an ink flow diagram.',
934:'Fanned painted book accompanies fore-edge painting. The tiny landscape is editorial, not a replica of a named book.',
935:'Altered page with retained word islands accompanies A Humument; abstract marks do not reproduce the original text or artwork. First gray backdrop rejected.',
936:'Box and loose booklets accompany the physical novel format; the simplified booklet count does not claim to display all 27 parts.',
937:'Transfer of one chair is a metaphor for selecting a successor, not a reconstruction of German parliamentary proceedings.',
938:'Empty parliamentary seat accompanies apportionment; the illustration does not provide a worked allocation example.',
939:'Intact glass tadpole accompanies residual stress; no claim that the illustration shows a measured stress distribution.',
940:'Spiked pool accompanies ferrofluid instability; no particle-scale diagram or magnetic field map.',
941:'Two moons and orbital arcs accompany co-orbital motion; distances and sizes are not to scale.',
942:'Mercury and Sun accompany spin-orbit resonance; the image does not claim to demonstrate the 3:2 ratio.',
943:'Bicycle under umbrella is an insurance metaphor; no universal behavioral claim about policyholders is pictured.',
944:'Sealed bids and gavel accompany the auction format; no literal bid values or dominant-strategy proof.',
945:'Completing a learning card accompanies generation at encoding; abstract writing is not a scored experimental response.',
946:'Closed book and recall card accompany retrieval practice; not a claim that merely shutting a book improves memory.',
947:'Light corridor accompanies slit-scan aesthetics; symbolic optical traces, not an exact apparatus reconstruction.',
948:'Separated animation planes accompany layered compositing; the reduced scene is not a mechanical blueprint.',
949:'Curved triangle accompanies constant width. Only its large outline matters; no counting of tiny construction marks.',
950:'Cube and compass accompany the constrained construction problem; this does not depict a successful duplication.',
951:'Sieve and data tile are a metaphor for membership filtering; not the literal implementation or a one-way physical filter.',
952:'Fingerprint on file is a metaphor for a content hash; no biometric system or guaranteed collision-free mapping is asserted.',
953:'Knotted cords accompany khipu. Reduced knot count is not an encoded historical numerical record.',
954:'Bolt between strings accompanies prepared piano; no instructions to modify an instrument without expertise.',
955:'Pale icefish accompanies hemoglobin loss; translucent color is stylized and does not show blood chemistry directly.',
956:'Reverse clock in book accompanies reversed time; no complete plot or historical scene is depicted.'
};
for(const p of posts){
 if(manifest.some(e=>e.id===p.id))throw Error(`Already registered: ${p.id}`);
 const j=jobs.find(j=>j.id===p.id),r=read(`tmp/imagegen-batch-927/record-${p.id}.json`);
 const cp=`tmp/imagegen-batch-927/correction-${p.id}.json`,c=existsSync(cp)?read(cp):null;
 const source=c?.source??r.source,prompt=c?.prompt??j.prompt,bytes=readFileSync(`static/illustrations-ai/${p.id}.webp`);
 const {knowledge,...article}=p;
 const m={...article,image:j.image,originalMetadata:p.illustration,metadataHash:j.metadataHash,prompt,promptHash:sha(prompt),generationSource:source,generationSourceSha256:sha(readFileSync(source)),generationMethod:'built-in image_gen; transparent_background=true; generation dimensions, quality and cost controls unavailable',cached:false,imageSha256:sha(bytes),bytes:bytes.length,review:{status:'pending-card-review',meaning:notes[p.id],sizes:['160x90','320x180']}};
 if(c)m.previousAttempts=[{prompt:j.prompt,promptHash:j.promptHash,generationSource:r.source,generationSourceSha256:sha(readFileSync(r.source)),status:'replaced-background-defect',reason:'Gray textured rectangle behind the actual page; transparent corners alone did not establish a transparent empty background.'}];
 manifest.push(m);
}
writeFileSync('static/illustrations-ai/manifest.json',JSON.stringify(manifest,null,2)+'\n');
const path='src/lib/components/PostIllustration.svelte';let component=readFileSync(path,'utf8');
component=component.replace(/('926')\s*\]\);/,`$1,\n\t${posts.map(p=>`'${p.id}'`).join(', ')}\n]);`);
if(!component.includes("'956'"))throw Error('Card registry insertion failed');
writeFileSync(path,component);
console.log(JSON.stringify({registered:posts.length,total:manifest.length}));
