/**
 * Sedm základních scén a osm kompozičních vzorů.
 *
 * Scéna určuje rodinu a výchozí motiv, kompozice určuje vztah mezi objekty.
 * Vzor `single` staví jeden motiv na linku podstavce. Ostatní vzory kreslí
 * dva až tři objekty a jsou záměrně obecné: fungují s libovolným motivem,
 * takže se nemusí psát scéna pro každý příspěvek.
 */

import { circle, group, line, path, polyline, polygon } from '../primitives.js';
import { round } from '../prng.js';
import { VIEWBOX } from './constants.js';
import { shape, stroke } from './palette.js';
import { HEROES } from './heroes.js';

const W = VIEWBOX.width;

/** Společná linka podstavce — jediná zem, žádné dekorativní pozadí. */
function baseline(p, y = 150, opacity = 0.24) {
	return [line(26, y, W - 26, y, { stroke: p.light, sw: 1, opacity })];
}

/** Přerušená linka podstavce — tam, kde se země rozpadá. */
function brokenBaseline(p, y = 150, gap = 22) {
	return [
		line(26, y, 160 - gap, y, { stroke: p.light, sw: 1, opacity: 0.24 }),
		line(160 + gap, y, W - 26, y, { stroke: p.light, sw: 1, opacity: 0.24 })
	];
}

function drawHero(ctx, subject, placement) {
	const builder = HEROES[subject];
	if (!builder) return [];
	return group(builder({ ...ctx, subject }), placement);
}

/**
 * Obrysová verze motivu pro proměnu a protiklad. Zachová jen kresbu,
 * plochy zprůhlední — čtenář vidí „ještě ne hotový“ objekt.
 */
function outlineOf(elements, p) {
	return elements.map((el) => {
		const next = { ...el, fill: 'none', opacity: Math.min(el.opacity ?? 1, 0.6) };
		delete next.fillOpacity;
		next.stroke = p.light;
		next.sw = Math.min(el.sw ?? 1, 1.2);
		return next;
	});
}

function arrow(x1, x2, y, p, opacity = 1) {
	const direction = Math.sign(x2 - x1);
	return [
		line(x1, y, x2, y, { ...stroke(p.amber, 1.8, opacity) }),
		polygon(
			[
				[x2, y - 4.5],
				[x2 - direction * 8, y],
				[x2, y + 4.5]
			],
			{ fill: p.amber, opacity }
		)
	];
}

/** Dvě poloviny téhož motivu oddělené trhlinou. */
function composeSplit(ctx, y = 150) {
	const p = ctx.palette;
	const second = ctx.secondary || ctx.subject;
	const out = [...brokenBaseline(p, y, 20)];
	// Trhlina není dekorace: drží scénu pohromadě a nese hlavní význam.
	const crack = [
		[160, 50],
		[153, 72],
		[167, 90],
		[152, 108],
		[165, 126],
		[156, y]
	];
	out.push(
		polyline(crack, { ...stroke(p.terracotta, 2.2, 0.95) }),
		polyline(
			crack.map(([x, cy]) => [x + (ctx.variant === 2 ? 5 : 3), cy + 2]),
			{ ...stroke(p.amber, 1, 0.55) }
		)
	);
	out.push(
		...drawHero(ctx, ctx.subject, {
			x: 106 + ctx.balance * 3,
			y: y - 42,
			scale: 0.58 * (0.98 + ctx.density * 0.04),
			rotate: -2
		})
	);
	out.push(
		...drawHero(ctx, second, {
			x: 214 + ctx.balance * 3,
			y: y - 42,
			scale: 0.58 * (0.98 + ctx.density * 0.04),
			rotate: 2,
			flip: true
		})
	);
	// Dva úlomky, které se odlouply.
	out.push(
		polygon(
			[
				[144, y - 4],
				[152, y - 12],
				[158, y - 2]
			],
			{ fill: p.accent, opacity: 0.85 }
		),
		polygon(
			[
				[168, y - 8],
				[176, y - 14],
				[180, y - 4]
			],
			{ fill: p.accent, opacity: 0.6 }
		)
	);
	return out;
}

