/**
 * Sémantické kompozice.
 *
 * Staví na motivech z `motifs.js`: každá rodina má jedno hlavní místo pro
 * předmět příspěvku a nejvýš dvě doplňková místa. Kompozice sama nevybírá
 * téma — to dostane hotové z `concepts.js` — jen rozhoduje, jak ho aranžovat.
 * Souřadnice jsou ve stejném viewBoxu 320 × 180 jako původní scény.
 */

import { arcPath, circle, ellipse, line, path, rect, tick } from './primitives.js';
import { MOTIF_BY_KEY, renderMotif, supportsForFamily } from './motifs.js';
import { SYMBOLIC_FAMILIES } from './symbolic-scenes.js';

const stroke = (color, sw = 1.4, opacity = 1) => ({
	fill: 'none',
	stroke: color,
	sw,
	opacity,
	linecap: 'round',
	linejoin: 'round'
});

/** Zajistí, že předmět patří do rodiny; jinak vrátí výchozí motiv. */
function resolveSubject(context, fallback) {
	const motif = MOTIF_BY_KEY[context.subject];
	if (motif && motif.families.includes(context.family)) return motif.key;
	return fallback;
}

/** Umístí doplňky do připravených slotů. */
function placeSupports(context, slots) {
	return slots.slice(0, context.supports.length).flatMap((slot, index) => {
		const key = context.supports[index];
		if (!key || key === context.subject) return [];
		return renderMotif(key, {
			...context,
			placement: slot
		});
	});
}

function dot(context, minX, maxX, minY, maxY, options = {}) {
	const { color, opacity = 0.5, radius = 1.2 } = options;
	const p = context.palette;
	// drobné jiskry střídají doplňkové a materiálové barvy
	const palette = [p.secondary, p.tertiary, p.gold, p.water, p.foliage];
	const fallback = palette[Math.floor(context.rand() * palette.length)];
	return circle(
		context.rand.range(minX, maxX),
		context.rand.range(minY, maxY),
		radius,
		{ fill: color || fallback, opacity }
	);
}

// --- 1. Příběh ------------------------------------------------------------

function storybook(ctx) {
	const p = ctx.palette;
	const variant = ctx.variant || 0;
	const subject = resolveSubject(ctx, 'book');
	const out = [];

	// Jemné orámování stránky a linky pohybu
	out.push(path('M 28 42 Q 8 92 28 142', stroke(p.primary, 1, 0.18)));
	out.push(path('M 292 42 Q 312 92 292 142', stroke(p.primary, 1, 0.18)));
	out.push(line(42, 148, 278, 148, stroke(p.soft, 1)));

	// Doplňky v pozadí — les a vlk patří za knihu
	const supports = placeSupports(ctx, [
		{ x: 56, y: 108, scale: 0.62, flip: variant % 2 === 1 },
		{ x: 266, y: 104, scale: 0.66, flip: variant % 2 === 0 }
	]);
	out.push(...supports);

	// Hlavní předmět
	out.push(
		...renderMotif(subject, {
			...ctx,
			placement: { x: 160, y: 92, scale: 1.35, rotate: variant === 1 ? -4 : 0 }
		})
	);

	// Padající stránky / jiskry
	const sparks = variant === 1 ? 4 : 3;
	for (let i = 0; i < sparks; i++) {
		out.push(dot(ctx, 74, 250, 52, 132, { opacity: 0.3, radius: 1.1 }));
	}
	out.push(ellipse(160, 151, 54, 4, { fill: p.primary, opacity: 0.08 }));
	return out;
}

// --- 2. Portrét -----------------------------------------------------------

function portrait(ctx) {
	const p = ctx.palette;
	const subject = resolveSubject(ctx, 'bust');
	const out = [];

	// Halo a sokl místo
	out.push(circle(160, 82, 58, { ...stroke(p.primary, 1, 0.16), dash: '3 8' }));
	out.push(path('M 112 146 L 208 146', stroke(p.primary, 1, 0.35)));
	out.push(path('M 126 152 L 194 152', stroke(p.primary, 1, 0.18)));

	// Vavřín vždy za bustou — jen pokud není sám předmětem
	if (subject !== 'laurel') {
		out.push(...renderMotif('laurel', { ...ctx, placement: { x: 160, y: 88, scale: 1.35 } }));
		out.push(
			...renderMotif('laurel', {
				...ctx,
				placement: { x: 160, y: 88, scale: 1.35, flip: true }
			})
		);
	}

	const supports = placeSupports(ctx, [
		{ x: 48, y: 112, scale: 0.55 },
		{ x: 272, y: 112, scale: 0.55, flip: true }
	]);
	out.push(...supports);

	out.push(
		...renderMotif(subject, {
			...ctx,
			placement: { x: 160, y: 90, scale: 1.25 }
		})
	);

	for (let i = 0; i < 3; i++) out.push(dot(ctx, 60, 260, 40, 70, { opacity: 0.25 }));
	return out;
}

