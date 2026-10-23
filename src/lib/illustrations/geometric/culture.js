/**
 * Kulturní a historický kontext ilustrace.
 *
 * Text sám o sobě říká „o čem“ (předmět) a „jak“ (kompozice). Tato vrstva
 * doplňuje „kde a kdy“: egyptská stéla nemá stát před řeckým chrámem a čínský
 * text nemá dostat římský oblouk. Kontext se kreslí jako tichá kulisa za
 * hlavní motiv — nikdy ho nenahrazuje.
 *
 * Detekce je deterministická a záměrně konzervativní:
 *   1. kultura musí být v titulku, nebo
 *   2. musí mít v textu alespoň dva zásahy a text musí být historický
 *      (chronologie, nebo humanitní kategorie).
 * Moderní zmínka („řecká dluhová krize“) tak nedostane antický chrám.
 *
 * Profily jsou data, ne podmínky pro konkrétní příspěvek. Nová kultura
 * znamená přidat klíče, kresbu památky a písma — bez zásahu do scén.
 */

import { circle, ellipse, line, path, polygon, rect } from '../primitives.js';
import { normalizeText, wordsOf, countHits, detectChronology } from '../analysis/analyze.js';
import { shape, stroke } from './palette.js';

const titleOf = (post) => normalizeText(post?.title ?? '');
const bodyOf = (post) => normalizeText(`${post?.title ?? ''} ${post?.content ?? ''}`);

/** Společná linka obzoru pod kulisou. */
function horizon(p, width = 38, opacity = 0.28) {
	return [line(-width, 0, width, 0, { ...stroke(p.light, 0.9, opacity), dash: '3 5' })];
}

/** Egypt: pyramida, obelisk, sluneční kotouč a hieroglyfické značky. */
function landmarkEgypt(p) {
	const out = [...horizon(p, 44)];
	out.push(
		polygon([[-40, 0], [0, -48], [40, 0]], { ...shape(p.forestDeep, p.light, 1.1), opacity: 0.72 }),
		line(0, -48, 9, 0, { ...stroke(p.light, 0.8, 0.28) }),
		line(-14, -26, 18, -26, { ...stroke(p.light, 0.7, 0.2) }),
		// Menší pyramida a obelisk
		polygon([[14, 0], [31, -25], [48, 0]], { ...shape(p.forest, p.light, 0.9), opacity: 0.6 }),
		polygon([[-52, 0], [-45, 0], [-43, -26], [-50, -26]], { ...shape(p.sageDeep, p.light, 0.8), opacity: 0.7 }),
		circle(-46, -31, 3.4, { fill: p.amber, opacity: 0.85 }),
		// Sluneční kotouč
		circle(0, -58, 5.2, { fill: p.amber, opacity: 0.8 })
	);
	// Hieroglyfy: oko, pírko, voda.
	out.push(
		ellipse(24, -6, 5, 3, { fill: 'none', stroke: p.teal, sw: 1, opacity: 0.8 }),
		circle(24, -6, 1.2, { fill: p.amber, opacity: 0.8 }),
		line(30, -10, 30, -2, { ...stroke(p.light, 1, 0.6) }),
		path('M 34 -3 Q 37 -8 40 -3', { ...stroke(p.teal, 1.1, 0.75) })
	);
	return out;
}

