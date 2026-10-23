/**
 * Metadata předmětů pro analýzu textu.
 *
 * Původní klasický systém měl kreslicí funkce i metadata v jednom objektu.
 * Po odstranění klasické vrstvy zůstává jen to, co potřebuje produkce:
 * klíč, popis, role, rodiny, kmeny slov a afinity. Kreslení je oddělené
 * v `geometric/`.
 *
 * Pořadí je závazné — při shodě skóre rozhoduje index v tomto poli.
 */

/** @typedef {{ key: string, label: string, note: string, role: string, families: string[], tags: string[], categories: Record<string, number>, maxSupports?: number }} Subject */

/** @type {Subject[]} */
export const SUBJECTS = [
	{
		key: "flame",
		label: "Plamen",
		note: "oheň, energie, vášeň, spalování",
		role: "both",
		families: ["flame", "ritual", "storybook"],
		tags: ["plamen*", "ohen*", "ohniv*", "horeni*", "hoření*", "spalit*", "spalil*", "spalovat*", "spalen*", "spalovani*", "spalit*", "spalil*", "spalovat*", "spalen*", "spalovani*", "pochoden*"],
		categories: { "historie": 1, "filozofie": 1, "veda": 1, "fyzika": 0.5 }
	},
	{
		key: "torch",
		label: "Pochodeň",
		note: "světlo, předávání, pochod",
		role: "both",
		families: ["flame", "ritual"],
		tags: ["pochoden*", "pochodn*", "nositel*", "predani*", "předání*"],
		categories: { "historie": 1, "filozofie": 1, "politika": 0.5 }
	},
	{
		key: "volcano",
		label: "Vulkán",
		note: "erupce, láva, geologie",
		role: "subject",
		families: ["flame", "peak"],
		tags: ["vulkan*", "vulkán*", "sopk*", "lava*", "láv*", "erupc*", "magma*"],
		categories: { "veda": 2, "zajimavost": 2 }
	},
	{
		key: "candle",
		label: "Svíčka",
		note: "světlo, vzpomínka, obřad",
		role: "both",
		families: ["ritual", "flame"],
		tags: ["svick*", "svíčk*", "svice*", "svíce*", "vosk*", "plamen*"],
		categories: { "filozofie": 1, "historie": 1, "umeni": 0.5 }
	},
	{
		key: "lightning",
		label: "Blesk",
		note: "bouře, elektřina, náhlý zásah",
		role: "subject",
		families: ["storm"],
		tags: ["blesk*", "hrom", "hromu", "hromy", "hromem", "hromech", "hromovy*", "hromosvod*", "vyboj*", "výboj*", "boure*", "bouř*", "burka*", "bouřka*"],
		categories: { "fyzika": 2, "zajimavost": 1.5, "veda": 0.5 }
	},
	{
		key: "cloud",
		label: "Mrak",
		note: "obloha, počasí, nejistota",
		role: "both",
		families: ["storm", "peak", "canopy"],
		tags: ["mrak*", "oblac*", "oblacn*", "mracn*", "mračn*", "nebe", "nebi", "nebem", "nebes*", "nebesa", "nebesich", "nebesky*", "nebes*"],
		categories: { "zajimavost": 1.5, "veda": 1, "fyzika": 0.5 }
	},
	{
		key: "wind",
		label: "Vítr",
		note: "pohyb, vzduch, změna",
		role: "both",
		families: ["storm", "peak"],
		tags: ["vitr*", "větr*", "vanek*", "vánek*", "proud*", "proudění*", "vzduch*", "foukan*", "fouká*"],
		categories: { "fyzika": 1.5, "zajimavost": 1.5, "veda": 0.5 }
	},
	{
		key: "rain",
		label: "Déšť",
		note: "srážky, počasí, úroda",
		role: "both",
		families: ["storm"],
		tags: ["dest", "deste", "destem", "desti", "destovy*", "destove*", "destiv*", "dest", "deste", "destem", "desti", "destovy*", "destove*", "destiv*", "prsel*", "prší*", "srazk*", "srážk*", "vlhk*"],
		categories: { "zajimavost": 1.5, "veda": 1 }
	},
	{
		key: "sun",
		label: "Slunce",
		note: "světlo, teplo, život",
		role: "subject",
		families: ["celestial"],
		tags: ["slunce*", "slunci*", "solarn*", "solární*", "svetlo*", "světlo*"],
		categories: { "astronomie": 2.5, "fyzika": 1, "zajimavost": 0.5 }
	},
	{
		key: "moon",
		label: "Měsíc",
		note: "noc, příliv, cyklus",
		role: "subject",
		families: ["celestial", "cycle"],
		tags: ["mesic*", "měsíc*", "luna*", "lunarn*", "lunární*"],
		categories: { "astronomie": 2.5, "filozofie": 0.5 }
	},
	{
		key: "star",
		label: "Hvězda",
		note: "hvězdy, souhvězdí, orientace",
		role: "both",
		families: ["celestial"],
		tags: ["hvezda*", "hvězd*", "souhvezd*", "souhvězd*", "supernov*", "pulsar*"],
		categories: { "astronomie": 2.5, "filozofie": 0.5 }
	},
	{
		key: "eclipse",
		label: "Zatmění",
		note: "zatmění, korona, vzácný úkaz",
		role: "subject",
		families: ["celestial"],
		tags: ["zatmeni*", "zatmění*", "korona*", "eclipse*"],
		categories: { "astronomie": 2.5 }
	},
	{
		key: "flower",
		label: "Květina",
		note: "květy, rozkvět, krása",
		role: "subject",
		families: ["bloom"],
		tags: ["kvetina*", "květin*", "kvet", "kvetu", "kvety", "kvetem", "kvetech", "kvetina*", "kvetiny", "kvetin*", "kvetouci*", "kveteni*", "kvet", "kvetu", "kvety", "kvetem", "kvetech", "kvetina*", "kvetiny", "kvetin*", "kvetouci*", "kveteni*", "rozkvet*", "rozkvět*", "kvetouc*", "květouc*"],
		categories: { "zajimavost": 2, "veda": 1, "umeni": 1 }
	},
	{
		key: "petal",
		label: "Okvětní lístek",
		note: "jemnost, pomíjivost, detail",
		role: "both",
		families: ["bloom"],
		tags: ["okvetni*", "okvětní*", "petal*", "listek*", "lístek*"],
		categories: { "umeni": 1.5, "zajimavost": 1, "literatura": 0.5 }
	},
	{
		key: "seed",
		label: "Semeno",
		note: "počátek, dědičnost, úroda",
		role: "both",
		families: ["growth", "undergrowth", "bloom"],
		tags: ["semen*", "semink*", "semínk*", "osivo*", "zrno*", "zrn*"],
		categories: { "veda": 1.5, "zajimavost": 1.5 }
	},
	{
		key: "mushroom",
		label: "Houba",
		note: "houby, podhoubí, rozklad",
		role: "subject",
		families: ["undergrowth", "decay"],
		tags: ["houb*", "houba*", "mycel*", "podhoub*", "hliva*", "hlíva*", "muchomork*", "muchomůrk*"],
		categories: { "zajimavost": 2, "veda": 1 }
	},
	{
		key: "roots",
		label: "Kořeny",
		note: "původ, podzemí, ukotvení",
		role: "both",
		families: ["undergrowth", "growth", "canopy"],
		tags: ["koren*", "kořen*", "koreny*", "kořeny*", "podzem*", "rhizom*", "odden*"],
		categories: { "veda": 1.5, "zajimavost": 1.5, "filozofie": 0.5 }
	},
	{
		key: "sprout",
		label: "Klíček",
		note: "růst, začátek, naděje",
		role: "subject",
		families: ["growth"],
		tags: ["klicek*", "klíček*", "sazenice*", "vyhonek*", "výhonek*", "puceni*", "pučení*", "vzklice*", "vzklíče*"],
		categories: { "veda": 1.5, "zajimavost": 1, "ekonomie": 0.5 }
	},
	{
		key: "branch",
		label: "Větev",
		note: "větve, koruna, propojení",
		role: "both",
		families: ["canopy", "growth"],
		tags: ["vetev*", "větev*", "vetvi*", "větvi*", "vetven*", "větven*"],
		categories: { "zajimavost": 1.5, "veda": 1, "umeni": 0.5 }
	},
	{
		key: "glacier",
		label: "Ledovec",
		note: "led, klima, ledovce",
		role: "subject",
		families: ["peak"],
		tags: ["ledovec*", "ledovc*", "glacier*", "kryosfer*", "kryosféra*", "tundr*", "polarn*", "polární*"],
		categories: { "zajimavost": 2, "veda": 1.5 }
	},
	{
		key: "sword",
		label: "Meč",
		note: "boj, konflikt, rozhodnutí",
		role: "both",
		families: ["clash", "armory"],
		tags: ["mec", "mece", "mecem", "meci", "mecu", "mecich", "mecum", "mec", "mece", "mecem", "meci", "mecu", "mecich", "mecum", "serm*", "šerm*", "souboj*", "duel*", "zbran*", "zbraň*", "ostri*", "ostří*", "cepel*", "valk*", "válk*", "bitv*", "bitva*", "konflikt*"],
		categories: { "historie": 1.5, "umeni": 0.5, "literatura": 0.5 }
	},
	{
		key: "shield",
		label: "Štít",
		note: "obrana, ochrana, hradba",
		role: "both",
		families: ["clash", "armory"],
		tags: ["stit*", "štít*", "stity*", "štíty*", "obrana*", "branit*", "bránit*", "ochrana*", "heraldik*", "erbu*", "erb*"],
		categories: { "historie": 1.5, "politika": 1 }
	},
	{
		key: "helmet",
		label: "Přilba",
		note: "rytíři, válka, ochrana",
		role: "both",
		families: ["armory"],
		tags: ["helma*", "helm*", "prilba*", "přilba*", "rytir*", "rytíř*", "bojovnik*", "bojovník*"],
		categories: { "historie": 1.5, "umeni": 0.5 }
	},
	{
		key: "crack",
		label: "Prasklina",
		note: "zlom, krize, narušení",
		role: "both",
		families: ["rupture", "decay"],
		tags: ["prasklin*", "praskl*", "trhlin*", "zlom*", "rozpuk*", "krize*", "kriz*"],
		categories: { "psychologie": 1.5, "politika": 1, "fyzika": 0.5 }
	},
	{
		key: "explosion",
		label: "Výbuch",
		note: "exploze, náraz, zvrat",
		role: "both",
		families: ["rupture", "clash"],
		tags: ["vybuch*", "výbuch*", "exploz*", "detonac*", "trhavin*", "trask*", "třask*", "tresk*"],
		categories: { "fyzika": 1.5, "historie": 1, "politika": 1 }
	},
	{
		key: "figure",
		label: "Postava",
		note: "člověk, jedinec, svědek",
		role: "both",
		families: ["silhouette", "crowd", "portrait"],
		tags: ["clovek*", "člověk*", "osoba*", "postava*", "postavy", "postavu", "postavou", "jedinec*"],
		categories: { "filozofie": 1, "psychologie": 1, "umeni": 0.5 }
	},
	{
		key: "crowd",
		label: "Dav",
		note: "společnost, skupina, veřejnost",
		role: "subject",
		families: ["crowd", "silhouette"],
		tags: ["dav", "davu", "davem", "davech", "davy", "davum", "davu*", "skupin*", "skupina*", "mnozstvi*", "množstv*", "spolecnost*", "společnost*", "obcan*", "občan*", "volici*", "voliči*", "publikum*"],
		categories: { "politika": 1.5, "psychologie": 1.5, "historie": 1 }
	},
	{
		key: "hand",
		label: "Ruka",
		note: "gesto, pomoc, tvorba",
		role: "both",
		families: ["silhouette", "crowd", "ritual"],
		tags: ["ruka*", "ruce*", "rukou*", "dlan*", "dlaň*", "prst", "prstu", "prsty", "prstem", "prstech", "prstum", "prstovy*", "podani*", "podání*", "pomoc", "pomocnik*", "gest*"],
		categories: { "umeni": 1, "psychologie": 1, "filozofie": 0.5 }
	},
	{
		key: "mask",
		label: "Maska",
		note: "identita, přetvářka, divadlo",
		role: "both",
		families: ["gaze", "transformation", "crowd"],
		tags: ["maska*", "masky*", "maskovani*", "maskování*", "divadl*", "role*", "pretvarka*", "přetvářka*", "identit*"],
		categories: { "psychologie": 1.5, "umeni": 1.5, "literatura": 0.5 }
	},
	{
		key: "eye",
		label: "Oko",
		note: "pohled, pozorování, vědomí",
		role: "subject",
		families: ["gaze"],
		tags: ["oci", "ocima", "ocich", "ocim", "ocou", "oko", "oka", "oku", "okem", "oky", "okum", "oci", "ocima", "ocich", "ocim", "ocou", "oko", "oka", "oku", "okem", "oky", "okum", "oci", "ocima", "ocich", "ocim", "ocou", "oko", "oka", "oku", "okem", "oky", "okum", "pohled*", "zrak*", "videni*", "vidění*", "pozorovani*", "pozorování*"],
		categories: { "psychologie": 1.5, "filozofie": 1, "umeni": 1 }
	},
	{
		key: "heart",
		label: "Srdce",
		note: "láska, emoce, vášeň",
		role: "both",
		families: ["heart"],
		tags: ["srdce*", "srdci*", "laska*", "láska*", "cit", "city", "citu", "citum", "citech", "citovy*", "citove*", "citliv*", "city*", "emoce*", "emoc*", "vase*", "vášeň*", "soucit*"],
		categories: { "psychologie": 2, "umeni": 1, "literatura": 0.5 }
	},
	{
		key: "labyrinth",
		label: "Labyrint",
		note: "bludiště, hledání, složitost",
		role: "subject",
		families: ["labyrinth"],
		tags: ["labyrint*", "bludist*", "bludišt*", "minotaur*"],
		categories: { "filozofie": 1.5, "psychologie": 1, "matematika": 0.5 }
	},
	{
		key: "knot",
		label: "Uzel",
		note: "propletení, problém, spojení",
		role: "both",
		families: ["knot"],
		tags: ["uzel*", "uzly*", "uzl*", "spleten*", "splét*", "propleten*", "provaz", "provazy", "provazu", "provazem", "provazech", "provazku*", "provazek*", "lano*"],
		categories: { "filozofie": 1, "psychologie": 1, "veda": 0.5 }
	},
	{
		key: "thread",
		label: "Nit",
		note: "spojení, stopa, Ariadnina nit",
		role: "both",
		families: ["knot", "labyrinth"],
		tags: ["nit*", "niti*", "nitka*", "vlakno*", "vlákno*", "klubko*", "ariadn*", "ariadna*", "provazec*"],
		categories: { "filozofie": 1, "literatura": 1, "historie": 0.5 }
	},
	{
		key: "hourglass",
		label: "Přesýpací hodiny",
		note: "čas, odpočet, pomíjivost",
		role: "subject",
		families: ["hourglass", "cycle"],
		tags: ["presypaci*", "přesýpací*", "pisek*", "písek*", "odpocet*", "odpočet*", "lhut*", "lhůt*"],
		categories: { "filozofie": 1.5, "historie": 1, "fyzika": 0.5 }
	},
	{
		key: "cycle",
		label: "Cyklus",
		note: "opakování, období, návrat",
		role: "subject",
		families: ["cycle"],
		tags: ["cyklus*", "cykly*", "cyklick*", "rocni*", "roční*", "obdobi*", "období*", "navrat*", "návrat*"],
		categories: { "filozofie": 1.5, "veda": 1, "astronomie": 0.5 }
	},
	{
		key: "ruin",
		label: "Zřícenina",
		note: "zánik, trosky, paměť místa",
		role: "both",
		families: ["decay"],
		tags: ["zricenin*", "zřícenin*", "ruina*", "ruiny*", "trosky*", "trosk*", "upadek*", "úpadek*", "zanik*", "zánik*", "chatar*", "chátr*"],
		categories: { "historie": 2, "umeni": 1 }
	},
	{
		key: "butterfly",
		label: "Motýl",
		note: "proměna, metamorfóza, svoboda",
		role: "subject",
		families: ["transformation"],
		tags: ["motyl*", "motýl*", "metamorfoz*", "metamorfóz*", "promena*", "proměna*", "kukla*", "kridla*", "křídla*"],
		categories: { "zajimavost": 1.5, "veda": 1, "psychologie": 0.5 }
	},
	{
		key: "cocoon",
		label: "Kukla",
		note: "klid, čekání, zrození",
		role: "both",
		families: ["transformation"],
		tags: ["kukla*", "kokon*", "zavije*", "zavíje*", "promena*", "proměna*"],
		categories: { "veda": 1, "zajimavost": 1, "psychologie": 0.5 }
	},
	{
		key: "throne",
		label: "Trůn",
		note: "moc, autorita, panovník",
		role: "subject",
		families: ["throne"],
		tags: ["trun*", "trůn*", "vladce*", "vládce*", "moc", "moci", "mocne*", "mocny*", "mocni*", "moci*", "autorita*", "panovnik*", "panovník*", "kralovst*", "královst*"],
		categories: { "politika": 2.5, "historie": 2, "filozofie": 0.5 }
	},
	{
		key: "scepter",
		label: "Žezlo",
		note: "vláda, moc, symbol",
		role: "both",
		families: ["throne", "ritual"],
		tags: ["zezl*", "žezl*", "berla*", "berly*", "berlou*"],
		categories: { "politika": 2, "historie": 1.5 }
	},
	{
		key: "seal",
		label: "Pečeť",
		note: "úřední moc, závazek, tajemství",
		role: "both",
		families: ["throne", "ritual"],
		tags: ["pecet*", "pečet*", "peceti*", "pečeti*", "razitko*", "razítk*", "pecetid*", "pečetid*"],
		categories: { "politika": 1.5, "historie": 1.5 }
	},
	{
		key: "temple",
		label: "Chrám",
		note: "víra, civilizace, posvátno",
		role: "subject",
		families: ["temple"],
		tags: ["chram*", "chrám*", "svatyn*", "svatyne*", "svatyně*", "kostel*", "katedral*", "bazilik*"],
		categories: { "historie": 2, "umeni": 1.5, "filozofie": 0.5, "politika": 0.5 }
	},
	{
		key: "altar",
		label: "Oltář",
		note: "oběť, obřad, posvátné místo",
		role: "both",
		families: ["ritual", "temple"],
		tags: ["oltar*", "oltář*", "obetist*", "obětišt*", "obet*", "oběť*", "ritual*", "rituál*", "bohosluzb*", "bohoslužb*"],
		categories: { "historie": 1.5, "filozofie": 1, "umeni": 1 }
	},
	{
		key: "chalice",
		label: "Kalich",
		note: "obřad, víno, posvátný předmět",
		role: "both",
		families: ["ritual"],
		tags: ["kalich*", "pohar*", "pohár*", "gral*", "grál*"],
		categories: { "historie": 1, "umeni": 1, "filozofie": 0.5 }
	},
	{
		key: "book",
		label: "Otevřená kniha",
		note: "literatura, příběhy, pohádky, eposy",
		role: "subject",
		families: ["storybook"],
		tags: ["knih*", "roman", "romany", "romanu", "romanum", "romanech", "romanem", "romanovy*", "pohadk*", "povest*", "povídk*", "povidk*", "detektiv*", "basen*", "básen*", "epos*", "pribeh*", "literatur*", "spisovatel*", "autor", "autora", "autorem", "autorovi", "autoru", "autory", "autorech", "autorum", "autorka*", "autorstvi", "stran*", "kapitol*", "rukopis*", "ctenar*", "bajk*", "komiks*", "grimm*", "divadl*", "poezi*"],
		categories: { "literatura": 3, "filmy": 1, "umeni": 0.5 }
	},
	{
		key: "scroll",
		label: "Svitek a listina",
		note: "dokumenty, zákony, kroniky, rukopisy",
		role: "both",
		families: ["storybook", "portrait", "relic"],
		tags: ["svitek*", "pergamen*", "rukopis*", "listin*", "dokument*", "ustava", "ustavy", "ustavu", "ustave", "ustavou", "ustavni*", "ustavnim", "ustavnich", "zakonik*", "zákoník*", "dekret*", "chart*", "smlouv*", "zapis*", "kronik*", "text", "texty", "textu", "textem", "textum", "textech", "textove*", "textovy*"],
		categories: { "literatura": 1, "historie": 1.5, "politika": 1.5, "filozofie": 0.5 }
	},
	{
		key: "quill",
		label: "Bruk a kalamář",
		note: "psaní, autoři, myšlenky",
		role: "support",
		families: ["storybook", "portrait"],
		tags: ["brylo*", "inkoust*", "kalamar*", "pisar*", "pero*", "psac*"],
		categories: { "literatura": 1.5, "filozofie": 0.5 }
	},
	{
		key: "wolf",
		label: "Vlk",
		note: "pohádky, příroda, archetypy",
		role: "support",
		families: ["storybook", "nature"],
		tags: ["vlk*", "vlci", "vlka", "vlkem", "grimm*", "silen*", "šelma*", "selma*"],
		categories: { "literatura": 1.5 }
	},
	{
		key: "forest",
		label: "Les",
		note: "příroda, pohádky, ekosystémy",
		role: "both",
		families: ["storybook", "nature", "canopy"],
		tags: ["les", "lesa", "lese", "lesu", "lesem", "lesy", "lesich", "lesum", "lesni*", "lesnim", "lesnich", "hvozd*", "prales*", "strom*", "dub", "dubu", "dubem", "duby", "dubech", "lipa*", "lipu*", "sekvoj*", "koren*", "lesnim*"],
		categories: { "literatura": 1, "zajimavost": 0.5, "veda": 0.5 }
	},
	{
		key: "castle",
		label: "Hrad a zámek",
		note: "středověk, šlechta, pohádky",
		role: "support",
		families: ["storybook", "relic"],
		tags: ["hrad*", "zamek*", "zámek*", "pevnost*", "tvrz", "tvrzi", "palac*", "zricenin*", "hradb*", "veza*", "vez", "veze", "vezi", "vezich", "vezemi", "vezicka*"],
		categories: { "historie": 1, "literatura": 1, "politika": 0.5 }
	},
	{
		key: "film",
		label: "Filmový pás",
		note: "film, střih, kamera, projekce",
		role: "subject",
		families: ["metaphor"],
		tags: ["film*", "reziser*", "režisér*", "kino*", "kamer*", "zaber*", "záběr*", "strih*", "střih*", "herec*", "hereck*", "animac*", "promit*", "projekc*"],
		categories: { "filmy": 3 }
	},
	{
		key: "bust",
		label: "Busta myslitele",
		note: "filozofové, vědci, historické osobnosti",
		role: "subject",
		families: ["portrait"],
		tags: ["filozof*", "myslitel*", "sokrates*", "platon*", "aristotel*", "konfucius*", "lao*", "buddha*", "herakleit*", "pythagoras*", "descartes*", "kant*", "hegel*", "nietzsche*", "jung*", "freud*", "stoik*", "epikur*", "zenon*", "seneca*", "augustin*", "akvinsk*", "hobbes*", "locke*", "rousseau*", "voltair*", "kierkegaard*", "schopenhauer*", "marx*", "wittgenstein*", "camus*", "sartre*", "portret*", "busta*", "mudrc*", "osobnost*"],
		categories: { "filozofie": 2.5, "psychologie": 1, "historie": 0.5 }
	},
	{
		key: "laurel",
		label: "Vavřín",
		note: "vítězství, odkaz, antičtí myslitelé",
		role: "support",
		families: ["portrait"],
		tags: ["vavrin*", "vítěz*", "vitez*", "odkaz*", "antik*", "slav*", "ocenen*", "oceněn*"],
		categories: { "filozofie": 0.5, "historie": 0.5 }
	},
	{
		key: "column",
		label: "Antický sloup",
		note: "architektura, chrámy, instituce",
		role: "both",
		families: ["portrait", "relic"],
		tags: ["sloup*", "chram*", "chrám*", "akropol*", "katedral*", "architektur*", "stavb*", "klenb*", "portal*", "korint*", "ionsk*", "antick*", "chramu*"],
		categories: { "umeni": 1.5, "historie": 1, "filozofie": 0.5, "politika": 0.5 }
	},
	{
		key: "lawScroll",
		label: "Listina s pečetí",
		note: "právo, ústava, politické dokumenty",
		role: "subject",
		families: ["relic", "storybook"],
		tags: ["listin*", "ustava", "ustavy", "ustavu", "ustave", "ustavou", "ustavni*", "ustavnim", "ustavnich", "prava*", "práva*", "zakon*", "zákon*", "chart*", "dokument*", "dekret*"],
		categories: { "politika": 2.5, "historie": 1 },
		maxSupports: 0
	},
	{
		key: "brain",
		label: "Mozek a mysl",
		note: "psychologie, vědomí, kognitivní zkreslení",
		role: "subject",
		families: ["metaphor", "portrait"],
		tags: ["mozek*", "mysl*", "myslenk*", "mysleni*", "vedomi*", "vědomí*", "pamet*", "psychik*", "psycholog*", "vniman*", "vnímán*", "kognitiv*", "zkreslen*", "efekt*", "experiment*", "chovan*", "archetyp*"],
		categories: { "psychologie": 2.5, "veda": 0.5, "filozofie": 0.5 }
	},
	{
		key: "flask",
		label: "Laboratorní baňka",
		note: "chemie, pokusy, objevy",
		role: "subject",
		families: ["discovery"],
		tags: ["chemie*", "chemik*", "laborator*", "pokus*", "experiment*", "pliesen*", "penicilin*", "prvek*", "mendelejev*", "curie*", "sloucenin*", "reakc*", "katalyz*", "molekul*"],
		categories: { "veda": 2.5 }
	},
	{
		key: "microscope",
		label: "Mikroskop",
		note: "biologie, buňky, mikrobiologie",
		role: "subject",
		families: ["discovery"],
		tags: ["mikroskop*", "bunk*", "bakteri*", "vir", "viru", "viry", "virum", "virech", "virov*", "virus*", "viraln*", "mikrob*", "vzorek*", "tkan*", "tkán*", "mikroskopick*"],
		categories: { "veda": 2.5 }
	},
	{
		key: "telescope",
		label: "Dalekohled",
		note: "astronomie, pozorování oblohy",
		role: "subject",
		families: ["discovery"],
		tags: ["dalekohled*", "teleskop*", "hvezd*", "hvězd*", "planet*", "vesmir*", "vesmír*", "komet*", "galaxi*", "astronom*", "obloh*", "souprav*", "orbit*", "mesic*", "měsíc*", "slunce*"],
		categories: { "astronomie": 2.5, "fyzika": 0.5 }
	},
	{
		key: "atom",
		label: "Atom",
		note: "fyzika částic, kvantová mechanika",
		role: "subject",
		families: ["discovery"],
		tags: ["atom*", "castic*", "částic*", "kvant*", "elektron*", "proton*", "neutron*", "jader*", "jáder*", "radioaktiv*", "fyzik*", "molekul*"],
		categories: { "fyzika": 2.5, "veda": 1 }
	},
	{
		key: "dna",
		label: "DNA",
		note: "genetika, dědičnost, biologie",
		role: "subject",
		families: ["discovery"],
		tags: ["dna", "gen", "genu", "geny", "genem", "genech", "genum", "genom*", "genetik*", "genetick*", "dedicnost*", "dědičnost*", "chromozom*", "mendel*", "genetik*", "helix*", "bunecn*", "buněčn*"],
		categories: { "veda": 2.5 }
	},
	{
		key: "magnifier",
		label: "Lupa",
		note: "zkoumání, důkazy, detaily",
		role: "support",
		families: ["discovery"],
		tags: ["lupa*", "zvetsov*", "zvětšov*", "detail*", "stopa*", "dukaz*", "důkaz*", "zkoumat*", "zkuman*"],
		categories: { "veda": 1, "historie": 0.5 }
	},
	{
		key: "planet",
		label: "Planeta",
		note: "planety, sluneční soustava, exoplanety",
		role: "subject",
		families: ["discovery"],
		tags: ["planet*", "mars*", "venuse*", "venuše*", "jupiter*", "saturn*", "neptun*", "uran*", "zeme", "zemi", "zem", "zemich", "zememi", "zemekoule*", "zeme", "zemi", "zem", "zemich", "zememi", "zemekoule*", "exoplanet*", "obloha*"],
		categories: { "astronomie": 2.5 }
	},
	{
		key: "blackhole",
		label: "Černá díra",
		note: "gravitace, horizont událostí",
		role: "subject",
		families: ["discovery"],
		tags: ["cerna*", "černá*", "cernou*", "černou*", "cerny*", "černý*", "horizont*", "singularit*", "gravitac*", "pohlti*", "pohlcen*"],
		categories: { "astronomie": 2.5, "fyzika": 1 }
	},
	{
		key: "rocket",
		label: "Raketa",
		note: "kosmonautika, lety do vesmíru",
		role: "subject",
		families: ["discovery"],
		tags: ["raket*", "kosmonaut*", "kosmick*", "apollo*", "start*", "startu*"],
		categories: { "astronomie": 2, "veda": 1 }
	},
	{
		key: "map",
		label: "Mapa",
		note: "objevování, území, expedice",
		role: "subject",
		families: ["relic", "discovery"],
		tags: ["mapa*", "mapy*", "mapu*", "atlas*", "mapov*", "uzemi*", "území*", "expedic*", "cestovatel*", "zemepis*", "zeměpis*", "kontinent*", "kolonie*"],
		categories: { "historie": 2, "zajimavost": 1 }
	},
	{
		key: "amphora",
		label: "Amfora",
		note: "archeologie, antické artefakty",
		role: "subject",
		families: ["relic"],
		tags: ["amfor*", "vaza*", "váza*", "nadob*", "nádob*", "artefakt*", "archeolog*", "vykopavk*", "keramik*", "pohreb*", "pohřeb*", "hrobk*"],
		categories: { "historie": 2.5, "umeni": 1 }
	},
	{
		key: "stele",
		label: "Kamenná deska",
		note: "nápisy, hieroglyfy, Rosettská deska",
		role: "subject",
		families: ["relic"],
		tags: ["deska*", "kamen*", "kámen*", "hieroglyf*", "rosetta*", "napisu*", "napisy*", "tabule*", "stela*", "klinopis*", "klínopis*", "zapis*", "zápis*"],
		categories: { "historie": 2.5, "veda": 0.5 },
		maxSupports: 0
	},
	{
		key: "crown",
		label: "Koruna",
		note: "panovníci, dynastie, říše",
		role: "both",
		families: ["relic", "throne", "temple"],
		tags: ["kral*", "král*", "cisar*", "císař*", "korun*", "monarch*", "dynast*", "vlada*", "vláda*", "panovnik*", "knez*", "kněz*"],
		categories: { "historie": 2, "politika": 1.5 }
	},
	{
		key: "key",
		label: "Klíč",
		note: "tajemství, šifry, odemknutí",
		role: "support",
		families: ["metaphor", "labyrinth"],
		tags: ["klic*", "klíč*", "odemkn*", "tajemstv*", "sifra*", "šifra*", "kod", "kody", "kodu", "kodem", "kodech", "kodum", "kodovani*", "kodovany*", "kod", "kody", "kodu", "kodem", "kodech", "kodum", "kodovani*", "kodovany*", "heslo*", "pristup*", "přístup*"],
		categories: { "pocitacove-vedy": 1.5, "historie": 0.5 }
	},
	{
		key: "tree",
		label: "Strom",
		note: "příroda, ekosystémy, růst",
		role: "subject",
		families: ["nature", "canopy", "growth"],
		tags: ["strom*", "dub", "dubu", "dubem", "duby", "dubech", "lipa*", "lipu*", "sekvoj*", "lesnim*", "prales*"],
		categories: { "zajimavost": 2, "veda": 1.5 }
	},
	{
		key: "leaf",
		label: "List",
		note: "botanika, fotosyntéza, rostliny",
		role: "both",
		families: ["nature", "canopy", "growth", "bloom"],
		tags: ["list", "listy", "listu", "listem", "listech", "listi", "listím", "rostlin*", "botanik*", "fotosyntez*", "fotosyntéz*", "zelena*", "zelená*"],
		categories: { "veda": 2, "zajimavost": 1 }
	},
	{
		key: "octopus",
		label: "Chobotnice",
		note: "mořští živočichové, biologie",
		role: "subject",
		families: ["nature"],
		tags: ["chobotnic*", "hlavonoz*", "hlavonož*", "kraken*", "chapadl*", "more*", "moře*", "morsk*", "mořsk*", "ocean*", "oceán*", "ryb*", "zralok*"],
		categories: { "zajimavost": 2.5, "veda": 1 }
	},
	{
		key: "bird",
		label: "Pták",
		note: "ptáci, migrace, obloha",
		role: "both",
		families: ["nature", "canopy"],
		tags: ["ptak*", "pták*", "orel*", "orla*", "vrabec*", "holub*", "kridl*", "křídl*", "migrac*", "hnizd*", "hnízd*", "peri", "perim", "pery", "perami", "perech", "pericka*", "peri", "perim", "pery", "perami", "perech", "pericka*"],
		categories: { "zajimavost": 2, "veda": 1 }
	},
	{
		key: "mountain",
		label: "Hory",
		note: "krajina, geologie, expedice",
		role: "both",
		families: ["nature", "relic", "peak"],
		tags: ["hora*", "hory*", "pohori*", "pohoří*", "vulkan*", "vulkán*", "horstv*", "vrchol*", "krajin*", "alpy*", "everest*"],
		categories: { "zajimavost": 2, "veda": 1, "historie": 0.5 }
	},
	{
		key: "cat",
		label: "Kočka",
		note: "Schrödingerova kočka, zvířata",
		role: "subject",
		families: ["metaphor", "nature"],
		tags: ["kock*", "kočk*", "schrodinger*", "schrödinger*", "micka*", "mička*"],
		categories: { "fyzika": 2, "zajimavost": 1 }
	},
	{
		key: "balance",
		label: "Váhy",
		note: "rovnováha, spravedlnost, protiklady",
		role: "subject",
		families: ["metaphor"],
		tags: ["rovnovah*", "vaha*", "váha*", "vahy*", "váhy*", "spravedln*", "nabidk*", "nabídk*", "poptavk*", "poptávk*", "stredni*", "střední*", "kompromis*", "protiklad*", "srovnan*", "srovnán*", "kontrast*", "paradox*", "dualit*", "ctnost*", "ctností*"],
		categories: { "filozofie": 2, "ekonomie": 2, "psychologie": 1 }
	},
	{
		key: "coin",
		label: "Mince",
		note: "peníze, měna, oběh, hodnota",
		role: "both",
		families: ["metaphor"],
		tags: ["peniz*", "penez*", "penezen*", "minc*", "mena*", "meny*", "menou*", "platidl*", "obeziv*", "oběži*", "razb*", "ražb*"],
		categories: { "ekonomie": 3, "historie": 1 }
	},
	{
		key: "periodicTable",
		label: "Periodická tabulka",
		note: "chemické prvky, Mendělejev, soustava",
		role: "subject",
		families: ["discovery", "metaphor"],
		tags: ["tabulk*", "prvk*", "prvku*", "periodick*", "mendelejev*", "chemik*", "chemie*", "chemick*", "atomov*"],
		categories: { "veda": 3, "fyzika": 1.5, "matematika": 1, "zajimavost": 0.5 }
	},
	{
		key: "snowflake",
		label: "Sněhová vločka",
		note: "sníh, led, mráz, polární krajina",
		role: "subject",
		families: ["snowfield"],
		tags: ["snih*", "sníh*", "snehu*", "sněhu*", "snehem*", "sněhem*", "snehov*", "sněhov*", "led", "ledu", "ledem", "ledy", "ledech", "ledovy*", "ledove*", "ledovc*", "ledni*", "ledu*", "ledem*", "mraz*", "mráz*", "antarktid*", "poust*", "poušť*", "polarn*", "polární*", "arktid*"],
		categories: { "zajimavost": 2.5, "veda": 2 }
	},
	{
		key: "knife",
		label: "Nůž",
		note: "násilí, hrozba, ostrý řez",
		role: "support",
		families: ["metaphor", "clash", "rupture"],
		tags: ["nuz*", "nůž*", "nozem*", "nožem*", "ostry*", "ostre*", "ostrim", "ostrou", "ostrost*", "ostri", "ostří*", "ubliz*", "ublíž*", "nasili*", "násilí*", "bodn*", "zran*", "vrazd*", "vražd*"],
		categories: { "psychologie": 2, "historie": 1, "literatura": 1, "filmy": 0.5 }
	},
	{
		key: "clock",
		label: "Hodiny",
		note: "čas, období, věčnost",
		role: "subject",
		families: ["metaphor", "hourglass", "cycle"],
		tags: ["cas", "casu", "casem", "casove*", "casovy*", "hodin*", "kalendar*", "kalendář*", "stoleti*", "století*", "obdobi*", "období*", "era", "eru", "vecnost*", "věčnost*", "budoucnost*", "minulost*"],
		categories: { "historie": 1, "filozofie": 1, "fyzika": 0.5 }
	},
	{
		key: "gear",
		label: "Ozubená kola",
		note: "stroje, průmysl, technologie",
		role: "subject",
		families: ["metaphor"],
		tags: ["stroj*", "tovarn*", "továrn*", "prumysl*", "průmysl*", "technolog*", "mechan*", "automatiz*", "vyrob*", "výrob*", "produkc*", "motor*"],
		categories: { "pocitacove-vedy": 1.5, "ekonomie": 1, "veda": 1 }
	},
	{
		key: "palette",
		label: "Malířská paleta",
		note: "výtvarné umění, malíři, obrazy",
		role: "subject",
		families: ["metaphor"],
		tags: ["obraz*", "malir*", "malíř*", "malba*", "malovat*", "picasso*", "gogh*", "michelangelo*", "barv*", "umeni*", "umění*", "galeri*", "platen*", "kresba*", "soch*"],
		categories: { "umeni": 3 }
	},
	{
		key: "polyhedron",
		label: "Mnohostěn",
		note: "geometrie, důkazy, matematika",
		role: "subject",
		families: ["metaphor"],
		tags: ["geometrie*", "mnohosten*", "krychle*", "trojuheln*", "trojúheln*", "dukaz*", "důkaz*", "veta*", "věta*", "matematik*", "cisl*", "čísl*", "prvocisl*", "prvočísl*", "rovnic*", "topolog*", "symetri*"],
		categories: { "matematika": 3 }
	},
	{
		key: "entropy",
		label: "Entropie",
		note: "chaos, neuspořádanost, pravděpodobnost",
		role: "subject",
		families: ["metaphor"],
		tags: ["entropie*", "chaos*", "neusporadan*", "neuspořádan*", "rozpad*", "nahod*", "náhod*", "pravdepodobnost*", "pravděpodobnost*", "nejistot*", "zmatek*"],
		categories: { "fyzika": 2.5, "matematika": 1 }
	},
	{
		key: "infinity",
		label: "Nekonečno",
		note: "nekonečno, cykly, rekurze",
		role: "subject",
		families: ["metaphor", "cycle"],
		tags: ["nekonec*", "nekoneč*", "infinit*", "limita*", "opakovan*", "fractal*", "fraktál*", "rekurz*"],
		categories: { "matematika": 2.5, "filozofie": 1 }
	}
];

/** @type {Record<string, Subject>} */
export const SUBJECT_BY_KEY = Object.fromEntries(SUBJECTS.map((subject) => [subject.key, subject]));

export const SUBJECT_KEYS = SUBJECTS.map((subject) => subject.key);
