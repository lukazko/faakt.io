/**
 * Atlasová vrstva ilustrací — prototyp nového vizuálního stylu.
 *
 * Teplý papír, inkoustové obrysy a barva kategorie jako akcent. Scény jsou
 * záměrně omezené: jeden dominantní motiv, nejvýš dva podpůrné. Využívají
 * stejný IR, viewBox i renderer jako klasický systém — jen jiné kresby
 * a jinou paletu.
 *
 * Tato vrstva je zatím zapojená pouze ve vývojové galerii. Běžný feed
 * zůstává na `selectIllustration()` beze změny.
 */

import { createRandom, clamp, hashString, round } from './prng.js';
import { mixHex, paletteForCategory } from './palettes.js';
import { analyzePost } from './concepts.js';
import { MOTIF_BY_KEY, renderMotif } from './motifs.js';
import { VIEWBOX } from './scenes.js';
import { circle, ellipse, group, line, n, path, rect, tick } from './primitives.js';
import { deriveSeed } from './select.js';

const W = VIEWBOX.width;
const H = VIEWBOX.height;

// --- Paleta atlasu --------------------------------------------------------

export const ATLAS_PAPER = '#f2e7cf';
export const ATLAS_INK = '#2f2719';

const PAPER_WARM = '#ead9b8';
const PAPER_SHADE = '#dfcba6';
const RULE = '#bfa77f';
const RULE_FAINT = '#d8c5a0';
const OCHRE = '#c08a2e';
const OCHRE_DARK = '#8a5f1f';

/** Materiály v teplých, tiskových odstínech — drží atlas jako celek. */
const ATLAS_MATERIALS = {
	wood: '#a9743f',
	woodDark: '#6e4a26',
	foliage: '#7f9153',
	foliageDark: '#4e6238',
	stone: '#bbae95',
	stoneDark: '#8a7d66',
	metal: '#a9a08d',
	metalDark: '#6f685a',
	paper: '#f0e2c4',
	paperDark: '#cbb287',
	skin: '#d7a478',
	skinDark: '#a87248',
	water: '#6a9fb0',
	waterDark: '#3f6f80',
	ember: '#cc6a4e',
	emberDark: '#8e3f2c',
	gold: '#d3a13c',
	goldDark: '#8f681d',
	snow: '#f6f0e2'
};

/**
 * Paleta scény: papír a inkoust pro kresbu, barva kategorie pro akcent.
 * `primary` je v atlasu inkoust — kresba drží jednotný rukopis a kategorie
 * se projevuje pouze plochami akcentu, ne obarvením celého objektu.
 */
export function atlasPalette(category) {
	const base = paletteForCategory(category);
	const accent = base.primary;
	return {
		paper: ATLAS_PAPER,
		paperWarm: PAPER_WARM,
		paperShade: PAPER_SHADE,
		ink: ATLAS_INK,
		inkSoft: '#5a4b34',
		rule: RULE,
		ruleFaint: RULE_FAINT,
		accent,
		accentDeep: mixHex(accent, ATLAS_INK, 0.32),
		accentSoft: mixHex(accent, ATLAS_PAPER, 0.6),
		accentPale: mixHex(accent, ATLAS_PAPER, 0.84),
		secondary: base.secondary,
		tertiary: mixHex(base.secondary, ATLAS_PAPER, 0.42),
		// Role, které očekávají starší motivy.
		primary: ATLAS_INK,
		dark: '#5a4b34',
		light: mixHex(accent, ATLAS_PAPER, 0.6),
		muted: '#8f7a58',
		soft: RULE,
		faint: RULE_FAINT,
		...ATLAS_MATERIALS
	};
}

// --- Kresebné pomocníky ---------------------------------------------------

const ink = (sw = 1.4, opacity = 1) => ({
	fill: 'none',
	stroke: ATLAS_INK,
	sw,
	opacity,
	linecap: 'round',
	linejoin: 'round'
});

const softInk = (sw = 1, opacity = 0.55) => ({
	fill: 'none',
	stroke: '#5a4b34',
	sw,
	opacity,
	linecap: 'round',
	linejoin: 'round'
});

