import contextlib,hashlib,importlib.util,io,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('fit',ROOT/'skills/faakt-illustrations/scripts/fit-image.py')
fit=importlib.util.module_from_spec(spec);spec.loader.exec_module(fit)
cfg=json.loads((ROOT/'reports/posts-gap-image-inputs.json').read_text())
records=[json.loads(p.read_text()) for p in (ROOT/'reports').glob('gap-image-*.json')]
folder=Path(records[0]['path']).parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
targets={sha(p):str(i) for i in range(313,353) if (p:=ROOT/f'static/illustrations-ai/{i}.webp').exists()}
cache=ROOT/'tmp/gap-source-recovery';cache.mkdir(parents=True,exist_ok=True)
matched={}
for source in folder.glob('*.png'):
    dest=cache/(source.stem+'.webp')
    if not dest.exists():
        sys.argv=['fit-image.py','--input',str(source),'--output',str(dest)]
        with contextlib.redirect_stdout(io.StringIO()):fit.main()
    if (id:=targets.get(sha(dest))):
        matched[id]=str(source)
        job=next(j for j in cfg['jobs'] if j['id']==id)
        prompt=cfg['style']+'\nMetadata: '+json.dumps(job['art'],ensure_ascii=False,separators=(',',':'))
        record={'id':id,'path':str(source),'prompt':prompt,'generationMetadata':job['art'],'recovery':'Source verified by exact hash of deterministic fit output.'}
        path=ROOT/f'reports/gap-image-{id}.json'
        if path.exists():
            previous=json.loads(path.read_text())
            if previous['path']!=str(source):record['unusedRepeat']=previous
        path.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'reports/posts-gap-source-recovery.json').write_text(json.dumps(matched,indent=2)+'\n')
print('Matched sources:',sorted(matched,key=int))