// --- 3. Objev -------------------------------------------------------------

function discovery(ctx) {
	const p = ctx.palette;
	const subject = resolveSubject(ctx, 'flask');
	const out = [];

	// Laboratorní stůl / měřicí mřížka
	out.push(line(24, 148, 296, 148, stroke(p.soft, 1.2)));
	out.push(line(24, 144, 296, 144, stroke(p.primary, 1, 0.18)));
	for (let i = 0; i < 6; i++) {
		out.push(line(44 + i * 44, 144, 44 + i * 44, 148, stroke(p.primary, 0.8, 0.18)));
	}
	out.push(arcPath(160, 92, 66, 202, 338, stroke(p.primary, 1, 0.18)));
	out.push(arcPath(160, 92, 75, 212, 328, { ...stroke(p.primary, 0.9, 0.12), dash: '2 6' }));

	const supports = placeSupports(ctx, [
		{ x: 54, y: 108, scale: 0.58 },
		{ x: 268, y: 110, scale: 0.55, flip: true }
	]);
	out.push(...supports);

	out.push(
		...renderMotif(subject, {
			...ctx,
			placement: { x: 160, y: 90, scale: 1.2, rotate: ctx.variant === 1 ? -2 : 0 }
		})
	);

	// Pozorované částice
	for (let i = 0; i < 5; i++) out.push(dot(ctx, 82, 238, 34, 126, { opacity: 0.25, radius: 1.1 }));
	return out;
}

// --- 4. Artefakt ----------------------------------------------------------

function relic(ctx) {
	const p = ctx.palette;
	const subject = resolveSubject(ctx, 'amphora');
	const out = [];

	// Vitrína / plinth
	out.push(
		path('M 58 148 L 262 148 M 70 142 L 250 142', stroke(p.primary, 1, 0.22))
	);
	out.push(rect(88, 66, 144, 76, { fill: p.primary, fillOpacity: 0.025, stroke: p.primary, sw: 0.9, dash: '3 7' }));
	// Rohové značky
	for (const [x, y, sx, sy] of [
		[88, 66, 1, 1],
		[232, 66, -1, 1],
		[88, 142, 1, -1],
		[232, 142, -1, -1]
	]) {
		out.push(line(x, y, x + 10 * sx, y, stroke(p.primary, 1.2, 0.5)));
		out.push(line(x, y, x, y + 9 * sy, stroke(p.primary, 1.2, 0.5)));
	}

	const supports = placeSupports(ctx, [
		{ x: 48, y: 110, scale: 0.52 },
		{ x: 274, y: 104, scale: 0.5, flip: true }
	]);
	out.push(...supports);

	out.push(
		...renderMotif(subject, {
			...ctx,
			placement: { x: 160, y: 92, scale: 1.22 }
		})
	);

	// Prach a odlesky
	for (let i = 0; i < 4; i++) out.push(dot(ctx, 100, 220, 46, 126, { opacity: 0.2, radius: 0.9 }));
	return out;
}

// --- 5. Příroda -----------------------------------------------------------

function nature(ctx) {
	const p = ctx.palette;
	const subject = resolveSubject(ctx, 'tree');
	const out = [];

	// Krajina: slunce, obzor, kopce
	out.push(circle(250, 46, 16, { fill: 'none', stroke: p.gold, sw: 1.2, opacity: 0.55 }));
	out.push(circle(250, 46, 10, { fill: p.gold, opacity: 0.2 }));
	out.push(line(20, 150, 300, 150, stroke(p.primary, 1, 0.3)));
	out.push(path('M 20 150 Q 70 116 120 150 Q 170 122 220 150 Q 260 132 300 150', stroke(p.foliage, 1.2, 0.42)));

	const supports = placeSupports(ctx, [
		{ x: 54, y: 112, scale: 0.52 },
		{ x: 268, y: 104, scale: 0.55, flip: true }
	]);
	out.push(...supports);

	out.push(
		...renderMotif(subject, {
			...ctx,
			placement: { x: 160, y: 90, scale: 1.2, flip: ctx.variant === 1 }
		})
	);

	// Pyl / listy ve vzduchu
	for (let i = 0; i < 4; i++) out.push(dot(ctx, 66, 252, 38, 120, { opacity: 0.24, radius: 1.1 }));
	return out;
}

