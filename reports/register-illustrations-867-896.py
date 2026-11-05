import hashlib
import json
import re
import subprocess
from pathlib import Path
from PIL import Image

root=Path(__file__).resolve().parents[1]
def read(path): return json.loads((root/path).read_text(encoding='utf-8-sig'))
def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
posts=read('reports/new-posts-867-896.json')
jobs={x['id']:x for x in read('reports/illustrations-867-896-prepared.json')['jobs']}
sources={x['id']:x['path'] for x in read('reports/illustrations-867-896-generated.json')}
manifest_path=root/'static/illustrations-ai/manifest.json'
raw=manifest_path.read_bytes()
manifest=json.loads(raw)
assert len(manifest)==766
assert not {p['id'] for p in posts}&{x['id'] for x in manifest}
meanings={
 '867':'Anonymous ruler privately rewards one supporter; accompanies selectorate incentives, not a portrait of a specific government.',
 '868':'Exactly five voters, with the median third figure highlighted; ordinal median illustration, not a claim about real electoral outcomes. Smoke/glow removed in one targeted edit.',
 '869':'Meeting chair grips the ledger while members wait; accompanies information and organizational advantages of officials.',
 '870':'A greeting links two separate social circles; accompanies weak ties and access to different information, not a diagram of the LinkedIn experiment.',
 '871':'Hesitant person beside conflicting blank signpost; metaphor for weakened shared normative guidance, not a medical diagnosis.',
 '872':'Waiter relaxes behind a kitchen doorway; coherent backstage scene accompanying impression management.',
 '873':'Anonymous ancient debtor with open hands and broken restraint; symbolic debt release, not abolition of all slavery or a portrait of Solon.',
 '874':'Roman official hands a blank scroll to a provincial recipient; symbolic citizenship grant, not a reconstruction of the damaged surviving papyrus.',
 '875':'Chiselled-out line on a Roman inscription; remaining conventional Latin letters establish the object, not an invented historical quotation.',
 '876':'Ancient thinker reaches toward cake beside a closed study tablet; symbolic temptation versus endorsed judgement, not a historical event.',
 '877':'Flexible measuring strip bends around irregular stone; illustrates Aristotle’s analogy, using palette colors rather than a literal lead material sample.',
 '878':'Cylinder and cone share a ramp; accompanies the different internal shapes in Chrysippus’s analogy, not a physical simulation of their trajectories.',
 '879':'Mutual deliberate handshake accompanies a promise; no claim that gesture alone is Austin’s verbal act.',
 '880':'White-cane user senses a curb; accompanies practical incorporation of an accustomed tool into body schema.',
 '881':'Nuclear cluster emits three separated dots; symbolic three-proton loss, not a counted model of all nucleons or industrial gold production.',
 '882':'Two three-dot clusters with unequal mirrored traces accompany baryon/antibaryon CP asymmetry; no fabricated measurement values.',
 '883':'Crystal containing a small nuclear motif receives one violet beam; accompanies laser-driven nuclear transition, without depicting a complete feedback apparatus.',
 '884':'Person leaves a meal table for a walk; accompanies the timing intervention, without suggesting a diabetes cure.',
 '885':'Recognizable bowl of oatmeal and spoon; accompanies oat beta-glucan, not a diagram or guarantee of lipid reduction.',
 '886':'Resting person under a blanket with unlit lamp; accompanies sleep extension, without predicting individual weight loss.',
 '887':'Small directed network with highlighted route; topic accompaniment, not a numerical worked example or the full new shortest-path algorithm.',
 '888':'Two small grids meet at a highlighted cell; matrix-multiplication topic accompaniment, not a representation of the exponent proof.',
 '889':'Closed padlock integrated with a chip; accompanies computation while data remains encrypted, not a claim of security for all surrounding software.',
 '890':'Diagonally stretched skull; recognizable anamorphic motif accompanying Holbein, not a color-accurate reproduction of the painting.',
 '891':'Book, character silhouette and shared speech shape; accompanies narration adopting the character’s voice without literal quoted text.',
 '892':'Film camera and facing actors; simple filmmaking accompaniment, not a full overhead geometric proof of the 180-degree rule.',
 '893':'Single thirteen-sided hat polygon follows the CC0 outline linked by the authors. Initial nonmatching patch was rejected. The image accompanies the tile, not a proof of an infinite aperiodic tiling.',
 '894':'Dark rocky fragment with enlarged pale salt patches; topic accompaniment, not a scale-accurate microscopic Bennu sample image.',
 '895':'Hollow Roman copper-alloy dodecahedron with face holes and vertex knobs; no hypothetical function depicted as established.',
 '896':'Paired kidney silhouettes and opposing curved arrows; symbolic paired exchange, not literal anatomical movement of organs between kidneys.'
}
entries=[]
for post in posts:
    id=post['id']; job=jobs[id]; path=root/f'static/illustrations-ai/{id}.webp'
    img=Image.open(path)
    assert img.mode=='RGBA' and img.size==(640,360) and path.stat().st_size<100000
    alpha=[img.getpixel(p)[3] for p in [(0,0),(639,0),(0,359),(639,359)]]
    assert alpha==[0,0,0,0]
    prompt=job['prompt']
    item={'id':id,'title':post['title'],'content':post['content'],'category':post['category'],'image':job['image'],'originalMetadata':post['illustration'],'metadataHash':job['metadataHash'],'generationSource':sources[id],'generationSourceSha256':sha(sources[id]),'generationMethod':'built-in image_gen; transparent_background=true; generation dimensions, quality and cost controls unavailable','cached':False,'review':{'status':'accepted','sizes':['160x90','320x180'],'cornerAlpha':alpha,'background':'True-alpha RGBA WebP inspected on #0d0d0d card surface; no opaque backdrop rectangle.','meaning':meanings[id],'simplicity':'Readable editorial motif. Some outputs exceed strict flat-shape/color/shadow targets; single-tile 893 retains slight surface variation.'}}
    if id in ['868','893']:
        fix=read(f'reports/illustration-{id}-correction.json')
        original_target=root/f'reports/illustration-{id}-original.webp'
        if not original_target.exists():
            subprocess.run(['python',str(root/'skills/faakt-illustrations/scripts/fit-image.py'),'--input',fix['originalPath'],'--output',str(original_target)],check=True)
        item['preparedOriginalPrompt']=prompt
        item['previousVersion']={'image':str(original_target.relative_to(root)).replace('\\','/'),'generationSource':fix['originalPath'],'generationSourceSha256':sha(fix['originalPath']),'prompt':prompt,'promptHash':job['promptHash'],'imageSha256':sha(original_target),'review':{'status':'rejected-background' if id=='868' else 'rejected-semantics','reason':fix['reason']}}
        prompt=fix['prompt']
        item['referencedImagePaths']=['static/illustrations-ai/868.webp'] if id=='868' else [fix['reference']['local']]
        if id=='868': item['referenceImageSha256']=sha(original_target)
        else:
            item['reference']=fix['reference']|{'sha256':sha(root/fix['reference']['local'])}
            item['previousVersion']['reference']=fix['originalReference']|{'sha256':sha(root/fix['originalReference']['local'])}
    item['prompt']=prompt
    item['promptHash']=hashlib.sha256(prompt.encode()).hexdigest()
    item['imageSha256']=sha(path)
    item['bytes']=path.stat().st_size
    entries.append(item)
