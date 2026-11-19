import json,hashlib,subprocess
from pathlib import Path
pre=Path('reports/batch-1132-1161')
def read(s):return json.loads(Path(str(pre)+s).read_text(encoding='utf-8-sig'))
drafts=read('-drafts.json');outputs=read('-images.json');art=read('-art-validation.json');local=read('-local-validation.json')
assert len(local['rows'])==30 and not local['errors']
notes=[
'Chemical stick accompanies oxalate chemiluminescence; the bent outer shell is a stylized way to show activation, not a cutaway of the ampoule.',
'Burning match accompanies combustion energy balance; no claim that breaking a bond alone releases heat.',
'Bent model contains one oxygen and two hydrogens, compatible with water polarity; no CO2 dipole diagram is attempted.',
'Balance and water sample accompany the mass/amount distinction; no number claims to measure exactly one mole.',
'Labels distinguish carbon-12 and carbon-13; both contain same-looking solid graphite. First attempt had misleading differently colored liquids. First edit corrected matter but introduced an outer haze; second edit removed it. Final crisp pale silhouettes were inspected.',
'Cubic salt crystals accompany ionic conductivity; image does not claim that the solid conducts.',
'Water drop accompanies the explicit water-formation example; stoichiometric counting remains in prose.',
'Sealed brown reaction flask accompanies a stable-looking dynamic mixture, without a full equilibrium apparatus.',
'Reagent bottle accompanies acids. Corrosive pictogram indicates a possible acid hazard, not a universal hazard class for all weak or strong solutions.',
'Pouring scene accompanies mixing. Palette colors separate the streams editorially and are not literal colors of water and ethanol; no drawn final volume claims an exact contraction.',
'Pan and sliding egg accompany nonstick PTFE; motion marks indicate release, not surface energy vectors.',
'Blue solution and stopwatch accompany the clock reaction, without claiming a particular waiting time.',
'Standalone chess king accompanies stalemate, without purporting to show a complete legal pat position. Automated portrait repair was rejected because the subject is an object.',
'Opposing adjacent pawns accompany en passant; no board position or arrow purports to certify legality.',
'Shoe touches a base while glove holds the ball; this accompanies a force out rather than a complete sequence of runners.',
'Ball grazes net tape; landing area and let conditions are supplied by the text.',
'Stylized shuttlecock and court corner accompany service position; feather count and diagonal service geometry are not a technical diagram.',
'Tabletop possession arrow accompanies FIBA alternating possession; no claim about every change of ball control.',
'Bar, uprights and mat accompany countback; no exact score or jumper performance is pictured.',
'Blank scorecard, pencil and ball accompany golf handicap; no invented handicap calculation is printed.',
'Anonymous running referee extends an arm to accompany advantage; no identifiable referee or match is depicted.',
'Fencer retreats beyond the marked rear end of the piste with both shoes past it; no opponent blade touches the subject.',
'Hands share one divided coin as a metaphor for economic tax incidence, not literal statutory payment or coin destruction.',
'Lamp shared by two houses accompanies nonrival illumination; the article defines pure public goods and does not claim all local lighting services are pure.',
'Bread and blank price tag accompany the explicit model economy; no invented observed price series.',
'Spring supporting a household is an explicit cushioning metaphor, not a literal fiscal mechanism.',
'Same window scene in blue and amber frames accompanies applied film tinting, not recorded natural scene color.',
'Semicircular filter glass in ring accompanies split focus; uncovered half remains transparent and no complete depth-of-field diagram is claimed.',
'Anonymous narrator beside screen accompanies benshi performance; image does not portray a named historical star.',
'Two color clusters in one neighborhood accompany model segregation; colors do not identify actual ethnic groups and scene is not empirical evidence about a real city.'
]
mp=Path('static/illustrations-ai/manifest.json');manifest=json.loads(mp.read_text(encoding='utf-8'))
for p,note in zip(drafts,notes):
 e=next(x for x in manifest if x['id']==p['id']);o=next(x for x in outputs if x['id']==p['id']);a=next(x for x in art if x['id']==p['id']);r=next(x for x in local['rows'] if x['id']==p['id'])
 e.update(prompt=o['prompt'],promptHash=hashlib.sha256(o['prompt'].encode()).hexdigest(),source=o['path'],imageSha256=a['imageSha256'])
 e['review'].update(status='accepted',alphaBounds=a['bounds'],meaning=note,background='RGBA WebP 640x360; four corners alpha 0; base gradient and exact current CardGlow inspected at 160x90 and 320x180.',cardReview=dict(viewport='390x844',baseAndGlowInspected=True,flipped=True,completeText=True,sourcesVerifiedInCard=True,visibleGapCssPx=round(r['metrics']['visibleGap'],3)),simplicity='Recognizable thumbnail silhouettes; several assets exceed the 5–8-shape or 3-color target through shading and internal detail. No automatic claim of exact compliance.',generationLimitations='No size, quality or cost controls exposed. 30 original generations and two targeted edits to 1136; final resizing only reduces transfer/storage.')
 if o.get('previousEdit'):e['previousAttempts'].append(dict(source=o['previousEdit']['path'],prompt=o['previousEdit']['prompt'],reason='Solid graphite was corrected but translucent stray fringe remained; simplified glass to solid pale silhouettes.',savedAsset='reports/batch-1132-1161-1136-edit1.webp'))
mp.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
old=json.loads(subprocess.check_output(['git','show','HEAD:static/data/posts.json'],encoding='utf-8'));current=json.loads(Path('static/data/posts.json').read_text(encoding='utf-8'))
assert current[:len(old)]==old and len(current)==len(old)+30
gaps=[r['metrics']['visibleGap'] for r in local['rows']]
summary=dict(records=len(current),new_ids=[p['id'] for p in drafts],original_posts_preserved=True,original_count=len(old),source_links=sum(len(p['sources']) for p in drafts),art_bytes=sum(a['bytes'] for a in art),visible_gaps=[min(gaps),max(gaps)],runtime_errors=local['errors'],preview=local['base']+'post/1132/')
Path(str(pre)+'-final-validation.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False))