/** Řecko: chrám s tympanonem, sloupy a meandrový pás. */
function landmarkGreece(p) {
	const out = [...horizon(p, 42)];
	// Stupně a sloupy
	out.push(
		rect(-38, -4, 76, 4, { fill: p.sageDeep, stroke: p.light, sw: 0.8, opacity: 0.75 }),
		rect(-34, -8, 68, 4, { fill: p.sage, stroke: p.light, sw: 0.8, opacity: 0.75 })
	);
	for (let i = 0; i < 4; i++) {
		const x = -27 + i * 18;
		out.push(rect(x - 3, -30, 6, 22, { fill: p.lightSoft, stroke: p.light, sw: 0.7, opacity: 0.68 }));
		out.push(rect(x - 4.5, -32, 9, 2.6, { fill: p.sage, opacity: 0.65 }));
	}
	out.push(
		rect(-32, -36, 64, 5, { fill: p.tealDeep, stroke: p.light, sw: 0.8, opacity: 0.72 }),
		polygon([[-32, -36], [0, -58], [32, -36]], { ...shape(p.forest, p.light, 1), opacity: 0.68 }),
		circle(0, -44, 3.2, { fill: p.amber, opacity: 0.85 })
	);
	// Meander — řecký klíčový vzor.
	for (let i = 0; i < 3; i++) {
		const x = 30 + i * 9;
		out.push(path(`M ${x} -8 L ${x} -16 L ${x + 5} -16 L ${x + 5} -11 L ${x + 3} -11`, {
			...stroke(p.amber, 1, 0.6)
		}));
	}
	return out;
}

/** Řím: oblouk, pilíře a vavřínová ratolest. */
function landmarkRome(p) {
	const out = [...horizon(p, 40)];
	out.push(
		rect(-36, -40, 72, 40, { fill: p.forest, stroke: p.light, sw: 1, opacity: 0.55 }),
		rect(-30, -34, 24, 34, { ...shape(p.forestDeep, p.light, 0.9), opacity: 0.8 }),
		rect(6, -34, 24, 34, { ...shape(p.forestDeep, p.light, 0.9), opacity: 0.8 }),
		// Otvor oblouku
		path('M -6 -34 L -6 -18 A 12 12 0 0 1 18 -18 L 18 -34 Z', { fill: p.bg, opacity: 0.9 }),
		arcPathLocal(6, -18, 12, 180, 360, p),
		// Atika
		rect(-38, -46, 76, 6, { fill: p.sageDeep, stroke: p.light, sw: 0.8, opacity: 0.7 })
	);
	// Vavřínové lístky a SPQR jako krátké zářezy.
	for (let i = 0; i < 4; i++) {
		out.push(ellipse(-42 + i * 7, -10 - i * 4, 3.4, 1.8, { fill: p.green, opacity: 0.7, rot: -30 }));
	}
	for (let i = 0; i < 4; i++) {
		out.push(rect(28 + i * 6, -12, 3, 1.6, { fill: p.light, opacity: 0.55 }));
	}
	return out;
}

function arcPathLocal(cx, cy, r, start, end, p) {
	const a = (start * Math.PI) / 180;
	const b = (end * Math.PI) / 180;
	return path(
		`M ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} A ${r} ${r} 0 0 1 ${cx + Math.cos(b) * r} ${cy + Math.sin(b) * r}`,
		{ fill: 'none', stroke: p.light, sw: 1, opacity: 0.55 }
	);
}

/** Čína: pagoda se třemi střechami a pečetní znaky. */
function landmarkChina(p) {
	const out = [...horizon(p, 38)];
	// Tři patra pagody
	for (let i = 0; i < 3; i++) {
		const y = -10 - i * 14;
		const w = 40 - i * 9;
		out.push(
			polygon([[-w, y], [0, y - 8], [w, y]], { ...shape(p.forestDeep, p.light, 0.9), opacity: 0.75 }),
			rect(-w + 7, y, (w - 7) * 2, 10, { fill: p.forest, stroke: p.light, sw: 0.7, opacity: 0.7 })
		);
		for (let c = 0; c < 3; c++) {
			out.push(rect(-w + 13 + c * ((w - 12) * 2 / 3), y + 2, 3, 6, { fill: p.amber, opacity: 0.6 }));
		}
	}
	out.push(line(0, -52, 0, -58, { ...stroke(p.amber, 1.4, 0.8) }), circle(0, -60, 2.4, { fill: p.amber, opacity: 0.85 }));
	// Pečetní čtverce.
	for (let i = 0; i < 2; i++) {
		const x = 30 + i * 11;
		out.push(
			rect(x, -14, 8, 8, { fill: 'none', stroke: p.terracotta, sw: 1, opacity: 0.8 }),
			line(x + 2, -10, x + 6, -10, { ...stroke(p.terracotta, 0.9, 0.8) }),
			line(x + 4, -12, x + 4, -8, { ...stroke(p.terracotta, 0.9, 0.8) })
		);
	}
	return out;
}

