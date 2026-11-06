import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
R=ROOT/'reports'
rows=json.loads((R/'posts-gap-313-352-specs.json').read_text(encoding='utf-8'))
plan=json.loads((R/'posts-gap-313-352-plan.json').read_text(encoding='utf-8'))
texts=dict(re.findall(r'===(\d+)\n(.*?)(?====|\Z)',(R/'posts-gap-313-352-texts.txt').read_text(encoding='utf-8'),re.S))
sources=[
 [('Royal Museums Greenwich: Nelsonův plán','https://www.rmg.co.uk/stories/maritime-history/battle-trafalgar-background'),('National Maritime Museum: Nelsonova taktika','https://doi.org/10.1080/21533369.2005.9668348')],
 [('Dominic Lieven: Mobilizing Russian Horsepower in 1812','https://onlinelibrary.wiley.com/doi/10.1111/j.1468-229X.2011.00512.x'),('Fondation Napoléon: Koně v napoleonských armádách','https://www.napoleon.org/histoire-des-2-empires/articles/le-cheval-dans-les-armees-napoleoniennes')],
 [('Musée des Arts et Métiers: Chappeho telegraf','https://artsandculture.google.com/asset/the-optical-telegraph-claude-chappe/GgELTlCgklxe7w'),('Fondation Napoléon: Napoleon a telekomunikace','https://www.napoleon.org/histoire-des-2-empires/articles/napoleon-et-les-telecommunications')],
 [('Francouzské Národní shromáždění: Kodifikace práva','https://www.assemblee-nationale.fr/dyn/histoire-et-patrimoine/consulat-et-premier-empire/la-codification-juridique'),('Code civil 1804: výňatky z původního zákoníku','https://www.revolution.chnm.org/exhibits/show/liberty--equality--fraternity/item/358')],
 [('National Army Museum: Bitva u Waterloo','https://www.nam.ac.uk/explore/battle-waterloo'),('Marine Corps University: The Waterloo Campaign and the Battle','https://www.usmcu.edu/Portals/218/Wargaming%20Waterloo_new%20web_1.pdf')],
 [('Lewis a kol.: Retrieval-Augmented Generation','https://arxiv.org/abs/2005.11401'),('Gao a kol.: Přehled metod RAG','https://arxiv.org/abs/2312.10997')],
 [('Leviathan a kol.: Fast Inference from Transformers','https://proceedings.mlr.press/v202/leviathan23a.html'),('Google Research: Looking back at speculative decoding','https://research.google/blog/looking-back-at-speculative-decoding/')],
 [('NIST: Standard ML-KEM','https://www.nist.gov/publications/module-lattice-based-key-encapsulation-mechanism-standard'),('NIST: První tři postkvantové standardy','https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards')],
 [('Nature: Perovskite/silicon tandem solar cells','https://www.nature.com/articles/s41586-024-07997-7'),('Nature Communications: Větší tandemové články','https://www.nature.com/articles/s41467-025-63673-y')],
 [('Nature Reviews Materials: Anody pro sodíkové baterie','https://www.nature.com/articles/s41578-025-00857-4'),('Chemical Science: Tvrdý uhlík pro sodíkové baterie','https://pmc.ncbi.nlm.nih.gov/articles/PMC11062112/')],
 [('Epikúros: Hlavní články','https://classics.mit.edu/Epicurus/princdoc.html'),('Stanford Encyclopedia of Philosophy: Epicurus','https://plato.stanford.edu/entries/epicurus/')],
 [('Aristotelés: Etika Níkomachova, kniha V','https://classics.mit.edu/Aristotle/nicomachaen.5.v.html'),('Stanford Encyclopedia of Philosophy: Justice','https://plato.stanford.edu/entries/justice/')],
 [('Platón: Kritón','https://classics.mit.edu/Plato/crito.html'),('Stanford Encyclopedia of Philosophy: Socrates','https://plato.stanford.edu/entries/socrates/')],
 [('Aristotelés: Etika Níkomachova, kniha III','https://classics.mit.edu/Aristotle/nicomachaen.3.iii.html'),('Stanford Encyclopedia of Philosophy: Aristotle’s Ethics','https://plato.stanford.edu/entries/aristotle-ethics/')],
 [('Stanford Encyclopedia of Philosophy: Platónova etika a politika','https://plato.stanford.edu/entries/plato-ethics-politics/'),('Internet Encyclopedia of Philosophy: Platónova politická filozofie','https://iep.utm.edu/platopol/')],
 [('Stanford Encyclopedia of Philosophy: Descriptions','https://plato.stanford.edu/entries/descriptions/'),('Stanford Encyclopedia of Philosophy: Bertrand Russell','https://plato.stanford.edu/entries/russell/')],
 [('Stanford Encyclopedia of Philosophy: Dva pojmy svobody','https://plato.stanford.edu/entries/liberty-positive-negative/'),('Stanford Encyclopedia of Philosophy: Isaiah Berlin','https://plato.stanford.edu/entries/berlin/')],
 [('Stanford Encyclopedia of Philosophy: John Dewey','https://plato.stanford.edu/entries/dewey/'),('Internet Encyclopedia of Philosophy: John Dewey','https://iep.utm.edu/john-dewey/')],
 [('Stanford Encyclopedia of Philosophy: Hans-Georg Gadamer','https://plato.stanford.edu/entries/gadamer/'),('Internet Encyclopedia of Philosophy: Gadamer','https://iep.utm.edu/Gadamer/')],
 [('Stanford Encyclopedia of Philosophy: Čínský pokoj','https://plato.stanford.edu/entries/chinese-room/'),('University of Hong Kong: The Chinese Room Argument','https://philosophy.hku.hk/courses/cogsci/chineseroom.php')],
 [('NASA: První výsledky mise DART','https://www.nasa.gov/solar-system/early-results-from-nasas-dart-mission/'),('NASA: Závěrečná technická zpráva mise DART','https://ntrs.nasa.gov/citations/20230015804')],
 [('Nature Communications: Uracil v planetce Ryugu','https://www.nature.com/articles/s41467-023-36904-3'),('Hokkaido University: Uracil ve vzorcích Ryugu','https://www.global.hokudai.ac.jp/news/14447/')],
 [('NASA: Transmisní spektrum WASP-39 b','https://science.nasa.gov/asset/webb/exoplanet-wasp-39-b-nirspec-transmission-spectrum/'),('JWST ERS Team: Identification of carbon dioxide','https://arxiv.org/abs/2208.11692')],
 [('NASA: Gravitační manévry Cassini','https://science.nasa.gov/mission/cassini/gravity-assists/'),('ESA: What are gravity assists?','https://www.esa.int/Enabling_Support/Operations/What_are_gravity_assists')],
 [('JAXA: Potvrzení zrychlování IKAROS','https://www.jaxa.jp/press/2010/07/20100709_ikaros_e.html'),('JAXA: Archiv mise IKAROS','https://darts.isas.jaxa.jp/en/missions/ikaros')],
 [('Mary Shelleyová: Frankenstein, úplný text','https://www.gutenberg.org/files/84/84-h/84-h.htm'),('National Library of Medicine: Proměna monstra','https://www.nlm.nih.gov/exhibition/frankenstein/exhibition4.html')],
 [('F. M. Dostojevskij: Zločin a trest, úplný text','https://www.gutenberg.org/files/2554/2554-h/2554-h.htm'),('Penguin Random House: Crime and Punishment','https://www.penguinrandomhouse.com/books/326618/crime-and-punishment-by-fyodor-dostoyevsky-with-an-intro-by-leonard-stantonjames-d-hardy-jr-trans-by-sidney-monas-and-afterword-by-robin-feuer-miller/9781101142318/')],
 [('Henrik Ibsen: A Doll’s House, úplný text','https://www.gutenberg.org/files/2542/2542-h/2542-h.htm'),('Univerzita v Oslu: A Doll’s House','https://www.hf.uio.no/is/english/services/virtual-ibsen-centre/on-ibsen-s-work/du/')],
 [('Oscar Wilde: Obraz Doriana Graye, úplný text','https://www.gutenberg.org/files/174/174-h/174-h.htm'),('British Library: The Picture of Dorian Gray','https://www.britishlibrary.cn/en/works/picture-of-dorian-gray/')],
 [('Aldous Huxley: Brave New World, úplný text','https://www.huxley.net/bnw/'),('Penguin: Brave New World','https://www.penguin.co.uk/books/357838/brave-new-world-by-huxley-aldous/9780099518471')],
 [('Kanadské ministerstvo obrany: Maďarsko 1956','https://www.canada.ca/en/department-national-defence/services/military-history/history-heritage/past-operations/europe/hungary-1956.html'),('Wilson Center: Looking Back at the Cold War, 1956','https://www.wilsoncenter.org/article/looking-back-the-cold-war-1956')],
 [('Office of the Historian: Invaze do Československa','https://history.state.gov/milestones/1961-1968/soviet-invasion-czechoslavkia'),('Národní archiv: Srpen 1968','https://na.gov.cz/labyrint/labyrintem-dejin-ceskych-zemi/prazske-jaro/srpen-1968')],
 [('Office of the Historian: Sblížení s Čínou','https://history.state.gov/milestones/1969-1976/rapprochement-china'),('Nixon Presidential Library: The Opening to China','https://www.nixonfoundation.org/2014/11/the-opening-of-china/')],
 [('Chilský Národní archiv: Převrat 11. září 1973','https://www.archivonacional.gob.cl/11-de-septiembre-1973-golpe-civil-militar'),('Office of the Historian: Allende a Pinochet','https://history.state.gov/milestones/1969-1976/allende')],
 [('Office of the Historian: Rozpad Sovětského svazu','https://history.state.gov/milestones/1989-1992/collapse-soviet-union'),('Harvard Davis Center: Poslední dekáda studené války','https://daviscenter.fas.harvard.edu/insights/1981-1991-2021-retrospective-poland-ussr-and-cold-wars-final-decade')],
 [('Schrodt a kol.: Metaanalýza demand–withdraw','https://www.tandfonline.com/doi/abs/10.1080/03637751.2013.813632'),('Ross a kol.: Význam sociálních podmínek','https://pmc.ncbi.nlm.nih.gov/articles/PMC10626985/')],
 [('Lewicki a kol.: Struktura účinných omluv','https://ncmr.lps.library.cmu.edu/article/id/264/'),('Ohio State University: Šest složek omluvy','https://news.osu.edu/the-6-elements-of-an-effective-apology-according-to-science/')],
 [('Algoe a kol.: Každodenní vděčnost ve vztahu','https://onlinelibrary.wiley.com/doi/10.1111/j.1475-6811.2010.01273.x'),('Algoe a kol.: Vděčnost a vnímaná vstřícnost','https://pmc.ncbi.nlm.nih.gov/articles/PMC5085264/')],
 [('Aron a kol.: Nové společné aktivity a vztah','https://pubmed.ncbi.nlm.nih.gov/10707334/'),('Aron a kol.: Úplný text studie','https://files.blogs.baruch.cuny.edu/wp-content/blogs.dir/7309/files/2019/11/Aron_Norman_Aron_McKenna_Heyman_2000.pdf')],
 [('Gordonová a Chenová: Spánek a mezilidský konflikt','https://ombuds.columbia.edu/sites/default/files/content/pics/30%20Anniv/Sleep%20and%20Interpersonal%20Conflict.pdf'),('UC Berkeley: Špatný spánek a partnerské spory','https://news.berkeley.edu/2013/07/08/sleep-fights/')]
]
concepts=[
 'Two Napoleonic sailing warships crossing at close quarters, with clearly perpendicular headings.',
 'An exhausted early nineteenth century draft horse in a simple artillery harness, head lowered.',
 'A Chappe optical telegraph tower with the characteristic articulated semaphore arms.',
 'An early nineteenth century civil code book with a wedding ring resting on its closed cover; no readable text.',
 'A few Napoleonic infantry silhouettes sheltering immediately behind a broad ridge.',
 'An open reference book beside a magnifying glass, a simple accompaniment to document retrieval.',
 'A small and a larger processor side by side jointly reviewing one short strip of token tiles.',
 'A light colored padlock with a restrained lattice pattern on its body, accompanying lattice cryptography.',
 'A simple cutaway of a two-layer tandem solar cell receiving a single broad band of light.',
 'A simple battery cutaway exposing a porous carbon electrode, without elemental labels.',
 'A modest piece of bread and a cup of water as sufficient satisfaction of basic needs.',
 'A balance scale with a hand returning one displaced weight to restore equilibrium.',
 'An open hand gently stops a second clenched hand; a concise refusal of retaliation.',
 'An overturned ancient wine cup beside a hesitant hand, accompanying culpable ignorance.',
 'An ancient Greek philosopher sets a crown aside while considering a civic responsibility.',
 'An empty royal throne, accompanying a definite description that lacks a referent.',
 'An ordinary person stands at an open gate holding their own reins as a compact metaphor for two liberties.',
 'Hands test the load on a simple bridge model, accompanying inquiry through active testing.',
 'Two broad overlapping horizon frames become one shared view, accompanying historically situated understanding.',
 'An anonymous person in a simple room sorts a few cards with invented abstract marks, no real language text.',
 'A small irregular asteroid recoils from an asymmetric fan of ejected debris after a probe impact.',
 'A dark asteroid sample grain held inside a clean open sample capsule.',
 'A star behind a gas giant; a single broad band of light passes through the atmospheric rim, no extra diagram.',
 'A small space probe curves around one planet, one subtle trajectory curve, no arrows or labels.',
 'IKAROS with a single square thin solar sail and small central spacecraft, isolated without scenery.',
 'A lonely fictional Frankenstein creature reaches toward a door from which its creator has departed; no film likeness.',
 'A solitary nineteenth century student sits hunched with a stark divided shadow, accompanying guilt.',
 'A nineteenth century woman leaves a dollhouse-like doorway carrying a small travel bag.',
 'A youthful Victorian portrait whose painted face has a subtly corrupted half, one framed portrait only.',
 'An anonymous hand offers one tablet in front of a few identical hatchery bottles, accompanying manufactured contentment.',
 'A Soviet-era tank faces one simple Budapest street barricade in 1956, no flags or crowds.',
 'A Soviet-era tank tread presses a newspaper in a Czechoslovak street, accompanying August 1968.',
 'Two simple porcelain tea cups face each other across a diplomatic table, accompanying the opening to China.',
 'A simplified historically recognizable La Moneda palace facade with a small plume of smoke, no people.',
 'A lowered red Soviet flag with a small hammer and sickle near a bare pole, accompanying the end of the USSR.',
 'Two ordinary partners in one conversation; one leans forward to speak while the other turns away.',
 'Two hands repair one broken ceramic cup, accompanying an apology with concrete repair.',
 'One ordinary partner warmly thanks the other while acknowledging a small helpful gesture.',
 'An ordinary couple learn a simple dance step together with curious engaged expressions.',
 'Two tired partners talk across a small table, one rubbing a sleepy eye; no clocks or extra symbols.'
]
palettes=['blue_gold','green_copper','indigo_cyan','terracotta_cream','teal_amber','violet_coral','monochrome_cool','monochrome_warm']
keywords='''sailing_warships,square_sails,crossing_headings
draft_horse,lowered_head,leather_harness
semaphore_tower,pivoting_regulator,two_moving_arms
bound_law_book,wedding_ring,closed_cover
infantry_silhouettes,broad_ridge,sheltered_reverse_slope
open_book,magnifying_glass,visible_pages
small_processor,large_processor,token_strip
padlock,lattice_pattern,closed_shackle
solar_cell,two_layers,light_band
battery_cutaway,porous_carbon,electrode_layers
bread,water_cup,modest_meal
balance_scale,returning_hand,displaced_weight
open_hand,clenched_fist,stopping_gesture
ancient_wine_cup,spilled_wine,hesitant_hand
greek_philosopher,crown,setting_aside_gesture
empty_throne,royal_seat,vacant_cushion
ordinary_person,open_gate,held_reins
hands,bridge_model,test_load
overlapping_frames,broad_horizon,shared_view
anonymous_person,symbol_cards,small_room
irregular_asteroid,ejecta_fan,impact_site
asteroid_grain,sample_capsule,open_lid
gas_giant,atmospheric_rim,starlight_band
space_probe,planet,curved_trajectory
square_solar_sail,thin_membrane,central_spacecraft
lonely_creature,outstretched_hand,empty_doorway
nineteenth_century_student,hunched_pose,divided_shadow
nineteenth_century_woman,doorway,travel_bag
framed_portrait,youthful_face,corrupted_painted_half
offered_tablet,hatchery_bottles,anonymous_hand
soviet_era_tank,street_barricade,budapest_street
tank_tread,newspaper,street_surface
porcelain_cups,diplomatic_table,facing_placement
la_moneda_facade,small_smoke_plume,palace_windows
lowered_red_flag,flagpole,hammer_and_sickle
two_partners,leaning_forward,turning_away
repairing_hands,broken_cup,joined_pieces
two_partners,warm_thanks,helpful_gesture
couple,dance_step,engaged_expressions
tired_partners,small_table,sleepy_eye'''.splitlines()
drafts=[]
for offset,(row,proposal,ss,concept) in enumerate(zip(rows,plan['proposals'],sources,concepts)):
    id=proposal['id'];motif=row[5]
    scene='interaction' if offset in [0,4,6,11,12,14,16,17,19,20,25,26,27,29,30,35,36,37,38,39] else 'object'
    content=''.join('<p>'+p+'</p>' for p in texts[id].strip().splitlines())
    title='Aristotelés: „Nevěděl jsem“ nemusí být omluva' if id=='326' else row[1]
    drafts.append({'id':id,'title':title,'content':content,'category':row[0],
      'sources':[{'label':l,'url':u} for l,u in ss],
      'illustration':{'concept':concept,'scene_type':scene,'primary_subject':motif,'secondary_subjects':[],
       'visual_keywords':keywords[offset].split(','),
       'composition_hints':['dominant_central_subject','balanced_transparent_margins','single_coherent_scene'],
       'mood':'contemplative' if offset>=10 else 'neutral','palette':palettes[offset%len(palettes)]},
      'knowledge':proposal['knowledge']})
(R/'posts-gap-313-352-drafts.json').write_text(json.dumps(drafts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Wrote',len(drafts),'drafts; content lengths',min(len(p['content']) for p in drafts),max(len(p['content']) for p in drafts))
