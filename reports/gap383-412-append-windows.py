"""Run the unchanged editorial gate in staging, then transfer its verified bytes.

Windows denies os.replace on the existing posts.json in this session. Original
bytes remain in tmp/gap383-412-append/original; all input hashes are rechecked
before the first transfer. No validation or approval check is bypassed.
"""
import hashlib
import json
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[1]
stage = root/'tmp/gap383-412-append'
original = stage/'original'
original.mkdir(parents=True, exist_ok=True)
paths = ['static/data/posts.json','static/data/post-knowledge.json',
         'static/data/knowledge-ideas.json','editorial/knowledge-state.json','static/data/tags.json']
before = {}
for relative in paths:
    raw = (root/relative).read_bytes()
    before[relative] = hashlib.sha256(raw).hexdigest()
    target = stage/Path(relative).name
    target.write_bytes(raw)
    backup = original/Path(relative).name
    if backup.exists() and backup.read_bytes() != raw:
        raise RuntimeError('Preserve earlier staging originals; investigate before retrying')
    backup.write_bytes(raw)
subprocess.run(['python','scripts/post-knowledge.py',
    '--posts',str(stage/'posts.json'),'--knowledge',str(stage/'post-knowledge.json'),
    '--ideas-file',str(stage/'knowledge-ideas.json'),'--state',str(stage/'knowledge-state.json'),
    '--tags-file',str(stage/'tags.json'),
    'append','--drafts','reports/gap383-412-drafts.json','--approval','reports/gap383-412-approval.json','--fill-gaps'],cwd=root,check=True)
for relative, expected in before.items():
    if hashlib.sha256((root/relative).read_bytes()).hexdigest() != expected:
        raise RuntimeError('Input changed during staged append: '+relative)
old_posts = json.loads((original/'posts.json').read_bytes())
new_posts = json.loads((stage/'posts.json').read_bytes())
assert new_posts[:len(old_posts)] == old_posts
assert len(new_posts) == len(old_posts)+30
for relative in paths[:-1]:
    raw = (stage/Path(relative).name).read_bytes()
    with (root/relative).open('wb') as stream:
        stream.write(raw)
    assert (root/relative).read_bytes() == raw
subprocess.run(['python','scripts/post-knowledge.py','status'],cwd=root,check=True)
print('Transferred unchanged guarded append result; all 946 original article objects preserved.')