/** Krátké ručně kreslené tahy v pásu — jemné šrafování bez filtrů. */
function hatchRows(x, y, w, h, rand, color = '#5a4b34', opacity = 0.25) {
	const out = [];
	const gap = 5.5;
	const rows = Math.max(1, Math.floor(h / gap));
	for (let row = 0; row < rows; row++) {
		const yy = y + 2.5 + row * gap;
		let cursor = x + rand.range(1, 5);
		while (cursor < x + w - 3) {
			const len = rand.range(4, 10);
			out.push(
				line(cursor, yy, Math.min(cursor + len, x + w), yy, {
					stroke: color,
					sw: 0.8,
					opacity: opacity * rand.range(0.7, 1),
					linecap: 'round'
				})
			);
			cursor += len + rand.range(3, 8);
		}
	}
	return out;
}

/** Uzavřená organická křivka z radiálních bodů. */
function blob(cx, cy, rx, ry, points, rand) {
	const pts = [];
	for (let i = 0; i < points; i++) {
		const angle = (i / points) * Math.PI * 2;
		const wobble = 0.84 + rand() * 0.2;
		pts.push([cx + Math.cos(angle) * rx * wobble, cy + Math.sin(angle) * ry * wobble]);
	}
	const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
	const start = mid(pts[pts.length - 1], pts[0]);
	let d = `M ${n(start[0])} ${n(start[1])}`;
	for (let i = 0; i < points; i++) {
		const current = pts[i];
		const next = mid(current, pts[(i + 1) % points]);
		d += ` Q ${n(current[0])} ${n(current[1])} ${n(next[0])} ${n(next[1])}`;
	}
	return d + ' Z';
}

/** Vlnitá hranice vrstvy — atlasový řez krajinou. */
function waveBand(y, amplitude, phase, x0 = 0, x1 = W) {
	const steps = 5;
	const step = (x1 - x0) / steps;
	let d = `M ${n(x0)} ${n(y + Math.sin(phase) * amplitude)}`;
	for (let i = 0; i < steps; i++) {
		const xa = x0 + i * step + step * 0.5;
		const xb = x0 + (i + 1) * step;
		d += ` Q ${n(xa)} ${n(y + Math.sin(phase + (i + 0.5) * 1.4) * amplitude)} ${n(xb)} ${n(
			y + Math.sin(phase + (i + 1) * 1.4) * amplitude
		)}`;
	}
	return d;
}

function closedBand(topY, bottomY, topPhase, bottomPhase, amplitude, x0 = 0, x1 = W) {
	const top = waveBand(topY, amplitude, topPhase, x0, x1);
	// Spodní hranice pokračuje jako čára z konce horní a cesta se uzavře.
	const bottom = waveBand(bottomY, amplitude, bottomPhase, x0, x1).replace('M', 'L');
	return `${top} ${bottom} Z`;
}

// --- Hlavní motivy --------------------------------------------------------

/** Otevřená kniha — atlasová deska s vrstvenými stránkami. */
function atlasBook({ palette: p, rand }) {
	const out = [];
	// Spodní deska a hřbet
	out.push(
		path(
			'M -58 26 Q -58 -14 -52 -20 L 0 -13 L 52 -20 Q 58 -14 58 26 L 0 34 Z',
			{ fill: p.accentSoft, stroke: p.ink, sw: 1.5, linejoin: 'round' }
		)
	);
	// Stránky — levá a pravá, každá s vlastní vrstvou
	out.push(
		path('M -53 20 Q -27 12 -1 17 L -1 -11 Q -27 -18 -53 -11 Z', {
			fill: '#fbf3dd',
			stroke: p.ink,
			sw: 1.2,
			linejoin: 'round'
		})
	);
	out.push(
		path('M 53 20 Q 27 12 1 17 L 1 -11 Q 27 -18 53 -11 Z', {
			fill: '#f7edd4',
			stroke: p.ink,
			sw: 1.2,
			linejoin: 'round'
		})
	);
	out.push(line(0, -11, 0, 17, { stroke: p.ink, sw: 1.8 }));
	// Řádky — jen náznak textu
	for (let i = 0; i < 3; i++) {
		const y = -4 + i * 7;
		out.push(path(`M -43 ${n(y + 2)} Q -26 ${n(y)} -10 ${n(y + 3)}`, softInk(1, 0.45)));
		out.push(path(`M 10 ${n(y + 3)} Q 26 ${n(y)} 43 ${n(y + 2)}`, softInk(1, 0.45)));
	}
	// Záložka v barvě kategorie
	out.push(rect(8, -9, 5, 24, { fill: p.accent, opacity: 0.9 }));
	out.push(line(-58, 26, 0, 34, { stroke: p.ink, sw: 1.2 }));
	out.push(line(0, 34, 58, 26, { stroke: p.ink, sw: 1.2 }));
	// Šrafování spodní desky
	out.push(...hatchRows(-48, 26, 96, 6, rand, p.inkSoft, 0.18));
	return out;
}

