from pathlib import Path
import subprocess,difflib

path='skills/faakt-illustrations/SKILL.md'
old=subprocess.check_output(['git','show','HEAD:'+path]).decode('utf-8')
current=Path(path).read_text(encoding='utf-8')
section=current[current.index('## Fallback after a provider refusal'):current.index('## Visual specification')]
new=old.replace('One call per missing post, one complete image, no contact sheets, variants or procedural SVG substitutes.','Default to one call per missing post, with the bounded refusal fallback below; one complete image per call, no contact sheets, cosmetic variants or procedural SVG substitutes.',1)
assert new!=old
assert '## Fallback after a provider refusal' not in new
new=new.replace('## Visual specification',section+'## Visual specification',1)
patch=''.join(difflib.unified_diff(old.splitlines(keepends=True),new.splitlines(keepends=True),fromfile='a/'+path,tofile='b/'+path))
subprocess.run(['git','apply','--cached','-'],input=patch.encode('utf-8'),check=True)
print('Staged only refusal fallback changes; existing next-batch edits remain in working tree.')
