"""Authored editorial copy for the 1.5.2 batch; no AI/API calls."""
from pathlib import Path
import json
ROOT = Path(__file__).resolve().parents[1]
plan = json.loads((ROOT/'reports/v152-plan.json').read_text(encoding='utf-8'))
copy = []
def add(title, paragraphs, subject, concept, keywords, sources, scene='object', secondary=None, mood='contemplative', palette='blue_gold'):
    copy.append(dict(title=title,content=''.join('<p>'+p+'</p>' for p in paragraphs),sources=[dict(label=a,url=b) for a,b in sources],illustration=dict(concept=concept,scene_type=scene,primary_subject=subject,secondary_subjects=secondary or [],visual_keywords=keywords.split(','),composition_hints=['centered_horizontal_and_vertical','balanced_empty_margins','large_readable_silhouette'],mood=mood,palette=palette)))

add('Hodinky, které pomohly najít místo uprostřed oceánu',[
'Na širém moři nestačí vědět, kolik je hodin právě tam. Pro určení zeměpisné délky potřebovali námořníci také čas místa, které už dávno zmizelo za obzorem.',
'Země se otočí za den, takže rozdíl jedné hodiny odpovídá patnácti stupňům délky. Porovnání místního slunečního času s uchovaným referenčním časem proto může prozradit polohu ve směru východ–západ.',
'Potíž byla udržet přesný chod během plavby. John Harrison vytvořil časoměřič <strong>H4</strong>, dokončený roku 1759, který připomínal velké kapesní hodinky. Na cestě na Jamajku roku 1761 jej zkoušel jeho syn William.',
'Nešlo o kouzelné ukazování polohy na ciferníku. Přístroj uchovával jednu z veličin potřebných k výpočtu: čas vzdáleného místa, který loď vezla s sebou.'
], 'harrison_h4_watch','A single large silver eighteenth-century marine watch, with a simple pale dial and dark hands.','silver_case,pale_dial,dark_hands',[
('Royal Museums Greenwich: Harrisonovy časoměřiče','https://www.rmg.co.uk/stories/time/harrisons-clocks-longitude-problem'),('Royal Museums Greenwich: H4, rok 1759','https://www.rmg.co.uk/collections/objects/rmgc-object-79142')])
add('Po požáru Londýna se měnila i pravidla stavění',[
'Po požáru roku 1666 nestačilo v Londýně jen postavit ztracené domy znovu. Obnova měla změnit i podmínky, za kterých se mohl další oheň šířit.',
'Zákon přijatý v únoru 1667 požadoval cihlové nebo kamenné vnější stěny nových budov a upravoval podobu zástavby. Šlo tedy o zásah do toho, jak se město smí obnovovat, nikoli jen o rozdělení pomoci po katastrofě.',
'Z toho vznikl vytrvalý omyl: že Londýn objevil cihly až po požáru. Zděné domy přitom existovaly už před ním, dokonce i v Pudding Lane, kde hořet začalo. Starší královská nařízení je rovněž prosazovala.',
'<strong>Katastrofa nezavedla nový materiál, ale proměnila rozsah a vynucování jeho použití.</strong> Podoba dnešního města tak může vyrůstat také z pravidel napsaných ve chvíli, kdy se jeho předchozí podoba zhroutila.'
], 'london_brick_house','A compact seventeenth-century London brick house with pale stone window surrounds; no fire or skyline.','brick_facade,steep_roof,pale_windows',[
('UK Parliament: zákon o obnově Londýna','https://www.parliament.uk/about/living-heritage/transformingsociety/towncountry/towns/collections/collections-great-fire-1666/1666-act-to-rebuild-the-city-of-london/'),('London Museum: mýty o velkém požáru','https://www.londonmuseum.org.uk/collections/london-stories/myths-great-fire-london/')],palette='terracotta_cream')
add('Kdy smí okolí rozhodovat za vás?',[
'Vaše rozhodnutí může ostatním připadat hloupé. Znamená to už samo o sobě, že vás smějí donutit k jinému?',
'John Stuart Mill v knize <em>O svobodě</em> z roku 1859 hájí princip újmy: podstatným důvodem donucení má být ochrana druhých, nikoli jen vlastní dobro člověka, kterému okolí poroučí. Míří přitom i na tlak společnosti, nejen na státní zákazy.',
'Rozlišuje se tak přesvědčování od nucení. Svéprávného dospělého lze varovat a kritizovat, aniž z toho automaticky plyne právo jeho volbu zakázat. Pouhá nelibost okolí není totéž co poškození jeho zájmů.',
'Nejde o hotový seznam povolených činů. Sporné zůstává, co přesně je újma a které následky už zasahují druhé. Millův argument ale mění výchozí otázku: kdo chce omezovat, musí uvést víc než tvrzení, že ví lépe, jak má druhý žít.'
], 'open_hand_at_boundary','An open pale hand held beside a simple boundary line, evoking the limit of coercion without restraints.','open_palm,boundary_line,clear_gesture',[
('Stanford Encyclopedia of Philosophy: meze práva','https://plato.stanford.edu/entries/law-limits/'),('Stanford Encyclopedia of Philosophy: Millova morální a politická filozofie','https://plato.stanford.edu/entries/mill-moral-political/')],scene='interaction',palette='violet_coral')
add('Osel, kterému jsou obě večeře stejně dobré',[
'Osel stojí přesně mezi dvěma stejně lákavými hromadami sena. Kdyby musel před každou volbou najít důvod, proč je jedna lepší, měl by vůbec jak začít jíst?',
'Myšlenkový příklad známý jako <strong>Buridanův osel</strong> zkouší teorii rozhodování v dokonale vyvážené situaci. Nejde o pozorování zvířete ani o pokus dokazující, že nerozhodnost skutečně vede k hladovění.',
'Příklad nese jméno středověkého filozofa Jeana Buridana, jeho jednoduché připsání autorovi je však zavádějící. Příbuznou situaci člověka stejně hladového a žíznivého zmiňuje už Aristotelés ve spise O nebi.',
'Jádrem je rozdíl mezi důvodem vybrat něco dobrého a důvodem dát přednost právě této možnosti. Obě večeře lze považovat za dobré, přesto nemusí existovat věcná převaha jedné. Teorie vůle musí vysvětlit také to, zda lze jednat i bez takové převahy.'
], 'donkey_between_hay','A small undecided donkey between two equally sized simple golden piles of hay, symmetric coherent scene.','donkey_profile,equal_hay_piles,hesitant_pose',[
('Stanford Encyclopedia of Philosophy: Jean Buridan','https://plato.stanford.edu/entries/buridan/'),('Aristotelés: O nebi, kniha II','https://classics.mit.edu/Aristotle/heavens.2.ii.html')],scene='interaction',secondary=['two_equal_hay_piles'],mood='playful')
add('Ptakopysk loví se zavřenýma očima',[
'Ptakopysk se při ponoření neřídí zrakem. Zavře oči, uši i nozdry a potravu přesto dokáže hledat v kalném dně.',
'Jeho zobák není jen nástroj k nabírání soust. Obsahuje mechanické receptory citlivé na pohyb a tlak i <strong>elektroreceptory</strong>, které zachycují slabá elektrická pole vznikající činností kořisti.',
'Svalové stahy drobných vodních živočichů tak poskytují stopu, kterou naše oči nevidí. Ptakopysk pohybuje hlavou ze strany na stranu a spojuje elektrické informace s mechanickými podněty.',
'Nejde o stejný smysl, jakým si stěhovaví ptáci pomáhají zemským magnetickým polem. Tady zobák vyhledává blízké zdroje elektrických signálů. Orgán, který na první pohled vypadá jako podivná tlama, je zároveň specializovanou smyslovou plochou.'
], 'foraging_platypus','A platypus in side view sweeping its broad bill near a simple riverbed, eyes closed.','broad_bill,closed_eye,flat_tail',[
('American Museum of Natural History: elektrický smysl ptakopyska','https://www.amnh.org/explore/news-blogs/platypus-electroreception-hunting'),('University of Western Australia: elektroreceptory ptakopyska','https://www.uwa.edu.au/science/-/media/Faculties/Science/Docs/Platypus-electroreception.pdf')],scene='environment',palette='teal_amber')
add('Vydra si při česání udržuje vlastní izolaci',[
'Mořská vydra tráví péčí o srst spoustu času. Nejde jen o čistotu: načechraný kožich jí pomáhá přežít ve studené vodě.',
'Na rozdíl od mnoha jiných mořských savců se neopírá o silnou izolační vrstvu podkožního tuku. Její hustá srst zadržuje vzduch, který omezuje ztráty tepla a pomáhá oddělit kůži od chladné vody.',
'Při úpravě kožichu vydra srst čistí a načechrává. Udržuje tím vlastnost materiálu, na které závisí její tepelná bilance. Tělesná výbava tu potřebuje průběžnou údržbu chováním.',
'Proto je ropné znečištění pro vydry zvlášť nebezpečné. Olej naruší funkci srsti a vzduchové vrstvy; problémem tedy není jen samotná toxická látka. <strong>Poškozený kožich znamená také poškozenou tepelnou ochranu.</strong>'
], 'grooming_sea_otter','A sea otter floating on its back and grooming its chest with both paws, compact expressive silhouette.','floating_otter,chest_grooming,rounded_paws',[
('Monterey Bay Aquarium: mořská vydra','https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/sea-otter'),('U.S. Fish & Wildlife Service: vydra mořská jižní','https://www.fws.gov/species/southern-sea-otter-enhydra-lutris-nereis')],scene='portrait',palette='green_copper')
add('Malíř nechal barvy setkat až ve vašem pohledu',[
'Zblízka vidíte oddělené barevné body, z odstupu souvislou scénu. Georges Seurat z tohoto rozdílu udělal promyšlený malířský postup.',
'Místo úplného smíchání pigmentů na paletě kladl malé barevné doteky vedle sebe. Jejich sousedství a společné působení v oku vytvářely výsledný dojem světla a odstínu. Technika se označuje jako <strong>pointilismus</strong>.',
'Neznamená to, že jakákoli dvojice teček automaticky vytvoří přesně zamýšlenou barvu. Rozhoduje také jejich velikost, okolní odstíny a vzdálenost diváka. Obraz zůstává fyzicky složený z oddělených značek.',
'Seurat tak přesunul část práce z míchání hmoty do uspořádání vjemu. Povrch může být pečlivě rozdělený a přesto působit jako jeden celek. To, co drží obraz pohromadě, nemusí být jediná předem namíchaná barva.'
], 'pointillist_painted_swatch','A compact artist palette with a small patch of clearly separate blue and gold paint dabs, large readable marks.','artist_palette,separate_color_dabs,blue_gold_marks',[
('The Courtauld: Seurat, barva a voda','https://courtauld.ac.uk/take-part/schools/secondary/focus-seurat-colour-and-water/'),('National Galleries of Scotland: pointilismus','https://www.nationalgalleries.org/art-and-artists/glossary-terms/pointillism')])
add('Dřevořez tiskne právě to, co rytec neodřízne',[
'Rytec odebírá dřevo, ale vyřezané čáry se nevytisknou tmavě. V dřevořezu se obraz rodí z toho, co na povrchu štočku zůstalo.',
'Na vyvýšené plochy se nanese tisková barva a přitiskne se papír. Prohlubně jsou níž, takže při běžném postupu barvu na papír nepředají. Jde o <strong>tisk z výšky</strong>.',
'To obrací intuitivní představu kreslení čáry: rýha vytváří světlé místo. Tmavá čára vyžaduje naopak ponechat úzký proužek dřeva a odříznout jeho okolí. Rozhodnutí při řezání se pak opakuje v každém otisku.',
'Stejný základní princip zvýšené tisknoucí plochy umožnil kombinovat dřevořezy s pohyblivými literami v raných tištěných knihách. Obraz a text nemusely vznikat stejným nástrojem, ale mohly společně projít tiskem.'
], 'inked_woodcut_block','An angled wood block with a bold raised inked leaf motif and one carving gouge beside it.','raised_leaf,wood_block,carving_gouge',[
('The Metropolitan Museum of Art: technika dřevořezu','https://www.metmuseum.org/perspectives/materials-and-techniques-printmaking-woodcut'),('The Metropolitan Museum of Art: dřevořez v dějinách tisku','https://www.metmuseum.org/essays/the-printed-image-in-the-west-woodcut')],secondary=['carving_gouge'],palette='terracotta_cream')
add('Román, který vám uteče do poznámek',[
'Otevřete báseň s odborným komentářem a zjistíte, že poznámky začaly vyprávět vlastní příběh. V Nabokovově <em>Bledém ohni</em> je zdánlivě pomocný aparát jedním z hlavních jevišť románu.',
'Kniha obsahuje báseň fiktivního Johna Shadea a předmluvu, komentář i rejstřík od Charlese Kinbotea. Ten čtenáře od veršů opakovaně odvádí ke svému vlastnímu vyprávění, zejména k příběhu země Zembla.',
'Komentář tak neslouží jen k vysvětlení obtížného místa. Soutěží s básní o pozornost a pokouší se určit, co má čtenář považovat za střed celého díla. Čtení odkazů se stává součástí děje.',
'<strong>Forma poznámky může předstírat službu textu a současně si jej přivlastňovat.</strong> Nejde pouze o otázku, zda vypravěči věřit: i rozdělení stránky na hlavní obsah a jeho výklad se tu ukazuje jako nejistá hierarchie.'
], 'book_with_overgrowing_margin','An open book with a small central text block and an oversized curling marginal note shape, no legible words.','open_book,large_margin_note,cream_pages',[
('Brian Boyd: Nabokov’s Pale Fire, ukázka knihy','https://api.pageplace.de/preview/DT0400.9781400823192_A25050773/preview-9781400823192_A25050773.pdf'),('Penguin Random House: Pale Fire','https://www.penguinrandomhouse.com/books/119451/pale-fire-by-vladimir-nabokov-introduction-by-richard-rorty/')],palette='indigo_cyan')
add('Hrůza, o které postavy mluví jako o běžném životě',[
'Kathy vzpomíná na školu, přátelství a drobná nedorozumění. Teprve postupně vychází najevo, jaký osud pro ni okolní společnost připravila.',
'Román Kazua Ishigura <em>Neopouštěj mě</em> sleduje klony vychované pro darování orgánů. Vyprávění ovšem nestojí především na technickém vysvětlení jejich vzniku. Důležité je, jak postavy ve svěřeném světě prožívají vztahy a vlastní budoucnost.',
'Slova jako péče a darování znějí známě a uklidňujícím způsobem. V příběhu však patří k uspořádání, které některé lidi předem obětuje pro potřeby jiných. Všední tón vytváří napětí s tím, co se za ním odkrývá.',
'Čtenář se tak k nepřijatelnému systému dostává zevnitř každodenní zkušenosti jeho obětí. <strong>Důvěrně známý jazyk může pomáhat snášet pravidla, která by při pohledu zvenčí působila nesnesitelně.</strong>'
], 'school_uniform_on_empty_chair','An empty school chair with a neatly draped school cardigan, a restrained absence motif, no medical equipment.','empty_school_chair,folded_cardigan,quiet_absence',[
('Penguin Random House: čtenářský průvodce Neopouštěj mě','https://www.penguinrandomhouse.com/books/85609/never-let-me-go-by-kazuo-ishiguro/readers-guide'),('Faber: studijní průvodce románem','https://www.faber.co.uk/journal/never-let-me-go-by-kazuo-ishiguro-a-study-guide/')],mood='mysterious',palette='monochrome_cool')
add('Železnice sjednotily hodiny dřív než federální zákon',[
'Vlakový jízdní řád nemá rád města, z nichž každé ukazuje trochu jiný čas. S růstem železniční sítě přestávaly místní hodiny představovat jen místní záležitost.',
'Severoamerické železnice přijaly 18. listopadu 1883 společný systém standardního pásmového času. Stanice upravily hodiny podle nově dohodnutých pásem, aby se daly sladit příjezdy, odjezdy a navazující tratě.',
'Místní sluneční čas se s délkou mění plynule. Pro provoz však bylo praktičtější přejít na několik společných hodnot. U některých hodin tak po přestavení nastalo poledne téhož dne podruhé.',
'Ve Spojených státech přišel federální zákon o standardním čase až roku 1918. <strong>Společenský standard se tedy mohl prosadit koordinací infrastruktury ještě před jeho celostátním zákonným zakotvením.</strong>'
], 'railway_station_clock','A large station clock mounted on a short bracket above a compact railway wheel silhouette, no numerals required.','station_clock,mounting_bracket,railway_wheel',[
('Library of Congress: den dvou polední','https://guides.loc.gov/this-month-in-business-history/november/day-of-two-noons'),('University of Nebraska–Lincoln: železniční příkaz z listopadu 1883','https://railroads.unl.edu/documents/view_document_id=rail.gen.0002.html')],palette='teal_amber')
add('Rodný list a občanství nejsou stejná věc',[
'Člověk se narodí, i když o něm úřad nemá záznam. Bez dokladu o narození však může být mnohem těžší prokázat, kdo je, kolik mu je let a kdo jsou jeho rodiče.',
'Registrace narození zapisuje událost do úřední evidence. Rodný list je doklad vystavený na základě takového záznamu; samotné zaregistrování a držení listiny tedy nejsou úplně totožné situace.',
'Údaje o místě narození a rodičích mohou pomáhat určit nárok na občanství, ale <strong>zápis narození není automatickým udělením státní příslušnosti</strong>. Ta se řídí příslušnými pravidly státu.',
'Doklad přesto může otevírat přístup ke službám a ochraně práv, protože člověk snáze doloží věk či rodinnou vazbu. Význam evidence není v tom, že by teprve vytvářela lidskou existenci. Vytváří úředně uznatelný důkaz o některých jejích základních skutečnostech.'
], 'birth_record_with_footprint','A cream birth record sheet with a single small baby footprint and simple official seal, no readable text.','paper_record,baby_footprint,round_seal',[
('UNICEF Canada: registrace narození a rodný list','https://www.unicef.ca/en/what-we-do/our-work-globally/child-protection/birth-registration'),('OSN: právní rámec registrace a identity','https://desapublications.un.org/file/1149/download')],palette='violet_coral')
add('Voda může v tenké trubičce vystoupat nad hladinu',[
'Ponoříte úzkou skleněnou trubičku do vody a hladina uvnitř stoupne výš než voda venku. Malé množství kapaliny se přitom zvedá proti gravitaci.',
'Při <strong>kapilárním vzlínání</strong> spolu působí přitažlivost mezi molekulami kapaliny, její vztah ke stěně a povrchové napětí. Voda čisté sklo smáčí a její zakřivený povrch se opírá o obvod trubičky.',
'Výška neroste neomezeně. Zdvih se zastaví, když se účinek na povrchu vyrovná tíze sloupce. Za stejných podmínek vystoupá voda v užší smáčené trubičce výše: obvod se vůči ploše sloupce zvětšuje.',
'Na jiném materiálu nebo s jinou kapalinou nemusí nastat stejný směr pohybu. Kapilarita není obecné pravidlo, že cokoli úzkého nasává vodu vzhůru. Rozhoduje také smáčení, ne pouze rozměr otvoru.'
], 'capillary_glass_tube','A thin glass tube standing in a small water vessel, with a visibly higher blue water column inside the tube.','thin_glass_tube,raised_water_column,concave_meniscus',[
('USGS: kapilární vzlínání vody','https://www.usgs.gov/water-science-school/science/capillary-action-and-water'),('OpenStax: koheze, adheze a kapilarita','https://openstax.org/books/college-physics-2e/pages/11-8-cohesion-and-adhesion-in-liquids-surface-tension-and-capillary-action')],scene='diagram',palette='indigo_cyan')
add('Termoska potřebuje víc než prázdnou mezeru',[
'Mezi stěnami termosky skoro nic není. Přesto samotné vakuum nestačí k zastavení všech cest, kterými si obsah vyměňuje teplo s okolím.',
'Dvě oddělené stěny s odčerpaným vzduchem výrazně omezují vedení tepla plynem a jeho proudění v mezeře. Teplo se ale může přenášet i <strong>zářením</strong>, které žádný vzduch nepotřebuje.',
'Proto mají vakuové nádoby také odrazivé povrchy. Ty omezují radiační výměnu. Hrdlo, uzávěr a místa, kde se konstrukce spojuje, nadále představují další cesty přenosu, takže izolace není dokonalá.',
'James Dewar používal takové nádoby při výzkumu velmi chladných zkapalněných plynů. Stejná logika pomáhá uchovat i teplý nápoj: nádoba nevyrábí chlad ani teplo, pouze zpomaluje jejich výměnu přes několik různých mechanismů.'
], 'vacuum_flask_cutaway','A clean cutaway of one thermos showing double silver walls and a narrow empty gap, no arrows or labels.','double_wall,silver_inner_flask,narrow_vacuum_gap',[
('Royal Institution: Dewarova vakuová nádoba','https://www.rigb.org/explore-science/explore/collection/james-dewars-vacuum-flask'),('University of Hong Kong: fyzika kuchyně a termosky','https://www.physics.hku.hk/~phys1055/lectures/chap01.html')],scene='diagram',palette='monochrome_cool')
add('Hnědá kůrka není jen zkaramelizovaný cukr',[
'Topinka voní jinak než neopečený chléb a maso na pánvi získává hnědou kůrku. K této proměně nemusí stačit jen příběh o cukru, který se zahřívá.',
'Významnou roli mají <strong>Maillardovy reakce</strong>. Začínají reakcí redukujících cukrů s aminoskupinami, například v aminokyselinách a bílkovinách. Navazující síť přeměn vytváří barevné i aromatické produkty.',
'Nejde o jednu molekulu hnědé barvy ani o jedinou vůni společnou všem jídlům. Výsledek závisí na použitých látkách a podmínkách, včetně teploty a kyselosti prostředí.',
'Karamelizace je jiný soubor přeměn cukrů a nevyžaduje stejnou spoluúčast aminoskupin. V kuchyni mohou oba procesy probíhat vedle sebe. Podobná hnědá barva proto sama neprozradí, která chemická cesta ji právě vytvořila.'
], 'golden_brown_toast','A single thick slice of golden-brown toast with a clearly pale interior and simple browned crust.','toast_slice,brown_crust,pale_interior',[
('American Society of Baking: Maillardovy reakce','https://asbe.org/article/maillard-reaction/'),('Kwak a Lim: vliv cukrů a aminokyselin na hnědnutí','https://pubmed.ncbi.nlm.nih.gov/15309575/')],palette='terracotta_cream')
add('Tvrdá voda spotřebuje část mýdla dřív než mastnota',[
'Stejné mýdlo může v jedné vodě pěnit snadno a v jiné vytvářet povlak. Rozdíl nemusí být v množství špíny, ale v rozpuštěných iontech.',
'Tvrdá voda obsahuje více vápníku a hořčíku. Tyto ionty reagují s mýdlem za vzniku špatně rozpustných solí mastných kyselin. Část přidaného mýdla se tak převede do sraženiny místo toho, aby zůstala k dispozici pro mytí.',
'Výsledkem může být menší pěnění a usazený mýdlový povlak na povrchu umyvadla či vany. Není to totéž co běžné usazování uhličitanu vápenatého při zahřívání vody, i když oba jevy souvisejí s jejím složením.',
'<strong>Voda tedy není jen pasivní prostředí čisticího prostředku.</strong> Může s ním chemicky reagovat a měnit jeho dostupné množství. Větší dávka mýdla pak částečně kompenzuje reakci, která proběhne ještě před samotným odstraněním mastnoty.'
], 'soap_bar_with_scum','A pale soap bar resting beside one chalky scum ring on a small basin edge, few subdued bubbles.','soap_bar,chalky_scum_ring,sparse_bubbles',[
('USGS: tvrdost vody','https://www.usgs.gov/water-science-school/science/hardness-water'),('USGS: mýdlo v tvrdé a měkké vodě','https://www.usgs.gov/faqs/why-does-it-take-so-long-rinse-soap-my-hands-what-are-hard-water-and-soft-water')],palette='green_copper')
add('Aktivní uhlí čistí povrchem, který zvenku nevidíte',[
'Malé černé granule mohou zachytávat některé látky z protékající vody. Jejich nejdůležitější plocha přitom neleží jen na viditelném vnějším obrysu.',
'Aktivní uhlí má rozsáhlou síť pórů s velkým vnitřním povrchem. Některé molekuly se na něj vážou procesem zvaným <strong>adsorpce</strong>. Není to totéž jako prosté zachycení většího zrnka v jemném sítu.',
'Schopnost zachycovat látky má meze. Záleží na konkrétní sloučenině, podobě uhlí i podmínkách průtoku. Když se využitelná místa zaplní, filtr už nemusí odstraňovat znečištění stejně účinně jako na začátku.',
'Proto samotná přítomnost černé vložky neprokazuje, že je jakákoli voda bezpečná. Uhlí není univerzální likvidátor všeho rozpuštěného. Je to materiál pro vybrané úlohy, jehož účinek i vyčerpání je potřeba posuzovat podle toho, co má zachytávat.'
], 'porous_activated_carbon_granule','One large charcoal granule in cutaway with a few broad visible pores, light gray surface clearly visible on a dark card.','porous_granule,large_internal_cavities,pale_gray_edges',[
('EPA: úprava vody aktivním uhlím','https://19january2021snapshot.epa.gov/sites/static/files/2015-04/documents/a_citizens_guide_to_activated_carbon_treatment.pdf'),('Australian Drinking Water Guidelines: granulované aktivní uhlí','https://guidelines.nhmrc.gov.au/australian-drinking-water-guidelines/part-5/treatment-chemicals/carbon-granulated-activated')],scene='diagram',palette='monochrome_cool')
add('Ze Země lze zahlédnout víc než polovinu Měsíce',[
'Měsíc k nám obrací stále přibližně stejnou stranu. Přesto lze při dostatečně dlouhém pozorování uvidět ze Země asi 59 procent jeho povrchu.',
'Pomáhá <strong>librace</strong>, proměna pohledu, která dovoluje nahlížet trochu za okraje běžně přivrácené polokoule. Neznamená to, že se najednou odhalí celá odvrácená strana.',
'Měsíc se otáčí poměrně rovnoměrně, ale po nekruhové dráze obíhá různou rychlostí. Z našeho pohledu proto mírně kývá na východ a západ. Náklon jeho osy přidává proměnu pohledu na severní a jižní okraj.',
'V jediném okamžiku stále vidíme přibližně polovinu koule. Větší pokrytí vznikne až složením různých pohledů v čase. <strong>Synchronní rotace tedy neznamená dokonale neměnný výřez povrchu.</strong> Je to shoda period, která ponechává prostor pro změny geometrie pozorování.'
], 'moon_with_edge_crescent','A large pale cratered Moon with a subtle blue highlighted outer edge, one disk only and no Earth.','moon_disk,broad_crater_marks,highlighted_limb',[
('NASA Goddard: librace Měsíce','https://cdaweb.gsfc.nasa.gov/pub/documents/archived_websites/pwg.gsfc.nasa.gov/stargaze/Smoon4.htm'),('Hong Kong Observatory: měsíční librace','https://my.weather.gov.hk/en/education/astronomy-and-time/astronomy/00777-what-is-lunar-libration.html')],palette='indigo_cyan')
add('Saturnův prstenec není pevná obruč',[
'Na snímku působí Saturnovy prstence jako souvislý disk. Ve skutečnosti jde o obrovské množství částic, z nichž každá obíhá planetu sama.',
'Převážnou část tvoří vodní led. Rozměry jednotlivých kusů se liší a celý systém je vzhledem ke své šířce neobyčejně tenký: u hlavních prstenců se typicky mluví o tloušťce kolem deseti metrů.',
'Tento údaj není výška každého útvaru. Vlny a další struktury se mohou z roviny vychylovat výrazně výše. Prstence také nejsou klidná deska: gravitační působení měsíců i vzájemné interakce částic vytvářejí jejich jemnou strukturu.',
'<strong>Zdánlivě jednolitý tvar je výsledkem společného pohybu mnoha samostatných těles.</strong> To, co se z velké vzdálenosti čte jako jeden objekt, může být zblízka dynamickým shromážděním nespočetných kusů.'
], 'saturn_and_thin_icy_rings','Saturn with a very thin bright tilted ring crossing behind and in front of the planet, no stars or extra moons.','saturn_globe,thin_ice_ring,tilted_ring_plane',[
('NASA Cassini: prstence','https://science.nasa.gov/mission/cassini/science/rings/'),('NASA Cassini: otázky o částicích a tloušťce prstenců','https://science.nasa.gov/mission/cassini/faq/')],palette='blue_gold')
add('Na Marsu může západ Slunce zmodrat',[
'Zapadající Slunce si spojujeme s oranžovou a červenou. Na Marsu ale mohou jeho blízké okolí při západu zvýraznit modré odstíny.',
'Rozhodující roli má jemný prach v atmosféře. Rozptyluje světlo jinak než samotné molekuly pozemského vzduchu. Modrá složka při rozptylu na marťanském prachu zůstává více soustředěná do směru blízkého Slunci.',
'Proto se při nízkém Slunci může na jinak prachově zbarvené obloze objevit namodralá oblast. Takové západy zachytily i kamery vozítek. Neznamená to, že veškerá marťanská obloha musí být modrá jako pozemské poledne.',
'<strong>Barva západu není pevná vlastnost Slunce.</strong> Vzniká z dráhy světla atmosférou, velikosti částic a směru, ze kterého se díváme. Jiná atmosféra může ze stejného slunečního světla sestavit překvapivě odlišný večer.'
], 'blue_martian_sunset','A small pale sun at a simple rust-colored Martian horizon, with a compact meaningful blue atmospheric wedge, transparent outside the scene.','pale_sun,blue_twilight,rust_horizon',[
('NASA: východy a západy Slunce na Marsu','https://science.nasa.gov/solar-system/planets/mars/what-does-a-sunrise-sunset-look-like-on-mars/'),('NASA Scientific Visualization Studio: modrý západ Curiosity','https://svs.gsfc.nasa.gov/11875')],scene='environment',palette='teal_amber')
add('Když úroková sazba narazí na svou spodní mez',[
'Centrální banka chce povzbudit ekonomiku levnějšími penězi. Jenže co když už její krátká úroková sazba leží velmi blízko spodní meze?',
'V situaci označované jako <strong>past likvidity</strong> slábne prostor pro běžnou stimulaci dalším snižováním krátkých nominálních sazeb. Držení peněz se při velmi nízkém úroku stává bližší alternativou krátkých bezpečných dluhopisů.',
'Neznamená to, že jakýkoli zásah centrální banky musí být bez účinku. Výzkum proto rozlišuje omezení tradičního sazebního nástroje od možností ovlivňovat delší výnosy, očekávání či podmínky financování jinými postupy.',
'Ani samotná blízkost nuly není automatickým důkazem úplné bezmoci měnové politiky. Pointa spočívá v omezení konkrétního mechanismu. <strong>Vyčerpaný prostor jednoho ovladače není totéž jako vyčerpané možnosti celého systému.</strong>'
], 'interest_dial_at_stop','A simple pale financial control dial whose pointer rests against a physical lower stop, no words or numerals.','control_dial,pointer_at_stop,physical_limit',[
('Federal Reserve: měnová politika a past likvidity','https://www.federalreserve.gov/econres/feds/monetary-policy-in-deflation-the-liquidity-trap-in-history-and-practice.htm'),('MMF: past likvidity a zadlužení','https://www.imf.org/en/publications/wp/issues/2016/12/31/liquidity-trap-and-excessive-leverage-41769')],palette='blue_gold')
add('Stejné sedadlo, jiná cena',[
'Dva lidé dostanou stejnou službu, ale nezaplatí stejně. Rozdíl nemusí odpovídat tomu, kolik stojí službu každému z nich poskytnout.',
'Ekonomie tomu říká <strong>cenová diskriminace</strong>. Prodávající s určitou možností určovat cenu rozděluje zákazníky podle jejich poptávky a ochoty platit. Příkladem mohou být studentské nebo seniorské vstupenky.',
'Aby rozdělení fungovalo, levnější nabídka se nesmí snadno přelévat k těm, od nichž chce prodávající vyšší cenu. Kdyby mohl kdokoli nakoupit levně a bez překážek prodávat dál, cenový rozdíl by se hůře udržoval.',
'Ne každá odlišná cena je ovšem tento případ. Jiná doprava, balení nebo rozsah služby mohou znamenat skutečně jiné náklady. Podstatné je odlišit cenu jiné služby od jiné ceny téže služby pro různé skupiny.'
], 'paired_admission_tickets','Two matching cinema tickets side by side, one with a simple student-cap symbol and the other plain, no prices or words.','matching_tickets,student_cap_symbol,paired_admission',[
('MIT OpenCourseWare: Principles of Microeconomics, cenová diskriminace','https://ocw.mit.edu/ans7870/14/14.01SC/MIT14_01SCF11_rttext.pdf'),('Church a Ware: Industrial Organization','https://prawo.uwr.edu.pl/wp-content/uploads/sites/210/2023/08/J._R._Church_Roger_Ware_Industrial_organization_Irwin_McGraw_Hill_1999_.pdf')],palette='violet_coral')
add('Gorila může projít obrazem a vy ji nezahlédnete',[
'Počítáte přihrávky hráčů v bílých tričkách a úkol zvládnete. Přitom můžete přehlédnout postavu v gorilím kostýmu, která projde přímo sledovanou scénou.',
'Daniel Simons a Christopher Chabris tak roku 1999 zkoumali <strong>nepozornostní slepotu</strong>. Účastníci sledující vybranou činnost si nečekané události nevšímali vždy, přestože záznam normálně pokračoval.',
'Nejde o slepotu ke změně, při níž porovnáváme dvě podoby obrazu, ani o problém očí rozlišit příliš malý detail. Výběr toho, čemu věnujeme pozornost, ovlivňuje, co se dostane do vědomého vnímání.',
'Výsledek závisí na úloze i na podobě nečekaného objektu; ne každý pozorovatel přehlédne totéž. Pokus proto nedokazuje, že lidé nevidí gorily. Ukazuje, jak snadno přeceňujeme úplnost vlastního pohledu, když jsme zaměstnáni něčím jiným.'
], 'gorilla_with_basketball','A fictional person in a simple gorilla costume walking calmly beside a single orange basketball, no extra players.','gorilla_costume,walking_pose,orange_ball',[
('Simons a Chabris: Gorillas in Our Midst, 1999','https://www.chabris.com/Simons1999.pdf'),('Open University: nepozornostní slepota','https://www.open.edu/openlearn/mod/oucontent/view.php?id=88410&section=_unit4.1.1')],scene='interaction',secondary=['basketball'],mood='playful',palette='monochrome_warm')
add('Nápad může být vzpomínka se ztraceným původem',[
'Napadne vás skvělá formulace a připadá vám nová. Později zjistíte, že jste ji už slyšeli od někoho jiného.',
'Při <strong>kryptomnézii</strong> se vybaví obsah, ale člověk nerozpozná jeho zdroj. Znalost pak může zaměnit za vlastní tvorbu. Není to totéž jako vědomé opisování, i když výsledkem může být převzetí cizího příspěvku.',
'Alan Brown a Dana Murphyová v pokusech z roku 1989 nechávali účastníky střídavě vytvářet příklady zadaných kategorií. Při dalších úlohách lidé někdy vydávali již použité odpovědi druhých za své nebo nové, ačkoli se měli opakování vyhnout.',
'Nejde o univerzální omluvu každé podobnosti. Pokus dokládá konkrétní možnost selhání: paměť na informaci a paměť na její původ se mohou rozejít. <strong>Pocit originality proto není sám o sobě dokladem původu nápadu.</strong>'
], 'idea_note_with_detached_source_tag','A single handwritten note shape with a small detached source tag beside it, no readable lettering, suggesting lost attribution.','idea_note,detached_tag,missing_connection',[
('Brown a Murphyová: Kryptomnézie, 1989','https://warwick.ac.uk/fac/sci/psych/people/fsch/fsch/studentresources/3rdyearprojects/projects/plag2.pdf'),('Marsh a Bower: neúmyslné převzetí v úloze s hledáním slov','https://pubmed.ncbi.nlm.nih.gov/8501434/')],palette='green_copper')
add('Němý film nemá jednu povinnou rychlost',[
'Starý film může při nesprávném promítání působit směšně uspěchaně. Někdy se zrychlí nejen krok herce, ale i celý rytmus vyprávění.',
'V němé éře nebyla jedna univerzální snímková rychlost pro všechny filmy. Rychlost snímání a promítání se v praxi měnila. Představa, že každý němý snímek patří přesně na šestnáct políček za sekundu, proto neobstojí.',
'Když stejný počet políček přehrajeme rychleji, film se zkrátí a pohyb zrychlí. Nejde o převrácení směru kola kvůli vzorkování, ale o změnu časového měřítka celého záznamu.',
'Filmové archivy proto řeší i rychlosti odlišné od běžných 24 snímků za sekundu a možnosti jejich digitálního uvedení. <strong>Zachovat obraz neznamená pouze uchovat všechna políčka.</strong> Záleží také na tom, kolik času každému z nich při promítání přidělíme.'
], 'silent_film_projector_crank','A compact early film projector with a prominent hand crank and one reel, clean simplified silhouette.','film_projector,hand_crank,single_reel',[
('FIAF: digitální promítání a rychlosti němých filmů','https://www.fiafnet.org/pages/E-Resources/Digital-Statement-part-III.html'),('CESIF: filmová technika a archivní sbírky','https://www.screenculture.org/cesif/sites/default/files/CESIF_Primer_FINAL.pdf')],palette='monochrome_warm')
add('Filmový palác se může vejít na malované sklo',[
'Herec stojí ve skutečných dveřích, ale nad nimi se tyčí palác, který nikdo nepostavil. Část filmového prostoru může existovat jen jako malba.',
'Klasická <strong>dokreslovačka</strong>, anglicky matte painting, spojuje namalované prostředí s hranou akcí. Obraz na skle nebo jiné ploše doplní kulisu o vzdálenou krajinu, střechy či rozlehlý interiér.',
'Spojení vyžaduje sladit perspektivu, světlo a hranice jednotlivých částí. Maskování může nechat určitou oblast filmu neexponovanou pro doplnění druhé složky. Malba tak nepředstavuje jen dekoraci za hercem, ale část výsledného záběru.',
'Na rozdíl od klíčování nejde především o odstranění vybrané barvy pozadí. Podstatné je, že kamera může ukázat prostor složený z reálného děje a plochého obrazu. Divák pak čte dvě odlišné výrobní vrstvy jako jediné místo.'
], 'matte_painting_glass_panel','A glass panel bearing a simple painted palace silhouette with a clear doorway area, held by a small studio support.','glass_panel,painted_palace,clear_doorway',[
('Academy of Motion Picture Arts and Sciences: průvodce vizuálními efekty','https://www.oscars.org/sites/oscars/files/complete_visual_effects_activities_guide.pdf'),('StarWars.com: malby na skle pro Impérium vrací úder','https://www.starwars.com/news/empire-at-40-5-amazing-matte-paintings-from-star-wars-the-empire-strikes-back')],palette='blue_gold')
add('Na krychli vyjde dvojka. Na čtyřstěnu také',[
'Krychle má osm vrcholů, dvanáct hran a šest stěn. Když spočítáte osm minus dvanáct plus šest, vyjde dvě — a není to výsada krychle.',
'<strong>Eulerův vztah pro konvexní mnohostěny</strong> říká, že počet vrcholů minus počet hran plus počet stěn je vždy dva. Čtyřstěn dává stejný výsledek: čtyři minus šest plus čtyři.',
'Délky hran ani velikosti úhlů do výpočtu nevstupují. Rozhoduje uspořádání ploch, hran a vrcholů. Když například rozdělíte jednu stěnu novou hranou mezi jejími existujícími vrcholy, přibude hrana i stěna a rozdíl se nezmění.',
'Podmínky jsou důležité. Povrch s otvorem, jako má prstenec, má jinou topologii a nelze na něj bez úpravy přenášet výsledek pro konvexní těleso. Jednoduchá dvojka tak zachycuje strukturu tvaru, nikoli jeho metricky přesné rozměry.'
], 'cube_with_highlighted_vertices','A single clean cube with broad pale edges, three visible flat faces and distinct gold vertex dots, no formula text.','cube_edges,vertex_dots,three_visible_faces',[
('Wolfram MathWorld: Eulerův vztah pro mnohostěny','https://mathworld.wolfram.com/PolyhedralFormula.html'),('Ústav informatiky AV ČR: Eulerova věta','https://cs.cas.cz/portal/AlgoMath/Geometry/SpatialGeometry/Polyhedra/EulerPolyhedronTheorem.htm')],scene='diagram',palette='indigo_cyan')
add('Náhodná tětiva nestačí jako zadání',[
'Vyberte v kružnici náhodnou tětivu. Jaká je šance, že bude delší než strana vepsaného rovnostranného trojúhelníku?',
'U <strong>Bertrandova paradoxu</strong> mohou vyjít různé odpovědi, aniž by někdo udělal početní chybu. Slovo náhodná totiž ještě neurčuje, jak má výběr probíhat.',
'Můžeme rovnoměrně vybírat dva koncové body na obvodu. Nebo zvolit rovnoměrně bod uvnitř kruhu jako střed tětivy a určit ji příslušným směrem. Tyto postupy nerozdělují pravděpodobnost mezi tětivy stejně.',
'V klasických variantách úlohy se proto objevují hodnoty jedna třetina, jedna polovina nebo jedna čtvrtina podle zvoleného modelu. Spor se nevyřeší dalšími hody podle neurčitého návodu. Nejdřív je třeba určit, co skutečně náhodně vybíráme: souřadnice a mechanismus vzorkování jsou součástí otázky.'
], 'circle_with_unequal_chords','One cream circle containing only three bold blue chords of different lengths, no labels or probability chart.','circle_outline,three_chords,different_lengths',[
('Wolfram MathWorld: Bertrandova úloha','https://mathworld.wolfram.com/BertrandsProblem.html'),('Grinstead a Snell: simulace spojitých pravděpodobností','https://stats.libretexts.org/Bookshelves/Probability_Theory_(Grinstead_and_Snell)/02:_Continuous_Probability_Densities/2.01:_Simulation_of_Continuous_Probabilities')],scene='diagram',palette='blue_gold')
add('Nejkratší skluz nemusí být nejrychlejší',[
'Dva body spojíte přímou šikmou dráhou a delší prohnutou drahou. Kulička puštěná po té delší může dorazit dolů dřív.',
'Úloha o <strong>brachistochroně</strong> hledá křivku nejrychlejšího sestupu. V ideálním modelu částice startuje z klidu, působí na ni homogenní gravitace a dráha ji nebrzdí třením.',
'Přímočařejší cesta šetří délku, ale může pomaleji nabírat rychlost. Strmější počáteční propad dovolí získat větší rychlost dříve a tuto výhodu využít v další části pohybu. Správná rovnováha vede k oblouku cykloidy, křivky spojené s pohybem bodu na valící se kružnici.',
'Nejde o návod pro libovolnou klouzačku: skutečné tření či valení mění podmínky. Matematický výsledek ukazuje něco obecnějšího o cíli výpočtu. Minimalizovat vzdálenost a minimalizovat čas jsou dvě odlišné úlohy.'
], 'bead_on_curved_descent','A single gold bead on a broad blue curved descending track that starts steep and flattens, no extra tracks or arrows.','gold_bead,steep_start,curved_track',[
('Wolfram MathWorld: brachistochrona','https://mathworld.wolfram.com/BrachistochroneProblem.html'),('Ohio State University: variační počet, brachistochrona','https://people.math.osu.edu/gerlach.1/math5451/book/CVtypsetnew.pdf')],scene='diagram',palette='indigo_cyan')
add('SSD stěhuje data, aby neopotřeboval jedno místo',[
'Soubor se může zdánlivě pořád ukládat na stejné místo. Uvnitř flash paměti však jeho fyzická poloha nemusí zůstávat stejná.',
'Buňky NAND flash snesou omezený počet cyklů programování a mazání. Kdyby se často měněná data přepisovala stále ve stejných blocích, právě tato místa by se opotřebovala mnohem dřív než zbytek zařízení.',
'<strong>Wear leveling</strong> proto rozděluje zátěž mezi více fyzických bloků. Řadič udržuje překlad mezi adresou, kterou používá systém, a skutečným místem v paměti. Přesun obsahu tak nemusí změnit adresu viditelnou pro aplikaci.',
'Tento postup nevytváří nezničitelnou paměť ani neodstraňuje všechny příčiny poruch. Brání však tomu, aby malá často používaná část zařízení předčasně vyčerpala svou životnost, zatímco většina ostatních buněk zůstává málo využitá.'
], 'flash_memory_with_distributed_blocks','A single flash memory chip with six large internal blocks in alternating pale blue and gold, suggesting distributed use without tiny circuitry.','memory_chip,six_large_blocks,even_distribution',[
('Macronix: Wear Leveling in NAND Flash Memory','https://www.macronix.com/Lists/ApplicationNote/Attachments/1913/AN0289V1-Wear%20Leveling%20in%20NAND%20Flash%20Memory.pdf'),('Kioxia: vyrovnávání opotřebení NAND flash','https://www.kioxia.com/content/dam/kioxia/shared/business/memory/mlc-nand/asset/productbrief/KIOXIA_Understanding_Wear_Leveling_Tech_Brief.pdf')],scene='diagram',palette='blue_gold')
add('Databáze si změnu nejdřív zapíše vedle',[
'Aplikace oznámí, že je změna potvrzená, ale hlavní databázový soubor ještě nemusí obsahovat její nejnovější podobu. Potřebný záznam může zatím ležet v samostatném deníku.',
'Při <strong>write-ahead logging</strong> se nové verze ukládají nejdřív do logu. SQLite v tomto režimu potvrzuje transakci zvláštním záznamem v souboru WAL; čtení musí brát v úvahu i příslušná data v něm.',
'Pozdější checkpoint přesouvá obsah z logu do hlavního databázového souboru. Potvrzení změny a její promítnutí do tohoto souboru jsou tedy dva různé okamžiky.',
'Není to samo o sobě záloha na jiném zařízení a odolnost vůči výpadku napájení závisí i na nastavení synchronizace a chování úložiště. Důležitá je změna pořadí práce: nejdřív uchovat záznam změny, potom aktualizovat hlavní uložení.'
], 'database_with_side_journal','A compact pale database cylinder beside one gold bound journal, a coherent pair with no arrows or text.','database_cylinder,side_journal,recorded_change',[
('SQLite: Write-Ahead Logging','https://www.sqlite.org/wal.html'),('SQLite: formát databáze a souboru WAL','https://www.sqlite.org/fileformat2.html')],secondary=['side_journal'],palette='teal_amber')
add('Dva správně přenesené bajty mohou dát špatné číslo',[
'Přenesená data nemají jediný poškozený bit, a přesto příjemce přečte jiné číslo. Stačí, aby oba systémy nesdílely dohodu o pořadí jeho částí.',
'Vícebajtové číslo lze ukládat dvěma běžnými způsoby. <strong>Big-endian</strong> zapisuje nejvýznamnější bajt dříve, <strong>little-endian</strong> začíná nejméně významným. Toto pořadí se nazývá endianness.',
'Číslo 258 lze ve dvou bajtech zapsat jako 01 a 02 v šestnáctkové soustavě. Při opačném výkladu jejich pořadí vznikne 513. Změnil se význam sekvence, nikoli jednotlivé přenesené hodnoty.',
'Proto souborové formáty a síťové protokoly určují, jak se mají takové hodnoty číst. Nejde o pořadí písmen celého textu ani automaticky o pořadí bitů uvnitř bajtu. Spolehlivý přenos vyžaduje vedle neporušených dat také společné pravidlo jejich interpretace.'
], 'paired_byte_tiles','Two large adjacent digital tiles marked 01 and 02, with a simple reversible ordering gesture below, no other text.','two_byte_tiles,01_02_marks,ordering_gesture',[
('NIST: big-endian a little-endian','https://www.nist.gov/glossary-term/22791'),('RFC 1700: pořadí přenosu vícebajtových hodnot','https://www.rfc-editor.org/rfc/rfc1700')],scene='diagram',palette='indigo_cyan')
add('Cílová fotografie nemá na šířku prostor, ale čas',[
'Na cílovém snímku mohou být běžci podivně protažení a dráha vypadat nezvykle. Takový obraz není obyčejná fotografie všech závodníků v jediném okamžiku.',
'Cílová kamera opakovaně snímá velmi úzký pruh přesně v rovině cílové čáry. Jednotlivé záznamy se kladou vedle sebe v časovém pořadí. Vodorovná osa výsledku proto ukazuje, kdy daná část těla protnula cíl.',
'Zdánlivá šířka postavy závisí také na tom, jak dlouho její části touto rovinou procházejí. Z obrazu tak nelze stejným způsobem jako z běžné fotografie odměřovat vzdálenosti podél tratě.',
'<strong>Deformace může být stopou měřicí metody, nikoli chybou výsledku.</strong> Přesné vyrovnání kamery s cílem a časová stupnice dovolují rozhodovat těsné doběhy právě tím, že nahrazují obvyklý prostorový pohled záznamem průchodu.'
], 'finish_line_camera','A compact finish-line camera on a tripod aimed across a single pale race finish stripe, no runners or timing text.','finish_camera,tripod,finish_stripe',[
('Seiko: princip cílového systému Slit Video','https://www.seiko-stc.co.jp/e/products/uploads/docs/trackandfield_e.pdf'),('England Athletics: historie a funkce fotofiniše','https://www.englandathletics.org/news/olympic-factoid-snap-happy/')],palette='monochrome_cool')
add('V čele cyklistické skupiny se platí víc',[
'Dva cyklisté jedou stejnou rychlostí, ale nemusejí na ni vynakládat stejné úsilí. Ten vzadu může využívat proudění, které za sebou mění první jezdec.',
'Jízda v závětří, označovaná také jako <strong>drafting</strong>, snižuje aerodynamický odpor. O velikosti úspory rozhoduje mimo jiné rozestup, poloha jezdců, rychlost a vítr; jedna univerzální procentní hodnota nepopíše všechny skupiny.',
'Proto má střídání na čele praktický smysl. Jezdec vpředu nese vyšší aerodynamickou zátěž a po vystřídání může část sil šetřit v háku. Spolupráce může pomoci skupině udržet tempo, které by jednotlivec sám nesl obtížněji.',
'Nejde o vypnutí gravitace ani o pomoc proti samotnému stoupání. Výhoda se týká především odporu vzduchu. Taktika tak vyrůstá z fyziky: pořadí ve skupině ovlivňuje energetickou cenu stejné rychlosti.'
], 'two_cyclists_in_slipstream','Two helmeted racing cyclists riding close in line, connected by a single broad pale airflow ribbon, no extra scenery.','two_cyclists,close_line,shared_airflow',[
('Exploratorium: aerodynamika a jízda v závětří','https://annex.exploratorium.edu/cycling/aerodynamics2.html'),('Blocken a kol.: odpor v cyklistickém pelotonu','https://pure.tue.nl/ws/files/101844924/1_s2.0_S0167610518303751_main.pdf')],scene='interaction',secondary=['following_cyclist'],mood='dynamic',palette='green_copper')
add('Než rozhodovaly penalty, mohl rozhodnout los',[
'Vyřazovací zápas skončil nerozhodně a vítěz se někdy hledal mimo další hru. O postupu mohl rozhodnout i los, což dnes působí zvláštněji než dramatický penaltový rozstřel.',
'Mezinárodní pravidlový orgán IFAB přijal rozstřel v roce 1970. Nešlo o vůbec první použití podobné myšlenky: různé soutěže zkoušely penalty k rozhodování remíz už dříve.',
'Zavádění nebylo jedním okamžikem společným všem turnajům. Finále mistrovství Evropy roku 1976 rozhodly penalty mezi Československem a západním Německem. Na závěrečném turnaji mistrovství světa přišel první rozstřel až v semifinále roku 1982.',
'<strong>Novinka přenesla rozhodnutí zpět k výkonu hráčů na hřišti.</strong> Přesto zůstala oddělenou zkouškou, která není pokračováním běžné hry se všemi jejími vztahy. Dnešní samozřejmá součást fotbalového dramatu má vlastní, poměrně krátké dějiny.'
], 'football_on_penalty_spot','A single football resting on the penalty spot with a simple distant goal shape, no players or flags.','football,penalty_spot,goal_frame',[
('FIFA Museum: proč vznikly rozstřely','https://www.fifamuseum.com/en/explore/fifamuseumplus/blog/Why-penalty-shootout'),('IFAB: pravidla 1982–83 s rozhodnutím z roku 1970','https://downloads.theifab.com/downloads/laws-of-the-game-1982-83?l=en')],scene='environment',palette='teal_amber')

assert len(copy)==len(plan['proposals'])==35
drafts=[]
for article,proposal in zip(copy,plan['proposals']):
    drafts.append(dict(id=proposal['id'],title=article['title'],content=article['content'],category=proposal['category'],sources=article['sources'],illustration=article['illustration'],knowledge=proposal['knowledge']))
(ROOT/'reports/v152-drafts.json').write_text(json.dumps(drafts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for p in drafts: print(p['id'],len(p['content']),p['title'])
