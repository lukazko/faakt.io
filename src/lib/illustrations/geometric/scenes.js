/**
 * Sedm základních scén a osm kompozičních vzorů.
 *
 * Scéna určuje rodinu a výchozí motiv, kompozice určuje vztah mezi objekty.
 * Vzor `single` staví jeden motiv na linku podstavce. Ostatní vzory kreslí
 * dva až tři objekty a jsou záměrně obecné: fungují s libovolným motivem,
 * takže se nemusí psát scéna pro každý příspěvek.
 */

import { arcPath, circle, ellipse, group, line, path, polyline, polygon, rect } from '../primitives.js';
import { round } from '../prng.js';
import { VIEWBOX } from './constants.js';
import { shape, stroke } from './palette.js';
import { HEROES } from './heroes.js';
import { COMPOSITION_META } from './composition.js';

const FAMILY_META = {
	portrait: { label: 'Portrét', note: 'osobnosti, filozofie, psychologie' },
	discovery: { label: 'Objev', note: 'věda, fyzika, astronomie' },
	storybook: { label: 'Příběh', note: 'literatura, filmy' },
	relic: { label: 'Artefakt', note: 'historie, politika, právo' },
	metaphor: { label: 'Metafora', note: 'matematika, ekonomie, umění, počítače' },
	nature: { label: 'Příroda', note: 'zajímavosti, biologie, krajina' },
	layers: { label: 'Vrstvy', note: 'abstraktní texty, chronologie, geologie' }
};

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

// --- Sémantické scény -----------------------------------------------------
// Každá scéna řeší jiný vztah objektů než kompoziční vzory: prostředí,
// akci, následek, měřítko nebo doprovodný předmět. Sdílejí kreslicí
// primitiva a motivy, ale nejsou to kosmetické variace jedné scény.

/** Plameny v absolutních souřadnicích — oheň jako událost, ne dekorace. */
function flamesAt(p, x, y, scale = 1, count = 5) {
	const out = [];
	for (let i = 0; i < count; i++) {
		const fx = x + (i - (count - 1) / 2) * 11 * scale;
		const height = (18 + ((i * 7) % 11)) * scale;
		const sway = (i % 2 === 0 ? 1 : -1) * 4 * scale;
		out.push(
			path(
				`M ${fx} ${y} Q ${fx + sway + 8 * scale} ${y - height * 0.55} ${fx + sway} ${y - height} Q ${fx - sway - 8 * scale} ${y - height * 0.5} ${fx} ${y} Z`,
				{ fill: i % 2 === 0 ? p.terracotta : p.amber, opacity: 0.9, stroke: p.light, sw: 0.7 }
			)
		);
	}
	return out;
}

/** Odlétající stránky — následek požáru nebo ztráty. */
function flyingPages(p, x, y, count = 4) {
	const out = [];
	for (let i = 0; i < count; i++) {
		const px = x + i * 12;
		const py = y - i * 9;
		out.push({
			t: 'rect',
			x: px,
			y: py,
			w: 8,
			h: 11,
			fill: p.lightSoft,
			stroke: p.light,
			sw: 0.6,
			opacity: 0.85,
			transform: `rotate(${-18 + i * 9} ${px} ${py})`
		});
	}
	return out;
}

/** Knihovna v plamenech. */
function sceneBookFire(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y, 0.18)];
	out.push(
		...drawHero(ctx, ctx.subject, {
			x: 102 + ctx.balance * 3,
			y: y - 52,
			scale: 0.82 * (0.98 + ctx.density * 0.04)
		})
	);
	out.push(...flamesAt(p, 166, y - 10, 1.05 * (0.9 + ctx.density * 0.2), 6));
	out.push(
		...drawHero(ctx, 'flame', {
			x: 218,
			y: y - 48,
			scale: 0.72 * (0.98 + ctx.density * 0.04)
		})
	);
	out.push(...flyingPages(p, 214, 76, 4));
	for (let i = 0; i < 5; i++) {
		out.push(circle(150 + i * 16, 54 + ((i * 13) % 26), 1.8, { fill: p.amber, opacity: 0.7 }));
	}
	return out;
}

