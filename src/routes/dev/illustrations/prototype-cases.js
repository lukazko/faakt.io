/**
 * Čtrnáct skutečných příspěvků pro prototyp geometrického stylu.
 * Data jsou převzatá z `static/data/posts.json`. Rodina a předmět jsou
 * u případů s více možnostmi zvolené ručně, aby šla porovnat každá scéna.
 */

export const PROTOTYPE_CASES = [
  {
    "id": "027",
    "title": "Sokrates: vím, že nic nevím, a proto jsem nejmoudřejší z Athéňanů",
    "category": "filozofie",
    "content": "<p>Co kdyby byla přiznaná neznalost cennější než sebejistá odpověď? Přesně tímto paradoxem prošel svým životem Sokrates.</p><p>Athénský delfský orákul prohlásil Sokrata, žijícího kolem roku 400 př. n. l., za nejmoudřejšího muže v Athénách. Sokrates tomu nevěřil a vydal se ptát řemeslníků, politiků i básníků, aby zjistil, zda ho někdo v moudrosti předčí.</p><p>Zjistil, že všichni jsou přesvědčeni o své znalosti, ale při hlubším zkoumání se ukázalo, že rozumí věcem méně, než si myslí. Sokrates sám tvrdil, že jeho moudrost spočívá právě v tom, že si je vědom vlastní nevědomosti.</p><p>Tento postoj se stal základem takzvané sokratovské metody – kladení otázek, které odhalují mezery ve vlastním myšlení. Dnes ji používají učitelé, terapeuti i vědci, kteří vědí, že první krok k poznání je přiznat si, co nevíme.</p>",
    "family": "portrait"
  },
  {
    "id": "032",
    "title": "Plíseň na zapomenuté Petriho misce, která zachránila miliony životů",
    "category": "veda",
    "content": "<p>Co by se stalo, kdyby si skotský bakteriolog v roce 1928 nezapomněl umýt nádobí před odjezdem na dovolenou? Historie medicíny by možná vypadala úplně jinak.</p><p>Alexander Fleming se po návratu do laboratoře v Londýně všiml, že jedna z jeho zapomenutých misek s bakteriemi stafylokoka je zamořená plísní rodu <em>Penicillium</em> – a kolem ní bakterie odumřely. Objevil tak látku, kterou nazval penicilin.</p><p>Samotný Fleming netušil, jak látku vyrobit ve větším množství, a teprve o deset let později ji dokázali izolovat a vyrábět chemici Howard Florey a Ernst Chain. Během druhé světové války penicilin zachránil životy tisíců raněných vojáků.</p><p>Za tento objev získali všichni tři vědci v roce 1945 Nobelovu cenu za fyziologii a medicínu. Náhoda v laboratoři tak odstartovala éru antibiotik.</p>",
    "family": "discovery"
  },
  {
    "id": "155",
    "title": "James Webb: teleskop, který vidí nejstarší galaxie vesmíru",
    "category": "astronomie",
    "content": "<p>Vesmírný dalekohled <strong>James Webb</strong> byl vypuštěn 25. prosince 2021 a umístěn do vzdálenosti asi 1,5 milionu kilometrů od Země, v takzvaném Lagrangeově bodě L2.</p><p>Na rozdíl od svého předchůdce, Hubbleova teleskopu, pozoruje Webb vesmír především v infračerveném spektru, což mu umožňuje vidět skrz oblaka prachu a zachytit světlo velmi vzdálených a tedy i velmi starých galaxií.</p><p>V červenci 2022 zveřejnila NASA první ostré snímky, včetně hlubokého pole vesmíru s tisíci galaxiemi, z nichž některé vznikly už několik set milionů let po velkém třesku.</p><p>Teleskop, vyvíjený přes dvacet let za náklady přesahující 10 miliard dolarů, dnes patří k nejvýkonnějším vědeckým nástrojům, jaké lidstvo kdy vytvořilo.</p>",
    "family": "discovery",
    "subject": "telescope"
  },
  {
    "id": "864",
    "title": "Proč jsou Grimmové víc než sběratelé pohádek",
    "category": "literatura",
    "content": "<p>Bratři Jacob a Wilhelm Grimmovi vydali v letech 1812 až 1815 sbírku <em>Dětské a domácí pohádky</em>. Většina lidí je zná jako sběratele lidových vyprávění, ale byli především učenci.</p><p>Jacob Grimm je autorem <strong>Grimmova zákona</strong>, který popisuje pravidelné změny hlásek mezi germánskými jazyky a ostatními indoevropskými. Bratři také začali sestavovat velký německý slovník, který vyšel až v roce 1961.</p><p>Pohádky nesbírali jen od prostých venkovanů, ale často od vzdělaných vypravěček. Postupně je upravovali, Wilhelm zvlášť zjemňoval drsné části a doplňoval morální nauku.</p><p>Sbírka měla vliv na vznik folkloristiky. Podobné sbírky pak vznikaly v celé Evropě, včetně české od Karla Jaromíra Erbena.</p>",
    "family": "storybook"
  },
  {
    "id": "088",
    "title": "Aristotelés a zlatá střední cesta mezi extrémy",
    "category": "filozofie",
    "content": "<p>Kolik odvahy je příliš mnoho a kolik málo?</p><p>Aristotelés si všiml, že lidé mají tendenci sklouzávat k extrémům — buď k zbabělosti, nebo k bezhlavé odvaze. Ve spise <em>Etika Níkomachova</em>, který napsal kolem roku 340 př. n. l., ukázal, že skutečná ctnost leží uprostřed.</p><p>Odvaha tak není absence strachu ani jeho přemíra, ale schopnost jednat správně mezi zbabělostí a bezohledností. Stejný princip platí u velkorysosti mezi marnotratností a šetrností, nebo u sebevědomí mezi arogancí a ponížeností.</p><p>Aristotelés netvrdil, že střed je matematický průměr — je to bod, který odpovídá konkrétní situaci a člověku. Proto ctnost vyžaduje praxi a úsudek, ne jen teorii.</p><p><strong>Rovnováha se nedá naučit z knihy, jen opakovaným rozhodováním.</strong></p>",
    "family": "metaphor"
  },
  {
    "id": "051",
    "title": "Milgramův experiment: jak snadno uposlechneme rozkaz ubližovat",
    "category": "psychologie",
    "content": "<p>Zmáčkli byste tlačítko, které někomu způsobí bolest, jen proto, že vám to řekl muž v bílém plášti?</p><p>Psycholog Stanley Milgram to v roce 1961 na Yaleově univerzitě skutečně testoval. Účastníci měli za falešné chyby udělovat elektrické šoky „studentovi“ v druhé místnosti — ve skutečnosti hercovi, kterému se nic nestalo.</p><p>Přestože herec křičel a prosil o zastavení, přibližně 65 procent účastníků pokračovalo až do nejvyšší, potenciálně smrtelné úrovně napětí, jen na základě verbálního nátlaku experimentátora.</p><p>Milgram chtěl porozumět tomu, jak mohli obyčejní lidé v nacistickém Německu páchat hrozné zločiny. Experiment ukázal, že autorita dokáže potlačit i základní morální zábrany.</p>",
    "family": "metaphor",
    "subject": "brain"
  },
  {
    "id": "033",
    "title": "Michelangelo strávil čtyři roky malováním stropu, na který se nemohl dívat zpříma",
    "category": "umeni",
    "content": "<p>Zkuste si na chvíli lehnout na záda a natáhnout ruce nad hlavu. Teď si představte, že v této pozici, na lešení pod klenbou, malujete čtyři roky.</p><p>Papež Julius II. pověřil Michelangela Buonarrotiho v roce 1508 výmalbou stropu Sixtinské kaple ve Vatikánu. Sochař, který malbu považoval za vedlejší disciplínu, nakonec vytvořil přes tři sta postav na ploše více než pěti set metrů čtverečních.</p><p>Michelangelo maloval vestoje s hlavou zvrácenou vzhůru na speciálně navrženém lešení, nikoli vleže, jak se často mylně tvrdí. Přesto si při práci trvale poškodil oči a krční páteř natolik, že podle dochovaných dopisů měl potíže číst dokumenty vzpřímeně ještě roky poté.</p><p>Výsledná freska Stvoření Adama se dnes stala jedním z nejrozpoznatelnějších obrazů v dějinách lidstva.</p>",
    "family": "metaphor",
    "subject": "palette"
  },
  {
    "id": "053",
    "title": "Gödel dokázal, že matematika nikdy nemůže dokázat úplně vše",
    "category": "matematika",
    "content": "<p>Může matematika dokázat naprosto všechno, co je pravdivé?</p><p>Rakouský logik Kurt Gödel na tuto otázku odpověděl v roce 1931 překvapivě: ne. Ve svých teorémech o neúplnosti dokázal, že v každém dostatečně silném formálním systému, jako je aritmetika, existují pravdivá tvrzení, která se v rámci tohoto systému nedají ani dokázat, ani vyvrátit.</p><p>Jinými slovy, žádný matematický systém nemůže být zároveň úplný a zaručeně bezesporný. Gödelovy věty otřásly snahou matematiků na počátku 20. století vybudovat jednotný, dokonale konzistentní základ celé matematiky.</p><p>Důsledky sahají i do filozofie a informatiky — ukazují na principiální hranice formálních systémů a algoritmického myšlení.</p>",
    "family": "metaphor",
    "subject": "polyhedron"
  },
  {
    "id": "148",
    "title": "Cesta na Měsíc: film z roku 1902, který vynalezl filmové triky",
    "category": "filmy",
    "content": "<p>Francouzský filmař <strong>Georges Méliès</strong>, původně profesionální kouzelník, natočil v roce 1902 čtrnáctiminutový film <em>Cesta na Měsíc</em>, dnes považovaný za jedno z prvních děl sci-fi žánru.</p><p>Film ukazuje skupinu vědců, kteří vystřelí z obřího děla kabinu s posádkou na Měsíc, kde narazí na obyvatele zvané Selenité. Nejznámějším záběrem je dělová koule zabodnutá do oka antropomorfizovaného Měsíce.</p><p>Méliès při natáčení vynalezl řadu technik, které se staly základem filmových triků, včetně vícenásobné expozice, rozpouštění záběrů a ručně malovaného kolorování políček filmu.</p><p>Přestože byl film v době vydání komerčně pirátsky kopírován v USA bez Méliésova svolení, dodnes patří k nejvlivnějším dílům rané kinematografie.</p>",
    "family": "metaphor",
    "subject": "film"
  },
  {
    "id": "111",
    "title": "Howard Carter otevřel hrobku, kterou 3245 let nikdo nespatřil",
    "category": "historie",
    "content": "<p>4. listopadu 1922 narazili dělníci v Údolí králů na schod vytesaný do skály. O tři týdny později stál britský archeolog Howard Carter před zapečetěnými dveřmi a jeho svíce odhalila místnost plnou zlata.</p><p>Byla to hrobka faraona <strong>Tutanchamona</strong>, který zemřel kolem roku 1323 př. n. l. a jehož poslední místo odpočinku zůstalo na rozdíl od většiny ostatních hrobek nevykradené.</p><p>Expedici financoval lord Carnarvon a nálezy — včetně proslulé zlaté masky — dodnes patří k nejcennějším artefaktům starého Egypta.</p><p>Mezi smrtí faraona a otevřením jeho hrobky uplynulo přesně tolik let, kolik dnes trvá zhruba 130 lidských generací.</p>",
    "family": "relic"
  },
  {
    "id": "043",
    "title": "Katedrála, která se staví už přes sto čtyřicet let",
    "category": "umeni",
    "content": "<p>Existuje stavba, kterou nikdo z jejích tvůrců neuvidí dokončenou. Barcelonská bazilika <strong>Sagrada Família</strong> se staví od roku 1882 a dodnes není hotová.</p><p>Architekt Antoni Gaudí na projektu pracoval přes čtyřicet let a věnoval mu poslední desetiletí svého života, přesto se dožil dokončení jen zlomku stavby. Zemřel v roce 1926, sražen tramvají.</p><p>Gaudí kombinoval gotické prvky s organickými tvary inspirovanými přírodou — sloupy připomínají stromy, věže krápníky.</p><p>Dokončení se dnes plánuje kolem roku 2026, u příležitosti sto let od Gaudího smrti, financování stavby přitom stále závisí hlavně na vstupním vstupném turistů.</p>",
    "family": "relic",
    "subject": "column"
  },
  {
    "id": "203",
    "title": "Hmota stromu nepochází ze země, ale ze vzduchu",
    "category": "veda",
    "content": "<p>Kde se vezme dřevo, ze kterého je strom? Intuitivní odpověď zní, že si ho rostlina vytáhne z půdy. Skutečnost je jiná.</p><p>Při <strong>fotosyntéze</strong> rostlina pomocí energie světla váže oxid uhličitý ze vzduchu a vodu a vytváří z nich cukry. Uhlík, který tvoří většinu sušiny dřeva, tak pochází z atmosféry.</p><p>Vedlejším produktem tohoto procesu je kyslík. Právě díky němu se složení zemské atmosféry v dávné minulosti zásadně změnilo a umožnilo vznik dnešních forem života.</p><p>Půda dodává vodu a minerální živiny, které jsou nezbytné, ale hmotnostně tvoří jen menší část.</p><p><em>Strom je do velké míry vzduch, který se podařilo zachytit a zpevnit.</em></p>",
    "family": "nature",
    "subject": "tree"
  },
  {
    "id": "152",
    "title": "Chobotnice mají tři srdce a modrou krev",
    "category": "zajimavost",
    "content": "<p>Oběhová soustava chobotnic funguje zcela jinak než u obratlovců, včetně člověka.</p><p>Chobotnice mají <strong>tři srdce</strong>: dvě žaberní srdce pumpují krev skrze žábry, kde se okysličuje, a jedno systémové srdce rozvádí okysličenou krev do zbytku těla.</p><p>Jejich krev navíc není červená, ale modrá, protože kyslík v ní přenáší měď obsahující bílkovina hemocyanin místo železa obsahujícího hemoglobinu, který dává barvu krvi obratlovců.</p><p>Zajímavostí je i to, že při plavání se systémové srdce chobotnice dočasně zastavuje, což je jeden z důvodů, proč se chobotnice raději plazí po dně, než aby neustále plavaly – plavání je pro ně energeticky velmi náročné.</p>",
    "family": "nature",
    "subject": "octopus"
  },
  {
    "id": "207",
    "title": "Myšlenka, že se kontinenty pohybují, byla desítky let odmítána",
    "category": "veda",
    "content": "<p>Pobřeží Jižní Ameriky a Afriky do sebe podezřele zapadají. Na tuto podobnost upozorňovali pozorovatelé už dlouho, ale zůstávala kuriozitou.</p><p>V roce 1912 z ní německý meteorolog Alfred Wegener udělal teorii. Doložil ji shodou geologických vrstev a nálezy stejných fosilií na různých kontinentech a tvrdil, že pevniny kdysi tvořily jeden celek a od té doby se rozešly.</p><p>Hlavní námitka zněla, že nedokázal vysvětlit, jaká síla by tak obrovské masy pohybovala. Teorie proto byla řadu desetiletí odmítána.</p><p>Uznání přišlo až v 60. letech 20. století, kdy výzkum dna oceánů a magnetických pruhů vedl k teorii deskové tektoniky.</p><p><em>Správné pozorování bez mechanismu nestačí, ale nezmizí.</em></p>",
    "family": "layers",
    "subject": null
  }
];