/** Dva motivy proti sobě přes hranici. */
function composeConfrontation(ctx, y = 150) {
	const p = ctx.palette;
	const second = ctx.secondary || ctx.subject;
	const out = [...brokenBaseline(p, y, 14)];
	const boundaryX = 160 + (ctx.variant === 2 ? 4 : 0);
	out.push(
		line(boundaryX, 48, boundaryX, y - 4, {
			...stroke(p.light, 1, 0.35),
			dash: '3 6'
		})
	);
	out.push(
		...drawHero(ctx, ctx.subject, {
			x: 102 + ctx.balance * 3,
			y: y - 44,
			scale: 0.56 * (0.98 + ctx.density * 0.04)
		})
	);
	out.push(
		...drawHero(ctx, second, {
			x: 218 + ctx.balance * 3,
			y: y - 44,
			scale: 0.56 * (0.98 + ctx.density * 0.04),
			flip: true
		})
	);
	// Střet na hranici: kosočtverec a dva krátké paprsky.
	out.push(
		polygon(
			[
				[boundaryX, y - 62],
				[boundaryX + 7, y - 54],
				[boundaryX, y - 46],
				[boundaryX - 7, y - 54]
			],
			{ fill: p.terracotta, stroke: p.light, sw: 0.9 }
		)
	);
	out.push(
		line(boundaryX - 10, y - 54, boundaryX - 20, y - 54, { ...stroke(p.amber, 1.4, 0.7) }),
		line(boundaryX + 10, y - 54, boundaryX + 20, y - 54, { ...stroke(p.amber, 1.4, 0.7) })
	);
	return out;
}

/** Obrys se mění v hotový objekt. */
function composeTransformation(ctx, y = 150) {
	const p = ctx.palette;
	const out = [...baseline(p, y)];
	const left = outlineOf(
		drawHero(ctx, ctx.subject, {
			x: 94 + ctx.balance * 3,
			y: y - 44,
			scale: 0.5 * (0.98 + ctx.density * 0.04)
		}),
		p
	);
	const right = drawHero(ctx, ctx.secondary || ctx.subject, {
		x: 226 + ctx.balance * 3,
		y: y - 44,
		scale: 0.62 * (0.98 + ctx.density * 0.04)
	});
	out.push(...left, ...right);
	out.push(...arrow(124, 196, 60, p, 0.95));
	// Tři částice mezi stavy — přechod, ne skok.
	for (let i = 0; i < 3; i++) {
		out.push(
			circle(140 + i * 20, 70 + (i % 2 === 0 ? 5 : -5), 2, {
				fill: i === 1 ? p.terracotta : p.amber,
				opacity: 0.8
			})
		);
	}
	return out;
}

/** Tři stupně růstu podél stoupající linky. */
function composeGrowth(ctx, y = 152) {
	const p = ctx.palette;
	const out = [...baseline(p, y)];
	const steps = [
		{ x: 92, y: y - 28, scale: 0.4, opacity: 0.5 },
		{ x: 160, y: y - 38, scale: 0.55, opacity: 0.72 },
		{ x: 228, y: y - 48, scale: 0.72, opacity: 1 }
	];
	out.push(
		polyline(
			[
				[64, y - 4],
				[118, y - 14],
				[184, y - 24],
				[256, y - 38]
			],
			{ ...stroke(p.accent, 1.6, 0.75) }
		)
	);
	steps.forEach((step, index) => {
		out.push(
			...drawHero(ctx, index === 2 ? ctx.secondary || ctx.subject : ctx.subject, {
				x: step.x + ctx.balance * 3,
				y: step.y,
				scale: step.scale * (0.98 + ctx.density * 0.04),
				opacity: step.opacity
			}).map((el) => ({ ...el, opacity: Math.min(el.opacity ?? 1, step.opacity) }))
		);
	});
	out.push(circle(256, y - 38, 3.4, { fill: p.amber }));
	return out;
}

/** Tři stupně pádu — objekt ztrácí barvu i výšku. */
function composeCollapse(ctx, y = 152) {
	const p = ctx.palette;
	const out = [...brokenBaseline(p, y, 12)];
	const steps = [
		{ x: 92, y: y - 68, scale: 0.68, rotate: -10, opacity: 1 },
		{ x: 160, y: y - 48, scale: 0.56, rotate: 8, opacity: 0.66 },
		{ x: 228, y: y - 26, scale: 0.44, rotate: -20, opacity: 0.4 }
	];
	steps.forEach((step) => {
		out.push(
			...drawHero(ctx, ctx.subject, {
				x: step.x + ctx.balance * 3,
				y: step.y,
				scale: step.scale * (0.98 + ctx.density * 0.04),
				rotate: step.rotate
			}).map((el) => ({ ...el, opacity: Math.min(el.opacity ?? 1, step.opacity) }))
		);
	});
	// Prach a úlomky pod pádem.
	out.push(
		circle(196, y - 6, 2.4, { fill: p.terracotta, opacity: 0.7 }),
		circle(212, y - 12, 1.8, { fill: p.amber, opacity: 0.6 }),
		polygon(
			[
				[240, y - 4],
				[248, y - 10],
				[252, y - 2]
			],
			{ fill: p.accent, opacity: 0.7 }
		)
	);
	return out;
}

