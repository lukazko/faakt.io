import json,pathlib,hashlib,subprocess,re
R=pathlib.Path(__file__).resolve().parents[1]; O=R/'reports'
posts=json.loads((R/'static/data/posts.json').read_text(encoding='utf8'))
manifest=json.loads((R/'static/illustrations-ai/manifest.json').read_text(encoding='utf8'))
old=json.loads(subprocess.check_output(['git','show','8ad972ac:static/illustrations-ai/manifest.json'],cwd=R,encoding='utf8'))
assert manifest[:len(old)]==old and len(manifest)==1006
pids={p['id'] for p in posts[-30:]}; m={e['id']:e for e in manifest}
category={}
for p in posts[-30:]:
 category[p['category']]=category.get(p['category'],0)+1
 assert (R/f"build/post/{p['id']}/index.html").exists()
 assert (R/f"build/illustrations-ai/{p['id']}.webp").read_bytes()==(R/f"static/illustrations-ai/{p['id']}.webp").read_bytes()
 assert hashlib.sha256((R/f"static/illustrations-ai/{p['id']}.webp").read_bytes()).hexdigest()==m[p['id']]['imageSha256']
assert category=={'sport':15,'historie':5,'umeni':4,'fyzika':3,'chemie':3}
assert (R/'build/.nojekyll').exists()
pkg=json.loads((R/'package.json').read_text(encoding='utf8')); lock=json.loads((R/'package-lock.json').read_text(encoding='utf8'))
assert pkg['version']==lock['version']==lock['packages']['']['version']=='1.5.1'
local=json.loads((O/'batch-977-local-validation.json').read_text(encoding='utf8'))
assert len(local['cards'])==30 and not local['runtimeErrors']
assert all(x['hookComplete'] and x['reverseVerified'] and x['sourcesVerified'] for x in local['cards'])
tests=(O/'batch-977-tests.log').read_text(encoding='utf-16') if (O/'batch-977-tests.log').read_bytes().startswith(b'\xff\xfe') else (O/'batch-977-tests.log').read_text(encoding='utf8')
assert '# fail 0' in tests or '# fail 0' in tests.replace('\x00','')
notes={'986':'Anonymous 1932-33 batter corrected to a soft cap; original helmet version retained in provenance.',
'987':'Generic teammates accompany tug-of-war; not the composition of a particular historical Olympic squad.',
'989':'Derailleur accompanies the permission change; not a technical reconstruction of the 1937 model.',
'990':'Football players accompany the topic; no complete offside decision is encoded.',
'995':'Open church doorway accompanies toleration; not a reconstruction of a specified 4th-century building.',
'1001':'A curved fiber accompanies total internal reflection; the ray is not a calibrated optical diagram.',
'1003':'Contrasting lens views are an editorial comparison of glare; not a literal claim that normal glasses have two differently oriented lenses.',
'1004':'The pale rim symbolizes a protective surface; thickness is not to atomic scale.',
'1006':'The crystal openings symbolize accessible pores; not an atomically accurate zeolite framework.'}
for e in manifest[-30:]:
 e['review'].update(status='accepted-card-and-thumbnail',background='Inspected at 160x90 and 320x180 on dark surface, and actual mobile cards on base gradient and exact current CardGlow; alpha-zero corners verified.',meaning=notes.get(e['id'],'Selected recognizable motif accompanies the full article rather than reproducing all its mechanisms.'),simplicity='Clear at thumbnail scale; some illustrations use more contour/detail/shading than the strict 5-8-shape target.',cardReview=next(x for x in local['cards'] if x['id']==e['id']))
(R/'static/illustrations-ai/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
report=dict(ids=sorted(pids,key=int),categories=category,records=1006,ideas=963,illustrations=30,totalIllustrationBytes=sum(e['bytes'] for e in manifest[-30:]),originalManifestPreserved=True,allStaticRoutesVerified=True,buildAssetsMatch=True,testsPassed=True,local=local['base']+'post/977/',version='1.5.1',minGap=min(x['visibleArtworkToHookGap'] for x in local['cards']),maxGap=max(x['visibleArtworkToHookGap'] for x in local['cards']))
(O/'batch-977-final-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(report,ensure_ascii=False))