/** Postava a hodiny — vztah člověka k času. */
function sceneTimeFigure(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y)];
	out.push(
		...drawHero(ctx, 'figure', {
			x: 96 + ctx.balance * 3,
			y: y - 44,
			scale: 0.96 * (0.98 + ctx.density * 0.04)
		})
	);
	out.push(
		...drawHero(ctx, 'clock', {
			x: 220,
			y: y - 66,
			scale: 0.86 * (0.98 + ctx.density * 0.04)
		})
	);
	out.push(
		path(`M 126 ${y - 96} Q 170 ${y - 128} 214 ${y - 106}`, {
			...stroke(p.terracotta, 1.6, 0.7),
			dash: '3 5'
		})
	);
	for (let i = 0; i < 4; i++) {
		const angle = -Math.PI / 2 + (Math.PI / 5) * i;
		out.push(circle(160 + Math.cos(angle) * 46, 78 + Math.sin(angle) * 20, 1.8, { fill: p.amber, opacity: 0.8 }));
	}
	return out;
}

/** Písmo: tabulka se znaky a jeho nositel — pero nebo loď. */
function sceneWriting(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y)];
	out.push(
		...drawHero(ctx, ctx.subject, {
			x: 106 + ctx.balance * 3,
			y: y - 50,
			scale: 0.94 * (0.98 + ctx.density * 0.04)
		})
	);
	const carrier = ctx.secondary || 'quill';
	if (carrier === 'ship') {
		out.push(...drawHero(ctx, 'ship', { x: 226, y: y - 26, scale: 0.62 }));
		out.push(
			path(`M 152 ${y - 24} Q 186 ${y - 44} 214 ${y - 28}`, {
				...stroke(p.amber, 1.4, 0.7),
				dash: '3 4'
			})
		);
	} else {
		out.push(...drawHero(ctx, carrier, { x: 224, y: y - 54, scale: 0.86, rotate: -8 }));
		out.push(...flyingPages(p, 188, 96, 3));
	}
	out.push(line(74, y - 14, 214, y - 14, { ...stroke(p.lightSoft, 1, 0.35) }));
	return out;
}

/** Stroj a starý svět, který nahradil. */
function sceneDisruption(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...brokenBaseline(p, y, 16)];
	out.push(
		...drawHero(ctx, ctx.secondary || 'ruin', {
			x: 74 + ctx.balance * 3,
			y: y - 34,
			scale: 0.62,
			rotate: -6
		}).map((el) => ({ ...el, opacity: Math.min(el.opacity ?? 1, 0.5) }))
	);
	out.push(
		...drawHero(ctx, 'machine', {
			x: 222,
			y: y - 52,
			scale: 0.94 * (0.98 + ctx.density * 0.04)
		})
	);
	out.push(...arrow(112, 178, 64, p, 0.95));
	out.push(circle(146, y - 8, 2.6, { fill: p.terracotta, opacity: 0.75 }));
	out.push(polygon([[158, y - 4], [166, y - 12], [172, y - 2]], { fill: p.accent, opacity: 0.75 }));
	return out;
}

/** Slunce ve středu a planety na drahách. */
function sceneSolarSystem(ctx) {
	const p = ctx.palette;
	const out = [
		ellipse(160, 94, 118, 44, { fill: 'none', stroke: p.sage, sw: 1, opacity: 0.35 }),
		ellipse(160, 94, 82, 30, { fill: 'none', stroke: p.tealDeep, sw: 1, opacity: 0.4 })
	];
	out.push(...drawHero(ctx, 'sun', { x: 160, y: 94, scale: 0.86 }));
	out.push(...drawHero(ctx, 'planet', { x: 252, y: 76, scale: 0.4 }));
	out.push(circle(88, 112, 6, { fill: p.sage, stroke: p.light, sw: 1 }));
	out.push(circle(124, 68, 3.4, { fill: p.teal, stroke: p.light, sw: 0.8 }));
	for (let i = 0; i < 4; i++) {
		out.push(circle(44 + i * 18, 36 + (i % 2) * 14, 1.6, { fill: p.amber, opacity: 0.7 }));
	}
	out.push(...baseline(p, 150, 0.16));
	return out;
}

