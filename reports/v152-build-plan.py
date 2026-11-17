import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
def read(p): return json.loads((ROOT / p).read_text(encoding='utf-8'))
def write(p, data): (ROOT / p).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
rows = read('reports/v152-topics.json')
rows[28][1] = rows[28][1].replace('beztrenný', 'bez tření probíhající')
write('reports/v152-topics.json', rows)
reasons = [
 '296 vysvětluje relativistické opravy GPS a 667 měření obvodu Země ze stínů; nový text popíše historické uchování referenčního času na moři a převod rozdílu na délku.',
 '897 řeší financování kanalizace po zápachu a 530 římské nájemní domy a hasiče; zde jde o konkrétní stavební pravidla obnovy Londýna roku 1667 a mýtus o zavedení cihel.',
 '329 rozlišuje dva významy svobody a 185 univerzalizaci mravních pravidel; nový poznatek je Millovo měřítko oprávněného donucení podle újmy druhým.',
 '878 řeší odpovědnost při příčinné určenosti a 426 přetížení počtem možností; zde jde o logický problém symetrické volby už mezi dvěma shodnými alternativami.',
 '509 vysvětluje magnetický kompas při migraci; elektrické vyhledávání blízké kořisti zobákem je jiný smyslový mechanismus a funkce.',
 '903 řeší toleranci zamrznutí a 955 transport kyslíku u ledovek; vydra předchází ztrátě tepla izolací vzduchem v srsti, nikoli tolerancí ledu či krevní adaptací.',
 '252 vysvětluje název impresionismu a 470 Mondrianovu geometrickou redukci; zde je pointou práce s oddělenými barevnými body a optickým mísením.',
 '390 popisuje hlubotisk vyhlazováním zdrsněné desky a 249 kulturní vliv ukiyo-e; dřevořez nově vysvětluje opačný vztah vyřezané plochy a tisknoucího reliéfu.',
 '908 řeší selektivní zamlčení detektivního vypravěče a 592 teorii autorovy autority; zde je děj formálně ukryt v parazitním komentáři k samostatné básni, nikoli jen v nespolehlivém líčení události.',
 '338 řeší odpovědnost stvořitele za opuštěného tvora a 342 řízení lidských tužeb pro stabilitu; nový text rozebere jazyk a vzpomínání obětí systému odběrů orgánů a postupné odhalení jejich situace.',
 '793 popisuje politicky jednotný čas rozlehlé země a 842 data začátku roku; zde jde o koordinované zavedení více časových pásem železniční sítí před federálním zákonem.',
 '874 řeší plošné udělení římského občanství a 992 jeho získání službou; nově se odlišuje úřední záznam faktu narození od právního přiznání občanství.',
 '38 vysvětluje vztlak vytlačenou kapalinou a 443 hustotu vody a ledu; nový mechanismus je smáčení a kapilární zdvih proti gravitaci.',
 '1002 řeší energii přeměny skupenství a 749 izolaci kapky vrstvou páry; zde se rozlišují tři přenosové cesty a jejich omezení vakuem a odrazivými stěnami.',
 '444 řeší dráždivou reakci po narušení cibule a 824 tepelný rozklad dřeva; zde jde o reakce cukrů s aminoskupinami, nikoli jakoukoli změnu teplem.',
 '825 vysvětluje tvorbu micel a odnos mastnoty a 1006 velikostní selekci v zeolitu; nový text řeší chemické vysrážení mýdla ionty tvrdé vody.',
 '1006 vysvětluje pravidelné molekulové síto a 913 superkritickou extrakci; aktivní uhlí nově ukáže kapacitně omezené zachycení látek na povrchu, nikoli průchod podle rozměru nebo rozpouštění v CO2.',
 '292 řeší přenos momentu a vzdalování Měsíce, 836 zdánlivou velikost při zatmění; zde proměnlivý směr pohledu odhaluje část odvrácených okrajů navzdory synchronní rotaci.',
 '941 řeší výměnu drah měsíců a 288 ochranný zánik sondy; zde je novým poznatkem částicová a extrémně tenká podoba hlavních prstenců.',
 '295 řeší molekulární rozptyl na Zemi a 851 barevné osvětlení stínů; marťanský prach má jiné směrové rozptylové působení a vytváří modrou oblast právě kolem zapadajícího Slunce.',
 '40 doporučuje rozpočtové výdaje a 60 řeší dlouhodobou inflaci; nový mechanismus je omezení krátké nominální sazby a rozdíl mezi běžnou a nekonvenční měnovou stimulací.',
 '481 řeší užitek další jednotky a 752 neznámou kvalitu a nepříznivý výběr; zde rozdílné ceny stejného statku zachycují rozdílnou ochotu platit a potřebují segmentaci zákazníků.',
 '401 vyžaduje porovnání změněných scén s přerušením a 918 rychlé zpracování dvou cílů; zde může uniknout souvisle viditelný nečekaný objekt kvůli úkolu zaměřenému jinam.',
 '242 řeší změnu obsahu vzpomínky sugescí a 945 lepší uložení samostatně vytvořené odpovědi; zde se zachovaný obsah mylně připisuje vlastní tvorbě kvůli ztrátě zdroje.',
 '852 vysvětluje aliasing a 920 chemické stárnutí nosiče; zde promítací rychlost mění celé časové měřítko filmu a archiv musí respektovat proměnlivou historickou praxi.',
 '461 odděluje barvu pro klíčování a 784 rozebírá Zemanův výtvarný styl; zde malba nahrazuje část fyzického prostoru a skládá se s hranou akcí pomocí maskovaných oblastí.',
 '223 je identita komplexní exponenciály a 228 podmínka Eulerova tahu; nový vztah V-E+F=2 spočítá topologickou vlastnost povrchu konvexního mnohostěnu.',
 '405 má předem určené rovnoměrné vzorkování a 303 empirické rozdělení číslic; zde různé definice náhodné tětivy vedou k různým správným pravděpodobnostem.',
 '694 hledá nejkratší cestu v grafu a 500 odhaduje pí mnohoúhelníky; brachistochrona optimalizuje dobu dynamického sestupu mezi body a odlišuje čas od délky.',
 '799 uvolňuje nedostupné objekty a 952 pojmenovává data obsahem; wear leveling vyrovnává fyzické cykly mazání flash a omezuje předčasné opotřebení bloků.',
 '408 koordinuje potvrzení mezi účastníky a 742 odděluje relační model od fyzického uložení; WAL řeší lokální pořadí zápisu a pozdější checkpoint bez kopírování celé této koordinace.',
 '657 počítá se zbytky a 796 opravuje chybné bity; zde jsou všechny bity správné, ale číselný význam závisí na dohodnutém pořadí bajtů.',
 '947 během expozice tvoří umělý filmový prostor a 852 popisuje aliasing; cílový systém skládá časový záznam jediné čáry pro měření pořadí závodníků.',
 '988 vysvětluje brzdění samostatného badmintonového míčku a 989 povolení přehazovaček; zde proudové ovlivnění více jezdců vede k taktické spolupráci a střídání.',
 '382 rozebírá náhodné strategie jednotlivé penalty a 412 tenisový formát konce setu; nový text doloží konkrétní vznik a zavádění fotbalového rozstřelu proti dřívějšímu losování.'
]
snapshot = 'f0c60951330b0a5f53dd52bee54030fa198d9545f7464c9fa1ad86843f488478'
proposals=[]
for i,(r,reason) in enumerate(zip(rows,reasons)):
    pid=str(1007+i)
    proposals.append(dict(id=pid,category=r[0],knowledge=dict(idea='idea-'+pid,point=r[1],tags=r[3].split(','),type=r[4]),compared_ids=r[5].split(','),reason=reason,verdict='accept'))
write('reports/v152-plan.json',dict(snapshot=snapshot,catalog_reviewed=snapshot,proposals=proposals))