/** Busta — teplá tvář, tmavé vlasy, akcentní šerpa. */
function atlasBust({ palette: p, rand }) {
	const out = [];
	// Sokl
	out.push(rect(-34, 44, 68, 7, { fill: p.stone, stroke: p.ink, sw: 1.2 }));
	out.push(rect(-27, 51, 54, 7, { fill: p.stoneDark, opacity: 0.45, stroke: p.ink, sw: 1.1 }));
	// Ramena a draperie
	out.push(
		path(
			'M -6 18 Q -30 20 -42 34 Q -48 42 -44 44 L 44 44 Q 48 42 42 34 Q 30 20 6 18 Z',
			{ fill: p.paperWarm, stroke: p.ink, sw: 1.3, linejoin: 'round' }
		)
	);
	// Šerpa v barvě kategorie
	out.push(
		path('M -26 30 Q -6 36 12 28 L 20 36 Q 0 44 -32 39 Z', {
			fill: p.accent,
			opacity: 0.85,
			stroke: p.ink,
			sw: 1
		})
	);
	// Krk
	out.push(path('M -11 4 L -8 21 Q 0 25 9 20 L 11 2 Z', { fill: p.skin, stroke: p.ink, sw: 1.2 }));
	// Hlava z profilu
	out.push(
		path(
			'M -15 -38 Q 6 -44 18 -28 Q 24 -18 18 -8 L 24 -2 Q 23 2 16 3 L 18 11 Q 13 17 3 15 L 2 27 L -13 27 L -15 15 Q -26 6 -27 -8 Q -28 -30 -15 -38 Z',
			{ fill: p.skin, stroke: p.ink, sw: 1.6, linejoin: 'round' }
		)
	);
	// Vlasy jako tmavá vrstva
	out.push(
		path('M -27 -8 Q -30 -26 -15 -37 Q 4 -43 16 -30 Q 6 -34 -4 -28 Q -14 -22 -16 -10 Q -20 -16 -27 -8 Z', {
			fill: p.inkSoft,
			opacity: 0.9,
			stroke: p.ink,
			sw: 1.1,
			linejoin: 'round'
		})
	);
	// Stín na tváři
	out.push(
		path('M -15 15 Q -24 6 -25 -6 Q -20 2 -12 6 L -10 16 Z', {
			fill: p.skinDark,
			opacity: 0.35
		})
	);
	// Oko, obočí, ústa
	out.push(circle(6, -11, 1.5, { fill: p.ink }));
	out.push(path('M 1 -16 Q 7 -18 12 -14', softInk(0.9, 0.7)));
	out.push(path('M 14 6 Q 18 5 19 8', softInk(0.9, 0.55)));
	// Šrafování stínu a soklu
	out.push(...hatchRows(-11, 18, 12, 9, rand, p.skinDark, 0.22));
	out.push(...hatchRows(-23, 47, 46, 8, rand, p.inkSoft, 0.18));
	return out;
}

/** Erlenmeyerova baňka s tekutinou v barvě kategorie. */
function atlasFlask({ palette: p, rand, variant }) {
	const out = [];
	// Hrdlo a zátka
	out.push(rect(-7, -52, 14, 7, { fill: p.wood, stroke: p.ink, sw: 1.2 }));
	out.push(rect(-6, -45, 12, 16, { fill: p.paper, opacity: 0.75, stroke: p.ink, sw: 1.2 }));
	// Tělo baňky
	out.push(
		path(
			'M -6 -29 L -6 -14 L -31 26 Q -36 35 -25 35 L 25 35 Q 36 35 31 26 L 6 -14 L 6 -29',
			{ fill: p.accentPale, fillOpacity: 0.55, stroke: p.ink, sw: 1.6, linejoin: 'round' }
		)
	);
	// Kapalina
	out.push(
		path(
			'M -27 24 Q -4 17 27 24 L 31 26 Q 36 35 25 35 L -25 35 Q -36 35 -31 26 Z',
			{ fill: p.accent, opacity: 0.78 }
		)
	);
	out.push(path('M -27 24 Q -4 17 27 24', { ...ink(1.1, 0.8) }));
	// Odlesk skla
	out.push(path('M -14 -6 L 4 -6 L 12 14', softInk(1, 0.35)));
	out.push(tick(-21, 20, 8, softInk(1, 0.45)));
	// Bublinky nad hladinou
	const bubbles = variant === 1 ? 2 : 3;
	for (let i = 0; i < bubbles; i++) {
		out.push(
			circle(rand.range(-9, 9), rand.range(2, 19), rand.range(1.4, 2.6), {
				fill: 'none',
				stroke: p.accentDeep,
				sw: 1,
				opacity: 0.65
			})
		);
	}
	out.push(...hatchRows(-22, 28, 44, 6, rand, p.accentDeep, 0.25));
	return out;
}