/** Plavba: loď na vlnách a trasa k cíli. */
function sceneVoyage(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [
		path('M -20 36 Q 8 28 36 36 Q 64 44 92 36 Q 120 28 148 36 Q 176 44 204 36 Q 232 28 260 36 Q 288 44 316 36 L 316 60 L -20 60 Z', {
			fill: p.forestDeep,
			opacity: 0.9
		}),
		line(-20, 36, 316, 36, { ...stroke(p.teal, 1.4, 0.6) })
	];
	out.push(...drawHero(ctx, 'ship', { x: 150 + ctx.balance * 2, y: y - 16, scale: 1.02 }));
	out.push(
		path('M 62 70 Q 120 34 214 48 Q 254 54 286 30', {
			...stroke(p.amber, 1.5, 0.75),
			dash: '4 5'
		}),
		circle(62, 70, 3, { fill: p.amber }),
		circle(286, 30, 4, { fill: p.terracotta, stroke: p.light, sw: 0.8 })
	);
	if (ctx.secondary === 'map') out.push(...drawHero(ctx, 'map', { x: 52, y: 58, scale: 0.34 }));
	else out.push(...drawHero(ctx, 'compass', { x: 56, y: 58, scale: 0.32 }));
	return out;
}

/** Stroj jako mechanismus: převody, pist a výstup práce. */
function sceneMechanism(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y)];
	out.push(...drawHero(ctx, 'machine', { x: 146, y: y - 52, scale: 1.02 }));
	out.push(...drawHero(ctx, 'gear', { x: 244, y: 62, scale: 0.44, rotate: 12 }));
	out.push(...arrow(196, 232, 96, p, 0.8));
	out.push(
		line(244, 84, 244, 120, { ...stroke(p.light, 1, 0.4), dash: '2 4' }),
		circle(244, 124, 3, { fill: p.amber })
	);
	return out;
}

/** Laboratoř: sklo, mikroskop a stůl. */
function sceneLaboratory(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [
		line(36, y, 284, y, { ...stroke(p.light, 1.4, 0.55) }),
		rect(60, y - 5, 200, 5, { fill: p.forestDeep, stroke: p.light, sw: 0.8 })
	];
	out.push(...drawHero(ctx, ctx.subject || 'flask', { x: 112, y: y - 44, scale: 0.82 }));
	out.push(...drawHero(ctx, ctx.secondary || 'microscope', { x: 218, y: y - 44, scale: 0.86 }));
	for (let i = 0; i < 3; i++) {
		out.push(circle(140 + i * 9, 82 - i * 10, 2 - i * 0.3, { fill: p.amber, opacity: 0.65 }));
	}
	return out;
}

/** Divadlo a film: maska, obraz a světlo jeviště. */
function sceneTheatre(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [
		...baseline(p, y),
		polygon([[20, 10], [88, y - 8], [52, y - 8]], { fill: p.amber, opacity: 0.09 }),
		polygon([[300, 10], [232, y - 8], [268, y - 8]], { fill: p.teal, opacity: 0.09 }),
		line(24, 12, 24, y - 8, { ...stroke(p.terracotta, 2, 0.5) }),
		line(296, 12, 296, y - 8, { ...stroke(p.terracotta, 2, 0.5) })
	];
	out.push(...drawHero(ctx, ctx.subject || 'mask', { x: 132, y: y - 46, scale: 0.9 }));
	out.push(...drawHero(ctx, ctx.secondary || 'film', { x: 232, y: y - 44, scale: 0.68 }));
	out.push(circle(180, 60, 2.4, { fill: p.amber, opacity: 0.7 }));
	return out;
}

/** Mapa a kompas — prostor, trasy a orientace. */
function sceneMapScene(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y, 0.16)];
	out.push(...drawHero(ctx, 'map', { x: 162, y: y - 50, scale: 1.02 }));
	out.push(
		polyline(
			[
				[108, y - 26],
				[138, y - 58],
				[176, y - 44],
				[210, y - 74],
				[248, y - 54]
			],
			{ ...stroke(p.amber, 1.8, 0.9), dash: '4 4' }
		),
		circle(108, y - 26, 3, { fill: p.amber }),
		polygon([[248, y - 62], [254, y - 54], [248, y - 46], [242, y - 54]], { fill: p.terracotta }),
		...drawHero(ctx, 'compass', { x: 54, y: 62, scale: 0.4 })
	);
	return out;
}