/** Japonsko: brána torii a stylizovaná vlna. */
function landmarkJapan(p) {
	const out = [...horizon(p, 38)];
	out.push(
		// Sloupky
		rect(-24, -38, 6, 38, { fill: p.terracotta, stroke: p.light, sw: 0.8, opacity: 0.8 }),
		rect(18, -38, 6, 38, { fill: p.terracotta, stroke: p.light, sw: 0.8, opacity: 0.8 }),
		// Horní a spodní příčka
		path('M -34 -40 Q 0 -46 34 -40 L 34 -34 Q 0 -40 -34 -34 Z', {
			...shape(p.terracotta, p.light, 0.9),
			opacity: 0.82
		}),
		rect(-28, -28, 56, 5, { fill: p.terracotta, stroke: p.light, sw: 0.7, opacity: 0.75 }),
		rect(-3, -34, 6, 6, { fill: p.light, opacity: 0.5 })
	);
	// Vlna pod branou.
	out.push(
		path('M -34 -2 Q -28 -9 -22 -2 Q -16 -9 -10 -2 Q -4 -9 2 -2', {
			...stroke(p.teal, 1.2, 0.7)
		}),
		circle(28, -8, 2.2, { fill: p.amber, opacity: 0.7 })
	);
	return out;
}

/** Indie: stúpa, špička a lotosové tečky. */
function landmarkIndia(p) {
	const out = [...horizon(p, 38)];
	out.push(
		rect(-32, -6, 64, 6, { fill: p.sageDeep, stroke: p.light, sw: 0.8, opacity: 0.75 }),
		path('M -26 -6 Q -26 -34 0 -34 Q 26 -34 26 -6 Z', { ...shape(p.lightSoft, p.light, 1), opacity: 0.7 }),
		rect(-6, -42, 12, 8, { fill: p.sage, stroke: p.light, sw: 0.8, opacity: 0.75 }),
		line(0, -42, 0, -54, { ...stroke(p.amber, 1.4, 0.8) }),
		// Tři deštníky
		line(-9, -49, 9, -49, { ...stroke(p.light, 0.9, 0.55) }),
		line(-6, -53, 6, -53, { ...stroke(p.light, 0.8, 0.45) })
	);
	// Lotosové okvětní lístky.
	for (let i = 0; i < 5; i++) {
		const x = 30 + i * 5;
		out.push(ellipse(x, -8, 3.2, 5, { fill: p.terracotta, opacity: 0.55, rot: -20 + i * 10 }));
	}
	return out;
}

/** Mezopotámie: zikkurat a klínové znaky. */
function landmarkMesopotamia(p) {
	const out = [...horizon(p, 40)];
	for (let i = 0; i < 4; i++) {
		const w = 38 - i * 9;
		const y = -i * 11;
		out.push(
			rect(-w, y - 11, w * 2, 11, {
				fill: i % 2 === 0 ? p.forest : p.forestDeep,
				stroke: p.light,
				sw: 0.8,
				opacity: 0.72
			})
		);
	}
	out.push(
		rect(-7, -50, 14, 8, { fill: p.sageDeep, stroke: p.light, sw: 0.8, opacity: 0.8 }),
		line(0, -50, 0, -56, { ...stroke(p.amber, 1, 0.7) })
	);
	// Klínové znaky: trojúhelník a dvě čárky.
	for (let i = 0; i < 3; i++) {
		const x = 28 + i * 9;
		out.push(
			polygon([[x, -12], [x + 6, -9], [x, -6]], { fill: p.amber, opacity: 0.65 }),
			line(x + 2, -3, x + 7, -3, { ...stroke(p.light, 0.8, 0.5) })
		);
	}
	return out;
}

