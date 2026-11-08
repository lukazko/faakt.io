"""Pracovní redakční podklady; zápis článků provádí výhradně post-knowledge append."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'reports'
SNAPSHOT = '82a7f117195b6b97913a6ce2fde39b99632c5907b5a7eaa65388b6cad698e3dd'
rows = []
def add(category, title, paragraphs, point, tags, kind, subject, concept, compared, reason, sources):
    rows.append(dict(category=category, title=title, paragraphs=paragraphs, point=point,
                     tags=tags.split(), kind=kind, subject=subject, concept=concept,
                     compared=compared.split(), reason=reason, sources=sources))

add('historie', 'Důstojník, který nikdy nežil, pomohl oklamat nacisty', [
'Britové v roce 1943 poslali k nepříteli mrtvého muže s vymyšleným životopisem. Jeho nejdůležitější zbraní nebyla pistole, ale dokumenty, které měl někdo zdánlivě náhodou objevit.',
'Operace Mincemeat měla odvést pozornost od chystaného vylodění na Sicílii. Tělo dostalo uniformu a identitu majora Williama Martina; falešné písemnosti naznačovaly útok na Řecko a Sardinii. Ponorka HMS Seraph je dopravila ke španělskému pobřeží.',
'Důvěryhodnost podporovaly i osobní drobnosti v kapsách. Plán počítal s tím, že se obsah dokumentů dostane přes Španělsko k německé rozvědce. Úspěch klamu nebyl jedinou příčinou výsledku sicilské invaze, ale ukázal sílu informace, kterou protivník pokládá za vlastní úlovek.'
], 'Operace Mincemeat podsunula roku 1943 falešné invazní plány prostřednictvím těla s vytvořenou identitou, aby odvedla německou pozornost od Sicílie.', 'military-history communication', 'event', 'wartime_document_briefcase', 'A weathered wartime briefcase with a partly visible sealed document.', '766 156', '766 řeší zachycení skutečné depeše, 156 skutečné vylodění v Normandii; zde je mechanismem cílené podstrčení falešného nálezu před invazí na Sicílii.', [
('National WWII Museum – Operation Mincemeat','https://www.nationalww2museum.org/war/articles/secret-agents-secret-armies-operation-mincemeat'),
('Royal Navy Museums – HMS Seraph','https://www.royalnavymuseums.org.uk/news/operation-mincemeat-hms-seraphs-special-operations-and-man-who-never-was')])

add('historie', 'Loď v Sutton Hoo přežila hlavně jako otisk', [
'Pod anglickou mohylou čekala loď, z níž už téměř zmizelo dřevo. Přesto archeologové dokázali rozpoznat její tvar: zůstaly železné spoje a stopa trupu v půdě.',
'Výzkum mohyly v Sutton Hoo v roce 1939 odhalil asi 27 metrů dlouhé plavidlo s neporušenou pohřební výbavou. Pohřebiště pochází z raného středověku a bohatství předmětů ukazuje na člověka mimořádného postavení.',
'Jméno pohřbeného ovšem neznáme. Často navrhovaný král Rædwald zůstává hypotézou, nikoli přečteným podpisem na hrobě. Nález tak současně ukazuje dvě stránky archeologie: z nepatrných hmotných stop lze obnovit velkou konstrukci, ale ani množství pokladů nemusí prozradit majitele.'
], 'Sutton Hoo uchovalo tvar raně středověké pohřební lodi v půdě a železných spojích, ale bohatá výbava sama neurčuje totožnost pohřbeného.', 'archaeology medieval-history knowledge-evidence', 'discovery', 'buried_ship_impression', 'A long boat-shaped hollow in sandy earth with a few visible iron rivets.', '39 895', '39 pojednává o identifikované egyptské hrobce, 895 o neznámé funkci předmětů; zde se rekonstruuje zaniklé plavidlo a odděluje identita pohřbeného od fyzického nálezu.', [
('Suffolk Heritage Explorer – Sutton Hoo','https://heritage.suffolk.gov.uk/Designation/DSF16027'),
('Valerie Fenwick – Sutton Hoo: Re-imaging the Ship and Chamber','https://doi.org/10.1017/S0003581523000021')])

add('filozofie', 'Podle Aristotela se charakter také cvičí', [
'Znát definici odvahy ještě neznamená jednat odvážně. Aristotelés proto přirovnává utváření charakteru k řemeslu, které se člověk nenaučí pouze posloucháním výkladu.',
'Ve druhé knize Etiky Níkomachovy tvrdí, že mravní ctnosti získáváme opakovaným jednáním. Stavitelem se stáváme stavěním; podobně naše rozhodnutí postupně vytvářejí dispozici jednat spravedlivě nebo nespravedlivě.',
'Nejde však jen o mechanické opakování pohybu. Ctnostný člověk má vědět, co dělá, volit čin pro něj samotný a jednat ze stálého charakteru. Výcvik zahrnuje i to, z čeho se těšíme a co nás odpuzuje. Etika je v tomto pojetí proměna vlastních návyků a úsudku, nikoli sbírka správných odpovědí u zkoušky.'
], 'Aristotelés vysvětluje vznik mravních ctností opakovaným vědomě voleným jednáním, které utváří stálé dispozice i vztah k potěšení a bolesti.', 'ancient-philosophy ethics aristotle', 'theory', 'apprentice_shaping_clay', 'An anonymous ancient apprentice carefully shaping a single clay vessel by hand.', '17 169 876', '17 definuje přiměřený střed, 169 nápravu přirozenosti v čínské tradici, 876 akrasii; zde je hlavním poznatkem Aristotelův vznik hexis praxí, včetně podmínek vědomé volby.', [
('Aristotelés – Etika Níkomachova, kniha II','https://classics.mit.edu/Aristotle/nicomachaen.2.ii.html'),
('Stanford Encyclopedia – Aristotle’s Ethics','https://plato.stanford.edu/entries/aristotle-ethics/')])

add('filozofie', 'Nekonečno, které nikdy nemusí být hotové', [
'Můžeš stále půlit úsečku, aniž bys někdy držel všechny výsledky najednou. Právě takové rozlišení pomáhalo Aristotelovi mluvit o nekonečnu bez představy nekonečně velké hotové věci.',
'Ve Fyzice odlišuje nekonečno potenciální od aktuálního. Při dělení je vždy možné pokračovat, ale každý uskutečněný počet kroků zůstává konečný. Nejde o mimořádně dlouhý seznam, který bychom nakonec dokončili.',
'Toto pojetí není totožné s dnešní matematikou nekonečných množin. Zajímá je jiná otázka: znamená neomezená možnost pokračovat totéž jako současná existence dokončeného nekonečného celku? Rozdíl mezi procesem bez posledního kroku a hotovým souhrnem je důležitější než jakékoli obrovské číslo.'
], 'Aristotelovo potenciální nekonečno označuje neomezenou možnost pokračovat například v dělení, nikoli dokončený nekonečný souhrn všech kroků.', 'ancient-philosophy metaphysics aristotle limits', 'theory', 'repeatedly_folded_strip', 'A single strip with successively halved sections suggesting continued division.', '76 229 964', '76 řeší paradox dokončení pohybu, 229 velikosti množin, 964 obecně schopnost a uskutečnění; zde je samostatným předmětem status potenciálního nekonečna.', [
('Aristotelés – Fyzika, kniha III','https://classics.mit.edu/Aristotle/physics.3.iii.html'),
('Stanford Encyclopedia – Infinity','https://plato.stanford.edu/entries/infinity/')])

add('biologie', 'Chobotnici barví krev měď, ne železo', [
'Krev nemusí být červená, aby rozvážela kyslík. Chobotnice k tomu používají jinou bílkovinu než člověk a její okysličená podoba má modrou barvu.',
'V lidském hemoglobinu se na vazbě kyslíku podílí železo. U chobotnic tuto práci vykonává hemocyanin s mědí. Je rozpuštěný v krevní tekutině, místo aby byl zabalen v červených krvinkách jako lidský hemoglobin.',
'Modrá tedy není nátěr ani důkaz, že chobotnici chybí kyslík. Vzniká naopak při jeho navázání na měďnaté centrum bílkoviny; bez kyslíku je hemocyanin bezbarvý. Stejnou základní úlohu může evoluce vyřešit odlišnou molekulární výbavou, a tím změnit i tak samozřejmou vlastnost, jako je barva krve.'
], 'Okysličený hemocyanin s mědí dává krvi chobotnic modrou barvu a přenáší kyslík rozpuštěný v krevní tekutině místo lidského hemoglobinu v krvinkách.', 'zoology chemistry patterns', 'principle', 'octopus_blue_drop', 'A simple octopus silhouette beside one large blue drop, no anatomy diagram.', '152 448', '152 vysvětluje rozdělení práce tří srdcí, 448 optiku modrých žil; nový text vysvětluje chemii skutečně modré okysličené krve.', [
('EMBL-EBI – Hemocyanin a modrá krev','https://www.ebi.ac.uk/pdbe/articles/what-do-snails-spiders-octopods-and-queen-england-have-common'),
('Smithsonian Ocean – Cephalopods','https://ocean.si.edu/ocean-life/invertebrates/octopuses-squids-and-relatives')])

add('biologie', 'Bakterie poznají, že už nejsou samy', [
'Jedna bakterie může vypouštět chemický signál, který se v okolí téměř ztratí. Když stejnou látku uvolňuje mnoho sousedů, její koncentrace může spustit společnou změnu chování.',
'Tomuto způsobu regulace se říká quorum sensing. Buňky vytvářejí a zachycují signální molekuly zvané autoinduktory. Při vhodné koncentraci mění aktivitu genů; podle druhu se tak koordinuje například světélkování nebo tvorba biofilmu.',
'Bakterie ovšem nesčítají sousedy jako lidé na schůzi. Měří chemické okolí, které ovlivňuje také proudění, prostor a únik signálu. Nejde ani o vědomou domluvu. Z jednoduchého propojení výroby signálu a reakce na něj přesto vzniká činnost, která dává větší smysl teprve celé skupině.'
], 'Quorum sensing koordinuje bakteriální genovou aktivitu prostřednictvím koncentrace uvolňovaných signálů, kterou kromě hustoty buněk ovlivňuje také prostředí.', 'microbiology communication cooperation', 'principle', 'signaling_bacterial_cluster', 'A compact group of three large bacterial cells surrounded by a few shared signaling dots.', '633 691', '633 popisuje reakci vytvářející světlo a 691 optimalizaci sítě slizovkou; zde je mechanismem chemická regulace genů v bakteriální populaci.', [
('American Society for Microbiology – How Quorum Sensing Works','https://asm.org/articles/2020/june/how-quorum-sensing-works'),
('Mehta a kol. – Information processing in bacterial quorum sensing','https://arxiv.org/abs/0905.4092')])

add('umeni', 'Socha vznikne v místě, odkud zmizel vosk', [
'Aby vznikla bronzová soška, může být nejprve nutné zničit její voskovou podobu. Metoda ztraceného vosku využívá prázdné místo, které po modelu zůstane ve formě.',
'Voskový model se opatří kanálky a obalí žáruvzdornou hmotou. Zahřátí vosk odstraní a do vzniklé dutiny se nalije roztavený kov. Další kanálky umožňují uniknout vzduchu; po vychladnutí se forma rozbije a odlitek opracuje.',
'U přímého postupu je původní voskový model nenávratně pryč i tehdy, když se lití nezdaří. Nepřímý postup proto nejprve sejme formu z původního modelu a vytváří voskové kopie. Není to rozdíl mezi ruční a strojovou tvorbou, ale mezi jednorázovým riskováním originálu a možností připravit další odlitek.'
], 'Lití na ztracený vosk nahrazuje odstraněný voskový model kovem v žáruvzdorné formě; nepřímý postup zachovává původní model pomocí voskových kopií.', 'sculpture materials preservation', 'principle', 'bronze_figurine_cast', 'A simple bronze figurine emerging from two halves of a broken clay casting shell.', '463 906', '463 je opracování mramoru, 906 pozitivní odlitek dutiny místnosti; nový text vysvětluje nahrazení vosku kovem a rozdíl přímé a nepřímé metody.', [
('Victoria and Albert Museum – Metalworking techniques','https://www.vam.ac.uk/articles/metalworking-techniques'),
('The Met – Direct versus Indirect Casting','https://www.metmuseum.org/essays/direct-versus-indirect-casting-of-small-bronzes-in-the-italian-renaissance')])

add('umeni', 'Mezzotinta kreslí světlo ubíráním drsnosti', [
'Grafik může začít deskou, která by vytiskla téměř samou čerň. Obraz pak nevytváří přidáváním tmavých čar, ale postupným otevíráním světla.',
'Při mezzotintě se kovová deska nejprve celoplošně zdrsní nástrojem zvaným skobla. Drobné nerovnosti zadržují tiskovou barvu. Škrabkou a hladítkem se potom vybrané plochy zjemňují: čím hladší povrch, tím méně barvy podrží a tím světleji se vytiskne.',
'Jde o tisk z hloubky, nikoli o bílou kresbu přímo na černém papíře. Změna drsnosti umožňuje měkké přechody a hluboké tmavé tóny. Proces obrací obvyklou představu kreslení: místo postupného zatemňování čisté plochy se z předem připravené tmy dobývá podoba motivu.'
], 'Mezzotinta získává světlé tóny vyhlazováním celoplošně zdrsněné kovové desky, protože hladší místa při hlubotisku zadrží méně barvy.', 'painting materials patterns', 'principle', 'mezzotint_plate_and_burnisher', 'A hand burnishing a bright oval into a dark copper printing plate.', '933 905', '933 zanechává kovovou stopu stříbrnou špičkou, 905 využívá světlocitlivý papír; zde určuje tón množství barvy zachycené zdrsněnou deskou.', [
('Escher in The Palace – Mezzotint','https://www.escherinhetpaleis.nl/en/about-escher/techniques/mezzotint'),
('National Portrait Gallery – Mezzotint','https://www.npg.org.uk/collections/explore/glossary-of-art-terms/mezzotint.php')])

add('literatura', 'Jedno slovo může do haiku přivést celé roční období', [
'Krátká báseň nemusí napsat, že je jaro, aby je čtenář ucítil. V tradičním haiku může podobnou práci odvést jediný květ nebo jiný kulturně známý sezónní motiv.',
'Takovému slovu či spojení se říká kigo. Nejde jen o údaj v kalendáři: sezónní výraz může nést vzpomínky, zvyky a ozvěny starších básní. Sbírky zvané saijiki tyto výrazy uspořádávají a doprovázejí příklady.',
'Vazba na období ovšem není všude samozřejmá. Stejná rostlina může v jiné zemi kvést jindy a překlad nemusí vyvolat totožné asociace. Existují také haiku bez kigo. V tradiční podobě však sezónní slovo ukazuje, jak lze na několika řádcích otevřít mnohem větší prostor, než kolik dovoluje jejich prostá délka.'
], 'Kigo v tradičním haiku ukotvuje báseň v ročním období a aktivuje sdílené kulturní asociace, které se mezi jazyky a místy nemusejí přenést beze změny.', 'literature communication patterns', 'principle', 'single_cherry_blossom_branch', 'A short cherry branch bearing one prominent pale blossom.', '587 689', '587 řeší zaměření na formu sdělení a 689 tvorbu omezením; zde je novým poznatkem sezónní a kulturní funkce kigo, nikoli počet slabik či obecná stručnost.', [
('The Haiku Foundation – What is a Kigo?','https://thehaikufoundation.org/new-to-haiku-what-is-a-kigo/'),
('Yuki Teikei Haiku Society – Season Word List','https://yths.org/season-word-list/')])

add('literatura', 'Román, který ti stále bere rozečtenou knihu', [
'Začneš číst příběh, ale místo pokračování dostaneš začátek jiného. Calvino z této čtenářské frustrace udělal samotný motor románu Když jedné zimní noci cestující.',
'Kniha staví do středu Čtenáře a jeho snahu dopátrat se pokračování rozečteného textu. Cesta za chybějícími částmi jej vede přes další příběhy, vydavatelské zmatky a překlady. Touha dočíst se tak mění v děj, který sám sleduješ.',
'Úvod navíc oslovuje čtenáře přímo, takže hranice mezi člověkem s knihou v ruce a postavou nazvanou Čtenář záměrně znejistí. Nejde o příručku náhodného pořadí kapitol. Calvino ukazuje, že očekávání další stránky není pouhým vedlejším účinkem vyprávění: může být jeho hlavním tématem i zdrojem napětí.'
], 'Calvinův román Když jedné zimní noci cestující mění přerušované čtení a touhu po pokračování v příběh samotného Čtenáře.', 'narratology literature perceived-reality', 'work', 'reader_with_interrupted_book', 'An anonymous reader holding an open book with a conspicuous gap between two blocks of pages.', '936 686', '936 modeluje paměť volným pořadím samostatných částí, 686 úplnost kombinací knih; zde je tématem vyprávěná honba za přerušeným pokračováním a oslovení Čtenáře.', [
('Penguin Random House – If on a Winter’s Night a Traveler','https://www.penguinrandomhouse.com/books/23123/if-on-a-winters-night-a-traveler-by-italo-calvino-translated-by-william-weaver-introduction-by-peter-washington/'),
('Italo Calvino – autorizovaná ukázka románu','https://cdn.penguin.co.uk/dam-assets/books/9780099430896/9780099430896-sample.pdf')])

add('politika', 'Proč obviněný nemusí dokazovat svou nevinu', [
'Podezření může být vážné, a přesto ještě není rozsudkem. Presumpce neviny brání tomu, aby se z obvinění samočinně stal důkaz viny.',
'Článek 6 Evropské úmluvy o lidských právech přiznává obviněnému právo být považován za nevinného, dokud vina není prokázána zákonným způsobem. Důkazní břemeno přitom v zásadě nese obžaloba a pochybnosti mají prospět obviněnému.',
'Pravidlo neříká, že se vyšetřovaná událost nestala. Určuje, kdo musí co prokázat a jak mají státní orgány s člověkem zacházet před konečným rozhodnutím. Význam má proto i způsob, jakým úřady o neuzavřeném případu mluví. Spravedlivé řízení nezačíná až čtením rozsudku; potřebuje otevřenou otázku viny už během dokazování.'
], 'Presumpce neviny podle článku 6 Evropské úmluvy chrání obviněného před předčasným přisouzením viny a v zásadě ukládá její prokázání obžalobě.', 'law human-rights fairness', 'principle', 'unresolved_justice_scales', 'Balanced justice scales with two empty pans, a restrained legal symbol.', '284 260', '284 je osobní odpovědnost za mezinárodní zločiny, 260 obecná deklarace práv; zde je konkrétní procesní rozdělení důkazního břemene před odsouzením.', [
('Rada Evropy – Right to a fair trial','https://www.coe.int/en/web/human-rights-convention/justice'),
('Evropský soud pro lidská práva – Guide on Article 6','https://ks.echr.coe.int/documents/d/echr-ks/guide_art_6_criminal_eng')])

add('politika', 'Kdy má rozhodnout obec a kdy celá Unie', [
'Rozhodovat co nejblíž lidem zní jednoduše, dokud problém nepřekročí hranice. Znečištěná řeka ani přeshraniční emise se nemusí zastavit tam, kde končí pravomoc jedné obce.',
'Zásada subsidiarity v Evropské unii řeší, na jaké úrovni má být určitý cíl prosazován. V oblastech mimo výlučnou pravomoc Unie má její zásah přijít tehdy, když členské státy cíle dostatečně nedosáhnou a unijní úroveň jej může vzhledem k rozsahu či účinkům lépe zajistit.',
'Není to tedy prostý příkaz vždy zvolit nejnižší patro správy. Vyžaduje srovnání schopností jednotlivých úrovní a zdůvodnění společného zásahu. Jinou otázku řeší proporcionalita: zda zvolený prostředek nepřesahuje to, co je k dosažení cíle potřeba.'
], 'Subsidiarita v EU mimo výlučné pravomoci podmiňuje unijní zásah nedostatečností řešení členskými státy a lepší dosažitelností cíle na unijní úrovni.', 'institutions political-science cooperation', 'principle', 'nested_civic_buildings', 'A small town hall sheltered within the outline of a larger shared civic building.', '287 665', '287 rozděluje druhy státní moci, 665 je historická integrace uhlí a oceli; zde jde o test vhodné úrovně výkonu nevýlučné pravomoci.', [
('EUR-Lex – The principle of subsidiarity','https://eur-lex.europa.eu/EN/legal-content/summary/the-principle-of-subsidiarity.html'),
('Smlouva o Evropské unii – článek 5','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:12016M005')])

add('fyzika', 'Voda může být pod nulou a stále kapalná', [
'Nula na teploměru není kouzelné tlačítko, které každou kapku okamžitě promění v led. V mracích se běžně vyskytují kapky kapalné vody i při teplotách pod bodem mrazu.',
'Jde o podchlazenou vodu. K začátku krystalizace pomáhá vznik zárodku ledu, takže samotná vhodná teplota nemusí stačit k okamžité změně skupenství. Po spuštění krystalizace může kapalná voda přejít v led velmi rychle.',
'Takové kapky mají význam při námraze letadel. Za určitých podmínek se také podílejí na vzniku děr v oblačné vrstvě: vzniklé ledové krystalky rostou na úkor okolních kapek. Teplota tedy popisuje podmínky, ale skutečný stav látky může záviset také na tom, zda se už našel způsob, jak novou strukturu založit.'
], 'Podchlazená voda zůstává kapalná pod bodem mrazu, dokud nezačne krystalizace; její přítomnost v oblacích je důležitá i pro vznik námrazy.', 'thermodynamics materials', 'principle', 'supercooled_cloud_droplet', 'One large water droplet containing the first small ice crystal.', '912 443', '912 je rovnováha tří fází a 443 hustota vody a ledu; zde jde o metastabilní kapalinu a spuštění krystalizace.', [
('NOAA NESDIS – Fallstreak Clouds','https://www.nesdis.noaa.gov/fallstreak-clouds'),
('National Weather Service – Aircraft Icing','https://www.weather.gov/source/zhu/ZHU_Training_Page/icing_stuff/icing/icing.htm')])

add('fyzika', 'Staré okno nestéká po staletí dolů', [
'Některá stará okenní skla mají nestejnou tloušťku. Svádí to k příběhu, že se pevná tabule po stovky let pomalu slévá k dolnímu okraji.',
'Tato oblíbená představa neodpovídá chování běžného skla za pokojové teploty. Sklo je amorfní pevná látka: jeho atomy netvoří pravidelnou krystalovou mřížku, ale to z něj nedělá tekutinu, která v historickém okně znatelně teče.',
'Nestejnoměrnost starých tabulí souvisí s jejich výrobou, nikoli s několika staletími gravitačního toku. Zásadně jiné chování přichází při silném zahřátí, kdy viskozita výrazně klesá a sklo lze tvarovat. Neuspořádaná vnitřní struktura a každodenní tekutost jsou dvě odlišné vlastnosti, které lidový výklad zaměnil.'
], 'Běžné okenní sklo je za pokojové teploty amorfní pevná látka a nerovnoměrná tloušťka historických tabulí nedokládá jejich stékání během staletí.', 'materials chemistry knowledge-evidence', 'principle', 'uneven_historic_glass_pane', 'A single old window pane with an uneven edge, no dripping glass.', '911 939', '911 je tání galia a 939 vnitřní pnutí skla; zde se opravuje záměna amorfní struktury s tokem historického okna.', [
('Corning Museum of Glass – Does glass continue to flow?','https://info.cmog.org/node/631'),
('CORDIS – Is glass really a slow-moving liquid?','https://cordis.europa.eu/article/id/435748-is-glass-really-a-slow-moving-liquid')])

add('astronomie', 'Io hřeje gravitační mačkání', [
'Daleko od Slunce existuje měsíc posetý aktivními sopkami. Jupiterův Io ukazuje, že výrazné vnitřní teplo nemusí pocházet jen ze slunečních paprsků nebo radioaktivního rozpadu.',
'Jupiter na různá místa měsíce působí různě silnou gravitací. Io navíc obíhá po mírně protáhlé dráze, jejíž podobu pomáhají udržovat gravitační vazby s dalšími měsíci. Slapové deformace se během oběhu mění a jejich energie se uvnitř mění v teplo.',
'Výsledkem je mimořádně intenzivní vulkanismus. Nejde o tření měsíce o okolní plyn ani o přímé zahřívání povrchu Jupiterem. Energie pochází z dynamiky gravitačně propojené soustavy. I na vzdáleném světě tak může být rozhodující to, jak jej jeho sousedé neustále natahují a stlačují.'
], 'Proměnlivé slapové deformace Io při oběhu v gravitačně vázané soustavě Jupiterových měsíců přeměňují mechanickou energii na teplo pohánějící vulkanismus.', 'solar-system mechanics jupiter', 'principle', 'volcanic_io', 'A simple ochre moon with one broad bright volcanic plume.', '292 915', '292 řeší přenos momentu a vzdalování Měsíce, 915 vzorkování oceánu Enceladu; zde je mechanismem disipace slapových deformací pohánějící sopky Io.', [
('NASA – Juno Takes Temperature of Io','https://www.nasa.gov/missions/juno/nasas-juno-takes-temperature-of-jupiters-fiery-moon-io/'),
('NASA Science – Io','https://science.nasa.gov/jupiter/jupiter-moons/io/')])

add('astronomie', 'Příliš blízko planety se měsíc nemusí udržet', [
'Gravitace planety dokáže měsíc držet na dráze, ale může jej také roztrhat. Rozhoduje rozdíl mezi přitažlivostí na jeho přivrácené a odvrácené straně.',
'Rocheova mez označuje hranici, uvnitř níž mohou slapové síly překonat vlastní gravitaci tělesa. Není to pro všechna tělesa stejná vzdálenost: záleží například na hustotě a na tom, zda celek drží hlavně gravitací, nebo i pevností materiálu.',
'Tento princip pomáhá rozumět planetárním prstencům, jejichž částice se v blízkosti planety obtížně skládají ve velký měsíc. Neznamená však, že se každý pevný kámen po překročení jedné čáry okamžitě rozpadne. Hranice porovnává konkrétní síly a vlastnosti tělesa, nikoli jen kilometry od povrchu.'
], 'Rocheova mez porovnává slapové působení planety s gravitací držící těleso pohromadě a závisí na jeho hustotě i významu materiálové pevnosti.', 'solar-system mechanics limits', 'principle', 'tidally_disrupting_moon', 'A small loosely bound moon stretched into a short arc beside a larger planet.', '554 941', '554 popisuje protažení u černé díry, 941 výměnu drah měsíců; zde jde o mez rozpadu gravitačně vázaného satelitu a nemožnost snadného shlukování prstence.', [
('NASA Cassini – FAQ: Roche limit','https://science.nasa.gov/mission/cassini/faq/'),
('OpenStax Astronomy – Planetary Rings','https://openstax.org/books/astronomy-2e/pages/12-5-planetary-rings')])

add('ekonomie', 'Levnější rýže nemusí znamenat víc snědené rýže', [
'Když zlevní základní jídlo, může ho chudá domácnost začít kupovat méně. Na první pohled to popírá zákon poptávky, ale klíčem je změna toho, co si rodina může celkově dovolit.',
'Giffenův statek je takový podřadný statek, u něhož důchodový účinek změny ceny převáží účinek substituční. Zlevnění hlavní potraviny uvolní tolik rozpočtu, že domácnost může část této potraviny nahradit chutnějším jídlem.',
'Jensen a Miller zkoumali tento jev dotováním cen základních potravin v Číně a našli silný doklad u rýže v provincii Chu-nan. Neplatí to pro každé levné zboží ani pro všechny chudé lidi. Výsledek závisí na tom, jak blízko existenčnímu minimu rodina je a jak velkou část jejího jídelníčku a rozpočtu základní potravina tvoří.'
], 'U Giffenova statku může zlevnění snížit poptávané množství, pokud u velmi omezeného rozpočtu převáží důchodový účinek nad substitucí.', 'microeconomics resources decision-making', 'principle', 'rice_bowl_and_small_meal', 'A large plain rice bowl beside a much smaller appetizing dish, one coherent table scene.', '481 709', '481 řeší mezní užitek, 709 statusovou drahou spotřebu; zde roste poptávka s cenou kvůli rozpočtovému omezení, nikoli kvůli prestiži.', [
('Jensen a Miller – Giffen Behavior: Theory and Evidence','https://www.nber.org/papers/w13243'),
('American Economic Review – Giffen Behavior and Subsistence Consumption','https://www.aeaweb.org/articles?id=10.1257/aer.98.4.1553')])

add('ekonomie', 'Tři měnová přání, která nelze splnit současně', [
'Pevný kurz, volný pohyb kapitálu a vlastní úroková politika vypadají jako lákavá kombinace. Měnové trilema vysvětluje, proč je země nemůže mít všechny naplno současně.',
'Pokud mohou peníze volně překračovat hranice, rozdílné úročení vytváří tlak na jejich přesun. Centrální banka, která zároveň brání pevný kurz, pak nemůže libovolně měnit sazby podle domácích potřeb, aniž by narazila na pohyb kapitálu a tlak na měnu.',
'Možnosti se proto skládají do různých dvojic: pohyblivý kurz může uvolnit prostor vlastní politice, omezení kapitálu zase může chránit pevný kurz s větší autonomií. Reálná uspořádání bývají smíšená, ale nezruší samotné napětí. Stabilita jedné veličiny může být zaplacena ztrátou volnosti v jiné.'
], 'Měnové trilema říká, že nelze současně plně udržovat pevný kurz, volný pohyb kapitálu a nezávislou měnovou politiku.', 'macroeconomics finance limits', 'theory', 'three_way_currency_balance', 'A triangular balance with a coin at each corner and one corner visibly lifted.', '141 479', '141 je konkrétní historické uspořádání Bretton Woods, 479 změna očekávání při politice; zde je vysvětlen konflikt tří měnových cílů.', [
('IMF Finance & Development – The impossible trinity','https://www.imf.org/external/pubs/ft/fandd/2015/06/people.htm'),
('Economic Report of the President 2007 – The Impossible Trinity','https://www.govinfo.gov/content/pkg/ERP-2007/pdf/ERP-2007.pdf')])

add('psychologie', 'Velká změna v obraze může projít bez povšimnutí', [
'Na fotografii se opakovaně mění výrazný předmět, ale ty změnu dlouho nevidíš. Stačí mezi dvě verze vložit krátkou prázdnou plochu a překvapivě těžký úkol je na světě.',
'Rensink, O’Regan a Clark tak zkoumali slepotu ke změně. Přerušení potlačí místní pohybový signál, který by jinak přitáhl pozornost. Pozorovatel pak musí změnu aktivně hledat; slovní vodítko o jejím umístění hledání výrazně usnadňuje.',
'Nejde o důkaz, že oko změněný předmět nedokáže rozlišit. Problém spočívá v zachycení rozdílu mezi dvěma okamžiky. Náš dojem úplného detailního obrazu okolí je štědřejší než skutečná schopnost všechny detaily průběžně porovnávat. Dívat se na scénu proto ještě neznamená mít pod kontrolou každou její změnu.'
], 'Krátké přerušení mezi verzemi scény může skrýt i velkou změnu potlačením místních pohybových vodítek; cílená pozornost její rozpoznání usnadňuje.', 'perception knowledge-evidence', 'discovery', 'changing_room_picture', 'Two nearly identical simple room pictures with a large chair missing in one, separated by a pale gap.', '918 714', '918 řeší krátké časové okno zpracování druhého cíle a 714 výběr zvukového kanálu; zde je přehlédnuté porovnání změn mezi obrazy scény.', [
('Rensink – The Need for Attention to See Change','https://www2.psych.ubc.ca/~rensink/flicker/index.html'),
('Psychological Science – To See or not to See','https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.1997.tb00427.x/')])

add('psychologie', 'Slovo znáš, ale jeho zvuk se ne a ne vybavit', [
'Víš, koho máš na mysli, a jeho jméno bys poznal okamžitě. Přesto je nedokážeš vyslovit a máš jen nepříjemný pocit, že je máš na jazyku.',
'Psychologie tento stav označuje jako fenomén špičky jazyka. Vybavení není vše, nebo nic: význam a související informace mohou být dostupné, zatímco přesná slovní podoba se dočasně nedaří vyvolat. Někdy si člověk vybaví jen část zvukové podoby.',
'Pocit jistoty ovšem není neomylný důkaz, že správnou odpověď skutečně známe. Vědci porovnávají různé výklady toho, jak stav vzniká, a oddělují částečné vybavení od pouhého dojmu známosti. Běžné drobné selhání tak odhaluje členitost paměti: dostat se k člověku v myšlenkách není vždy totéž jako dostat se k jeho jménu.'
], 'Fenomén špičky jazyka je dočasné selhání vybavení slova při pocitu jeho znalosti, někdy s dostupným významem či částí zvukové podoby.', 'learning-memory linguistics uncertainty', 'principle', 'speaker_searching_for_word', 'An anonymous thoughtful face with a speech bubble containing one unfinished simple word-like mark, no readable text.', '758 838', '758 řeší chunking pracovní paměti, 838 přesun zapamatování k místu vyhledání; zde jde o dočasnou nedostupnost lexikální podoby při pocitu znalosti.', [
('ETS – The Tip-Of-The-Tongue Phenomenon','https://www.ets.org/research/policy_research_reports/publications/report/1975/hrtp.html'),
('APA – Caffeine got your tongue?','https://www.apa.org/monitor/julaug04/caffeine')])

add('filmy', 'Kreslená postava si může vypůjčit lidský pohyb', [
'Kreslená postava se pohne tak přirozeně, až připomíná živého herce. Někdy je důvod doslovný: animátor vycházel z natočeného člověka políčko po políčku.',
'Rotoskopie používá hraný záznam jako podklad pro kreslenou animaci. Max Fleischer vyvinul zařízení, které umožňovalo jednotlivá filmová políčka promítat a jejich pohyb převádět do kresby. Jeho bratr Dave poskytl pohybovou předlohu pro rané pokusy.',
'Výsledek nemusí být pouhou obkreslenou kopií. Animátor může měnit proporce, výtvarnou podobu i míru zachovaného detailu. Důležité je rozlišení mezi zdrojem pohybu a konečnou podobou obrazu: skutečný herecký výkon může být oporou i pro svět, který se na plátně vůbec netváří jako fotografie.'
], 'Rotoskopie převádí pohyb z hraných záběrů do animace po jednotlivých snímcích, aniž by vyžadovala zachovat fotografický vzhled předlohy.', 'animation film-technique innovation', 'principle', 'animator_tracing_dancer', 'An animator hand tracing a simple dancer silhouette on a light table.', '459 452', '459 zaznamenává pohyb jako data pro digitální postavu, 452 snímá pohybovaný model; rotoskopie používá obraz jednotlivých hraných políček jako kreslířskou předlohu.', [
('Fleischer Studios – Rotoscope','https://fleischerstudios.com/rotoscope'),
('BFI Player – A Family Portrait','https://player.bfi.org.uk/rentals/film/watch-a-family-portrait-2009-online')])

add('filmy', 'Herec může stejnou větu zahrát ještě po natáčení', [
'Na plátně vidíš herce mluvit v ulici, ale jeho hlas mohl vzniknout až ve studiu. Hluk dopravy či vítr totiž může původní dialog znehodnotit, i když obraz zůstane výborný.',
'Při postsynchronu označovaném jako ADR herec znovu nahraje vybrané repliky podle hotového obrazu. Musí sladit načasování, rytmus a výraz s původním výkonem. Zvukový tým pak novou nahrávku upraví a zasadí do zvukového prostředí scény.',
'Není to jen překladový dabing do jiného jazyka ani pouhé odstranění šumu ze staré stopy. Vzniká nový hlasový výkon, který má s natočeným tělem působit jako jediný okamžik. Přirozeně znějící filmový rozhovor tak může být velmi pečlivě sestaveným setkáním obrazu a později pořízeného zvuku.'
], 'ADR nahrazuje nebo doplňuje dialog novou studiovou nahrávkou synchronizovanou s obrazem a hereckým výkonem z natáčení.', 'sound film-technique preservation', 'principle', 'actor_recording_dialogue', 'An anonymous actor at a studio microphone watching a simple scene on a small screen.', '282 460', '282 je tvorba ruchů fyzickými předměty a 460 potlačení šumu; ADR vytváří novou synchronní řečovou nahrávku samotné postavy.', [
('ScreenSkills – ADR editor','https://www.screenskills.com/job-profiles/browse/post-production/sound-studios/adr-editor-post-production/'),
('Avid – Cue Pro integrated ADR in Pro Tools','https://www.avid.com/resource-center/cue-pro')])

add('matematika', 'Číslo pí lze odhadnout házením jehly', [
'Jehla padá na podlahu s rovnoběžnými čarami a ty počítáš zásahy. Překvapivě tím můžeš odhadovat číslo pí, i když v pokusu nekreslíš žádnou kružnici.',
'V Buffonově úloze má jehla délku nejvýše rovnou vzdálenosti čar. Její poloha i směr se volí rovnoměrně a nezávisle. Pravděpodobnost, že protne některou čáru, je dvakrát délka jehly dělená součinem pí a rozestupu čar.',
'Když je délka jehly stejná jako rozestup, vychází pravděpodobnost 2/pí. Z podílu zásahů proto získáš přibližný odhad. Přesnost ale vyžaduje mnoho pokusů a poctivou náhodnost. Kružnice se skrývá v možných směrech natočení jehly: geometrie vstupuje do výsledku přes úhly, nikoli přes tvar podlahy.'
], 'Buffonova jehla protíná rovnoběžné čáry s pravděpodobností 2l/(pí·d) pro l nejvýše d při rovnoměrné nezávislé poloze a orientaci, což umožňuje odhad pí.', 'probability geometry patterns', 'principle', 'needle_crossing_parallel_lines', 'One short needle diagonally crossing only the middle of three widely spaced parallel floor lines; the needle is no longer than the spacing between adjacent lines.', '500 493', '500 ohraničuje pí mnohoúhelníky a 493 obecně zákon velkých čísel; zde je nový konkrétní geometricko-pravděpodobnostní vztah daný polohou a orientací jehly.', [
('Wolfram MathWorld – Buffon’s Needle Problem','https://mathworld.wolfram.com/BuffonsNeedleProblem.html'),
('Encyclopedia of Mathematics – Buffon problem','https://encyclopediaofmath.org/wiki/Buffon_problem')])

add('matematika', 'Dvě chybějící políčka porazí všechna domina', [
'Ze šachovnice odřízni dva protilehlé rohy. Zůstane 62 polí, takže 31 dílků domina o velikosti dvou sousedních polí zdánlivě přesně stačí.',
'Položit je bez překryvu a beze zbytku ale nelze. Každé domino zakryje jedno bílé a jedno černé pole. Protilehlé rohy šachovnice mají stejnou barvu, takže po jejich odstranění zůstane 30 polí jedné barvy a 32 druhé.',
'Žádné přerovnání domina tento rozdíl nezmění. Důkaz proto nemusí zkoušet všechny možné sestavy; najde vlastnost, kterou každý povolený dílek zachovává. Samotná shoda celkové plochy je jen nutnou podmínkou. Barvy, které na první pohled vypadají jako dekorace, odhalí překážku skrytou v geometrii úlohy.'
], 'Šachovnici bez dvou protilehlých rohů nelze pokrýt dominy 1×2, protože každé kryje obě barvy stejně, ale zbylá deska má jejich počty rozdílné.', 'combinatorics geometry limits', 'principle', 'domino_on_cut_chessboard', 'A simplified chessboard with two opposite same-color corners missing and one oversized domino nearby.', '757 302', '757 je počítání přihrádek a 302 barvení map; zde barvení vytváří invariant při pokrývání a dokazuje nemožnost konkrétní dlažby.', [
('University of Cambridge – Chessboard Tiling','https://wild.maths.org/chessboard-tiling'),
('Lawrence Paulson – A simple formalization and proof for the mutilated chess board','https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-394.pdf')])

add('pocitacove-vedy', 'Nový server nemusí přestěhovat skoro všechna data', [
'Rozdělit data mezi servery je snadné, dokud se počet serverů nemění. Naivní pravidlo založené na zbytku po dělení jejich počtem může při přidání stroje přidělit jinam velkou část klíčů.',
'Konzistentní hašování umisťuje klíče i servery do společného kruhového prostoru. V jednoduché variantě patří klíč nejbližšímu následujícímu serveru. Přidání nového uzlu tak změní hlavně odpovědnost za sousední úsek, místo aby přepsalo pravidlo pro všechny.',
'Více virtuálních pozic jednoho serveru pomáhá rozložit zátěž rovnoměrněji. Samotná metoda ovšem nezaručuje zálohy ani správnost souběžných zápisů. Řeší jinou praktickou věc: jak při změnách členství omezit množství dat, která musejí dostat nového správce.'
], 'Konzistentní hašování mapuje klíče a uzly do společného prostoru tak, aby přidání či odebrání uzlu přesouvalo jen omezenou část přiřazení.', 'algorithms networks resources', 'principle', 'server_hash_ring', 'A simple ring with three large server markers and a fourth newly inserted marker.', '952 742', '952 určuje identitu podle obsahu, 742 logický relační model; zde je cílem stabilní rozdělení klíčů mezi měnící se množinu uzlů.', [
('Karger a kol. – Consistent Hashing and Random Trees','https://people.csail.mit.edu/karger/Papers/web.pdf'),
('Amazon Science – Dynamo','https://www.amazon.science/publications/dynamo-amazons-highly-available-key-value-store')])

add('pocitacove-vedy', 'Databáze si nejprve slíbí, že jsou připravené', [
'Převod nesmí v jedné databázi peníze odečíst a v druhé je zapomenout přičíst. Když jedna operace zasahuje více účastníků, potřebuje způsob, jak sladit její společný výsledek.',
'Dvoufázové potvrzení nejprve požádá účastníky, aby transakci připravili a trvale uchovali možnost ji dokončit. Teprve po úspěšné přípravě všech přijde rozhodnutí potvrdit; při neúspěchu se operace ruší.',
'Cena za tuto koordinaci se ukáže při poruše. Připravený účastník může čekat na konečné rozhodnutí a přitom dál držet zámky. PostgreSQL proto varuje před dlouho otevřenými připravenými transakcemi. Společné všechno, nebo nic není zadarmo: může vyměnit část dostupnosti za jistotu, že se jednotlivé části operace nerozejdou.'
], 'Dvoufázové potvrzení odděluje přípravu všech účastníků od konečného rozhodnutí o transakci, ale při poruše může ponechat připravené účastníky čekat se zámky.', 'programming networks cooperation', 'principle', 'coordinated_transaction_gate', 'Two simple data cabinets waiting behind one shared gate held by a central latch.', '798 925', '798 řeší dohodu při zrádných uzlech a 925 síťové zahlcení; zde jde o atomické dokončení distribuované transakce s blokující připravenou fází.', [
('PostgreSQL – Two-Phase Transactions','https://www.postgresql.org/docs/17/two-phase.html'),
('PostgreSQL – PREPARE TRANSACTION','https://www.postgresql.org/docs/current/sql-prepare-transaction.html')])

add('sport', 'Basketbal opravdu začínal s koši na broskve', [
'Název basketbal původně nebyl jen obrazný. James Naismith v roce 1891 použil jako cíle skutečné koše na broskve zavěšené nad podlahou tělocvičny.',
'Ve springfieldské škole hledal hru pro zimní pohyb uvnitř. Dva koše připevnil k zábradlí galerie a hráči používali fotbalový míč. Původní pravidla mimo jiné zakazovala s míčem běhat, takže posun hry závisel na přihrávkách.',
'Koše měly dno a míč se po zásahu musel vyndávat. Dnešní otevřená obroučka ani samozřejmý driblink tedy nebyly hotovým balíčkem od prvního dne. Příběh ukazuje vznik sportu jako řešení konkrétního organizačního problému: potřebovali bezpečnější zimní hru a její vybavení si nejprve vypůjčili z toho, co bylo po ruce.'
], 'Naismithův basketbal vznikl roku 1891 jako zimní hra v tělocvičně s fotbalovým míčem a skutečnými koši na broskve, přičemž původní pravidla zakazovala běh s míčem.', 'sport modern-history innovation', 'event', 'peach_basket_with_ball', 'An old wooden peach basket with a closed bottom mounted high, a plain leather ball beside its rim.', '378 379', '378 je změna skokanské techniky a 379 průběh maratonu; zde je samostatný vznik pravidel a vybavení basketbalu.', [
('Springfield College – Where Basketball was Invented','https://springfield.edu/about/birthplace-of-basketball'),
('Naismith Basketball Hall of Fame – The 1891 Gallery','https://www.hoophall.com/explore/exhibits/1891')])

add('sport', 'Řídký vzduch může běžci pomoci i uškodit', [
'Vysoká nadmořská výška není pro všechny atletické disciplíny stejný soupeř. Sprinterovi může ubrat odpor vzduchu, zatímco vytrvalci zkomplikuje zásobování kyslíkem.',
'Olympiáda v Mexiku v roce 1968 probíhala přibližně ve výšce 2 240 metrů. Nižší hustota vzduchu zvýhodňuje rychlé pohyby, ale nižší tlak zároveň znamená nižší parciální tlak kyslíku. Podíl kyslíku ve vzduchu přitom zůstává přibližně stejný.',
'Krátký sprint proto může získat jinou bilanci výhod a nevýhod než dlouhý běh závislý na aerobním výkonu. Přispívá také aklimatizace a příprava konkrétního sportovce. Mexické hry se staly důležitou zkušeností pro sportovní vědu: stejné prostředí nemusí pouze zrychlovat nebo zpomalovat, ale mění podmínky podle povahy výkonu.'
], 'Ve vysoké nadmořské výšce nižší odpor vzduchu může pomoci sprintům, zatímco nižší parciální tlak kyslíku omezuje zejména vytrvalostní výkon.', 'sport mechanics limits', 'principle', 'sprinter_on_highland_track', 'A single sprinter running on a short elevated track ribbon, no scenic mountains.', '380 277', '380 řeší vodiče při míli a 277 definici výšky hor; zde se porovnávají protichůdné účinky prostředí na krátký a vytrvalostní výkon.', [
('IOC – A testing ground for sports science','https://www.olympics.com/ioc/news/a-testing-ground-for-sports-science'),
('Olympedia – Athletics at the 1968 Summer Olympics','https://www.olympedia.org/editions/17/sports/ATH?id=BKB')])

add('sport', 'Brusle může zvednout patu a nechat nůž na ledě', [
'Rychlobruslař zvedá patu, ale dlouhý nůž ještě zůstává na ledě. Klapací brusle tím porušuje intuitivní představu, že bota a kovová část musejí být pevně spojeny po celé délce.',
'Nůž je k botě připojen kloubem vpředu a pata se od něj může odklápět. Konstrukce umožňuje jiný průběh závěru odrazu, při němž čepel zůstává déle v kontaktu s ledem. Pružina ji následně vrací k botě.',
'V průběhu devadesátých let se tato změna rychle prosadila mezi elitou; olympijské hry v Naganu 1998 už znamenaly její velký nástup. Není to motor ukrytý v brusli. Výhodu vytváří změna mechanického spojení mezi lidským pohybem a ledem, takže nový výkon může začít i u nenápadného kloubu.'
], 'Klapací rychlobruslařská brusle má přední kloub umožňující zdvih paty při delším kontaktu nože s ledem a změně mechaniky odrazu.', 'sport mechanics innovation', 'principle', 'clap_skate_raised_heel', 'A clear side view of one clap skate with the boot heel raised and the blade horizontal on a short ice strip.', '378', '378 mění polohu těla při překonání laťky; zde je novým mechanismem kloubové oddělení paty boty od nože při odrazu na ledě.', [
('International Skating Union – The clap skate revolution','https://beta.isu-skating.com/en/news/speed-skating-and-the-clap-skate-revolution/'),
('NBC Olympics – Speed Skating Equipment','https://www.nbcolympics.com/news/speed-skating-101-equipment')])

add('sport', 'Tie-break dal dlouhému setu jiný konec', [
'Dva tenisté si mohou opakovaně držet servis a konec setu se stále vzdaluje. Tie-break mění způsob, jak tuto vyrovnanost rozhodnout, místo aby čekal na náskok dvou her.',
'Na US Open se objevil v roce 1970 a postupně proměnil podobu tenisového skórování. Nešlo přitom od začátku všude o jednu neměnnou variantu. Dnešní pravidla rozlišují běžnou zkrácenou hru i další schválené formáty.',
'V obvyklém tie-breaku k sedmi bodům musí vítěz získat alespoň dvoubodový náskok. Nemá tedy bezpodmínečně stanovený maximální počet výměn: při dalším vyrovnávání může pokračovat. Inovace omezila závislost konce setu na střídání celých servisních her, ale zachovala požadavek vyhrát závěr s určitou převahou.'
], 'Tie-break nahrazuje pokračování setu rozhodováním po bodech; běžná varianta k sedmi bodům stále vyžaduje dvoubodový náskok, takže nemá pevný maximální počet výměn.', 'sport institutions patterns', 'principle', 'tennis_scoreboard_tiebreak', 'A simple tennis net and a compact scoreboard showing 6:6, no extra lettering.', '382', '382 řeší strategickou náhodnost při penaltě, nikoli pravidla ukončení setu; katalog neobsahuje jiný poznatek o tenisovém skórování.', [
('US Open – The tiebreak makes its Grand Slam debut','https://www.usopen.org/en_US/news/articles/2018-06-13/50_moments_that_mattered_the_tiebreak_makes_its_grand_slam_debut.html'),
('International Tennis Federation – Rules of Tennis 2026','https://www.itftennis.com/media/7221/2026-rules-of-tennis-english.pdf')])

# Konzervativně nahrazené náměty po přečtení plných blízkých článků.
rows[2] = dict(category='filozofie', title='Básník podle Aristotela nepíše horší kroniku', paragraphs=[
'Vymyšlený příběh nemusí být jen méně přesnou verzí skutečných dějin. Aristotelés v Poetice tvrdí, že básník a historik odpovídají na odlišné otázky.',
'Historik vypráví, co se stalo. Básník ukazuje, co by se podle pravděpodobnosti nebo nutnosti stát mohlo. Rozdíl podle Aristotela nespočívá ve verších: i dějiny převedené do metra by zůstaly dějinami.',
'Básnictví proto přisuzuje obecnější dosah. Nezajímá je jen jednotlivý člověk a událost, ale také to, jak by určitý typ člověka za daných okolností jednal. Nejde o povolení vydávat smyšlené příběhy za fakta. Je to obhajoba jiné poznávací práce fikce: může promýšlet souvislost činů, kterou pouhý seznam skutečně nastalých událostí ještě nevysvětlí.'
], point='Aristotelés odlišuje historii toho, co se stalo, od básnictví toho, co by se pravděpodobně či nutně mohlo stát; rozdíl není v použití veršů.',
tags=['ancient-philosophy','literature','aristotle','knowledge-evidence'], kind='theory', subject='poet_and_historian_scrolls', concept='Two anonymous ancient writers facing a shared scroll, one observing and one imagining.', compared=['768','144'], reason='768 řeší emoční účinek tragédie a 144 ústní formule eposu; zde je odlišný druh poznání univerzálního možného děje oproti konkrétnímu historickému záznamu.', sources=[
('Aristotelés – Poetika, kapitola IX','https://classics.mit.edu/Aristotle/poetics.1.1.html'),
('Internet Encyclopedia of Philosophy – Aristotle: Poetics','https://iep.utm.edu/aristotle-poetics/')])
rows[4] = dict(category='biologie', title='Narvalův roh je ve skutečnosti zub', paragraphs=[
'Narval vypadá jako mořský jednorožec, ale jeho dlouhý výběžek nevyrůstá z čela. Je to prodloužený zub horní čelisti, který prorůstá skrz pysk.',
'Typický kel mají především samci a obvykle jde o levý z páru zubů. Existují ale i samice s klem a vzácně jedinci se dvěma kly. Spirálovitý povrch proto není známkou rohu podobného tomu, jaký má nosorožec.',
'Jeho funkce jsou složitější než pouhá ozdoba. Výzkum se zabývá smyslovými vlastnostmi i významem při sociálním a pohlavním výběru; jediný jednoduchý účel nelze odvodit jen z tvaru. Jistá anatomická odpověď tedy neuzavírá všechny biologické otázky. Víme, která část těla tak neobvykle vyrostla, ale proč se prosadila právě v této podobě, vyžaduje další důkazy.'
], point='Narvalí kel je prodloužený, obvykle levý horní zub prorůstající pyskem, nikoli roh; typicky jej mají samci, ale existují výjimky.', tags=['zoology','evolution','patterns'], kind='principle', subject='narwhal_with_tusk', concept='One simple narwhal in side view with a long spiral tusk emerging from the upper lip.', compared=['152','740'], reason='152 řeší krevní oběh hlavonožců a 740 délku života grónského žraloka; v katalogu není anatomický původ narvalího klu ani jeho pohlavní rozdíly.', sources=[
('Smithsonian – Understanding the Narwhal’s Smile','https://www.si.edu/stories/understanding-narwhals-smile'),
('NOAA – The Unicorn of the Sea','https://cdn.oceanservice.noaa.gov/oceanserviceprod/education/activity-book/pdf/NOAA_DYW_2017_34_Narwhals.pdf')])
rows[15] = dict(category='astronomie', title='Ve vesmíru existují místa, která drží krok s planetou', paragraphs=[
'Sonda může obíhat Slunce a přitom se držet přibližně na stejném místě vůči Zemi. Neznamená to, že tam gravitace zmizela nebo že sonda ve vesmíru stojí.',
'V idealizované soustavě dvou velkých těles existuje pět Lagrangeových bodů. Umožňují malému tělesu zachovat stálou polohu v soustavě, která se otáčí spolu s nimi. Body L1, L2 a L3 leží na společné přímce, L4 a L5 tvoří s velkými tělesy rovnostranné trojúhelníky.',
'Rozdílná je i stabilita. Okolí L1 a L2 využívají sondy, které potřebují korekce dráhy; za vhodného poměru hmotností jsou L4 a L5 stabilnější a mohou hostit skupiny planetek. Kosmické parkoviště je tedy jen přirovnání. Pořád jde o pohyb po dráze a přesně vyváženou dynamiku, nikoli o vypnutí přitažlivosti.'
], point='Lagrangeovy body umožňují malému tělesu držet polohu vůči dvěma obíhajícím velkým tělesům; L1–L3 jsou nestabilní, zatímco L4 a L5 mohou být za vhodných podmínek stabilní.', tags=['solar-system','spaceflight','mechanics'], kind='principle', subject='spacecraft_near_lagrange_point', concept='A small spacecraft keeping station beyond a simple Earth silhouette, with a restrained curved orbital arc.', compared=['941','296'], reason='941 jsou výměny drah dvojice měsíců a 296 relativistické opravy hodin GPS; zde se vysvětlují rovnovážné polohy v rotující soustavě a jejich odlišná stabilita.', sources=[
('NASA Science – What are Lagrange Points?','https://science.nasa.gov/solar-system/resources/faq/what-are-lagrange-points/'),
('ESA – What are Lagrange points?','https://www.esa.int/Enabling_Support/Operations/What_are_Lagrange_points')])
assert len(rows) == 30
rows[4]['sources'] = [
('NOAA Fisheries – Narwhal','https://www.fisheries.noaa.gov/species/narwhal'),
('NOAA Ocean Exploration – What is a narwhal?','https://oceanexplorer.noaa.gov/ocean-fact/narwhal/')]
rows[16]['sources'][0] = ('Jensen a Miller – Giffen Behavior: Theory and Evidence','https://research.hks.harvard.edu/publications/getFile.aspx?Id=482')
rows[17]['sources'] = [
('Bank of Canada – Exits, Spillovers and Monetary Policy Independence','https://www.bankofcanada.ca/2013/08/exits-spillovers-monetary-policy-independence/'),
('European Central Bank – The international role of the euro','https://www.ecb.europa.eu/press/other-publications/ire/html/ecb.ire201906~f0da2b823e.en.html')]
rows[19]['reason'] = '758 řeší chunking pracovní paměti; plný text 838 ve skutečnosti řeší právní odstranění odkazů a jeho chybný index byl opraven. Zde jde o dočasnou nedostupnost slovní podoby při pocitu znalosti.'
rows[22]['sources'][1] = ('Harvey Mudd College – Buffon Needle Problem','https://math.hmc.edu/funfacts/buffon-needle-problem/')
rows[23]['sources'][0] = ('Matthew Scroggs – The mutilated chessboard','https://www.mscroggs.co.uk/puzzles/42')
rows[23]['subject'] = 'domino_on_checkerboard_fragment'
rows[23]['concept'] = 'A single domino lying across one white and one dark adjacent square on a small two-square checkerboard fragment; no full chessboard and no extra tiles.'
rows[25]['sources'][1] = ('PostgreSQL – PREPARE TRANSACTION','https://www.postgresql.org/docs/18/sql-prepare-transaction.html')
rows[28]['sources'][0] = ('International Skating Union – The clap skate revolution','https://isu-skating.com/en/speed-skating/news/speed-skating-and-the-clap-skate-revolution/')
rows[29]['sources'][0] = ('US Open – The US Open introduced the tiebreak set','https://www.usopen.org/en_US/news/articles/2020-09-02/the_us_open_introduced_the_tiebreak_set_50_years_ago_today.html')
palettes = ['blue_gold','green_copper','indigo_cyan','monochrome_cool','monochrome_warm','teal_amber','terracotta_cream','violet_coral']
keywords = [
['leather_case','sealed_envelope','paper_edge'], ['sandy_hollow','boat_outline','iron_rivets'],
['ancient_writers','shared_scroll','contrasting_gestures'], ['folded_strip','halved_sections','paper_crease'],
['arctic_whale','spiral_tusk','upper_lip'], ['bacterial_cells','signal_dots','close_cluster'],
['bronze_figure','broken_clay_shell','casting_cavity'], ['copper_plate','burnisher','pale_oval'],
['cherry_blossom','short_branch','pale_petals'], ['open_book','reader_hands','missing_pages'],
['balance_beam','empty_pans','legal_scales'], ['town_hall','nested_building','shared_roof'],
['water_drop','ice_seed','crystal_branch'], ['old_window','uneven_glass','thick_edge'],
['ochre_moon','volcanic_plume','lava_patch'], ['space_probe','earth_disk','orbital_arc'],
['rice_bowl','small_dish','plain_table'], ['triangle_balance','three_coins','lifted_corner'],
['paired_room_views','missing_chair','blank_gap'], ['thinking_face','speech_bubble','unfinished_mark'],
['light_table','tracing_hand','dancer_silhouette'], ['studio_microphone','actor_profile','scene_screen'],
['diagonal_needle','parallel_lines','floor_strips'], ['contrasting_squares','shared_border','domino_tile'],
['server_markers','circular_path','new_node'], ['data_cabinets','shared_gate','central_latch'],
['peach_basket','closed_bottom','leather_ball'], ['sprinter','running_track','raised_platform'],
['skate_boot','front_hinge','horizontal_blade'], ['tennis_net','scoreboard','tied_score']]
scenes = {384:'environment',385:'interaction',388:'interaction',389:'process',390:'process',392:'interaction',
          397:'environment',398:'environment',399:'interaction',401:'diagram',402:'portrait',403:'process',
          404:'interaction',406:'diagram',407:'diagram',408:'diagram',410:'interaction'}
parents = {t['id']:t['parent'] for t in json.loads((ROOT/'static/data/tags.json').read_text(encoding='utf-8'))['tags']}
drafts, proposals = [], []
for n, row in enumerate(rows, 383):
    pid = str(n)
    ancestors = set()
    for tag in row['tags']:
        parent = parents[tag]
        while parent:
            ancestors.add(parent)
            parent = parents[parent]
    knowledge = dict(idea=f'idea-{pid}',point=row['point'],tags=[t for t in row['tags'] if t not in ancestors],type=row['kind'])
    illustration = dict(concept=row['concept'],scene_type=scenes.get(n,'object'),primary_subject=row['subject'],secondary_subjects=[],
                        visual_keywords=keywords[n-383],
                        composition_hints=['optically_centered_in_both_axes','balanced_transparent_margins'],
                        mood='contemplative',palette=palettes[(n-383)%len(palettes)])
    drafts.append(dict(id=pid,title=row['title'],content=''.join(f'<p>{p}</p>' for p in row['paragraphs']),
                       category=row['category'],sources=[dict(label=l,url=u) for l,u in row['sources']],
                       illustration=illustration,knowledge=knowledge))
    proposals.append(dict(id=pid,category=row['category'],knowledge=knowledge,compared_ids=row['compared'],reason=row['reason'],verdict='accept'))
for name, obj in [('gap383-412-drafts.json',drafts),('gap383-412-plan.json',dict(snapshot=SNAPSHOT,catalog_reviewed=SNAPSHOT,proposals=proposals))]:
    (OUT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print([(p['id'],p['category'],len(p['content'])) for p in drafts])
