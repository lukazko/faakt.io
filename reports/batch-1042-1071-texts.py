from pathlib import Path
import runpy, json
b=runpy.run_path(str(Path(__file__).with_name('batch-1042-1071.py')))
texts=[
'''Na Vánoce roku 1914 vyšli někteří vojáci ze zákopů a setkali se s protivníky. Válka přitom neskončila a na jiných místech se dál bojovalo.
Podél částí západní fronty vznikla neoficiální příměří. Britští a němečtí vojáci si vyměňovali drobné dárky, mluvili spolu a využívali klidu také k pohřbívání mrtvých. Rozsah i průběh se lišily místo od místa.
Nešlo o jedinou akci řízenou z velitelství ani o všeobecný vánoční mír. Známý obraz velkého fotbalového utkání navíc nelze jednoduše přenést na celou frontu.
Právě místní a dočasný charakter události je podstatný. Lidé, kteří měli plnit roli nepřítele, na krátkou dobu navázali přímý kontakt, aniž se změnily politické cíle válčících států.''',
'''Z přístavu se stalo bojiště, přestože na Halifax nikdo nezaútočil. Dne 6. prosince 1917 se tam srazily lodě Imo a Mont-Blanc a vznikl požár s katastrofálním pokračováním.
Mont-Blanc vezl výbušniny určené pro válku v Evropě. Po srážce začal hořet a následná exploze zničila rozsáhlé části okolní zástavby. Zahynuly téměř dva tisíce lidí a další tisíce utrpěly zranění.
Nebezpečí tak nebylo omezené na palubu. Přístav spojoval vojenské zásobování s každodenním životem města a ničivá energie nákladu zasáhla i lidi, kteří s přepravou neměli nic společného.
Halifax připomíná méně viditelnou stránku světové války: její logistika vytvářela vážná rizika daleko od fronty. K rozsáhlému zničení města stačila nehoda v dopravním uzlu.''',
'''Touha podle Spinozy není cizí síla, která se občas připojí k rozumnému člověku. Vychází ze základnějšího úsilí, jímž každá věc setrvává ve svém bytí.
V Etice označuje toto úsilí slovem <em>conatus</em>. U člověka se promítá do žádosti a při vědomí této žádosti do touhy. Nejde pouze o rozhodnutí za každou cenu prodloužit vlastní život, ale o základ jeho výkladu lidského jednání.
Radost a smutek pak souvisejí s přechody k větší nebo menší schopnosti jednat. To, co nás posiluje či oslabuje, mění také naše citové vztahy ke světu.
Je to součást určitého filozofického systému, nikoli experimentálně prokázaný zákon psychologie. Spinoza tím ale obrací běžnou otázku: člověka nelze pochopit jen podle vyhlášených zásad, je třeba zkoumat i to, co jeho jednání udržuje a pohání.''',
'''Vyplatilo by se věřit v Boha, i kdybychom jeho existenci neuměli dokázat? Pascalova sázka přesouvá pozornost od důkazů k tomu, co můžeme získat nebo ztratit.
V jejím známém podání má víra při existenci Boha přinést nekonečně hodnotnou spásu, zatímco pozemská cena náboženského života je konečná. I malá kladná pravděpodobnost tak má dát víře rozhodující očekávaný užitek.
Výpočet ovšem stojí na předpokladech. Proč zvažovat právě Boha, který odměňuje tento typ víry? Jiná náboženská možnost může mít odlišné podmínky. A přesvědčení nemusí jít prostě zapnout rozhodnutím.
Sázka tedy není důkazem Boží existence. Je to sporný argument o rozhodování v nejistotě, který ukazuje rozdíl mezi důvodem pokládat tvrzení za pravdivé a důvodem chtít podle něj žít.''',
'''Stříkoun nemusí kvůli hmyzu opustit vodu. Kořist nad hladinou zasáhne proudem z tlamy a pak ji může sebrat z povrchu.
Proud přitom není jen voda vystříknutá stále stejným způsobem. Pokusy ukázaly, že ryba aktivně řídí jeho hydrodynamiku podle vzdálenosti cíle. Průběh výstřiku upravuje tak, aby se voda soustředila do účinného úderu u kořisti.
Záleží tedy nejen na směru míření, ale také na tom, jak se jednotlivé části proudu během letu dohánějí. Výsledkem je použití okolní vody jako loveckého nástroje.
Neznamená to, že ryba vědomě počítá rovnice proudění nebo nikdy nemine. Její chování však ukazuje, že přesný zásah může vyžadovat průběžně přizpůsobený pohyb, nikoli pouze spuštění neměnného reflexu.''',
'''Malý pták přináší potravu mláděti, které ho velikostí přerůstá. U kukačky obecné jde o důsledek hnízdního parazitismu: odchov zajišťuje jiný druh.
Samice vloží vejce do hostitelského hnízda, často po odstranění jednoho původního vejce. Kukaččí mládě po vylíhnutí může vytlačit ostatní vejce nebo mláďata přes okraj, a získat tak potravu pro sebe.
Hostitelé ale nejsou vždy bezbranní. Rozpoznávání cizích vajec vytváří selekční tlak na jejich podobnost s hostitelskou snůškou; kukaččí vejce se proto mezi samičími liniemi liší barvou a vzorem.
Není to morální selhání zvířete ani vědomý lidský podvod. Jde o evoluční střet rozmnožovacích strategií, v němž náklady péče nese hostitel a parazit těží z jeho rodičovského chování.''',
'''Tisková deska nemusí mít vystouplý obraz ani vyryté rýhy. Litografie dokáže oddělit obraz od okolí na téměř rovné ploše kamene.
V tradičním postupu umělec kreslí mastnou tuší či křídou na vápenec. Chemické zpracování připraví povrch tak, aby netisknoucí místa přijímala vodu. Po navlhčení se mastná tisková barva zachytává na místech obrazu, zatímco vodní film chrání okolí.
Papír pak převezme obraz při průchodu lisem. Výběr tisknoucích míst tedy zajišťují vlastnosti povrchu a vztah vody s mastnotou, nikoli rozdílná výška jako u dřevořezu.
To pomohlo přenášet do tisku charakter volné kresby. Zdánlivě obyčejný hladký kámen se mění v přesný nástroj rozmnožování obrazu díky chemii, kterou na hotovém otisku nevidíme.''',
'''Socha může změnit kompozici, i když se divák nepohne. Stačí, aby kolem Calderova závěsného mobilu prošel slabý proud vzduchu.
Alexander Calder spojoval vyvážené prvky pomocí drátů a závěsů. Jednotlivé části se mohou pohybovat vůči sobě, takže jejich vztahy nejsou jednou provždy určeny jako u pevné sochy.
Vzduch vytváří pomalé otáčení, proměňuje překryvy i vzdálenosti a někdy zapojuje také stíny. Pohyb tu není pouze zobrazený postojem figur: skutečně se odehrává v čase před divákem.
Vyvážení je přitom stejně důležité jako barva nebo tvar. Mobil není náhodná hromádka zavěšených předmětů; jeho konstrukce určuje možné pohyby. Autor tak navrhuje nejen jednu výslednou podobu, ale také prostor pro její další proměny.''',
'''Král Oidipús slíbí odhalit vraha a potrestat ho. Divák obeznámený s mýtem však ví, že hrdina právě zahajuje pátrání po sobě samém.
Sofoklova tragédie využívá rozdílu mezi tím, co zná postava, a tím, co chápe publikum. Oidipovy hrozby provinilci získávají druhý význam: dopadají i na jejich vlastního původce, aniž to on v danou chvíli tuší.
Tomuto vztahu se říká dramatická ironie. Napětí nestojí pouze na otázce, kdo zločin spáchal, ale na sledování cesty, po níž se hrdina přibližuje pravdě o své totožnosti.
Předem známý výsledek proto nemusí příběh oslabit. Může naopak zesílit každou repliku, jejíž důsledky divák vidí dříve než mluvčí. Hrůza vzniká i z toho, že dobře míněné pátrání nelze jednoduše oddělit od vlastního osudu.''',
'''Milenci na zdobené urně zůstávají těsně před polibkem. Nikdy nezestárnou, ale také nikdy nedosáhnou okamžiku, k němuž se naklánějí.
John Keats v <em>Ódě na řeckou urnu</em> oslovuje postavy a výjevy na starověké nádobě. To, co obraz uchovává, báseň rozvíjí jako zastavený děj: hudebník hraje neslyšenou hudbu a touha se nemůže vyčerpat naplněním.
Trvalost umění tak není jen vítězství nad časem. Má i svou cenu: zobrazené bytosti jsou chráněné před zánikem právě tím, že nemohou prožít pokračování.
Báseň pracuje s ekfrází, tedy slovním ztvárněním výtvarného díla. Místo pouhého popisu nádoby zkoumá rozdíl mezi životem, který plyne a končí, a obrazem, který dokáže uchovat krásu za cenu nehybnosti.''',
'''O tom, zda má obec opravit hřiště nebo upravit park, mohou rozhodovat i samotní obyvatelé. Participativní rozpočet jim otevírá část rozhodování o veřejných penězích.
Známým průkopníkem bylo brazilské Porto Alegre, kde proces začal roku 1989. Obyvatelé na setkáních a prostřednictvím zástupců určovali priority městských investic. Nešlo jen o odevzdání hlasu politické straně jednou za několik let.
Pod tímto názvem ale fungují různé modely. Někde se vybírají konkrétní projekty z vyčleněné částky, jinde se vyjednávají širší investiční priority. Podstatná jsou pravidla, dostupné prostředky i to, zda město výsledek skutečně provede.
Samotné hlasování tedy ještě nezaručuje velký vliv. Rozdíl mezi konzultací a rozhodnutím poznáme podle toho, jakou část rozpočtu může veřejnost opravdu změnit.''',
'''Konečné rozhodnutí soudu by nemělo být jen přestávkou před stejným trestním řízením. Pravidlo <em>ne bis in idem</em> chrání člověka před tím, aby stát uzavřený případ bez omezení otevíral znovu.
Článek 4 Protokolu č. 7 k Evropské úmluvě chrání před novým trestním stíháním či potrestáním za týž skutek v témže státě po konečném osvobození nebo odsouzení. Rozhodující nemusí být jen jiná právní nálepka činu, ale totožnost podstatných skutkových okolností.
Ochrana má vymezené hranice. Protokol připouští obnovu při nových skutečnostech nebo zásadní vadě předchozího řízení. Složitější pravidla platí i pro vzájemně propojené souběžné postupy.
Nejde tedy o zákaz opravit každý chybný rozsudek. Smyslem je, aby pravomocné uzavření věci mělo váhu a trestní moc nemohla stejnou otázku libovolně opakovat.''',
'''Dvě ladičky mohou znít každá rovnoměrně, ale společně vytvářet pulzující zvuk. Zesilování a zeslabování nevzniká tím, že by je někdo střídavě rozezníval.
Mají-li blízké frekvence, jejich vlny se postupně dostávají do stejné a opačné fáze. Chvíli se tedy zesilují a chvíli částečně ruší. Tomuto kolísání amplitudy se říká rázy neboli zázněje.
Při tónech 440 a 442 hertzů uslyšíme dva rázy za sekundu: četnost kolísání odpovídá absolutnímu rozdílu frekvencí. Neznamená to, že z reproduktoru začal samostatně vycházet běžně slyšitelný tón o dvou hertzech.
Rázy pomáhají při ladění nástrojů. Jak se frekvence přibližují, pulzování zpomaluje. Ucho tak může velmi malý rozdíl výšek převést na snadněji rozpoznatelné tempo změn hlasitosti.''',
'''Podepřený setrvačník se nerozpadá ani neuniká gravitaci. Když se rychle otáčí, může se jeho nakloněná osa začít stáčet kolem svislice místo prostého překlopení.
Tíha působí vůči místu podepření momentem síly. U rychle rotujícího tělesa tento moment mění především směr jeho momentu hybnosti. Osa pak opisuje kuželovitý pohyb označovaný jako precese.
Právě směr je klíčový. Kdyby se setrvačník netočil, stejná tíha by vedla k obvyklému pádu. Rotace však dává tělesu moment hybnosti, jehož změnu musíme posuzovat jako změnu vektoru.
Při postupném zpomalování může přibývat kývání a setrvačník nakonec spadne. Není to tedy trvalé vyvážení bez podmínek, ale zvláštní dynamika tělesa, jehož osa už před působením síly rychle rotuje.''',
'''Fialový výluh z červeného zelí může po přidání citronové šťávy zrůžovět. V zásaditém prostředí se naopak posouvá k zeleným až žlutým odstínům.
Za proměnou stojí antokyanová barviva. Jejich chemická forma závisí na pH prostředí a různé formy pohlcují viditelné světlo odlišně. Stejný rostlinný výluh tak může ukázat, že dva čiré roztoky mají rozdílné acidobazické vlastnosti.
Nejde přitom o přesný laboratorní pH metr. Výslednou barvu ovlivňuje složení výluhu, koncentrace i další vlastnosti vzorku. Bez kalibrace z ní nelze spolehlivě vyčíst konkrétní číselnou hodnotu.
Zelí je proto dobrým příkladem chemického indikátoru: změnu, kterou samotným pohledem na roztok nevidíme, převede na barvu. Údaj o prostředí se objeví díky reakci přidané látky.''',
'''Povlak na oceli nemusí chránit jen tím, že zakryje povrch. Zinek dokáže za vhodných podmínek pomoci i tam, kde se v ochranné vrstvě objeví škrábanec.
Je-li elektricky spojený s ocelí a oba kovy jsou ve vhodném elektrolytu, zinek se snáze oxiduje. Stává se obětovanou anodou a dodává elektrony dějům na chráněném kovu, čímž omezuje jeho rozpouštění.
Podobně fungují samostatné zinkové anody připevněné například k lodnímu trupu. Postupně se spotřebovávají, takže je třeba kontrolovat jejich stav a včas je nahradit.
Ochrana tedy neznamená, že koroze úplně zmizela. Probíhá přednostně na zvoleném kusu jiného kovu. Bez elektrického spojení nebo po spotřebování anody nelze stejný účinek očekávat: důležitý je celý elektrochemický obvod, nikoli pouhá blízkost zinku.''',
'''Na Uranu se jaro neměří několika měsíci. Jeden oběh planety kolem Slunce trvá asi 84 pozemských let a roční období zabere přibližně jejich čtvrtinu.
Rotační osa je skloněná zhruba o 98 stupňů vůči kolmici k rovině oběhu. Planeta se tak obrazně otáčí na boku. Kolem slunovratu míří jeden pól ke Slunci a druhý od něj, což vytváří mimořádně dlouhá období polárního dne a noci.
Pomalý oběh a extrémní sklon se tu doplňují. Samotná velká vzdálenost od Slunce by takové střídání nezpůsobila; rozhoduje také orientace osy vůči dopadajícím paprskům.
Atmosféra navíc nereaguje na změny osvětlení okamžitě. Dlouhá roční období proto nejsou jednoduchým zvětšením pozemského kalendáře: tepelné zpoždění ovlivňuje, kdy a jak se proměny projeví v oblačnosti.''',
'''Velká rudá skvrna vypadá na Jupiteru jako stálá značka. Ve skutečnosti je to atmosférický vír, jehož obrys se mění i během několika měsíců.
Hubbleův dalekohled ji od prosince 2023 do března 2024 sledoval po dobu přibližně devadesáti dnů. Snímky ukázaly, že se její eliptický tvar stlačuje a roztahuje v souvislosti s kolísáním pohybu bouře.
Jde o anticyklonu sevřenou mezi proudy Jupiterovy atmosféry. Není to pevný útvar na povrchu planety a slavný ovál nezaručuje neměnnou velikost. Dlouhodobá pozorování navíc dokládají zmenšování skvrny.
Časosběr tedy odhaluje něco, co osamělá fotografie skrývá. Zdánlivě známý symbol planety je dynamický meteorologický systém; ani po staletích pozorování nemusejí být podrobnosti jeho proměn úplně vysvětlené.''',
'''Letos je brambor málo, a tak jsou drahé. Pěstitelé rozšíří výsadbu, jenže nová úroda dorazí až v době, kdy stejné rozhodnutí učinili i ostatní.
Tak začíná pavučinový model trhu. Výrobci určují budoucí nabídku podle předchozí ceny, zatímco cena při sklizni už reaguje na nové množství. Velká úroda srazí cenu, omezení další výsadby pak může připravit nový nedostatek.
Střídání nemusí vyžadovat opakované sucho nebo jiný vnější šok. Vzniká uvnitř modelu kombinací výrobního zpoždění a způsobu, jakým si producenti tvoří očekávání.
Nejde o zákon, podle něhož musí každý zemědělský trh věčně oscilovat. Podle citlivosti nabídky a poptávky se mohou výkyvy tlumit, přetrvávat nebo zvětšovat. Lepší předvídání budoucího trhu také mění předpoklady celého příběhu.''',
'''Objev zemního plynu může zemi obohatit a současně ztížit život jiným vývozcům. Ekonomové tento možný vedlejší účinek surovinového boomu označují jako holandskou nemoc.
Příjmy ze surovin mohou vést k reálnému zhodnocení měny: domácí výrobky se vůči zahraničním zdraží. Rostoucí odvětví navíc přitahuje pracovníky a kapitál, o které pak soutěží ostatní firmy.
Výrobce, který suroviny netěží, tak může ztrácet konkurenceschopnost, přestože sám nezačal vyrábět hůře. Důležité jsou změny relativních cen a rozdělení zdrojů uvnitř hospodářství.
Název odkazuje k nizozemské zkušenosti s plynem, mechanismus ale není omezený na tuto zemi. Neznamená, že bohaté naleziště musí hospodářství poškodit; ukazuje, proč výsledek závisí i na nakládání s příjmy a na podmínkách ostatních odvětví.''',
'''Vyberete přitažlivější ze dvou tváří a potom vysvětlujete proč. Jenže výzkumník vám mezitím nenápadně podstrčil fotografii, kterou jste nevybrali.
V experimentu Johanssona a kolegů z roku 2005 si účastníci části takových záměn nevšimli. Přesto dokázali zdůvodňovat předložený výsledek, jako by šlo o jejich původní volbu. Výzkumníci jev označili jako slepotu k volbě.
Nejde jen o přehlédnutí změny obrazu. Podstatné je, že slovní vysvětlení může vzniknout až nad nesprávně předloženou možností a přitom působit jako zpráva o vlastních předchozích důvodech.
Pokus nedokazuje, že všechny preference jsou náhodné nebo že lidé vždy nevědí, co chtějí. Ukazuje užší omezení introspekce: přesvědčivé dodatečné vysvětlení samo nezaručuje, že opravdu zachycuje příčinu konkrétního rozhodnutí.''',
'''Když byste na určitou nabídku kývli vy, snadno čekáte podobnou reakci od ostatních. Vaše vlastní volba se tak může nenápadně proměnit v odhad společenské normy.
Ross, Greene a House zkoumali tento efekt mimo jiné žádostí, aby studenti nosili reklamní tabuli. Ti, kteří souhlasili, odhadovali souhlas ostatních jako častější než studenti, kteří nabídku odmítli.
Efekt falešného konsenzu tedy porovnává různé skupiny podle jejich vlastní volby. Není nutné, aby každý účastník tvrdil, že s ním souhlasí úplně všichni, ani aby byl každý jednotlivý odhad chybný.
Výsledek varuje před záměnou osobního stanoviska za reprezentativní vzorek. Když potřebujeme vědět, co si myslí veřejnost, silný pocit samozřejmosti není náhradou za údaje o tom, jak byly názory skutečně zjišťovány.''',
'''Na surovém záběru vypadají lidé nezvykle úzcí. Po správném zobrazení se jejich proporce napraví a před očima se otevře široký filmový obraz.
Anamorfotický objektiv zmenšuje obraz v jednom směru jinak než ve druhém. Běžná dvounásobná horizontální komprese vtěsná širší zorné pole do záznamu, který by bez tohoto postupu měl jiný poměr stran.
Při promítání nebo digitálním zpracování se provede odpovídající roztažení. Faktor musí odpovídat použitému objektivu; jinak zůstane obraz deformovaný. Ne každý anamorfotický objektiv přitom používá stejný poměr stlačení.
Široký obraz tedy nemusí vzniknout pouhým oříznutím horního a dolního okraje. Může být do záznamu opticky zakódován a teprve později rozvinut do správných proporcí. Samotný pohled na neroztažený snímek proto neukazuje zamýšlenou podobu filmu.''',
'''Ještě vidíte pokoj, ale už slyšíte ruch následující ulice. Střihač nemusí obraz a zvuk přepnout ve stejném okamžiku, aby mezi scénami vytvořil plynulý vztah.
Při děleném střihu má obrazová a zvuková stopa hranici jinde. U střihu označovaného jako J-cut přichází zvuk dalšího záběru před jeho obrazem. U L-cutu naopak zvuk předchozího záběru pokračuje i přes nový obraz.
V rozhovoru tak můžeme sledovat posluchačovu reakci, zatímco mluvčí ještě dokončuje větu. Přechod pozornosti se oddělí od konce repliky a dialog nemusí působit jako mechanické střídání tváří.
Názvy odkazují k tvaru uspořádání stop na časové ose. Podstatná ale není grafická značka v programu: je to možnost vést divákovo očekávání sluchem jinak než zrakem, aniž by se musel přidat nový záběr nebo vysvětlující text.''',
'''Nakreslete mnohoúhelník, jehož vrcholy leží na tečkách pravidelné čtvercové sítě. Jeho obsah můžete získat počítáním bodů, aniž změříte délku jediné šikmé strany.
Pickova věta říká: obsah se rovná počtu vnitřních mřížových bodů plus polovině počtu bodů na hranici minus jedna. Jednotkou je obsah základního čtverce sítě a každý hraniční bod započítáme jen jednou.
Čtverec o straně dva má jeden vnitřní a osm hraničních bodů. Výpočet tedy dává jedna plus čtyři minus jedna, což jsou čtyři čtvereční jednotky.
Podmínky jsou zásadní: mnohoúhelník má mít vrcholy v mříži, nesmí se sám křížit a v tomto základním znění nemá díry. Věta tak neslibuje obsah libovolné křivky podle počtu teček; spojuje přesnou geometrii s konkrétní diskrétní strukturou.''',
'''Tři rovné řezy nemusí znamenat šest porcí pizzy. Pokud nepřesouváte díly a řezy se vhodně protínají, lze získat až sedm částí.
První řez rozdělí kruh na dvě oblasti. Druhý může přidat další dvě. Třetí protne oba předchozí v různých bodech uvnitř pizzy, rozdělí se tím na tři úseky a každý může rozdělit jinou oblast.
Obecně může n-tý řez přidat nejvýše n nových částí. Součet jedna plus jedna plus dvě až po n dává maximum <strong>1 + n(n + 1)/2</strong>. Je třeba vyhnout se rovnoběžným řezům a společnému průsečíku tří čar.
Porce nemusejí být stejně velké a vzorec není návodem na spravedlivé servírování. Ukazuje jinou věc: počet vzniklých oblastí závisí na uspořádání průsečíků, nejen na počtu pohybů nože.''',
'''Web se přestěhoval na novou adresu, ale část lidí ještě míří na starý server. Důvodem může být mezipaměť DNS, nikoli pomalé šíření souborů samotného webu.
Resolver si odpověď na dotaz po doméně může uložit. Záznam nese časovou platnost TTL, která omezuje běžnou dobu jeho uchovávání bez nového dotazu. Dva resolvery se ale mohly ptát v jinou chvíli a mít různé zbývající časy.
Změna u autoritativního serveru proto nevymaže okamžitě všechny již uložené odpovědi. Nižší TTL může tento přechod zkrátit, pokud bylo nastaveno s dostatečným předstihem.
Existují i standardizované režimy, které při potížích dovolují dočasně použít zastaralá data. TTL je tedy pravidlo práce s kopií odpovědi, nikoli záruka, že všichni uživatelé na světě ve stejnou sekundu uvidí stejný stav.''',
'''Prst stiskne tlačítko jednou, ale elektronika může naměřit několik rychlých přepnutí. Mechanický kontakt totiž při dosednutí krátce odskakuje.
Pro rychlý digitální vstup může každý takový zákmit vypadat jako další změna stavu. Počítadlo bez ošetření pak z jednoho úmyslného stisku získá několik událostí.
Postup zvaný debounce tyto krátké přechody filtruje. Program může přijmout nový stav až po jeho dostatečně dlouhém ustálení; obvodové řešení může použít vhodné časové zpracování a vstup s hysterezí.
Univerzální čekací doba pro každé tlačítko neexistuje. Příliš krátký interval nechá rušení projít, zbytečně dlouhý zhorší odezvu. Rozdíl mezi lidským úkonem a elektrickým signálem tak musí návrhář výslovně překlenout: součástka sama neposílá abstraktní zprávu o jednom stisknutí.''',
'''Koš ze vzdálenosti může mít větší cenu než bližší úspěšný pokus. NBA tuto možnost zavedla pro sezonu 1979–80 přijetím tříbodové čáry.
Za úspěšnou střelu zpoza čáry získá tým tři body místo dvou. Tím se mění vztah mezi obtížností pokusu a jeho bodovou odměnou. Pro ilustraci: čtyřicet procent proměněných trojek dává v průměru 1,2 bodu na střelu, stejně jako šedesát procent proměněných dvojek.
Tento jednoduchý výpočet ovšem pomíjí doskoky, fauly, ztráty i možnosti spoluhráčů. Sám tedy neurčuje nejlepší střelu v konkrétní situaci.
Ukazuje však, proč čára na podlaze není jen geometrická pomůcka. Pravidlo oceňuje část prostoru jinak a nutí útok i obranu přemýšlet o vzdálenosti novým způsobem. Proměna strategie pak může pokračovat dlouho po zavedení pravidla.''',
'''Skokan roztáhne špičky lyží a vytvoří písmeno V. Dnes známá silueta kdysi přinášela srážky za styl, přestože pomáhala prodloužit let.
Švéd Jan Boklöv techniku prosazoval v osmdesátých letech. Oproti souběžným lyžím nabízela výhodnější aerodynamické uspořádání, ale neodpovídala tehdejším představám rozhodčích o správném provedení.
Boklöv přesto vyhrál celkové hodnocení Světového poháru v sezoně 1988–89. Úspěch přispěl k šíření V-stylu a postupné změně soutěžního standardu.
Příběh tedy není jen o nápadu letět dál. Skoky kombinují měřitelnou vzdálenost s bodovým hodnocením stylu a nová technika musí obstát v obou složkách. Způsob, kterým soutěž měří kvalitu, může nejprve penalizovat postup, který se později stane normou.'''
]
sources=[
[('National Army Museum: Christmas truce','https://ww1.nam.ac.uk/1331/news/christmas-truce/'),('National Army Museum: A First World War Christmas','https://www.nam.ac.uk/explore/christmas-ww1')],
[('Nova Scotia Museum: Explosion in The Narrows','https://museum.novascotia.ca/stories/explosion-narrows-1917-halifax-harbour-explosion'),('Nova Scotia Archives: 1917 Halifax Explosion','https://archives.novascotia.ca/halifax-explosion/')],
[('Stanford Encyclopedia of Philosophy: Spinoza','https://plato.stanford.edu/entries/spinoza/'),('Internet Encyclopedia of Philosophy: Spinoza','https://iep.utm.edu/spinoza/')],
[('Stanford Encyclopedia of Philosophy: Pascal’s Wager','https://plato.stanford.edu/entries/pascal-wager/'),('Internet Encyclopedia of Philosophy: Pascal’s Wager','https://iep.utm.edu/pasc-wag/')],
[('Gerl a Schuster: Archerfish actively control the hydrodynamics of their jets','https://pubmed.ncbi.nlm.nih.gov/25201684/'),('Archerfish use their shooting technique to produce adaptive underwater jets','https://pubmed.ncbi.nlm.nih.gov/28082614/')],
[('Oxford University Museum: The Common Cuckoo','https://www.oumnh.ox.ac.uk/node/4964346'),('RSPB: Cuckoo','https://www.rspb.org.uk/birds-and-wildlife/cuckoo')],
[('The Metropolitan Museum of Art: Lithograph','https://www.metmuseum.org/perspectives/materials-and-techniques-printmaking-lithograph'),('MoMA: Lithography','https://www.moma.org/collection/terms/lithography')],
[('SFMOMA: Alexander Calder','https://www.sfmoma.org/exhibition/alexander-calder/'),('National Gallery of Art: Alexander Calder','https://www.nga.gov/artists/2047-alexander-calder')],
[('Harvard CHS: Sophocles, Oedipus Tyrannus','https://chs.harvard.edu/primary-source/sophocles-oedipus-tyrannus-sb/'),('Encyclopaedia Britannica: Dramatic irony','https://www.britannica.com/art/dramatic-irony')],
[('Poetry Foundation: Ode on a Grecian Urn','https://www.poetryfoundation.org/poems/44477/ode-on-a-grecian-urn'),('Poetry Foundation: rozbor Keatsovy ódy','https://www.poetryfoundation.org/articles/145240/john-keats-ode-on-a-grecian-urn')],
[('World Bank: Participatory Budgeting in Porto Alegre','https://documents1.worldbank.org/curated/en/778301468019774995/pdf/401440v10ER0P01sclosed0March0302008.pdf'),('PADECO: Participatory Budgeting in Porto Alegre','https://www.padeco.co.jp/en/projects/detail.html?cmid=573&pdid=25020')],
[('ESLP: Guide on Article 4 of Protocol No. 7','https://ks.echr.coe.int/documents/d/echr-ks/guide_art_4_protocol_7_eng'),('ESLP: Article 4 of Protocol No. 7','https://ks.echr.coe.int/en/web/echr-ks/article-4-protocol-7')],
[('OpenStax: Beats','https://openstax.org/books/university-physics-volume-1/pages/17-6-beats'),('OpenStax: Sound Interference and Resonance','https://openstax.org/books/physics/pages/14-4-sound-interference-and-resonance')],
[('OpenStax: Precession of a Gyroscope','https://openstax.org/books/university-physics-volume-1/pages/11-4-precession-of-a-gyroscope'),('University of Texas: Gyroscopic Precession','https://farside.ph.utexas.edu/teaching/336k/lectures/node70.html')],
[('American Chemical Society: Red Cabbage Indicator','https://www.acs.org/education/activities/red-cabbage-indicator.html'),('Anthocyanins contents, profiles, and color characteristics of red cabbage extracts','https://pubmed.ncbi.nlm.nih.gov/24991694/')],
[('OpenStax: Corrosion','https://openstax.org/books/chemistry/pages/17-6-corrosion'),('Penn State: Corrosion','https://psu.pb.unizin.org/chem112masp18/chapter/17-6-corrosion/')],
[('NASA: Uranus Facts','https://science.nasa.gov/uranus/facts/'),('University of Wisconsin: Seasonal Change on Uranus','https://www.ssec.wisc.edu/planetary/uranus/science/')],
[('NASA: Hubble Watches Jupiter’s Great Red Spot Behave Like a Stress Ball','https://science.nasa.gov/missions/hubble/nasas-hubble-watches-jupiters-great-red-spot-behave-like-a-stress-ball/'),('NASA: Jupiter’s Great Red Spot','https://science.nasa.gov/asset/hubble/jupiters-great-red-spot-2/')],
[('MENDELU: Cobweb model of economics','https://user.mendelu.cz/marik/frvs/cobweb.pdf'),('Production delays and price dynamics','https://www.sciencedirect.com/science/article/abs/pii/S0167268121005436')],
[('IMF: Dutch Disease','https://www.imf.org/en/publications/fandd/issues/series/back-to-basics/dutch-disease'),('World Bank: Sudden Influxes of Resource Wealth to the Economy','https://documents.worldbank.org/en/publication/documents-reports/documentdetail/518791586875176017')],
[('Johansson a kol.: Failure to detect mismatches between intention and outcome','https://pubmed.ncbi.nlm.nih.gov/16210542/'),('Science: původní studie slepoty k volbě','https://ruccs.rutgers.edu/images/personal-zenon-pylyshyn/class-info/Consciousness_2014/Johansson_ChoiceBlindness_Science2005.pdf')],
[('Ross, Greene a House: The False Consensus Effect','https://web.mit.edu/curhan/www/docs/Articles/biases/13_J_Experimental_Social_Psychology_279_%28Ross%29.pdf'),('Mullen a kol.: A meta-analysis of 115 hypothesis tests','https://www.sciencedirect.com/science/article/pii/0022103185900204')],
[('ARRI: ALEXA LF & Anamorphic Lenses','https://www.arri.com/resource/blob/41434/9093dd51fa56328b70f56a718bac0e22/2018-10-26-alexa-lf-and-anamorphic-lenses-pdf-data.pdf'),('ARRI: Anamorphic Formats in Post-Production','https://www.arri.com/resource/blob/388830/8e291fd59589918e30d20677af9f0290/arri-alexa-35-anamorphic-formats-in-post-production-workflow-guideline-data.pdf')],
[('Avid: Using L-Cuts in the Timeline','https://resources.avid.com/supportfiles/attach/interplay_central/ipc_help/InterplayCentral_Help/UG_Sequences.15.55.html'),('Pearson: Video Production 101 – Delivering the Message','https://ptgmedia.pearsoncmg.com/images/9780321990198/samplepages/9780321990198.pdf')],
[('Wolfram MathWorld: Pick’s Theorem','https://mathworld.wolfram.com/PicksTheorem.html'),('New York University: Pick’s Theorem','https://math.nyu.edu/Archimedes/Stomachion/Pick.html')],
[('Wolfram MathWorld: Circle Division by Lines','https://mathworld.wolfram.com/CircleDivisionbyLines.html'),('Wolfram MathWorld: Plane Division by Lines','https://mathworld.wolfram.com/PlaneDivisionbyLines.html')],
[('RFC 1035: Domain Names – Implementation and Specification','https://www.rfc-editor.org/rfc/rfc1035.html'),('RFC 8767: Serving Stale Data to Improve DNS Resiliency','https://www.rfc-editor.org/rfc/rfc8767.html')],
[('Texas Instruments: Debounce a Switch','https://www.ti.com/lit/ab/scea094/scea094.pdf'),('Arduino: Debounce on a Pushbutton','https://docs.arduino.cc/built-in-examples/digital/Debounce/')],
[('FIBA: The Birth of the Three-Point Line','https://assets.fiba.basketball/image/upload/documents-corporate-others-90th-anniversary-book-single-page.pdf'),('Shot distribution in the NBA: výzkumná studie','https://pmc.ncbi.nlm.nih.gov/articles/PMC7712598/')],
[('Norrbottens Museum: Jan Boklöv a V-styl','https://www.ushnorrbotten.se/sv/fodelse/jan-boklov-uppfinnaren-av-v-stilen/'),('Even eagles struggle to fly: historická studie s rozhovory','https://www.tandfonline.com/doi/full/10.1080/17430437.2025.2596505')]
]
concepts=[
'Two anonymous British and German soldiers of 1914 exchange a small gift between trenches; no battle, flags or football.',
'A single early twentieth-century cargo steamship burning in a harbour, restrained small flame and hull; no victims or explosion diagram.',
'One young sapling pushing upward, a concise metaphor for striving to persevere; not a botanical claim about consciousness.',
'One die beside an open book, a restrained metaphor for Pascal’s decision argument, no writing or religious emblems.',
'An archerfish at the water surface shoots one clean jet toward a single small insect above it.',
'One large cuckoo chick with open beak sitting in a small host nest, emphasizing the scale mismatch without showing harm.',
'A lithographic limestone slab with a simple greasy drawing and an ink roller resting beside it, flat printing surface.',
'A freely suspended balanced mobile with just three broad colored leaf shapes on clearly connected arms; original generic arrangement.',
'A simple ancient Greek theatrical mask accompanying the tragedy Oedipus; intact face, no violence.',
'A Greek urn with two profile figures whose faces nearly meet; the suspended almost-kiss is a decorative image on the vessel.',
'Two hands place large voting tokens into one shared municipal budget bowl; anonymous, no charts or labels.',
'A closed legal case folder with one simple lock, illustrating finality; no text or repetitive arrows.',
'Two tuning forks close together, visibly slightly different size; no waveform chart needed.',
'A tilted spinning gyroscope balanced on one pivot; recognizable frame and wheel, no force arrows.',
'Three small identical glasses containing pink, purple and green cabbage indicator; no extra laboratory objects or labels.',
'A simple steel boat hull with one attached pale zinc anode block; no rust diagrams or extra apparatus.',
'Uranus as a pale cyan sphere with thin rings in a nearly vertical projected plane; no arrows, orbit or stars.',
'One Jupiter globe with a few broad cloud bands and one prominent red oval storm; no moons or labels.',
'A single overflowing crate of potatoes accompanies the delayed harvest supply story; no chart or price labels.',
'A broad gas pipeline beside a compact factory silhouette in one coherent industrial vignette; no money symbols or charts.',
'One hand holds two simple portrait cards, suggesting exchanged choices; anonymous faces and no labels.',
'One large speech bubble overlaps two smaller empty speech bubbles; a concise metaphor for projecting one’s view onto others, no words.',
'One cinema camera lens with a visibly oval front element, accompanying anamorphic cinematography; no flares or labels.',
'Two broad stacked film and audio timeline strips whose change boundaries are offset, no labels, tiny frames or graphs.',
'A single simple polygon over a sparse square lattice of prominent dots; no equations or labels.',
'A plain circular pizza with exactly three straight cuts whose three pairwise intersections are distinct and inside the circle, making seven regions; no toppings.',
'A simple network direction sign beside a small hourglass as metaphor for a cached address expiry; no letters or arrows network.',
'A large mechanical pushbutton with a visible single spring, accompanying contact bounce; no waveform or circuitry.',
'One basketball near a simple hoop and a single curved court line; no score, text or entire court.',
'One anonymous airborne ski jumper with two clearly separated skis forming a V in front; compact side-front view, no mountains.'
]
# Prefer directly readable institutional sources where a site returned only an empty shell.
sources[1][1]=('Parks Canada: The Halifax Explosion','https://www.canada.ca/en/parks-canada/news/2016/07/the-halifax-explosion.html')
sources[8][1]=('EBSCO Research Starters: Dramatic irony','https://www.ebsco.com/research-starters/literature-and-writing/dramatic-irony')
sources[12][1]=('OpenStax: Sound Interference and Resonance','https://openstax.org/books/physics/pages/14-4-sound-interference-and-resonance')
sources[15]=[('OpenStax: Corrosion','https://openstax.org/books/chemistry/pages/17-6-corrosion'),('Penn State: Corrosion and cathodic protection','https://psu.pb.unizin.org/chem112masp18/chapter/17-6-corrosion/')]
sources[19][1]=('World Bank: Sudden Influxes of Resource Wealth','https://documents.worldbank.org/en/publication/documents-reports/documentdetail/518791586875176017')
sources[29][0]=('Sveriges Radio: Jan Boklöv a sporný V-styl','https://www.sverigesradio.se/artikel/6333959')
sources[19][1]=('World Bank: Sudden Influxes of Resource Wealth','https://documents.worldbank.org/en/publication/documents-reports/documentdetail/518791586875176017')
sources[29][0]=('Sveriges Radio: rozhovor o Boklövově V-stylu','https://www.sverigesradio.se/artikel/jan-boklovs-v-stil-fyller-40-ar-dyraste-inom-idrotten')
drafts=[]
assert len(texts)==len(sources)==len(concepts)==30
for i,(r,plan,txt,src,concept) in enumerate(zip(b['rows'],b['proposals'],texts,sources,concepts),1042):
    content=''.join('<p>'+p.strip()+'</p>' for p in txt.splitlines() if p.strip())
    assert 500<=len(content)<=1200,(i,len(content))
    motif=r[7]
    illustration=dict(concept=concept,scene_type=r[8],primary_subject=motif,secondary_subjects=[],visual_keywords=motif.split('_')[:5],composition_hints=['dominant_central_object','balanced_transparent_margins'],mood='neutral',palette=r[9])
    drafts.append(dict(id=str(i),title=r[1],category=r[0],content=content,sources=[dict(label=l,url=u) for l,u in src],illustration=illustration,knowledge=plan['knowledge']))
b['save']('-drafts.json',drafts)
print('Drafts:',len(drafts),'length range:',min(len(p['content']) for p in drafts),max(len(p['content']) for p in drafts))