/** Dva motivy spojené drahou — vztah, dialog, síť. */
function composeConnection(ctx, y = 150) {
	const p = ctx.palette;
	const second = ctx.secondary || ctx.subject;
	const out = [...baseline(p, y)];
	out.push(
		...drawHero(ctx, ctx.subject, {
			x: 94 + ctx.balance * 3,
			y: y - 42,
			scale: 0.52 * (0.98 + ctx.density * 0.04)
		})
	);
	out.push(
		...drawHero(ctx, second, {
			x: 226 + ctx.balance * 3,
			y: y - 42,
			scale: 0.52 * (0.98 + ctx.density * 0.04),
			flip: ctx.subject !== second
		})
	);
	// Dráha spojení se prohýbá podle varianty, ale zůstává čitelná.
	const dip = ctx.variant === 2 ? 26 : 18;
	out.push(
		path(`M 122 ${y - 24} Q 160 ${y - 24 + dip} 198 ${y - 24}`, {
			...stroke(p.accent, 1.8, 0.9),
			dash: '4 4'
		}),
		circle(122, y - 24, 3, { fill: p.accent }),
		circle(198, y - 24, 3, { fill: p.accent })
	);
	for (let i = 0; i < 2; i++) {
		out.push(circle(160, y - 18 + i * 7, 1.6, { fill: p.amber, opacity: 0.75 }));
	}
	return out;
}

/** Obrys a plná forma přes osu — protiklad dvou stavů. */
function composeContrast(ctx, y = 150) {
	const p = ctx.palette;
	const out = [...baseline(p, y)];
	out.push(
		line(160, 48, 160, y - 6, { ...stroke(p.light, 1, 0.3) }),
		...outlineOf(
			drawHero(ctx, ctx.subject, {
				x: 102 + ctx.balance * 3,
				y: y - 42,
				scale: 0.54 * (0.98 + ctx.density * 0.04)
			}),
			p
		),
		...drawHero(ctx, ctx.secondary || ctx.subject, {
			x: 218 + ctx.balance * 3,
			y: y - 42,
			scale: 0.54 * (0.98 + ctx.density * 0.04),
			flip: true
		})
	);
	out.push(
		rectCentered(160, 44, 18, 4, p.accent),
		circle(160, y - 42, 2.6, { fill: p.amber, opacity: 0.85 })
	);
	return out;
}

/** Malý obdélník se středem v bodě — pruh protikladu. */
function rectCentered(x, y, w, h, fill) {
	return {
		t: 'rect',
		x: round(x - w / 2),
		y: round(y - h / 2),
		w: round(w),
		h: round(h),
		fill,
		opacity: 0.85
	};
}

const COMPOSERS = {
	split: (ctx, y) => composeSplit(ctx, y),
	confrontation: (ctx, y) => composeConfrontation(ctx, y),
	transformation: (ctx, y) => composeTransformation(ctx, y),
	growth: (ctx, y) => composeGrowth(ctx, y),
	collapse: (ctx, y) => composeCollapse(ctx, y),
	connection: (ctx, y) => composeConnection(ctx, y),
	contrast: (ctx, y) => composeContrast(ctx, y)
};

function composed(ctx, baselineY = 150) {
	const compose = COMPOSERS[ctx.composition];
	if (!compose) return null;
	return compose(ctx, baselineY);
}

// --- Základní scény -------------------------------------------------------

function scenePortrait(ctx) {
	const p = ctx.palette;
	const composition = composed(ctx, 150);
	if (composition) return composition;
	return [
		...baseline(p, 150),
		...drawHero(ctx, ctx.subject, {
			x: 160 + ctx.balance * 8,
			y: ctx.subject === 'bust' ? 84 : 98,
			scale: (ctx.subject === 'bust' ? 1.15 : 1.1) * (0.98 + ctx.density * 0.04),
			flip: ctx.variant === 1
		})
	];
}

function sceneDiscovery(ctx) {
	const p = ctx.palette;
	const composition = composed(ctx, 150);
	if (composition) return composition;
	const telescope = ctx.subject === 'telescope';
	const flask = ctx.subject === 'flask';
	return [
		...baseline(p, 150),
		...drawHero(ctx, ctx.subject, {
			x: 160 + ctx.balance * 8,
			y: telescope ? 94 : flask ? 104 : 100,
			scale: (telescope ? 1.05 : 1.12) * (0.98 + ctx.density * 0.04)
		})
	];
}

function sceneStorybook(ctx) {
	const p = ctx.palette;
	const composition = composed(ctx, 152);
	if (composition) return composition;
	return [
		...baseline(p, 152),
		...drawHero(ctx, ctx.subject, {
			x: 160 + ctx.balance * 6,
			y: 112,
			scale: 1.22 * (0.98 + ctx.density * 0.04),
			rotate: ctx.variant === 1 ? -2 : 0
		})
	];
}