/** Bludiště, postava a nit k východu. */
function sceneLabyrinth(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y)];
	out.push(...drawHero(ctx, 'labyrinth', { x: 136, y: y - 70, scale: 0.92 }));
	out.push(...drawHero(ctx, 'figure', { x: 244, y: y - 34, scale: 0.52 }));
	out.push(
		path('M 222 118 Q 190 96 158 118', { ...stroke(p.amber, 1.6, 0.85), dash: '3 4' })
	);
	out.push(...drawHero(ctx, 'key', { x: 258, y: 54, scale: 0.4, rotate: 20 }));
	return out;
}

/** Proměna: kukla, šipka a motýl. */
function sceneMetamorphosis(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y)];
	out.push(...drawHero(ctx, 'cocoon', { x: 84, y: y - 50, scale: 0.82 }));
	out.push(...drawHero(ctx, 'butterfly', { x: 230, y: 84, scale: 0.92 }));
	out.push(...arrow(120, 184, 54, p, 0.95));
	for (let i = 0; i < 4; i++) {
		out.push(circle(144 + i * 16, 74 + (i % 2) * 8, 1.8, { fill: p.amber, opacity: 0.7 }));
	}
	return out;
}

/** Růst: semeno, klíček a dospělý strom. */
function sceneSeedGrowth(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y)];
	out.push(
		polyline(
			[
				[42, y - 6],
				[118, y - 18],
				[196, y - 28],
				[282, y - 42]
			],
			{ ...stroke(p.accent, 1.5, 0.7) }
		)
	);
	out.push(...drawHero(ctx, 'sprout', { x: 82, y: y - 26, scale: 0.5 }));
	out.push(...drawHero(ctx, 'tree', { x: 168, y: y - 34, scale: 0.72 }));
	out.push(...drawHero(ctx, 'tree', { x: 258, y: y - 40, scale: 1.0 }));
	out.push(circle(282, y - 42, 3, { fill: p.amber }));
	return out;
}

/** Pochod: dav v pohybu, v čele pochodeň. */
function sceneProcession(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y, 0.3)];
	out.push(...drawHero(ctx, 'crowd', { x: 128, y: y - 36, scale: 0.92 }));
	out.push(...drawHero(ctx, 'torch', { x: 244, y: y - 48, scale: 0.82, rotate: 8 }));
	out.push(...arrow(82, 214, 66, p, 0.7));
	out.push(line(52, y - 4, 278, y - 4, { ...stroke(p.forestDeep, 2, 0.5) }));
	return out;
}

/** Obléhání: pevnost, štít a tlak zvenčí. */
function sceneSiege(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...brokenBaseline(p, y, 14)];
	out.push(...drawHero(ctx, ctx.subject || 'castle', { x: 190, y: y - 54, scale: 0.96 }));
	out.push(...drawHero(ctx, ctx.secondary || 'shield', { x: 68, y: y - 40, scale: 0.62, rotate: -12 }));
	for (let i = 0; i < 3; i++) {
		out.push(line(74 + i * 6, 84 + i * 10, 120 + i * 8, 78 + i * 12, { ...stroke(p.amber, 1.4, 0.7) }));
	}
	out.push(...arrow(82, 138, 58, p, 0.75));
	return out;
}

/** Monument: architektura a měřítko člověka. */
function sceneMonument(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y)];
	out.push(...drawHero(ctx, ctx.subject || 'tower', { x: 172, y: y - 58, scale: 1.12 }));
	out.push(...drawHero(ctx, 'figure', { x: 62, y: y - 26, scale: 0.42 }));
	out.push(circle(268, 46, 10, { fill: p.amber, opacity: 0.7, stroke: p.light, sw: 1 }));
	out.push(
		line(56, y - 4, 92, y - 4, { ...stroke(p.light, 1, 0.4) }),
		line(250, y - 4, 286, y - 4, { ...stroke(p.light, 1, 0.4) })
	);
	return out;
}

/** Obřad: svíčka, chrám a rituální kruh. */
function sceneRitual(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [
		...baseline(p, y),
		ellipse(160, y - 2, 104, 12, { fill: 'none', stroke: p.amber, sw: 1, opacity: 0.45, dash: '3 5' })
	];
	out.push(...drawHero(ctx, 'candle', { x: 160, y: y - 48, scale: 0.92 }));
	out.push(...drawHero(ctx, 'temple', { x: 62, y: y - 38, scale: 0.48 }));
	out.push(...drawHero(ctx, 'temple', { x: 258, y: y - 38, scale: 0.48, flip: true }));
	for (let i = 0; i < 5; i++) {
		const angle = Math.PI + (Math.PI / 4) * i;
		out.push(circle(160 + Math.cos(angle) * 72, y - 8 + Math.sin(angle) * 10, 1.8, { fill: p.light, opacity: 0.6 }));
	}
	return out;
}