/** Islám: kopule, minaret a osmicípá hvězda. */
function landmarkIslamic(p) {
	const out = [...horizon(p, 38)];
	out.push(
		rect(-34, -6, 68, 6, { fill: p.sageDeep, stroke: p.light, sw: 0.8, opacity: 0.75 }),
		rect(-28, -30, 56, 24, { fill: p.forest, stroke: p.light, sw: 0.9, opacity: 0.7 }),
		path('M -26 -30 Q -26 -48 0 -48 Q 26 -48 26 -30 Z', { ...shape(p.tealDeep, p.light, 1), opacity: 0.75 }),
		line(0, -48, 0, -56, { ...stroke(p.amber, 1.2, 0.8) }),
		circle(0, -57, 2.2, { fill: p.amber, opacity: 0.85 }),
		// Minaret
		rect(30, -44, 7, 44, { fill: p.forestDeep, stroke: p.light, sw: 0.8, opacity: 0.78 }),
		polygon([[29, -44], [37, -44], [33.5, -53]], { fill: p.sage, stroke: p.light, sw: 0.7, opacity: 0.8 }),
		circle(33.5, -57, 2, { fill: p.amber, opacity: 0.75 })
	);
	// Osmicípá hvězda z dvou čtverců.
	out.push(
		rect(-48, -18, 11, 11, { fill: 'none', stroke: p.amber, sw: 0.9, opacity: 0.65 }),
		polygon([[-42.5, -20.3], [-34.7, -12.5], [-42.5, -4.7], [-50.3, -12.5]], {
			fill: 'none',
			stroke: p.amber,
			sw: 0.9,
			opacity: 0.65
		})
	);
	return out;
}

/** Sever: drakkar s plachtou a runovými znaky. */
function landmarkNorse(p) {
	const out = [...horizon(p, 42)];
	out.push(
		// Trup
		path('M -38 -2 Q -24 14 0 14 Q 26 14 40 -4 L 34 -8 L 30 2 Q 0 8 -30 0 L -36 -6 Z', {
			...shape(p.forestDeep, p.light, 1),
			opacity: 0.8
		}),
		// Stěžeň a plachta
		line(0, -4, 0, -46, { ...stroke(p.light, 1.2, 0.7) }),
		polygon([[-16, -40], [16, -40], [12, -12], [-12, -12]], { fill: p.sage, stroke: p.light, sw: 0.8, opacity: 0.6 }),
		line(-14, -30, 14, -30, { ...stroke(p.terracotta, 1, 0.7) }),
		line(-13, -22, 13, -22, { ...stroke(p.terracotta, 1, 0.7) })
	);
	// Runy: svislá čára s větvemi.
	for (let i = 0; i < 3; i++) {
		const x = 28 + i * 7;
		out.push(
			line(x, -14, x, -4, { ...stroke(p.light, 1, 0.6) }),
			line(x, -11, x + 3, -14, { ...stroke(p.light, 0.8, 0.55) })
		);
	}
	return out;
}

/** Mezoamerika: stupňovitá pyramida a glyfový blok. */
function landmarkMesoamerica(p) {
	const out = [...horizon(p, 40)];
	for (let i = 0; i < 3; i++) {
		const w = 34 - i * 9;
		out.push(
			rect(-w, -10 - i * 10, w * 2, 10, {
				fill: i % 2 === 0 ? p.forest : p.sageDeep,
				stroke: p.light,
				sw: 0.8,
				opacity: 0.75
			})
		);
	}
	out.push(
		rect(-6, -38, 12, 8, { fill: p.forestDeep, stroke: p.light, sw: 0.8, opacity: 0.85 }),
		line(-34, -10, -24, -10, { ...stroke(p.light, 1, 0.5) }),
		line(22, -10, 34, -6, { ...stroke(p.light, 0.9, 0.45) })
	);
	// Glyfový blok.
	out.push(
		rect(28, -24, 12, 12, { fill: 'none', stroke: p.terracotta, sw: 1, opacity: 0.75 }),
		circle(34, -18, 2.4, { fill: p.amber, opacity: 0.75 }),
		line(30, -21, 38, -15, { ...stroke(p.terracotta, 0.8, 0.7) })
	);
	return out;
}

