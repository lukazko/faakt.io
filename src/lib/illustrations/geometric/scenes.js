/**
 * Sedm geometrických kompozic.
 *
 * Každá scéna kromě `layers` staví jeden hlavní motiv na společnou linku
 * podstavce. Žádné doplňkové objekty — ilustrace má nést jednu myšlenku.
 */

import { group, line, path, polygon } from '../primitives.js';
import { round } from '../prng.js';
import { VIEWBOX } from './constants.js';
import { shape, stroke } from './palette.js';
import { HEROES } from './heroes.js';

const W = VIEWBOX.width;

/** Společná linka podstavce — jediná země, žádné dekorativní pozadí. */
function baseline(p, y = 150, opacity = 0.24) {
	return [line(26, y, W - 26, y, { stroke: p.light, sw: 1, opacity })];
}

function drawHero(ctx, placement) {
	const builder = HEROES[ctx.subject];
	if (!builder) return [];
	return group(builder(ctx), placement);
}

function scenePortrait(ctx) {
	const p = ctx.palette;
	return [
		...baseline(p, 150),
		...drawHero(ctx, {
			x: 160 + ctx.balance * 8,
			y: ctx.subject === 'bust' ? 84 : 98,
			scale: (ctx.subject === 'bust' ? 1.15 : 1.1) * (0.98 + ctx.density * 0.04),
			flip: ctx.variant === 1
		})
	];
}

function sceneDiscovery(ctx) {
	const p = ctx.palette;
	const telescope = ctx.subject === 'telescope';
	const flask = ctx.subject === 'flask';
	return [
		...baseline(p, 150),
		...drawHero(ctx, {
			x: 160 + ctx.balance * 8,
			y: telescope ? 94 : flask ? 104 : 100,
			scale: (telescope ? 1.05 : 1.12) * (0.98 + ctx.density * 0.04)
		})
	];
}

function sceneStorybook(ctx) {
	const p = ctx.palette;
	return [
		...baseline(p, 152),
		...drawHero(ctx, {
			x: 160 + ctx.balance * 6,
			y: 112,
			scale: 1.22 * (0.98 + ctx.density * 0.04),
			rotate: ctx.variant === 1 ? -2 : 0
		})
	];
}

function sceneRelic(ctx) {
	const p = ctx.palette;
	const column = ctx.subject === 'column';
	const amphora = ctx.subject === 'amphora';
	return [
		...baseline(p, 152),
		...drawHero(ctx, {
			x: 160 + ctx.balance * 6,
			y: column ? 98 : amphora ? 94 : 100,
			scale: (column ? 1.18 : amphora ? 1.15 : 1.2) * (0.98 + ctx.density * 0.04)
		})
	];
}

function sceneMetaphor(ctx) {
	const p = ctx.palette;
	return [
		...baseline(p, 150),
		...drawHero(ctx, {
			x: 160 + ctx.balance * 6,
			y: 98,
			scale: 1.1 * (0.98 + ctx.density * 0.04)
		})
	];
}

function sceneNature(ctx) {
	const p = ctx.palette;
	const octopus = ctx.subject === 'octopus';
	return [
		...baseline(p, 152),
		...drawHero(ctx, {
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