/** Klasická amfora — hliněné tělo, pásek v barvě kategorie. */
function atlasAmphora({ palette: p, rand }) {
	const out = [];
	// Ucho vlevo a vpravo
	out.push(path('M -24 -34 Q -44 -30 -42 -8 Q -40 6 -24 2', { ...ink(1.5), fill: 'none' }));
	out.push(path('M 24 -34 Q 44 -30 42 -8 Q 40 6 24 2', { ...ink(1.5), fill: 'none' }));
	// Tělo
	out.push(
		path(
			'M -14 -40 L 14 -40 Q 18 -40 18 -35 L 16 -22 Q 34 -12 34 10 Q 34 38 0 42 Q -34 38 -34 10 Q -34 -12 -16 -22 L -18 -35 Q -18 -40 -14 -40 Z',
			{ fill: '#cf9a63', stroke: p.ink, sw: 1.6, linejoin: 'round' }
		)
	);
	// Pás v barvě kategorie
	out.push(
		path('M -33 -2 Q 0 9 33 -2 L 33 10 Q 0 21 -33 10 Z', {
			fill: p.accent,
			opacity: 0.85,
			stroke: p.ink,
			sw: 1
		})
	);
	// Geometrický meandr — jen náznak
	for (let i = 0; i < 5; i++) {
		const x = -24 + i * 12;
		out.push(path(`M ${n(x)} 4 L ${n(x)} -3 L ${n(x + 6)} -3 L ${n(x + 6)} 2`, softInk(1, 0.6)));
	}
	// Hrdlo a okraj
	out.push(ellipse(0, -40, 18, 4, { fill: p.accentSoft, stroke: p.ink, sw: 1.2 }));
	// Stín a šrafování
	out.push(path('M -33 10 Q -22 18 -16 34 Q -24 32 -30 24 Q -34 18 -33 10 Z', { fill: p.woodDark, opacity: 0.22 }));
	out.push(...hatchRows(-28, 22, 18, 12, rand, p.inkSoft, 0.2));
	out.push(circle(0, 43, 3, { fill: p.accentDeep, opacity: 0.5 }));
	return out;
}

/** Strom — vrstvená koruna, teplý kmen, kořeny v půdě. */
function atlasTree({ palette: p, rand, variant }) {
	const out = [];
	// Kmen s větvemi
	out.push(
		path(
			'M -7 42 Q -9 20 -12 4 Q -24 -2 -30 -16 Q -22 -12 -12 -8 Q -8 -18 -4 -24 L 2 -24 Q 1 -12 4 -6 Q 16 -14 24 -22 Q 20 -8 10 0 Q 8 20 7 42 Z',
			{ fill: p.wood, stroke: p.ink, sw: 1.5, linejoin: 'round' }
		)
	);
	// Koruna ve třech vrstvách
	const crowns = [
		{ x: -20, y: -32, rx: 26, ry: 24, fill: p.foliageDark, opacity: 0.85 },
		{ x: 20, y: -30, rx: 24, ry: 22, fill: p.foliage, opacity: 0.85 },
		{ x: 0, y: -48, rx: 30, ry: 24, fill: p.foliage, opacity: 0.95 }
	];
	crowns.forEach((crown, index) => {
		out.push(
			path(blob(crown.x, crown.y, crown.rx, crown.ry, 7, rand), {
				fill: crown.fill,
				opacity: crown.opacity,
				stroke: p.ink,
				sw: 1.4,
				linejoin: 'round'
			})
		);
		if (index === 2) out.push(...hatchRows(-18, -42, 30, 12, rand, p.foliageDark, 0.24));
	});
	// Akcentní plody / listy
	const fruits = variant === 2 ? 3 : 2;
	for (let i = 0; i < fruits; i++) {
		out.push(circle(rand.range(-24, 24), rand.range(-58, -24), 2.1, { fill: p.accent, opacity: 0.9 }));
	}
	// Kořeny
	out.push(path('M -6 42 Q -18 48 -30 47 M 6 42 Q 18 48 30 47', ink(1.3, 0.8)));
	out.push(...hatchRows(-34, 44, 68, 5, rand, p.inkSoft, 0.2));
	return out;
}