// --- 6. Metafora ----------------------------------------------------------

function metaphor(ctx) {
	const p = ctx.palette;
	const subject = resolveSubject(ctx, 'balance');
	const variant = ctx.variant || 0;
	const out = [];

	// Konceptuální osa a síť vztahů
	out.push(line(32, 94, 288, 94, stroke(p.soft, 0.9)));
	out.push(line(160, 28, 160, 152, stroke(p.soft, 0.7, 0.8)));
	out.push(circle(160, 92, 62, { ...stroke(p.primary, 0.9, 0.14), dash: '2 8' }));
	out.push(circle(160, 92, 78, { ...stroke(p.primary, 0.8, 0.1), dash: '1 9' }));

	// Uzly sítě
	const nodes =
		variant === 1
			? [
					[80, 50],
					[242, 54],
					[90, 132],
					[246, 126]
				]
			: [
					[74, 66],
					[248, 72],
					[88, 124],
					[238, 138]
				];
	const nodeColors = [p.secondary, p.tertiary, p.gold, p.water];
	nodes.forEach(([x, y], index) => {
		out.push(circle(x, y, 2.4, { fill: nodeColors[index % nodeColors.length], opacity: 0.6 }));
		out.push(line(160, 92, x, y, { ...stroke(p.primary, 0.7, 0.16), dash: '2 5' }));
		if (index === 0) out.push(circle(x, y, 6, stroke(p.primary, 0.8, 0.18)));
	});

	const supports = placeSupports(ctx, [
		{ x: 52, y: 110, scale: 0.48 },
		{ x: 270, y: 108, scale: 0.48, flip: true }
	]);
	out.push(...supports);

	out.push(
		...renderMotif(subject, {
			...ctx,
			placement: { x: 160, y: 92, scale: 1.22, rotate: variant === 1 ? 2 : 0 }
		})
	);

	out.push(dot(ctx, 44, 276, 40, 144, { opacity: 0.2, radius: 1 }));
	return out;
}

// --- Katalog rodin --------------------------------------------------------

function subjectsFor(family) {
	return Object.values(MOTIF_BY_KEY)
		.filter((motif) => motif.role !== 'support' && motif.families.includes(family))
		.map((motif) => motif.key);
}

/**
 * Metadata jsou zdrojem pravdy pro showcase i testy. `subjects` a `supports`
 * se odvozují z katalogu motivů, takže nový motiv se sám objeví v obou.
 */
const BASE_SEMANTIC_FAMILIES = [
	{
		key: 'storybook',
		label: 'Příběh',
		note: 'knihy, pohádky, divadlo, vypravěčství',
		defaultSubject: 'book',
		build: storybook
	},
	{
		key: 'portrait',
		label: 'Portrét',
		note: 'myslitelé, osobnosti, myšlenky',
		defaultSubject: 'bust',
		build: portrait
	},
	{
		key: 'discovery',
		label: 'Objev',
		note: 'věda, pokusy, vesmír, pozorování',
		defaultSubject: 'flask',
		build: discovery
	},
	{
		key: 'relic',
		label: 'Artefakt',
		note: 'historie, dokumenty, archeologie, architektura',
		defaultSubject: 'amphora',
		build: relic
	},
	{
		key: 'nature',
		label: 'Příroda',
		note: 'živé systémy, krajina, zvířata',
		defaultSubject: 'tree',
		build: nature
	},
	{
		key: 'metaphor',
		label: 'Metafora',
		note: 'pojmy, vztahy, abstraktní principy',
		defaultSubject: 'balance',
		build: metaphor
	}
].map((family) => ({
	...family,
	subjects: subjectsFor(family.key),
	supports: supportsForFamily(family.key)
}));

export const SEMANTIC_FAMILIES = [...BASE_SEMANTIC_FAMILIES, ...SYMBOLIC_FAMILIES];

export const SEMANTIC_FAMILY_BY_KEY = Object.fromEntries(
	SEMANTIC_FAMILIES.map((family) => [family.key, family])
);