/** Tkaní: stav, osnova a hotová látka. */
function sceneWeave(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y)];
	out.push(...drawHero(ctx, 'loom', { x: 130, y: y - 54, scale: 0.94 }));
	out.push(
		path(`M 178 ${y - 34} Q 216 ${y - 44} 252 ${y - 30}`, { ...stroke(p.teal, 4, 0.9) }),
		path(`M 178 ${y - 22} Q 216 ${y - 32} 252 ${y - 18}`, { ...stroke(p.amber, 3, 0.85) })
	);
	out.push(...drawHero(ctx, 'thread', { x: 266, y: 66, scale: 0.48, rotate: -14 }));
	return out;
}

/** Měření: kompas, hodiny a stupnice. */
function sceneMeasurement(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y), arcPath(160, y - 28, 82, 200, 340, { ...stroke(p.lightSoft, 1.2, 0.5) })];
	for (let i = 0; i <= 8; i++) {
		const angle = (200 + (140 / 8) * i) * (Math.PI / 180);
		const inner = i % 2 === 0 ? 72 : 76;
		out.push(
			line(
				160 + Math.cos(angle) * inner,
				y - 28 + Math.sin(angle) * inner,
				160 + Math.cos(angle) * 82,
				y - 28 + Math.sin(angle) * 82,
				{ ...stroke(p.light, i % 2 === 0 ? 1.2 : 0.8, 0.65) }
			)
		);
	}
	out.push(...drawHero(ctx, 'compass', { x: 112, y: y - 44, scale: 0.72 }));
	out.push(...drawHero(ctx, 'clock', { x: 222, y: y - 46, scale: 0.68 }));
	return out;
}

/** Cyklus: prstenec a přesýpací hodiny. */
function sceneOrbitCycle(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y, 0.16)];
	out.push(...drawHero(ctx, 'cycle', { x: 142, y: y - 52, scale: 0.96 }));
	out.push(...drawHero(ctx, 'hourglass', { x: 240, y: y - 44, scale: 0.62 }));
	for (let i = 0; i < 6; i++) {
		const angle = (Math.PI * 2 * i) / 6;
		out.push(circle(142 + Math.cos(angle) * 58, y - 52 + Math.sin(angle) * 40, 2, { fill: p.amber, opacity: 0.75 }));
	}
	return out;
}

/** Pozorování oblohy: dalekohled míří na konkrétní objekt. */
function sceneObservatory(ctx) {
	const p = ctx.palette;
	const y = 152;
	const out = [...baseline(p, y)];
	out.push(...drawHero(ctx, 'telescope', { x: 96 + ctx.balance * 3, y: y - 46, scale: 0.86 }));
	out.push(...drawHero(ctx, ctx.secondary || 'planet', { x: 236, y: 70, scale: 0.72 }));
	out.push(
		path('M 138 108 L 218 80', { ...stroke(p.amber, 1.4, 0.75), dash: '3 5' }),
		circle(218, 80, 2.6, { fill: p.amber })
	);
	for (let i = 0; i < 4; i++) {
		out.push(circle(196 + i * 20, 34 + (i % 2) * 12, 1.6, { fill: p.light, opacity: 0.65 }));
	}
	return out;
}

/** Samotné nebeské těleso s drahou a hvězdným polem. */
function sceneCelestial(ctx) {
	const p = ctx.palette;
	const out = [
		ellipse(160, 96, 116, 52, { fill: 'none', stroke: p.sageDeep, sw: 1, opacity: 0.35, dash: '3 6' }),
		...drawHero(ctx, ctx.subject, { x: 160, y: 96, scale: 1.14 })
	];
	for (let i = 0; i < 6; i++) {
		const angle = (Math.PI * 2 * i) / 6 + 0.4;
		out.push(circle(160 + Math.cos(angle) * (104 + (i % 2) * 8), 96 + Math.sin(angle) * (46 + (i % 2) * 6), 1.8, { fill: p.amber, opacity: 0.7 }));
	}
	return out;
}

