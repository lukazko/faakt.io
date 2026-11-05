import json,pathlib
R=pathlib.Path(__file__).resolve().parents[1]
read=lambda p:json.loads((R/p).read_text(encoding='utf-8'))
posts=read('reports/new-posts-897-926.json');plan=read('reports/new-posts-897-926-plan.json')
report='''# Redakční kontrola příspěvků 897–926

Výchozí databáze: 796 příspěvků, 753 unikátních poznatků. Celý kompaktní katalog byl přečten po stránkách 0–189, 190–379, 380–569 a 570–752; konec useknutého výstupu byl dočten samostatně (offsety 690 a 710). Plné blízké texty byly přečteny přes `show`. Průběžné lokální vyhledávání a finální kandidáty uchovávají soubory `new-posts-897-926-search.json` a `new-posts-897-926-draft-check.json`.

Při čtení 473 byla zjištěna nesprávná významová pointa: článek popisuje efekt vlastnictví, nikoli pobídky vlastnických práv. Oprava pouze významových souborů je doložena `knowledge-473-correction.json`; původní článek se nemění. Výchozí snapshot plánu byl po této opravě obnoven. Ostatní katalogové pointy zůstaly beze změny.

Všech 30 hotových textů bylo porovnáno s plánovanou pointou, celým katalogem, níže uvedenými plnými blízkými texty i mezi sebou. Výsledkem je 30 odlišných poznatků. Dvojice 900/901 se liší otázkou úplnosti fyzikálního poznání versus hodnoty života; 918/919 časovým výběrem zrakových podnětů versus audiovizuálním slučováním řeči; 911/912/913 táním kovu, rovnováhou tří fází a superkritickou extrakcí.

Každý text má dva přímé zdroje. Ověřeny byly otevřené institucionální stránky, odborné referenční texty, abstrakty původních prací a technické dokumenty; nejde o nové ověření starého obsahu. Automatické stažení dosáhlo HTTP 200 u 50 ze 60 adres, ale samo o sobě není důkazem obsahu (některé PubMed odpovědi mají ochrannou stránku). U muzejních webů omezených 403/429 byly přečteny stránky dostupné webovým nástrojem. U časopisů a některých PDF byly použity dostupné původní abstrakty a indexované pasáže. U 918 je plný Scholarpedia text dostupný ve vyhledávacím indexu, přímé stažení selhalo kvůli certifikátu. Omezení přístupu jsou zachována v `new-posts-897-926-source-access.json`.

Číselné hodnoty v 911–914 odpovídají RSC/NIST/NASA; u 923 byly navíc výslovně spočítány všechny dvojice hodů (20/36 pro A>B, B>C i C>A). Přibližné hodnoty jsou označeny jako přibližné. Myšlenkové pokusy nejsou vydávány za provedené experimenty; organické látky na Enceladu nejsou vydávány za důkaz života; rebound není označen za nevyhnutelný růst spotřeby.

| ID | Kategorie | Titulek | Přečtená blízká ID | Rozdíl |
|---|---|---|---|---|
'''
for p,proposal in zip(posts,plan['proposals']):
 report+='| '+ ' | '.join([p['id'],p['category'],p['title'],', '.join(proposal['compared_ids']+(['789'] if p['id']=='908' else [])),proposal['reason']])+' |\n'
report+='''
Ilustrace mají vlastní kontrolu a neslouží jako důkaz originality. Přesné původní a opravné prompty i významové výhrady zachovává manifest. Tři cílené opravy se týkaly 898 (zavěšený náklad), 906 (dutý pokoj místo plného odlitku) a 913 (zavádějící dojem vaření kávy). U 923 jsou kostky doprovodným motivem: dekorativní oka neznázorňují speciální očíslování z textu. QR motiv 926 není skenovatelná zpráva.

Deterministický repair byl spuštěn pouze v náhledu. Jediný návrh nové dávky mění 925 z objektu na diagram; byl odmítnut, protože zvolený hlavní motiv je fyzická metafora regulačního ventilu a současná metadata ji popisují. Žádné automatické opravy starých ilustrací nebyly aplikovány.
'''
(R/'reports/new-posts-897-926-review.md').write_text(report,encoding='utf-8')
print('Editorial review saved')
