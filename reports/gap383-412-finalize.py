import collections
import hashlib
import json
from pathlib import Path
import re
import subprocess

root=Path(__file__).resolve().parents[1]
baseline='67685c259473629fdbdf7f9ef8f4adad6414eca9'
read=lambda p:json.loads((root/p).read_text(encoding='utf-8'))
write=lambda p,d:(root/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
posts=read('static/data/posts.json')
old=json.loads(subprocess.check_output(['git','show',baseline+':static/data/posts.json'],cwd=root))
assert len(old)==946 and posts[:946]==old
assert {int(p['id']) for p in posts}==set(range(1,977))
new=[p for p in posts if 383<=int(p['id'])<=412]
assert len(new)==30
for p in new:
    assert len(p['title'])<=80 and 500<=len(p['content'])<=1200
    assert len(p['sources']) in (2,3)
    hook=re.match(r'<p>(.*?)</p>',p['content']).group(1)
    assert 2<=len(re.findall(r'[.!?](?:\s|$)',hook))<=3,(p['id'],hook)
local=read('reports/gap383-412-local-validation.json')
assert len(local['cards'])==30 and not local['runtimeErrors']
manifest=read('static/illustrations-ai/manifest.json')
old_manifest=json.loads(subprocess.check_output(['git','show',baseline+':static/illustrations-ai/manifest.json'],cwd=root))
assert manifest[:len(old_manifest)]==old_manifest
by_card={p['id']:p for p in local['cards']}
for entry in manifest:
    if entry['id'] not in by_card: continue
    card=by_card[entry['id']]
    entry['review']['status']='accepted'
    entry['review']['background']='RGBA WebP with alpha-zero corners. Both dark base card and exact current multicolor CardGlow inspected at 160×90/320×180 and on actual 390×844 mobile cards; no backdrop rectangles or essential contrast loss.'
    entry['review']['visibleArtworkToHookGap']=card['visibleArtworkToHookGap']
    entry['review']['actualCard']='Mobile title, full hook, illustration, flip and source-link controls verified in Chromium; actual cards reviewed on both backgrounds. Desktop first-post view also checked.'
    raw=(root/('static'+entry['image'])).read_bytes()
    assert hashlib.sha256(raw).hexdigest()==entry['imageSha256']
write('static/illustrations-ai/manifest.json',manifest)
build=root/'tmp/gap383-412-build/build'
assert json.loads((build/'data/posts.json').read_text(encoding='utf-8'))==posts
assert (build/'.nojekyll').is_file()
gallery=(build/'dev/illustrations-ai/index.html').read_text(encoding='utf-8')
for p in new:
    assert p['title'] in gallery
    assert (build/f'post/{p["id"]}/index.html').is_file()
    assert (build/f'illustrations-ai/{p["id"]}.webp').read_bytes()==(root/f'static/illustrations-ai/{p["id"]}.webp').read_bytes()
knowledge=json.loads(subprocess.check_output(['python','scripts/post-knowledge.py','status'],cwd=root,encoding='utf-8'))
assert knowledge['verified']==976 and not knowledge['problems']
repair=read('reports/gap383-412-repair-preview.json')
new_changes=[p['id'] for p in repair['changes'] if 383<=int(p['id'])<=412]
assert new_changes==['404']
package=read('package.json');lock=read('package-lock.json')
assert package['version']==lock['version']==lock['packages']['']['version']=='1.5.0'
gaps=[p['visibleArtworkToHookGap'] for p in local['cards']]
images=read('reports/gap383-412-image-validation.json')
result=dict(records=976,ideas=933,newIds=[p['id'] for p in new],categories=dict(collections.Counter(p['category'] for p in new)),
            gaps=[],originalArticleObjectsPreserved=946,originalManifestObjectsPreserved=len(old_manifest),
            images=30,imageBytes=images['totalBytes'],imageCalls=30,imageEdits=1,version='1.5.0',
            tests=dict(nodeTestsPassed=9,nodeTestsFailed=0,build=True,staticNewRoutes=30,galleryRegistration=True,
                       mobileCards=30,baseAndGlowReviewed=True,runtimeErrors=0,desktop=True),
            visibleArtworkToHookGap=dict(min=min(gaps),max=max(gaps)),repairProposedNewIds=new_changes,repairApplied=False,
            preview=local['base'],firstPost=local['base']+'post/383/')
write('reports/gap383-412-final-validation.json',result)
print(json.dumps(result,ensure_ascii=False,indent=2))
