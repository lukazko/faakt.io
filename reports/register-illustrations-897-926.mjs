import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(readFileSync(p,'utf8')),sha=x=>createHash('sha256').update(x).digest('hex');
const posts=read('reports/new-posts-897-926.json'),jobs=read('reports/illustrations-897-926-prepared.json').jobs;
const manifest=read('static/illustrations-ai/manifest.json');
const notes={
897:'Victorian parliament window and foul river: editorial scene, not a reconstruction of a particular sitting.',
898:'Propeller transport aircraft accompanies the airlift. Cargo is inside; the first external sling-load version was rejected.',
899:'Broken shackles symbolize the overthrow of slavery; no specific historical artefact or person is claimed.',
900:'Red tomato in a gray hand accompanies Mary’s first color experience, without claiming the whole world became colored.',
901:'Anonymous reclining capsule user illustrates the hypothetical machine, not a real device.',
902:'Leaf-shaped green sea slug accompanies kleptoplasty; internal chloroplasts are not depicted as a mechanism.',
903:'Brown masked wood frog beside ice accompanies freeze tolerance; external ice is a topic cue, not an intracellular diagram.',
904:'Hagfish with a trailing slime strand accompanies its defense; no claim about mucus exiting the mouth.',
905:'Seaweed cyanotype sheet is the depicted object; its blue rectangle is physical paper, with alpha outside it.',
906:'Solid room-shaped block with a shallow imprint accompanies Ghost; simplified interpretation, not a replica. First hollow-room image rejected.',
907:'Black page is part of the book, not an image background. The book accompanies Sterne’s typographic mourning.',
908:'Hand hiding part of a manuscript is a metaphor for omission, without revealing the detective novel’s ending.',
909:'Reduced stone allotment device with tickets; not an exact archaeological reconstruction or complete procedure.',
910:'Hands protecting a river symbolize representation and care; no literal giant hands or legal procedure is asserted.',
911:'Slumping silver cube accompanies gallium melting; the metallic silhouette is stylized, not a crystal model.',
912:'Sealed cell with ice and water accompanies triple-point metrology; clear headspace stands for vapor, not visible steam.',
913:'Standalone coffee bean accompanies caffeine extraction. First vessel resembled brewing and was replaced; no apparatus is now asserted.',
914:'Planet and retrograde arrow accompany Venus rotation. No claim about cloud-layer rotational speed.',
915:'Icy moon with south-polar jets accompanies ocean sampling; crack patterns are reduced symbols, not a mapped surface.',
916:'Turning a lamp up accompanies increased consumption after efficiency improvements; not a diagram of measured savings.',
917:'Gavel and tall bidding paddle accompany auctions; no price, guaranteed loss or measurement is shown.',
918:'Catching one card while another passes is a metaphor for temporal attention limits, not the laboratory stimulus stream.',
919:'Mouth and ear accompany speech perception; the standalone motif does not reconstruct the audiovisual illusion.',
920:'Reel and flame accompany nitrate-film vulnerability; not advice for handling a historical film.',
921:'Day scene, camera and night image symbolically contrast shooting conditions with the result; no literal instant filter conversion claimed.',
922:'Tapering horn accompanies the mathematical shape; finite artwork is not a scale representation of its infinite extension.',
923:'Three dice accompany pairwise comparisons. Their decorative pips do not depict the special numbered set supplied and verified in the text.',
924:'Wires through large magnetic rings accompany core-rope fabrication; simplified motif does not encode a specific program or bit string.',
925:'Adjustable gate and data stream are a metaphor for congestion control, not physical packet routing hardware.',
926:'Three locator squares are in the correct corners. Remaining modules are illustrative and do not encode a scannable message.'
};
for(const p of posts){
 if(manifest.some(e=>e.id===p.id)) throw Error(`Already registered ${p.id}`);
 const job=jobs.find(e=>e.id===p.id),record=read(`tmp/imagegen-batch-897/record-${p.id}.json`);
 const correctionPath=`tmp/imagegen-batch-897/correction-${p.id}.json`;
 const correction=existsSync(correctionPath)?read(correctionPath):null;
 const imageBytes=readFileSync(`static/illustrations-ai/${p.id}.webp`),source=correction?.source??record.source;
 const prompt=correction?.prompt??job.prompt;
 const {knowledge,...article}=p;
 const entry={...article,image:job.image,originalMetadata:p.illustration,metadataHash:job.metadataHash,prompt,promptHash:sha(prompt),generationSource:source,generationSourceSha256:sha(readFileSync(source)),generationMethod:'built-in image_gen; transparent_background=true; generation dimensions, quality and cost controls unavailable',cached:false,imageSha256:sha(imageBytes),bytes:imageBytes.length,review:{status:'pending-card-review',meaning:notes[p.id],sizes:['160x90','320x180'],background:'RGBA WebP, zero-alpha corners; full card review pending.'}};
 if(correction) entry.previousAttempts=[{prompt:job.prompt,promptHash:job.promptHash,generationSource:record.source,generationSourceSha256:sha(readFileSync(record.source)),imageSha256:sha(readFileSync(record.source)),status:'replaced-semantic-defect',reason:notes[p.id]}];
 manifest.push(entry);
}
writeFileSync('static/illustrations-ai/manifest.json',JSON.stringify(manifest,null,2)+'\n');
const path='src/lib/components/PostIllustration.svelte';let component=readFileSync(path,'utf8');
component=component.replace(/('896')\s*\]\);/,`$1,\n\t${posts.map(p=>`'${p.id}'`).join(', ')}\n]);`);
if(!component.includes("'926'")) throw Error('Registry insertion failed');
writeFileSync(path,component);
console.log(JSON.stringify({registered:posts.length,total:manifest.length}));