/** Váhy — inkoustová konstrukce, misky s akcentem. */
function atlasBalance({ palette: p, rand, variant }) {
	const tilt = variant === 2 ? -5 : variant === 1 ? 4 : 2.5;
	const rad = (tilt * Math.PI) / 180;
	const beamY = -24;
	const left = { x: -58 * Math.cos(rad), y: beamY - 58 * Math.sin(rad) };
	const right = { x: 58 * Math.cos(rad), y: beamY + 58 * Math.sin(rad) };
	const out = [];
	// Stojan a základna
	out.push(rect(-34, 44, 68, 8, { fill: p.stone, stroke: p.ink, sw: 1.2 }));
	out.push(rect(-8, -24, 16, 68, { fill: p.stoneDark, opacity: 0.35, stroke: p.ink, sw: 1.2 }));
	out.push(circle(0, -26, 5, { fill: p.accent, stroke: p.ink, sw: 1.2 }));
	// Břevno
	out.push(line(left.x, left.y, right.x, right.y, { stroke: p.ink, sw: 3, linecap: 'round' }));
	// Závěsy a misky
	for (const [side, point] of [
		['left', left],
		['right', right]
	]) {
		const panY = point.y + 34;
		out.push(line(point.x, point.y, point.x - 16, panY, ink(1.1, 0.85)));
		out.push(line(point.x, point.y, point.x + 16, panY, ink(1.1, 0.85)));
		out.push(
			path(`M ${n(point.x - 20)} ${n(panY)} Q ${n(point.x)} ${n(panY + 13)} ${n(point.x + 20)} ${n(panY)}`, {
				fill: side === 'left' ? p.accentSoft : p.paperWarm,
				stroke: p.ink,
				sw: 1.3,
				linejoin: 'round'
			})
		);
		out.push(line(point.x - 20, panY, point.x + 20, panY, ink(1.2, 0.9)));
	}
	// Závaží na levé misce, drobný předmět na pravé
	out.push(rect(left.x - 7, left.y + 22, 14, 10, { fill: OCHRE, stroke: p.ink, sw: 1 }));
	out.push(circle(right.x + 3, right.y + 26, 4, { fill: p.accent, stroke: p.ink, sw: 1 }));
	// Šrafování stínu
	out.push(...hatchRows(-30, 46, 60, 5, rand, p.inkSoft, 0.2));
	return out;
}

// --- Scény ----------------------------------------------------------------

const DEFAULT_SUBJECT = {
	portrait: 'bust',
	discovery: 'flask',
	storybook: 'book',
	relic: 'amphora',
	metaphor: 'balance',
	nature: 'tree',
	layers: null
};

const ATLAS_HERO = {
	book: atlasBook,
	bust: atlasBust,
	flask: atlasFlask,
	amphora: atlasAmphora,
	tree: atlasTree,
	balance: atlasBalance
};

function drawHero(ctx, subject, placement) {
	const builder = ATLAS_HERO[subject];
	if (!builder) return renderMotif(subject, { ...ctx, placement });
	return group(builder(ctx), placement);
}

function paperBase(rand) {
	const out = [rect(0, 0, W, H, { fill: ATLAS_PAPER })];
	// Jemné šrafování okraje desky — papírová textura, ne dekorace do prostoru.
	out.push(...hatchRows(14, 12, 58, 16, rand, '#8f7a58', 0.1));
	return out;
}

function ground(ctx, y = 152, options = {}) {
	const { rand, palette: p } = ctx;
	const out = [line(22, y, W - 22, y, ink(1.3, 0.8))];
	out.push(...hatchRows(26, y + 3, W - 52, 10, rand, p.inkSoft, 0.16));
	if (options.sky) {
		out.unshift(
			rect(0, 0, W, y - 40, { fill: p.accentPale, opacity: 0.4 })
		);
	}
	return out;
}

function supports(ctx, slots) {
	return slots.slice(0, ctx.supports.length).flatMap((slot, index) => {
		const key = ctx.supports[index];
		if (!key) return [];
		return renderMotif(key, {
			...ctx,
			placement: slot
		});
	});
}