/**
 * Profily kultur. `stems` jsou normalizované kmeny bez diakritiky;
 * `landmark` kreslí kulisu v lokálních souřadnicích (země je y = 0).
 */
export const CULTURES = {
	egypt: {
		label: 'Egypt',
		note: 'pyramidy, obelisk, hieroglyfy',
		stems: ['egypt*', 'faraon*', 'hieroglyf*', 'nil*', 'kairo*', 'theby*'],
		landmark: landmarkEgypt
	},
	greece: {
		label: 'Řecko',
		note: 'chrám, sloupy, meandros',
		stems: [
			'reck*',
			'athen*',
			'ateny*',
			'sparta*',
			'makedon*',
			'hellen*',
			'minoj*',
			'myken*',
			// Myslitelé a autoři jsou stejně silný signál jako místo.
			'sokrat*',
			'platon*',
			'aristotel*',
			'herakleit*',
			'pythagor*',
			'euklid*',
			'archimed*',
			'homer*',
			'sofokl*',
			'euripid*',
			'thukydid*',
			'herodot*',
			'epikur*',
			'stoik*',
			'zenon*',
			'sofist*',
			'presokrat*'
		],
		landmark: landmarkGreece
	},
	rome: {
		label: 'Řím',
		note: 'oblouk, vavřín, latinské zářezy',
		stems: [
			'rim',
			'rima',
			'rime',
			'rimu',
			'rimem',
			'riman*',
			'latium*',
			'caesar*',
			'augustus*',
			'legion*',
			'koloseum*',
			'pompej*',
			'cicero*',
			'senec*',
			'vergil*',
			'ovid*',
			'tacit*',
			'livius*'
		],
		landmark: landmarkRome
	},
	china: {
		label: 'Čína',
		note: 'pagoda, pečetní znaky',
		stems: ['cin', 'cina', 'ciny', 'cine', 'cinu', 'cinou', 'cins*', 'si-an', 'terakot*', 'konfuci*', 'tao*', 'ming*', 'qin*', 'hedvabi*', 'peking*'],
		landmark: landmarkChina
	},
	japan: {
		label: 'Japonsko',
		note: 'brána torii, vlna',
		stems: ['japons*', 'tokio*', 'kjoto*', 'samuraj*', 'sinto*', 'hirosima*', 'nagasaki*'],
		landmark: landmarkJapan
	},
	india: {
		label: 'Indie',
		note: 'stúpa, lotos',
		stems: ['indie', 'indii', 'indickou*', 'indicky*', 'indicka*', 'hindu*', 'buddh*', 'gandhi*', 'moghul*', 'sanskrit*'],
		landmark: landmarkIndia
	},
	mesopotamia: {
		label: 'Mezopotámie',
		note: 'zikkurat, klínové znaky',
		stems: ['mezopotam*', 'sumer*', 'babylon*', 'asyr*', 'akkad*', 'klinopis*'],
		landmark: landmarkMesopotamia
	},
	islam: {
		label: 'Islámský svět',
		note: 'kopule, minaret, hvězda',
		stems: ['islam*', 'muslim*', 'arab*', 'koran*', 'mecit*', 'bagdad*', 'dama*ek*', 'damasek*', 'persi*', 'persk*'],
		landmark: landmarkIslamic
	},
	norse: {
		label: 'Sever',
		note: 'drakkar, runy',
		stems: ['viking*', 'nord*', 'severs*', 'run*', 'odin*', 'drakkar*'],
		landmark: landmarkNorse
	},
	mesoamerica: {
		label: 'Mezoamerika',
		note: 'stupňovitá pyramida, glyf',
		stems: ['maysk*', 'maya', 'mayu', 'aztek*', 'inck*', 'inka', 'tenochtitlan*', 'andsk*'],
		landmark: landmarkMesoamerica
	}
};