/** Všechny sémantické scény podle klíče. */
export const SEMANTIC_SCENES = {
	bookFire: sceneBookFire,
	timeFigure: sceneTimeFigure,
	writing: sceneWriting,
	disruption: sceneDisruption,
	solarSystem: sceneSolarSystem,
	voyage: sceneVoyage,
	mechanism: sceneMechanism,
	laboratory: sceneLaboratory,
	theatre: sceneTheatre,
	mapScene: sceneMapScene,
	labyrinth: sceneLabyrinth,
	metamorphosis: sceneMetamorphosis,
	seedGrowth: sceneSeedGrowth,
	procession: sceneProcession,
	siege: sceneSiege,
	monument: sceneMonument,
	ritual: sceneRitual,
	weave: sceneWeave,
	measurement: sceneMeasurement,
	orbitCycle: sceneOrbitCycle,
	observatory: sceneObservatory,
	celestial: sceneCelestial
};

/** Metadata scény pro galerii a dokumentaci. */
export const SEMANTIC_SCENE_META = {
	bookFire: { label: 'Knihovna v plamenech', note: 'vědění, ztráta, oheň' },
	timeFigure: { label: 'Člověk a čas', note: 'postava ve vztahu k hodinám' },
	writing: { label: 'Písmo a jeho nositel', note: 'znaky, tabulka, pero nebo loď' },
	disruption: { label: 'Narušení', note: 'stroj nahrazuje starý svět' },
	solarSystem: { label: 'Sluneční soustava', note: 'střed a obíhající tělesa' },
	voyage: { label: 'Plavba', note: 'loď, vlny a trasa' },
	mechanism: { label: 'Mechanismus', note: 'stroj, převody a výstup' },
	laboratory: { label: 'Laboratoř', note: 'sklo, nástroj a stůl' },
	theatre: { label: 'Divadlo', note: 'maska, obraz a jeviště' },
	mapScene: { label: 'Mapa', note: 'trasa, kompas a cíl' },
	labyrinth: { label: 'Bludiště', note: 'cesta, nit a východ' },
	metamorphosis: { label: 'Proměna', note: 'kukla, šipka a motýl' },
	seedGrowth: { label: 'Růst', note: 'semeno, klíček a strom' },
	procession: { label: 'Pochod', note: 'dav, směr a pochodeň' },
	siege: { label: 'Obléhání', note: 'pevnost, štít a tlak' },
	monument: { label: 'Monument', note: 'stavba a měřítko člověka' },
	ritual: { label: 'Obřad', note: 'svíčka, chrám a kruh' },
	weave: { label: 'Tkaní', note: 'stav, osnova a látka' },
	measurement: { label: 'Měření', note: 'kompas, hodiny a stupnice' },
	orbitCycle: { label: 'Cyklus', note: 'prstenec a přesýpací hodiny' },
	observatory: { label: 'Pozorování', note: 'dalekohled a konkrétní objekt' },
	celestial: { label: 'Nebeské těleso', note: 'jeden objekt s drahou' }
};

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

/** Kresba kompozičního vzoru samostatně (pro scénu bez rodiny). */
export function drawCompositionScene(composition, ctx, baselineY = 150) {
	const compose = COMPOSERS[composition];
	return compose ? compose(ctx, baselineY) : null;
}

/**
 * Kresba podle klíče scény. Rodinné scény řeší i kompozici samy, sémantické
 * scény mají vlastní vztah objektů.
 */
export function drawScene(scene, ctx) {
	if (SEMANTIC_SCENES[scene]) return SEMANTIC_SCENES[scene](ctx);
	if (SCENES[scene]) return SCENES[scene](ctx);
	if (COMPOSERS[scene]) return drawCompositionScene(scene, ctx, scene === 'storybook' ? 152 : 150) || [];
	return SCENES[ctx.family](ctx);
}

/** Úplný katalog scén pro galerii, audit a dokumentaci. */
export const SCENE_TYPES = [
	...Object.keys(SCENES).map((key) => ({ key, group: 'family', ...FAMILY_META[key] })),
	...Object.keys(COMPOSERS).map((key) => ({ key, group: 'composition', ...(COMPOSITION_META[key] || { label: key, note: 'kompoziční vzor' }) })),
	...Object.keys(SEMANTIC_SCENES).map((key) => ({ key, group: 'semantic', ...SEMANTIC_SCENE_META[key] }))
];