function atlasPortrait(ctx) {
	const { palette: p, rand, variant } = ctx;
	const out = paperBase(rand);
	out.push(...ground(ctx, 150));
	// Vavřín za bustou jen když ho text skutečně zmínil (je součástí doplňků).
	if (ctx.supports.includes('laurel')) {
		out.push(
			...renderMotif('laurel', { ...ctx, placement: { x: 160, y: 84, scale: 1.3 } }),
			...renderMotif('laurel', { ...ctx, placement: { x: 160, y: 84, scale: 1.3, flip: true } })
		);
	}
	out.push(
		...supports(ctx, [
			{ x: 54, y: variant === 1 ? 124 : 126, scale: 0.54 },
			{ x: 266, y: variant === 2 ? 122 : 124, scale: 0.54, flip: true }
		])
	);
	out.push(
		...drawHero(ctx, ctx.subject, {
			x: 160 + ctx.balance * 8,
			y: 82 + ctx.balance * 3,
			scale: 1.18 * (0.97 + ctx.density * 0.06),
			rotate: variant === 1 ? -1.5 : 0
		})
	);
	return out;
}

function atlasStorybook(ctx) {
	const { palette: p, rand, variant } = ctx;
	const out = paperBase(rand);
	out.push(...ground(ctx, 154));
	out.push(
		...supports(ctx, [
			{ x: 54, y: 118, scale: 0.58, flip: variant % 2 === 1 },
			{ x: 268, y: 116, scale: 0.52, flip: variant % 2 === 0 }
		])
	);
	out.push(
		...drawHero(ctx, ctx.subject, {
			x: 160 + ctx.balance * 8,
			y: 102,
			scale: 1.5 * (0.97 + ctx.density * 0.05),
			rotate: variant === 1 ? -3 : variant === 2 ? 2 : 0
		})
	);
	return out;
}

function atlasDiscovery(ctx) {
	const { palette: p, rand, variant } = ctx;
	const out = paperBase(rand);
	// Pracovní stůl a měřicí značky na jeho hraně
	out.push(...ground(ctx, 150));
	for (let i = 0; i < 6; i++) {
		out.push(line(46 + i * 44, 150, 46 + i * 44, 156, ink(0.9, 0.45)));
	}
	out.push(
		...supports(ctx, [
			{ x: 58, y: 118, scale: 0.55 },
			{ x: 264, y: 116, scale: 0.52, flip: true }
		])
	);
	out.push(
		...drawHero(ctx, ctx.subject, {
			x: 160 + ctx.balance * 10,
			y: 106,
			scale: 1.24 * (0.97 + ctx.density * 0.06),
			rotate: variant === 1 ? -2 : 0
		})
	);
	return out;
}

function atlasRelic(ctx) {
	const { palette: p, rand, variant } = ctx;
	const out = paperBase(rand);
	// Plinth a stín
	out.push(...ground(ctx, 152));
	out.push(rect(108, 144, 104, 8, { fill: p.stone, opacity: 0.55, stroke: p.ink, sw: 1 }));
	out.push(
		...supports(ctx, [
			{ x: 54, y: 116, scale: 0.5 },
			{ x: 268, y: 114, scale: 0.5, flip: true }
		])
	);
	out.push(
		...drawHero(ctx, ctx.subject, {
			x: 160 + ctx.balance * 8,
			y: 88,
			scale: 1.22 * (0.97 + ctx.density * 0.06),
			rotate: variant === 2 ? -1.5 : 0
		})
	);
	return out;
}

function atlasMetaphor(ctx) {
	const { palette: p, rand, variant } = ctx;
	const out = paperBase(rand);
	out.push(...ground(ctx, 152));
	out.push(
		...supports(ctx, [
			{ x: 52, y: 128, scale: 0.46 },
			{ x: 270, y: 126, scale: 0.46, flip: true }
		])
	);
	out.push(
		...drawHero(ctx, ctx.subject, {
			x: 160 + ctx.balance * 8,
			y: 88,
			scale: 1.2 * (0.97 + ctx.density * 0.06)
		})
	);
	return out;
}

