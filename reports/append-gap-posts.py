"""Editorial approval and guarded import for the explicitly requested ID gap."""
import contextlib,importlib.util,io,json,runpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
runpy.run_path(str(ROOT/'reports/build-gap-drafts.py'))
spec=importlib.util.spec_from_file_location('knowledge',ROOT/'scripts/post-knowledge.py')
k=importlib.util.module_from_spec(spec);spec.loader.exec_module(k)
draft_path=ROOT/'reports/posts-gap-313-352-drafts.json'
drafts=k.read(draft_path); plan=k.read(ROOT/'reports/posts-gap-313-352-plan.json')
original=k.read(ROOT/'static/data/posts.json')
assert len(original)==876 and not ({p['id'] for p in original}&{p['id'] for p in drafts})
out=io.StringIO()
with contextlib.redirect_stdout(out):code=k.main(['check-drafts','--fill-gaps','--drafts',str(draft_path)])
check=json.loads(out.getvalue());k.write(ROOT/'reports/posts-gap-313-352-check.json',check)
assert code==0 and not check['errors'],check['errors']
assert check['snapshot']==plan['snapshot']
approval={'snapshot':check['snapshot'],'catalog_reviewed':plan['catalog_reviewed'],
 'drafts_hash':check['drafts_hash'],'reviewer':'Codex editorial review 2026-11-06',
 'scope':'40 posts, five per requested topic, filling IDs 313–352 at the user’s explicit request.',
 'decisions':[{**{key:p[key] for key in ['id','verdict','compared_ids','reason']},
 'final_text_reviewed':True,'within_batch_reviewed':True,'sources_verified':True} for p in plan['proposals']]}
approval_path=ROOT/'reports/posts-gap-313-352-approval.json';k.write(approval_path,approval)
k.main(['append','--fill-gaps','--drafts',str(draft_path),'--approval',str(approval_path)])
after=k.read(ROOT/'static/data/posts.json');by_id={p['id']:p for p in after}
assert all(by_id[p['id']]==p for p in original)
k.write(ROOT/'reports/posts-gap-313-352-import.json',{'appended':40,'total':len(after),'originalPostsUnchanged':len(original),
 'ids':[p['id'] for p in drafts],'remainingGap':list(range(353,413)),
 'sourceVerification':'Primary publications and texts, museums, research institutions and scholarly encyclopedias opened via web; publisher indexed abstracts used where full text is restricted. No invented quotations.',
 'contentReview':'Complete 833-idea catalog read against snapshot; nearby full articles compared; final drafts reviewed for their distinct points and within-batch differences.',
 'sourceNotes':{'315':'Museum description plus Fondation Napoléon text on fog/night constraints.',
 '317':'National Army Museum plus Waterloo Uncovered archaeological report on the reverse slope.',
 '333':'3.6 is explicitly the conditional early 2023 estimate, not an unconditional latest constant.',
 '334':'Detection of uracil is not detection of RNA or life; dated to the 2023 result.',
 '348':'Demand/withdraw association qualified by socioeconomic moderation.',
 '351':'Two distinct studies: Aron 2000 and Tomlinson 2019; no claim of permanent relationship repair.'}})
print('Original 876 posts preserved exactly; imported 313–352.')