# Append entries without rewriting any of the original provenance objects.
end=raw.rfind(b']')
addition=json.dumps(entries,ensure_ascii=False,indent=2)[2:-2]
combined=raw[:end].rstrip()+b',\n'+addition.encode()+b'\n]\n'
assert json.loads(combined)==manifest+entries
manifest_path.write_bytes(combined)
component_path=root/'src/lib/components/PostIllustration.svelte'
component=component_path.read_text(encoding='utf-8')
match=re.search(r'const generatedIds = new Set\(\[([\s\S]*?)\]\);',component)
assert match
old_ids=set(re.findall(r"'([0-9]+)'",match.group(1)))
assert not old_ids&set(sources)
new_ids=', '.join("'"+str(i)+"'" for i in range(867,897))
component=component[:match.end(1)]+',\n\t'+new_ids+'\n'+component[match.end(1):]
component_path.write_text(component,encoding='utf-8')
final=read('static/illustrations-ai/manifest.json')
assert final[:766]==manifest
report={'ids':[x['id'] for x in entries],'count':30,'width':640,'height':360,'format':'RGBA WebP','totalBytes':sum(x['bytes'] for x in entries),'minBytes':min(x['bytes'] for x in entries),'maxBytes':max(x['bytes'] for x in entries),'cornerAlpha':'all zero','reviewSizes':['160x90','320x180'],'generationCalls':32,'corrections':['868: remove smoke/grain/glow background','893: replace incorrect patch with single reference-accurate hat polygon'],'originalManifestRecordsPreserved':766,'manifestRecords':len(final),'cardIds':len(old_ids)+30,'gallery':'manifest-driven; all new entries registered','originalManifestSha256':hashlib.sha256(raw).hexdigest(),'manifestSha256':hashlib.sha256(combined).hexdigest(),'entries':[{k:e[k] for k in ['id','bytes','promptHash','metadataHash','imageSha256','review']} for e in entries]}
(root/'reports/illustrations-867-896-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='entries'},ensure_ascii=False))