function atlasNature(ctx) {
	const { palette: p, rand, variant } = ctx;
	const out = paperBase(rand);

	// Obloha, slunce a vzdálené kopce — krajinná deska.
	out.push(rect(0, 0, W, 106, { fill: p.accentPale, opacity: 0.42 }));
	out.push(circle(250, 42, 20, { fill: p.accent, opacity: 0.16 }));
	out.push(circle(250, 42, 20, { ...ink(1.1, 0.45) }));
	out.push(circle(250, 42, 14, { fill: 'none', stroke: OCHRE, sw: 1, opacity: 0.5 }));
	out.push(
		path('M 0 118 Q 54 88 108 118 Q 160 92 214 118 Q 268 96 320 118 L 320 150 L 0 150 Z', {
			fill: p.paperWarm,
			opacity: 0.75,
			stroke: RULE,
			sw: 1
		})
	);
	out.push(
		path('M 0 132 Q 62 110 124 132 Q 186 112 248 132 Q 286 122 320 132 L 320 150 L 0 150 Z', {
			fill: p.stone,
			fillOpacity: 0.25,
			stroke: RULE,
			sw: 1
		})
	);
	out.push(line(0, 150, W, 150, ink(1.4, 0.85)));
	out.push(...hatchRows(10, 152, W - 20, 8, rand, p.inkSoft, 0.14));
	out.push(
		...supports(ctx, [
			{ x: variant === 1 ? 66 : 56, y: 118, scale: 0.52, flip: variant % 2 === 1 },
			{ x: variant === 2 ? 258 : 268, y: 116, scale: 0.5, flip: variant % 2 === 0 }
		])
	);
	out.push(
		...drawHero(ctx, ctx.subject, {
			x: 160 + ctx.balance * 10,
			y: 100,
			scale: 1.12 * (0.97 + ctx.density * 0.05)
		})
	);
	return out;
}

/**
 * Řez krajinou — abstraktní rodina `layers` v atlasovém pojetí.
 * Vrstvy nejsou dekorace: odpovídají geologickému obsahu příspěvku.
 */
function atlasLayers(ctx) {
	const { palette: p, rand, variant, density } = ctx;
	const out = paperBase(rand);
	const horizon = 74 + ctx.balance * 4;

	// Obloha a slunce
	out.push(rect(0, 0, W, horizon, { fill: p.accentPale, opacity: 0.45 }));
	out.push(circle(64, 34, 15, { fill: p.accent, opacity: 0.18 }));
	out.push(circle(64, 34, 15, { ...ink(1, 0.35) }));
	out.push(circle(64, 34, 8, { fill: OCHRE, opacity: 0.35 }));

	// Vrstvy pod povrchem — každá s vlastní teplou barvou a šrafováním.
	const layers = Math.round(3 + density * 2);
	const top = horizon;
	const bottom = 168;
	const bandHeight = (bottom - top) / layers;
	const fills = [
		p.paperShade,
		p.accentSoft,
		'#c9a574',
		p.stone,
		p.accentPale,
		p.woodDark
	];
	let previousTop = top;
	for (let i = 0; i < layers; i++) {
		const y = top + i * bandHeight;
		const lower = top + (i + 1) * bandHeight;
		const amplitude = 2.6 + (variant === 2 ? 2 : 0);
		const topPhase = 0.6 + i * 1.1;
		const bottomPhase = 0.8 + i * 1.1;
		const d = closedBand(
			y,
			lower,
			topPhase,
			bottomPhase,
			amplitude,
			-10,
			W + 10
		);
		out.push(
			path(d, {
				fill: fills[i % fills.length],
				opacity: i === 1 ? 0.7 : 0.85,
				stroke: p.ink,
				sw: i === 1 ? 1.1 : 0.8,
				linejoin: 'round'
			})
		);
		if (i % 2 === 0) {
			out.push(...hatchRows(-6, y + 3, W + 12, Math.max(4, bandHeight - 5), rand, p.inkSoft, 0.16));
		}
		// Sediment — drobné kamínky jen v některých vrstvách
		if (i % 2 === 1) {
			for (let k = 0; k < 4 + density * 4; k++) {
				out.push(
					ellipse(rand.range(18, W - 18), rand.range(y + 4, lower - 4), rand.range(1.4, 3.4), rand.range(1, 2), {
						fill: i === 1 ? p.inkSoft : p.stoneDark,
						opacity: 0.35
					})
				);
			}
		}
		previousTop = lower;
	}

	// Zlom nebo vrásnění podle varianty — vysvětluje pohyb vrstev.
	if (variant === 1) {
		out.push(
			path(`M ${n(196 + ctx.balance * 10)} ${n(top - 4)} L ${n(176 + ctx.balance * 10)} ${n(bottom + 2)}`, {
				fill: 'none',
				stroke: p.ink,
				sw: 1.6,
				dash: '5 4',
				opacity: 0.65
			})
		);
	} else if (variant === 2) {
		out.push(
			path(`M ${n(140)} ${n(top + 8)} Q ${n(180)} ${n(top + bandHeight * 0.4)} ${n(150)} ${n(top + bandHeight)} Q ${n(210)} ${n(top + bandHeight * 1.6)} ${n(176)} ${n(top + bandHeight * 2)}`, {
				fill: 'none',
				stroke: p.ink,
				sw: 1.4,
				opacity: 0.6
			})
		);
	}

	// Povrch a drobná vegetace na obzoru
	out.push(line(0, horizon, W, horizon, ink(1.5, 0.9)));
	out.push(
		path(`M 22 ${n(horizon)} Q 30 ${n(horizon - 10)} 38 ${n(horizon)} M 38 ${n(horizon)} Q 44 ${n(horizon - 7)} 50 ${n(horizon)}`, softInk(1, 0.55))
	);
	return out;
}

