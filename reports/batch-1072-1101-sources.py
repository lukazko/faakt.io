import json,urllib.request,concurrent.futures,re,io,ssl
from pathlib import Path
from html import unescape
from pypdf import PdfReader
root=Path(__file__).resolve().parents[1]
prefix=root/'reports/batch-1072-1101'
sources=[
 [('OpenStax: Buffers','https://openstax.org/books/chemistry-atoms-first-2e/pages/14-6-buffers'),('Purdue University: Buffer Components','https://www.purdue.edu/science/K12/LabPages/bufferspart3.html')],
 [('RSC: Chromatography','https://edu.rsc.org/resources/chromatography/11333.article'),('RSC: Teaching chromatography','https://edu.rsc.org/cpd/how-to-teach-chromatography-at-post-16/4019097.article')],
 [('Chemguide: Non-ideal mixtures','https://mail.chemguide.co.uk/physical/phaseeqia/nonideal.html'),('Lisa Nichols: Separation Theory','https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Organic_Chemistry_Lab_Techniques_(Nichols)/05%3A_Distillation/5.02%3A_Simple_Distillation/5.2B%3A_Separation_Theory')],
 [('Open University: Covalent structures','https://www.open.edu/openlearn/mod/oucontent/view.php?id=9265&section=1.4.3'),('American Ceramic Society: Building Blocks of Ceramics','https://ceramics.org/wp-content/uploads/2014/04/The-Building-Blocks-of-Ceramics-Lesson-111.pdf')],
 [('IUPAC: Vulcanization','https://goldbook.iupac.org/terms/view/VT07153'),('Penn State: Polymer lecture','https://zeus.plmsc.psu.edu/~manias/MatSE259/lecture3.pdf')],
 [('RSC: Making nylon','https://edu.rsc.org/download?ac=522709'),('Penn State: The Nylon Rope Trick','https://zeus.plmsc.psu.edu/~manias/MatSE259/lecture3.pdf')],
 [('RSC: What causes iron to rust?','https://edu.rsc.org/experiments/what-causes-iron-to-rust/434.article'),('OpenStax: Corrosion','https://openstax.org/books/chemistry-atoms-first/pages/16-6-corrosion')],
 [('RSC: Peroxide decomposition and catalysts','https://edu.rsc.org/experiments/hydrogen-peroxide-decomposition-using-different-catalysts/831.article'),('OpenStax: Catalysis','https://openstax.org/books/chemistry-2e/pages/12-7-catalysis')],
 [('UW–Madison: Chemical Cold Pack','https://demolab.chem.wisc.edu/thermochemistry-chemical-cold-pack/'),('ACS: Temperature Changes in Dissolving','https://www.acs.org/middleschoolchemistry/lessonplans/chapter5/lesson9.html')],
 [('ACS: Can Gases Dissolve in Water?','https://www.acs.org/middleschoolchemistry/lessonplans/chapter5/lesson8.html'),('University of Florida: Carbonating Beverages','https://ask.ifas.ufl.edu/publication/FS379')],
 [('Purdue University: EDTA','https://www.chem.purdue.edu/gchelp/cchem/polys.html'),('OpenStax: Coordination Chemistry','https://openstax.org/books/chemistry-2e/pages/19-2-coordination-chemistry-of-transition-metals')],
 [('RSC: Flame colours','https://edu.rsc.org/resources/flame-colours-a-demonstration/760.article'),('RSC: How to carry out flame tests','https://edu.rsc.org/infographics/how-to-carry-out-flame-tests/4024075.article')],
 [('ACS: Hall–Héroult Process','https://www.acs.org/education/whatischemistry/landmarks/aluminumprocess.html'),('Royal Society of Chemistry: Aluminium','https://www.rsc.org/periodic-table/element/13/aluminium')],
 [('Canadian Conservation Institute: Plaster of Paris','https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/care-plaster-paris.html'),('Gurgul et al.: Hemihydrate to dihydrate','https://onlinelibrary.wiley.com/doi/full/10.1107/S1600577519001929')],
 [('IFAB: Fouls and misconduct','https://www.theifab.com/laws/latest/fouls-and-misconduct/'),('FIFA: Back-pass rule','https://inside.fifa.com/news/back-pass-rule-changed-football-30-years-ago')],
 [('FIVB: The Game','https://www.fivb.com/volleyball/the-game/'),('FIVB: Basic Rules','https://www.fivb.com/volleyball/the-game/basic-rules/')],
 [('ISU: Why skaters switch lanes','https://www.isu-skating.com/en/speed-skating/news/explained-why-speed-skaters-switch-lanes/'),('ISU: Speed skating rules explained','https://beta.isu-skating.com/en/news/speed-skating-rules-explained/')],
 [('IBU: Competition formats','https://www.biathlonworld.com/discover-biathlon/how-it-works/competition-formats'),('IBU: Rules overview','https://www.biathlonworld.com/fr/discover-biathlon/how-it-works/rules-overview')],
 [('World Curling: What is curling?','https://worldcurling.org/about/curling/'),('USA Curling: Introduction','https://www.usacurling.org/intro-to-curling')],
 [('World Athletics: Decathlon','https://worldathletics.org/disciplines/combinedevents/decathlon'),('IAAF: Scoring Tables for Combined Events','https://0092469e90.clvaw-cdnwnd.com/ca11286dfd7cc4a4d81cd9baa1a60473/200000700-722d4722d7/tabela_pontos_combinadas_iaaf.pdf')],
 [('FIS: Individual competition formats','https://www.fis-ski.com/nordic-combined/news/2025-26/nordic-combined-101-individual-competition-formats'),('Milano Cortina 2026: Nordic Combined format','https://wmr-static-assets.scd.dgplatform.net/wmr/static/_PDF/OWG2026/NCB/2026-02-02/NCB-------------------------------__N02A_1.0.pdf')],
 [('World Athletics: Pole Vault','https://worldathletics.org/disciplines/field-events/pole-vault'),('Biomechanics: Stored Elastic Energy in the Bending Pole','https://www.mdpi.com/2673-7078/6/1/28')],
 [('ATP: Qualifying, a gateway to success','https://www.atptour.com/en/news/qualifying-2023-inside-the-game'),('ATP: The Competition, 2026 Rulebook','https://www.atptour.com/-/media/files/rulebook/2026/2026-rulebook-chapter-7_the-competition_25jan26.pdf')],
 [('Canadian Museum of Nordic Sport: Skate technique history','https://nordicskimuseum.sixmilesourdough.com/evolution/hidden-parent/race-technique-evolution/the-history-of-the-skate-technique/'),('Lindinger: Biomechanics in cross-country skiing','https://jyx.jyu.fi/bitstream/handle/123456789/64605/1/978-951-39-7797-9_vaitos29062019.pdf')],
 [('Cricket Australia: DLS calculation','https://mycricketsupport.cricket.com.au/hc/en-us/articles/360000922915-Using-Duckworth-Lewis-DLS-Calculation-during-match'),('ECB: Duckworth–Lewis–Stern methodology','https://resources.ecb.co.uk/ecb/document/2025/03/03/b086cf26-f1d4-4ab1-aa68-a7bcfbef32a2/Duckworth-Lewis-Stern-Methodology.pdf')],
 [('Aalto University: CinemaSense, Clapperboard','https://elokuvantaju.uiah.fi/english/study_material/production/klaffi.jsp'),('Nashville Film Institute: Clapperboard','https://www.nfi.edu/clapperboard/2/')],
 [('UCL: Image = Sound','https://www.ucl.ac.uk/mathematical-physical-sciences/image-sound-alchemy-issue-3'),('Museum of the Moving Image: Sound in Silent Cinema','https://scienceandfilm.org/articles/sound-in-silent-cinema/')],
 [('American Cinematographer: Imagining Middle-earth','https://theasc.com/article/lord-of-the-rings-fellowship-of-the-rings-vfx/'),('American Cinematographer: Peter Jackson interview','https://theasc.com/article/peter-jackson-lord-of-the-rings-interview/')],
 [('George Eastman Museum: Three-strip camera','https://www.eastman.org/technicolor/technology/three-strip-camera'),('George Eastman Museum: Dye-transfer printing','https://www.eastman.org/technicolor/technology/dye-transfer-printing')],
 [('Adobe: Jump cuts','https://www.adobe.com/uk/creativecloud/video/discover/jump-cut.html'),('Adobe: Cuts in film','https://www.adobe.com/creativecloud/video/post-production/cuts-in-film')]
]
posts=json.loads(Path(str(prefix)+'-drafts.json').read_text(encoding='utf-8'))
# After initial source selection, fetch only the current, editorially amended draft URLs.
if any(not p['sources'] for p in posts):
    for p,ss in zip(posts,sources):p['sources']=[dict(label=l,url=u) for l,u in ss]
    Path(str(prefix)+'-drafts.json').write_text(json.dumps(posts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
cache=root/'tmp/batch-1072-1101-source-cache';cache.mkdir(parents=True,exist_ok=True)
terms=['buffer','phase','azeotrop','graphite','cross','interface','rust','catal','endotherm','pressure','EDTA','flame','cryolite','hydr','1992','rally','lane','individual','sweep','progress','Gundersen','energy','lucky','skating','resources','synchron','optical','perspective','strip','jump']
def get(job):
    p,j,s=job;dest=cache/f"{p['id']}-{j}.txt"
    try:
        if dest.exists():t=dest.read_text(encoding='utf-8')
        else:
            req=urllib.request.Request(s['url'],headers={'User-Agent':'Mozilla/5.0'})
            try:
                response=urllib.request.urlopen(req,timeout=35)
            except urllib.error.URLError as e:
                if 'CERTIFICATE_VERIFY_FAILED' not in str(e):raise
                # Read-only public pages; host trust store lacks some university CA chains.
                response=urllib.request.urlopen(req,timeout=35,context=ssl._create_unverified_context())
            with response as r:data=r.read()
            if data.startswith(b'%PDF'):t=' '.join(page.extract_text() or '' for page in PdfReader(io.BytesIO(data)).pages)
            else:
                t=data.decode('utf-8',errors='replace');t=re.sub(r'<(script|style)\b[^>]*>.*?</\1>',' ',t,flags=re.S|re.I);t=unescape(re.sub('<[^>]+>',' ',t))
            t=re.sub(r'\s+',' ',t);dest.write_text(t,encoding='utf-8')
        term=terms[int(p['id'])-1072];matches=list(re.finditer(re.escape(term),t,re.I))
        return dict(id=p['id'],source=j,url=s['url'],chars=len(t),status='downloaded',excerpts=[t[max(0,m.start()-90):m.end()+450] for m in matches[:2]])
    except Exception as e:return dict(id=p['id'],source=j,url=s['url'],status='failed',error=str(e))
if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:results=list(ex.map(get,[(p,j,s) for p in posts for j,s in enumerate(p['sources'])]))
    Path(str(prefix)+'-source-fetch.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    for r in results:print(json.dumps(r,ensure_ascii=False))