export const CULTURE_KEYS = Object.keys(CULTURES);

const HISTORICAL_CATEGORIES = new Set([
	'historie',
	'filozofie',
	'literatura',
	'umeni',
	'veda',
	'astronomie',
	'matematika',
	'fyzika'
]);

/**
 * Rozpozná kulturu příspěvku. Vrací `null`, pokud text nemá dost signálů
 * nebo jde o moderní zmínku bez historického kontextu.
 *
 * @param {{title?: string, content?: string, category?: string} | null} post
 * @returns {{key: string, label: string, score: number, reason: string} | null}
 */
export function detectCulture(post) {
	if (!post || typeof post !== 'object') return null;
	const title = titleOf(post);
	const body = bodyOf(post);
	const category = String(post.category ?? '').toLowerCase();
	const chronology = detectChronology(post);

	const ranked = [];
	for (const key of CULTURE_KEYS) {
		const profile = CULTURES[key];
		const titleHits = countHits(wordsOf(title), profile.stems);
		const bodyHits = countHits(wordsOf(body), profile.stems);
		if (titleHits === 0 && bodyHits < 2) continue;
		if (titleHits === 0 && !chronology.strong && !HISTORICAL_CATEGORIES.has(category)) continue;
		// Moderní politika a ekonomika smí dostat kulturu jen výslovně
		// v titulku; jinak by „Řecko“ v dnešní dluhové krizi vykreslilo chrám.
		if (['politika', 'ekonomie'].includes(category) && titleHits === 0) continue;
		if (!HISTORICAL_CATEGORIES.has(category) && category !== 'politika') continue;
		ranked.push({
			key,
			label: profile.label,
			score: titleHits * 3 + bodyHits,
			bodyHits,
			reason: `culture:${key}`
		});
	}
	ranked.sort((a, b) => b.score - a.score || b.bodyHits - a.bodyHits);
	if (!ranked.length) return null;
	const best = ranked[0];
	// Text, který záměrně spojuje dvě kultury (indický a čínský trojúhelník),
	// nemá dostat jednu z nich jako kulisa. Neutralita je přesnější.
	if (ranked[1] && best.score - ranked[1].score < 2) return null;
	// Jeden zásah v textu bez opory v titulku je slabý signál.
	if (best.score < 3 && best.bodyHits < 2) return null;
	return best;
}

/** Scény, kde by kulturní kulisa byla šum: vesmír, abstrakce, moderna. */
const NO_BACKDROP = new Set([
	'layers',
	'solarSystem',
	'celestial',
	'observatory',
	'spacecraft',
	'networkScene',
	'crash',
	'inflation',
	'waveform',
	'digits',
	'repeatingDecimal',
	'canSeries',
	'laboratory',
	'artificial',
	'taxi',
	'bacteria',
	'atomIdea',
	'circleSquare',
	'powers',
	'compression',
	'boxParadox',
	'conditioning',
	'lossAversion',
	'roles',
	'stateBirth',
	// Již kulturně konkrétní scény: další kulisa by je zdvojila.
	'rosetta',
	'terracottaArmy'
]);

/**
 * Kulisa kultury za hlavní scénou. Vrací prázdné pole, pokud se scéna
 * nehodí nebo kultura chybí. Nikdy nemění předmět ani kompozici.
 */
export function cultureBackdrop(culture, ctx) {
	if (!culture || !ctx?.scene || NO_BACKDROP.has(ctx.scene)) return [];
	const profile = CULTURES[culture.key];
	if (!profile) return [];
	const p = ctx.palette;
	const right = (ctx.balance ?? 0) >= 0;
	const x = right ? 258 : 62;
	const y = 74;
	const scale = 0.52 + (ctx.density ?? 0.6) * 0.08;
	return profile.landmark(p).map((el) => ({
		...el,
		transform: `translate(${x} ${y}) scale(${scale}) ${el.transform ?? ''}`.trim(),
		opacity: (el.opacity ?? 1) * 0.42
	}));
}