function sceneRelic(ctx) {
	const p = ctx.palette;
	const composition = composed(ctx, 152);
	if (composition) return composition;
	const column = ctx.subject === 'column';
	const amphora = ctx.subject === 'amphora';
	return [
		...baseline(p, 152),
		...drawHero(ctx, ctx.subject, {
			x: 160 + ctx.balance * 6,
			y: column ? 98 : amphora ? 94 : 100,
			scale: (column ? 1.18 : amphora ? 1.15 : 1.2) * (0.98 + ctx.density * 0.04)
		})
	];
}

function sceneMetaphor(ctx) {
	const p = ctx.palette;
	const composition = composed(ctx, 150);
	if (composition) return composition;
	return [
		...baseline(p, 150),
		...drawHero(ctx, ctx.subject, {
			x: 160 + ctx.balance * 6,
			y: 98,
			scale: 1.1 * (0.98 + ctx.density * 0.04)
		})
	];
}

function sceneNature(ctx) {
	const p = ctx.palette;
	const composition = composed(ctx, 152);
	if (composition) return composition;
	const octopus = ctx.subject === 'octopus';
	return [
		...baseline(p, 152),
		...drawHero(ctx, ctx.subject, {
			x: 160 + ctx.balance * 8,
			y: octopus ? 96 : 98,
			scale: (octopus ? 1.1 : 1.08) * (0.98 + ctx.density * 0.04)
		})
	];
}

/** Řez krajinou — vrstvy, zlom a dva bloky, které se rozešly. */
function sceneLayers(ctx) {
	const p = ctx.palette;
	const horizon = 66;
	const bands = Math.round(4 + ctx.density);
	const colors = [p.sageDeep, p.forest, p.teal, p.terracotta, p.forestDeep, p.tealDeep];
	const out = [];
	const left = 16;
	const right = 304;

	const arrow = (x1, x2, y) => {
		const tip = x2;
		const base = x1;
		return [
			line(base, y, tip, y, { stroke: p.amber, sw: 1.6 }),
			polygon(
				[
					[tip, y - 4],
					[tip - Math.sign(x2 - x1) * 7, y],
					[tip, y + 4]
				],
				{ fill: p.amber }
			)
		];
	};

	// Dvě pevniny nad hladinou — mezi nimi se otevřela propast.
	out.push(
		polygon(
			[
				[18, horizon],
				[46, horizon - 20],
				[88, horizon - 16],
				[104, horizon]
			],
			{ ...shape(p.forest, p.light, 1.2) }
		)
	);
	out.push(
		polygon(
			[
				[216, horizon],
				[232, horizon - 16],
				[274, horizon - 20],
				[302, horizon]
			],
			{ ...shape(p.sage, p.light, 1.2) }
		)
	);
	out.push(line(18, horizon, W - 18, horizon, { stroke: p.light, sw: 1.1, opacity: 0.45 }));

	// Šipky míří od sebe — stejný směr jako pohyb bloků.
	out.push(...arrow(120, 102, horizon - 10));
	out.push(...arrow(200, 218, horizon - 10));

	// Vrstvy pod povrchem — každá má vlastní barvu a tenkou hranici.
	const top = horizon;
	const bottom = 170;
	const height = (bottom - top) / bands;
	for (let i = 0; i < bands; i++) {
		const y = top + i * height;
		const wave = 2.2 + (ctx.variant === 2 ? 1.4 : 0);
		const offset = Math.sin(i) * wave;
		const nextOffset = Math.sin(i + 1) * wave;
		const topEdge = `M ${left} ${round(y + offset, 2)} Q 90 ${round(y - wave, 2)} 160 ${round(y + nextOffset, 2)} Q 240 ${round(y + wave, 2)} ${right} ${round(y, 2)}`;
		// Každá vrstva sahá až dolů; další vrstva ji překryje a nechá jen pás.
		out.push(
			path(`${topEdge} L ${right} ${bottom} L ${left} ${bottom} Z`, {
				fill: colors[i % colors.length],
				opacity: i === 3 ? 0.55 : 0.94
			})
		);
		out.push(path(topEdge, { ...stroke(p.light, 0.9, 0.3) }));
	}

	// Zlom procházející vrstvami
	const faultX = 176;
	out.push(
		path(`M ${faultX - 12} ${top + 2} L ${faultX + 8} ${bottom}`, {
			...stroke(p.light, 1.4, 0.55)
		})
	);
	return out;
}

export const SCENES = {
	portrait: scenePortrait,
	discovery: sceneDiscovery,
	storybook: sceneStorybook,
	relic: sceneRelic,
	metaphor: sceneMetaphor,
	nature: sceneNature,
	layers: sceneLayers
};

export const GEOMETRIC_FAMILY_KEYS = Object.keys(SCENES);