const ATLAS_BUILDERS = {
	portrait: atlasPortrait,
	discovery: atlasDiscovery,
	storybook: atlasStorybook,
	relic: atlasRelic,
	metaphor: atlasMetaphor,
	nature: atlasNature,
	layers: atlasLayers
};

export const ATLAS_FAMILY_KEYS = Object.keys(ATLAS_BUILDERS);

/** Rodiny mimo prototyp se mapují na nejbližší atlasovou kompozici. */
const ATLAS_FAMILY_FALLBACK = {
	grid: 'layers',
	orbit: 'discovery',
	data: 'layers',
	timeline: 'layers',
	network: 'layers',
	signals: 'discovery',
	structure: 'relic',
	contrast: 'metaphor',
	organic: 'nature'
};

function atlasFamilyFor(family) {
	if (ATLAS_BUILDERS[family]) return family;
	return ATLAS_FAMILY_FALLBACK[family] || 'metaphor';
}

function belongsToFamily(family, key) {
	const motif = MOTIF_BY_KEY[key];
	return Boolean(motif && motif.families.includes(family));
}

function normalizeSupports(family, supports, subject) {
	const out = [];
	for (const key of supports || []) {
		if (!belongsToFamily(family, key)) continue;
		if (key === subject || out.includes(key)) continue;
		out.push(key);
		if (out.length === 2) break;
	}
	return out;
}

/**
 * Sestaví atlasovou scénu pro příspěvek nebo explicitní parametry.
 * Vrací stejný tvar spec jako `createIllustration`, takže ho zvládne
 * stávající renderer i testy.
 *
 * @param {{
 *   family?: string,
 *   post?: { id?: string, title?: string, content?: string, category?: string } | null,
 *   seed?: string | number,
 *   category?: string,
 *   subject?: string | null,
 *   supports?: string[],
 *   variant?: number,
 *   density?: number,
 *   scale?: number,
 *   balance?: number
 * }} [options]
 */
export function createAtlasIllustration(options = {}) {
	const analysis = options.post ? analyzePost(options.post) : null;
	const requested = options.family || analysis?.family || 'metaphor';
	const family = atlasFamilyFor(requested);
	const seed = options.seed == null ? deriveSeed(options.post) : String(options.seed);
	const random = createRandom(seed);

	// Stejné pevné pořadí losování jako klasický systém.
	const variant = clamp(Math.round(options.variant ?? random.int(0, 2)), 0, 2);
	const density = clamp(options.density ?? round(random.range(0.35, 1), 2), 0.35, 1);
	const scale = clamp(options.scale ?? round(random.range(0.9, 1.1), 2), 0.9, 1.1);
	const balance = clamp(options.balance ?? round(random.range(-1, 1), 2), -1, 1);

	const category = options.category ?? options.post?.category;
	const palette = atlasPalette(category);

	// Předmět: explicitní, jinak z textu, pokud do rodiny patří, jinak výchozí.
	let subject = options.subject;
	if (subject === undefined) {
		subject = analysis && belongsToFamily(family, analysis.subject) ? analysis.subject : null;
	}
	if (!subject || !belongsToFamily(family, subject)) {
		subject = DEFAULT_SUBJECT[family];
	}
	const supports = normalizeSupports(
		family,
		options.supports !== undefined ? options.supports : analysis?.supports || [],
		subject
	);

	const context = {
		family,
		subject,
		supports,
		rand: random,
		random,
		variant,
		density,
		scale,
		balance,
		palette
	};

	return {
		style: 'atlas',
		family,
		requestedFamily: requested,
		seed,
		seedHash: hashString(seed),
		category: category || null,
		variant,
		density,
		scale,
		balance,
		palette,
		subject,
		supports,
		elements: ATLAS_BUILDERS[family](context)
	};
}
