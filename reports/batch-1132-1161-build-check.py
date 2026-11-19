import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
posts = json.loads((root / 'static/data/posts.json').read_text(encoding='utf-8'))
checked = []
for post in posts[-30:]:
    pid = post['id']
    page = root / f'build/post/{pid}/index.html'
    assert page.is_file(), pid
    assert post['title'] in page.read_text(encoding='utf-8'), pid
    source = root / f'static/illustrations-ai/{pid}.webp'
    built = root / f'build/illustrations-ai/{pid}.webp'
    assert digest(source) == digest(built), pid
    checked.append(pid)
assert (root / 'build/.nojekyll').is_file()
assert digest(root / 'static/data/posts.json') == digest(root / 'build/data/posts.json')
gallery = list((root / 'build/_app/immutable/nodes').glob('3.*.js'))
assert len(gallery) == 1
assert posts[-30]['title'] in gallery[0].read_text(encoding='utf-8')
report = root / 'reports/batch-1132-1161-final-validation.json'
result = json.loads(report.read_text(encoding='utf-8'))
result.update(build_passed=True, built_pages_and_matching_images=checked,
              built_data_matches=True, nojekyll=True,
              preview='http://127.0.0.1:5188/faakt.io/?order=id&post=1132')
report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Verified 30 built pages and matching WebP, current data, gallery and .nojekyll.')
