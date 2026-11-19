import json,subprocess,os
from pathlib import Path
os.environ['PYTHONUTF8']='1'
pre='reports/batch-1072-1101'
def save(suffix,d):Path(pre+suffix).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
d=json.loads(Path(pre+'-drafts.json').read_text(encoding='utf-8'));p=d[1095-1072]
p['title']='Běžkař se může odrážet i bez stoupacího vosku'
p['content']='<p>Běžkař se může odrazit, aniž by mu stoupací vosk přidržel skluznici proti pohybu dozadu. Při bruslení totiž využívá jiný směr a způsob odrazu než při klasickém střídavém běhu.</p><p>Lyže klade šikmo ke směru jízdy a zatěžuje její hranu. Tlakem do strany a dozadu získává oporu ve sněhu, která umožňuje zrychlit vpřed. Hmotnost přenáší na druhou lyži a navazuje dalším skluzem; k pohonu přispívají také hole.</p><p>Proto mají bruslařské lyže skluznou plochu bez stoupací zóny potřebné pro klasický odraz. U klasických lyží přitom přilnavost nemusí zajišťovat jen vosk, ale také pás nebo jiná úprava.</p><p><strong>Opora nemusí mířit proti pohybu stejně jako krok pěšího.</strong> Bruslení přidává výraznou boční složku: pro rozbor účinného pohonu nestačí měřit jen sílu, důležitá je i orientace lyže a směr pohybu těla.</p>'
p['knowledge']=dict(idea='idea-1095',point='Bruslařská technika běhu na lyžích získává pohon šikmým odrazem z hrany a přenosem hmotnosti, takže nevyžaduje stoupací vosk jako klasický odraz.',tags=['sport','mechanics'],type='principle')
save('-drafts.json',d)
plan=json.loads(Path(pre+'-plan.json').read_text(encoding='utf-8'))
r=plan['proposals'][1095-1072];r['knowledge']=p['knowledge'];r['compared_ids']=['982','1071','411'];r['reason']='Šikmý odraz přes hranu, přenos hmotnosti a absence stoupacího vosku jsou mechanicky odlišné od návratu paží nad vodou u motýlku, aerodynamiky V-stylu i kloubu klapací brusle. Námět byl zúžen z institucionálního dělení technik, aby neopakoval pointu 982.'
save('-plan.json',plan)
result=subprocess.run(['python','scripts/post-knowledge.py','check-drafts','--drafts',pre+'-drafts.json'],capture_output=True,text=True,encoding='utf-8')
Path(pre+'-check-final.json').write_text(result.stdout,encoding='utf-8')
if result.returncode:raise RuntimeError(result.stderr or result.stdout)
print('Final revised texts checked',flush=True)
