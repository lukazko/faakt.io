/**
 * Symbolické kompoziční rodiny.
 *
 * Staví na hotových motivech z `motifs.js`, ale každá rodina má vlastní
 * prostorovou logiku: oheň má obřadní kruh, střet dvě protilehlé strany,
 * dav horizontální vrstvu, chrám frontální fasádu. Díky tomu nejde o pouhé
 * jiné rozmístění stejných objektů.
 */

import { arcPath, circle, ellipse, line, n, path, polygon, polyline, rect } from './primitives.js';
import { MOTIF_BY_KEY, renderMotif, supportsForFamily } from './motifs.js';

const stroke = (color, sw = 1.5, opacity = 1) => ({
	fill: 'none',
	stroke: color,
	sw,
	opacity,
	linecap: 'round',
	linejoin: 'round'
});

const filled = (color, opacity = 1) => ({ fill: color, opacity });

function resolveSubject(context, fallback) {
	const motif = MOTIF_BY_KEY[context.subject];
	if (motif && motif.role !== 'support' && motif.families.includes(context.family)) {
		return context.subject;
	}
	const fallbackMotif = MOTIF_BY_KEY[fallback];
	if (fallbackMotif && fallbackMotif.role !== 'support' && fallbackMotif.families.includes(context.family)) {
		return fallback;
	}
	return supportsForFamily(context.family)[0] || fallback;
}

function subjectAt(context, key, placement) {
	return renderMotif(key, { ...context, placement });
}

function placeSupports(context, slots, scale = 0.52) {
	const out = [];
	const supports = (context.supports || []).filter((key) => MOTIF_BY_KEY[key] && MOTIF_BY_KEY[key].families.includes(context.family));
	supports.slice(0, slots.length).forEach((key, i) => {
		out.push(
			...subjectAt(context, key, {
				x: slots[i].x,
				y: slots[i].y,
				scale: (slots[i].scale || 1) * scale,
				rotate: slots[i].rotate || 0,
				flip: slots[i].flip || false
			})
		);
	});
	return out;
}

function sparkField(out, rand, count, area, colors, size = 1.4) {
	for (let i = 0; i < count; i++) {
		out.push(
			circle(rand.range(area[0], area[2]), rand.range(area[1], area[3]), size * (0.55 + rand() * 0.9), {
				fill: rand.pick(colors),
				opacity: 0.25 + rand() * 0.45
			})
		);
	}
}

function groundLine(out, y, palette, opacity = 0.4) {
	out.push(line(-150, y, 150, y, stroke(palette.soft, 1, opacity)));
	return out;
}

function backdropRings(out, palette, cx, cy, count, maxRadius, ratio = 0.55) {
	for (let i = 1; i <= count; i++) {
		out.push(
			ellipse(cx, cy, (maxRadius / count) * i, (maxRadius / count) * i * ratio, {
				...stroke(i % 2 === 0 ? palette.secondary : palette.primary, 0.9, 0.08 + (count - i) * 0.012),
				dash: i % 3 === 0 ? '2 7' : undefined
			})
		);
	}
	return out;
}

function flameRitual(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'flame');
	const out = [
		backdropRings([], p, 0, 0, 4, 82, 0.62)[0],
		circle(0, 4, 46 + density * 14, { fill: p.ember, opacity: 0.06 }),
		groundLine([], 70, p, 0.3)[0]
	];
	out.push(...backdropRings([], p, 0, 0, 4, 82, 0.62).slice(1));
	if (variant === 0) {
		for (let i = 0; i < 9; i++) {
			const angle = (i / 9) * Math.PI * 2;
			out.push(ellipse(Math.cos(angle) * 48, 58 + Math.sin(angle) * 8, 9, 5, { fill: p.stoneDark, opacity: 0.55, stroke: p.primary, sw: 0.8, rot: (angle * 180) / Math.PI }));
		}
	} else if (variant === 1) {
		out.push(path('M -56 62 Q 0 48 56 62', stroke(p.woodDark, 3, 0.6)));
		out.push(line(-40, 58, -34, 70, stroke(p.wood, 2, 0.6)));
		out.push(line(40, 58, 34, 70, stroke(p.wood, 2, 0.6)));
	} else {
		out.push(ellipse(0, 62, 40, 6, { fill: p.gold, opacity: 0.18 }));
		out.push(path('M -30 64 Q 0 54 30 64', stroke(p.gold, 1, 0.45)));
	}
	out.push(...subjectAt(context, subject, { y: -4, scale: 1.02 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -92, y: 22, scale: 0.95 },
		{ x: 92, y: 22, scale: 0.95 },
		{ x: 0, y: -58, scale: 0.72 }
	], 0.52));
	sparkField(out, rand, 7 + Math.round(density * 8), [-72, -70, 72, 44], [p.gold, p.secondary, p.ember], 1.2);
	if (density > 0.72) out.push(arcPath(0, 0, 68, 205, 335, { ...stroke(p.gold, 1, 0.3), dash: '2 6' }));
	return out;
}

function stormScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'lightning');
	const out = [];
	for (let i = 0; i < 10 + Math.round(density * 12); i++) {
		const x = rand.range(-150, 150);
		const y = rand.range(-80, 50);
		out.push(line(x, y, x - 10 - rand() * 8, y + 22 + rand() * 16, { stroke: i % 4 === 0 ? p.secondary : p.water, sw: 0.9, opacity: 0.18 + rand() * 0.25 }));
	}
	out.push(ellipse(-74, -58, 58, 16, { fill: p.stoneDark, opacity: 0.28, stroke: p.primary, sw: 0.9 }));
	out.push(ellipse(58, -64, 64, 18, { fill: p.stoneDark, opacity: 0.22, stroke: p.primary, sw: 0.9 }));
	out.push(path('M -148 42 Q -120 30 -94 44 Q -68 56 -42 44 Q -16 32 10 44 Q 38 58 66 44 Q 96 30 124 44 Q 140 50 150 44', stroke(p.water, 1.2, 0.35)));
	out.push(...subjectAt(context, subject, { y: -2, scale: 1.02 + density * 0.1 }));
	out.push(...placeSupports(context, [
		{ x: -96, y: 8, scale: 0.9 },
		{ x: 96, y: 10, scale: 0.9 },
		{ x: 0, y: 58, scale: 0.6 }
	], 0.54));
	for (let i = 0; i < 3; i++) {
		out.push(ellipse(-52 + i * 52, 64, 22 + i * 6, 3, { fill: p.water, opacity: 0.16 }));
	}
	out.push(circle(0, -62, 24, { ...stroke(p.secondary, 0.8, 0.18), dash: '2 7' }));
	if (variant === 2) {
		out.push(path('M -126 -28 Q -72 -44 -20 -26 Q 34 -8 88 -26 Q 118 -36 146 -24', stroke(p.primary, 1.2, 0.4)));
		out.push(path('M -140 -8 Q -88 -24 -34 -6 Q 20 12 74 -4 Q 108 -14 142 -4', stroke(p.secondary, 1, 0.28)));
	}
	return out;
}

function celestialScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'sun');
	const out = [
		ellipse(0, 0, 112 + variant * 8, 62 + variant * 4, { ...stroke(p.primary, 1, 0.18), dash: '3 7' }),
		ellipse(0, 0, 86, 48, { ...stroke(p.secondary, 0.9, 0.16), dash: '2 6' })
	];
	out.push(...subjectAt(context, subject, { y: -2, scale: 1.02 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -104, y: -40, scale: 0.82 },
		{ x: 104, y: -38, scale: 0.82 },
		{ x: 0, y: 62, scale: 0.58 }
	], 0.55));
	sparkField(out, rand, 12 + Math.round(density * 10), [-146, -82, 146, 62], [p.snow, p.secondary, p.gold], 1.2);
	out.push(arcPath(0, 58, 118, 190, 350, stroke(p.primary, 1.2, 0.2)));
	out.push(ellipse(0, 62, 108, 8, { fill: p.primary, opacity: 0.06 }));
	if (variant === 1) out.push(circle(86, -48, 2.2, filled(p.gold, 0.8)));
	if (variant === 2) {
		out.push(path('M -118 44 Q -60 20 0 30 Q 62 40 118 24', stroke(p.tertiary, 1, 0.3)));
	}
	return out;
}

function bloomScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'flower');
	const out = [
		ellipse(0, 66, 92, 8, { fill: p.foliageDark, opacity: 0.16 }),
		line(-110, 66, 110, 66, stroke(p.foliageDark, 1, 0.3))
	];
	backdropRings(out, p, 0, -18, 3, 66, 0.82);
	for (let i = 0; i < 5; i++) {
		const angle = (i / 5) * Math.PI * 2 + variant * 0.25;
		out.push(
			ellipse(Math.cos(angle) * 54, -18 + Math.sin(angle) * 34, 10, 22, {
				fill: i % 2 === 0 ? p.secondary : p.tertiary,
				opacity: 0.07,
				stroke: p.primary,
				sw: 0.7,
				rot: (angle * 180) / Math.PI + 90
			})
		);
	}
	out.push(path('M -76 66 Q -64 26 -52 10 M 76 66 Q 64 26 52 10', stroke(p.foliageDark, 1.6, 0.35)));
	out.push(...subjectAt(context, subject, { y: -8, scale: 1 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -96, y: 34, scale: 0.88 },
		{ x: 96, y: 34, scale: 0.88 },
		{ x: 0, y: 58, scale: 0.62 }
	], 0.5));
	sparkField(out, rand, 6 + Math.round(density * 7), [-100, -74, 100, 52], [p.gold, p.secondary, p.snow], 1.1);
	if (variant === 1) out.push(path('M -110 54 Q -70 34 -32 48', stroke(p.foliage, 1.1, 0.4)));
	if (variant === 2) out.push(circle(64, -58, 10, { fill: p.gold, opacity: 0.16 }));
	return out;
}

function undergrowthScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'mushroom');
	const out = [
		rect(-160, 24, 320, 66, { fill: p.woodDark, opacity: 0.16 }),
		line(-160, 24, 160, 24, stroke(p.primary, 1.4, 0.55)),
		ellipse(0, 24, 110, 8, { fill: p.wood, opacity: 0.1 })
	];
	for (let i = 0; i < 6; i++) {
		out.push(path(`M ${n(-120 + i * 48)} 24 Q ${n(-112 + i * 48)} 44 ${n(-126 + i * 48)} 66`, stroke(p.wood, 0.9, 0.25)));
		out.push(circle(-118 + i * 48, 34 + (i % 3) * 10, 1.2, filled(p.gold, 0.35)));
	}
	out.push(...subjectAt(context, subject, { y: -22, scale: 1.02 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -98, y: -6, scale: 0.9 },
		{ x: 98, y: -4, scale: 0.9 },
		{ x: 0, y: 42, scale: 0.58 }
	], 0.52));
	for (let i = 0; i < 4 + Math.round(density * 5); i++) {
		out.push(circle(rand.range(-116, 116), rand.range(-70, 8), rand.range(0.7, 1.8), filled(i % 2 === 0 ? p.secondary : p.gold, 0.4)));
	}
	if (variant === 1) {
		out.push(line(-140, 24, 140, 24, { ...stroke(p.primary, 1, 0.35), dash: '5 5' }));
		out.push(path('M -122 38 Q -90 50 -58 38 Q -28 26 0 38 Q 28 50 58 38 Q 88 26 122 38', stroke(p.foliage, 1, 0.3)));
	} else if (variant === 2) {
		out.push(circle(-92, -54, 16, { fill: p.secondary, opacity: 0.1 }));
		out.push(circle(96, -60, 12, { fill: p.gold, opacity: 0.1 }));
	}
	return out;
}

function canopyScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'branch');
	const out = [
		line(-150, 70, 150, 70, stroke(p.foliageDark, 1, 0.35)),
		ellipse(0, 70, 118, 7, { fill: p.foliageDark, opacity: 0.12 })
	];
	for (let i = 0; i < 3 + variant; i++) {
		const x = -110 + i * (220 / Math.max(2 + variant, 1));
		out.push(path(`M ${n(x)} -86 Q ${n(x + 34)} -30 ${n(x + 14)} 70`, stroke(p.woodDark, 2.4 - i * 0.3, 0.28)));
	}
	for (let i = 0; i < 14 + Math.round(density * 10); i++) {
		const x = rand.range(-144, 144);
		const y = rand.range(-86, -34);
		out.push(ellipse(x, y, rand.range(5, 10), rand.range(9, 17), { fill: i % 3 === 0 ? p.foliage : p.foliageDark, opacity: 0.12, rot: rand.range(-50, 50) }));
	}
	for (let i = 0; i < 4; i++) {
		out.push(line(-80 + i * 54, -88, -64 + i * 54, 70, stroke(i % 2 === 0 ? p.gold : p.secondary, 0.8, 0.08)));
	}
	out.push(...subjectAt(context, subject, { y: -6, scale: 1.02 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -100, y: 34, scale: 0.9 },
		{ x: 100, y: 34, scale: 0.9 },
		{ x: 0, y: -58, scale: 0.62 }
	], 0.52));
	sparkField(out, rand, 6 + Math.round(density * 6), [-120, -76, 120, 54], [p.gold, p.foliage, p.secondary], 1.1);
	if (variant === 2) {
		out.push(path('M 68 -74 Q 24 -46 12 -8 Q 0 28 -18 54', { ...stroke(p.gold, 1, 0.22), dash: '2 6' }));
	}
	return out;
}

function peakScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'mountain');
	const out = [
		circle(66, -38, 18, { fill: p.gold, opacity: 0.18, stroke: p.primary, sw: 0.8 }),
		circle(66, -38, 10, { fill: p.gold, opacity: 0.32 }),
		path('M -160 46 L -98 6 L -46 34 L 2 -18 L 54 26 L 106 -6 L 160 40 L 160 90 L -160 90 Z', {
			fill: p.stoneDark,
			opacity: 0.22,
			stroke: p.primary,
			sw: 1
		}),
		path('M -160 62 L -108 30 L -52 58 L 8 18 L 62 52 L 118 28 L 160 56 L 160 90 L -160 90 Z', {
			fill: p.stoneDark,
			opacity: 0.34,
			stroke: p.primary,
			sw: 1
		})
	];
	for (let i = 0; i < 12 + Math.round(density * 8); i++) {
		out.push(circle(rand.range(-150, 150), rand.range(-20, 62), rand.range(0.7, 1.8), filled(i % 2 === 0 ? p.snow : p.secondary, 0.35)));
	}
	out.push(...subjectAt(context, subject, { y: -4, scale: 1 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -106, y: -8, scale: 0.84 },
		{ x: 106, y: -8, scale: 0.84 },
		{ x: 0, y: 56, scale: 0.58 }
	], 0.52));
	if (variant === 1) {
		out.push(path('M -120 58 Q -60 42 0 54 Q 64 66 120 50', stroke(p.snow, 0.9, 0.25)));
	}
	if (variant === 2) {
		out.push(line(-140, 66, 140, 66, stroke(p.primary, 0.9, 0.25)));
		out.push(circle(-86, -54, 2, filled(p.snow, 0.6)));
	}
	return out;
}

function clashScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'sword');
	const counterpairs = {
		sword: 'shield',
		shield: 'sword',
		helmet: 'sword',
		explosion: 'shield',
		crack: 'shield',
		flame: 'sword'
	};
	const supportKeys = (context.supports || []).filter((key) => key !== subject && MOTIF_BY_KEY[key] && MOTIF_BY_KEY[key].families.includes(family));
	const counterpart = counterpairs[subject] && MOTIF_BY_KEY[counterpairs[subject]] ? counterpairs[subject] : supportKeys[0] || 'shield';
	const out = [
		groundLine([], 72, p, 0.35)[0],
		ellipse(0, 48, 72, 8, { fill: p.ember, opacity: 0.08 })
	];
	out.push(...subjectAt(context, subject, { x: -66 - (variant === 1 ? 10 : 0), y: 4, scale: 0.9 + density * 0.06, rotate: -18 - variant * 4 }));
	out.push(...subjectAt(context, counterpart, { x: 66 + (variant === 2 ? 10 : 0), y: 4, scale: 0.9 + density * 0.06, rotate: 18 + variant * 4, flip: true }));
	const burst = starPointsLocal(0, 2, 22 + density * 10, 8, 9);
	out.push(polygon(burst, { fill: p.gold, opacity: 0.18, stroke: p.gold, sw: 0.8 }));
	for (let i = 0; i < 8; i++) {
		const angle = (i / 8) * Math.PI * 2;
		out.push(line(Math.cos(angle) * 12, 2 + Math.sin(angle) * 12, Math.cos(angle) * (28 + density * 10), 2 + Math.sin(angle) * (28 + density * 10), { stroke: i % 2 === 0 ? p.gold : p.secondary, sw: 1, opacity: 0.45 }));
	}
	sparkField(out, rand, 8 + Math.round(density * 8), [-100, -48, 100, 54], [p.gold, p.ember, p.secondary], 1.2);
	out.push(...placeSupports(context, [
		{ x: -116, y: 44, scale: 0.75 },
		{ x: 116, y: 44, scale: 0.75 }
	], 0.48));
	if (variant === 1) {
		out.push(path('M -126 -54 L -92 -22 M -96 -56 L -70 -30', stroke(p.primary, 1.1, 0.35)));
	}
	return out;
}

function starPointsLocal(cx, cy, outer, inner, count) {
	const points = [];
	for (let i = 0; i < count * 2; i++) {
		const radius = i % 2 === 0 ? outer : inner;
		const angle = -Math.PI / 2 + (i / (count * 2)) * Math.PI * 2;
		points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
	}
	return points;
}

function ruptureScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'crack');
	const out = [
		rect(-160, -90, 320, 180, { fill: p.primary, opacity: 0.02 }),
		ellipse(0, 54, 90, 7, { fill: p.primary, opacity: 0.1 })
	];
	for (let i = 0; i < 5 + variant; i++) {
		const angle = (i / (5 + variant)) * Math.PI * 2 + 0.4;
		out.push(
			path(`M 0 0 L ${n(Math.cos(angle) * 24)} ${n(Math.sin(angle) * 18)} L ${n(Math.cos(angle + 0.12) * (68 + density * 22))} ${n(Math.sin(angle + 0.12) * (44 + density * 14))}`, stroke(i % 3 === 0 ? p.gold : p.primary, i % 3 === 0 ? 1.8 : 1, 0.3 + (i % 2) * 0.15))
		);
	}
	out.push(...subjectAt(context, subject, { y: 0, scale: 1.06 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -108, y: 32, scale: 0.78 },
		{ x: 108, y: 32, scale: 0.78 },
		{ x: 0, y: -64, scale: 0.55 }
	], 0.5));
	for (let i = 0; i < 10 + Math.round(density * 8); i++) {
		const x = rand.range(-126, 126);
		const y = rand.range(-70, 60);
		const size = rand.range(2, 6);
		out.push(
			polygon(
				[
					[x, y],
					[x + size, y - size * 0.6],
					[x + size * 1.4, y + size * 0.5]
				],
				{ fill: i % 4 === 0 ? p.gold : p.stone, opacity: 0.25 }
			)
		);
	}
	if (variant === 2) {
		out.push(line(-150, -30, 150, 42, stroke(p.primary, 1.2, 0.3)));
		out.push(line(-150, 34, 150, -40, stroke(p.primary, 1.2, 0.22)));
	}
	return out;
}

function armoryScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'shield');
	const out = [
		rect(-138, -70, 276, 122, { fill: p.stoneDark, opacity: 0.1, stroke: p.primary, sw: 1 }),
		line(-138, -48, 138, -48, stroke(p.woodDark, 3, 0.55)),
		line(-138, 26, 138, 26, stroke(p.woodDark, 3, 0.45)),
		groundLine([], 70, p, 0.35)[0]
	];
	for (let i = 0; i < 3; i++) {
		out.push(path(`M ${n(-110 + i * 110)} -70 L ${n(-110 + i * 110)} -48`, stroke(p.primary, 1.1, 0.4)));
		out.push(path(`M ${n(-110 + i * 110)} -70 L ${n(-94 + i * 110)} -82 L ${n(-110 + i * 110)} -60`, stroke(p.secondary, 1, 0.3)));
	}
	if (variant === 0) {
		out.push(line(-58, -48, 58, 58, stroke(p.metal, 4, 0.25)));
		out.push(line(58, -48, -58, 58, stroke(p.metal, 4, 0.2)));
	} else if (variant === 1) {
		for (let i = 0; i < 4; i++) out.push(ellipse(-54 + i * 36, 2, 14, 24, { fill: 'none', stroke: p.primary, sw: 1, opacity: 0.16 }));
	}
	out.push(...subjectAt(context, subject, { y: 0, scale: 1.02 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -102, y: 30, scale: 0.82 },
		{ x: 102, y: 30, scale: 0.82 },
		{ x: 0, y: -58, scale: 0.55 }
	], 0.5));
	for (let i = 0; i < 8 + Math.round(density * 6); i++) {
		out.push(circle(rand.range(-120, 120), rand.range(-62, 58), 1.1, filled(i % 3 === 0 ? p.gold : p.secondary, 0.35)));
	}
	if (variant === 2) {
		out.push(rect(-126, -62, 20, 36, { fill: p.secondary, opacity: 0.16, stroke: p.primary, sw: 0.8 }));
		out.push(rect(106, -62, 20, 36, { fill: p.secondary, opacity: 0.12, stroke: p.primary, sw: 0.8 }));
	}
	return out;
}

function crowdScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'crowd');
	const out = [
		line(-150, 66, 150, 66, stroke(p.soft, 1.2)),
		ellipse(0, 68, 118, 6, { fill: p.primary, opacity: 0.08 })
	];
	const count = 5 + variant;
	for (let i = 0; i < count; i++) {
		const x = -120 + (i / Math.max(count - 1, 1)) * 240;
		const s = 0.5 + ((i * 7) % 5) * 0.09;
		const tone = i % 3 === 0 ? p.secondary : p.stoneDark;
		out.push(circle(x, 44 - 48 * s, 7 * s, { fill: tone, opacity: 0.32 }));
		out.push(path(`M ${n(x - 9 * s)} ${n(50 - 38 * s)} Q ${n(x)} ${n(44 - 44 * s)} ${n(x + 9 * s)} ${n(50 - 38 * s)} L ${n(x + 13 * s)} 66 L ${n(x - 13 * s)} 66 Z`, { fill: tone, opacity: 0.22 }));
	}
	out.push(...subjectAt(context, subject, { y: -2, scale: 1.02 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -110, y: 34, scale: 0.8 },
		{ x: 110, y: 34, scale: 0.8 },
		{ x: 0, y: -64, scale: 0.55 }
	], 0.5));
	for (let i = 0; i < 4 + Math.round(density * 5); i++) {
		out.push(circle(rand.range(-130, 130), rand.range(-62, 40), 1.1, filled(i % 2 === 0 ? p.gold : p.secondary, 0.3)));
	}
	if (variant === 2) {
		out.push(path('M -126 56 Q -60 44 0 54 Q 64 64 126 50', stroke(p.primary, 1, 0.25)));
	}
	return out;
}

function gazeScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'eye');
	const out = [
		rect(-140, -76, 280, 152, { fill: 'none', stroke: p.primary, sw: 1, opacity: 0.18 }),
		ellipse(0, 0, 92, 54, { ...stroke(p.primary, 1, 0.18), dash: '3 7' }),
		ellipse(0, 0, 68, 40, { ...stroke(p.secondary, 0.9, 0.2), dash: '2 6' })
	];
	for (let i = 0; i < 8; i++) {
		const angle = (i / 8) * Math.PI * 2;
		out.push(line(Math.cos(angle) * 70, Math.sin(angle) * 40, Math.cos(angle) * 122, Math.sin(angle) * 70, { stroke: i % 2 === 0 ? p.secondary : p.primary, sw: 0.9, opacity: 0.16 }));
	}
	out.push(...subjectAt(context, subject, { y: -2, scale: 1.12 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -114, y: 36, scale: 0.82 },
		{ x: 114, y: 36, scale: 0.82 },
		{ x: 0, y: -66, scale: 0.54 }
	], 0.5));
	sparkField(out, rand, 7 + Math.round(density * 6), [-126, -70, 126, 56], [p.gold, p.secondary, p.snow], 1.1);
	if (variant === 1) {
		out.push(path('M -126 -54 Q -64 -70 0 -58 Q 64 -46 126 -62', stroke(p.primary, 1.1, 0.28)));
	}
	if (variant === 2) {
		out.push(arcPath(0, 0, 80, 200, 340, { ...stroke(p.gold, 1, 0.28), dash: '3 6' }));
	}
	return out;
}

function heartScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'heart');
	const out = [
		circle(0, -2, 58, { fill: p.ember, opacity: 0.05 }),
		ellipse(0, 0, 84, 54, { ...stroke(p.secondary, 0.9, 0.12), dash: '2 7' })
	];
	out.push(...subjectAt(context, subject, { y: -2, scale: 1.1 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -110, y: 32, scale: 0.82 },
		{ x: 110, y: 32, scale: 0.82 },
		{ x: 0, y: -64, scale: 0.54 }
	], 0.5));
	const amp = variant === 1 ? 30 : 16;
	out.push(path(`M -146 56 L -92 56 L -78 44 L -64 56 L -40 56 L -24 ${n(56 - amp)} L -8 ${n(56 + amp)} L 8 56 L 34 56 L 50 46 L 66 56 L 146 56`, stroke(p.gold, 1.4, 0.65)));
	for (let i = 0; i < 7 + Math.round(density * 6); i++) {
		out.push(circle(rand.range(-104, 104), rand.range(-64, 34), 1.1, filled(i % 2 === 0 ? p.secondary : p.gold, 0.35)));
	}
	if (variant === 2) {
		out.push(path('M -110 30 Q -62 8 -12 22 Q 44 36 112 14', stroke(p.ember, 1, 0.3)));
	}
	return out;
}

function labyrinthScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'labyrinth');
	const out = [];
	for (let i = 0; i < 4; i++) {
		const inset = 18 + i * 18;
		out.push(rect(-132 + inset, -74 + inset, 264 - inset * 2, 148 - inset * 2, { fill: 'none', stroke: i % 2 === 0 ? p.primary : p.secondary, sw: 1.1, opacity: 0.2 }));
	}
	for (let i = 0; i < 8; i++) {
		const x = -120 + i * 34;
		out.push(line(x, -74, x, -38, stroke(p.primary, 1.2, 0.18)));
		out.push(line(x + 12, 38, x + 12, 74, stroke(p.primary, 1.2, 0.16)));
	}
	out.push(path('M -140 56 L -64 56 L -64 12 L 0 12 L 0 42 L 72 42 L 72 -20 L 18 -20 L 18 6', { ...stroke(p.gold, 1.4, 0.55), dash: '4 5' }));
	out.push(...subjectAt(context, subject, { y: -2, scale: 0.96 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -112, y: -42, scale: 0.72 },
		{ x: 112, y: 40, scale: 0.72 },
		{ x: 0, y: -68, scale: 0.5 }
	], 0.48));
	for (let i = 0; i < 6 + Math.round(density * 5); i++) {
		out.push(circle(rand.range(-126, 126), rand.range(-70, 64), 1.1, filled(i % 2 === 0 ? p.secondary : p.gold, 0.3)));
	}
	if (variant === 2) {
		out.push(circle(-96, 0, 2.4, filled(p.gold, 0.7)));
		out.push(path('M -96 0 Q -54 -30 -18 -10 Q 18 12 54 -8 Q 82 -24 112 -4', stroke(p.secondary, 1.2, 0.4)));
	}
	return out;
}

function knotScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'knot');
	const out = [];
	for (let i = 0; i < 4 + variant; i++) {
		const y = -56 + i * 24;
		out.push(path(`M -144 ${n(y)} Q -96 ${n(y - 24)} -48 ${n(y)} Q 0 ${n(y + 24)} 48 ${n(y)} Q 96 ${n(y - 24)} 144 ${n(y)}`, stroke(i % 2 === 0 ? p.primary : p.secondary, 1.3, 0.18)));
	}
	out.push(...subjectAt(context, subject, { y: -2, scale: 1.08 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -116, y: 36, scale: 0.8 },
		{ x: 116, y: 36, scale: 0.8 },
		{ x: 0, y: -66, scale: 0.55 }
	], 0.5));
	for (let i = 0; i < 8 + Math.round(density * 6); i++) {
		out.push(circle(rand.range(-126, 126), rand.range(-70, 60), 1.1, filled(i % 3 === 0 ? p.gold : p.secondary, 0.35)));
	}
	if (variant === 1) {
		out.push(path('M -110 -30 Q -58 -58 0 -30 Q 58 -2 110 -30', stroke(p.tertiary, 1, 0.3)));
	}
	return out;
}

function hourglassScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'hourglass');
	const out = [
		path('M -64 -76 L 64 -76 L 24 0 L 64 76 L -64 76 L -24 0 Z', { fill: 'none', stroke: p.primary, sw: 1.3, opacity: 0.25 }),
		path('M -48 -64 Q -42 -12 0 0 Q 42 12 48 64', { ...stroke(p.secondary, 1, 0.18), dash: '3 6' }),
		line(-76, -76, 76, -76, stroke(p.woodDark, 3, 0.25)),
		line(-76, 76, 76, 76, stroke(p.woodDark, 3, 0.25))
	];
	out.push(...subjectAt(context, subject, { y: -2, scale: 1.03 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -108, y: -14, scale: 0.8 },
		{ x: 108, y: -14, scale: 0.8 },
		{ x: 0, y: 62, scale: 0.55 }
	], 0.5));
	for (let i = 0; i < 8 + Math.round(density * 7); i++) {
		out.push(circle(rand.range(-48, 48), rand.range(-26, 54), 0.9 + rand() * 0.8, filled(i % 3 === 0 ? p.gold : p.secondary, 0.4)));
	}
	if (variant === 1) {
		out.push(path('M -142 66 Q -80 52 -20 66 Q 40 80 142 60', stroke(p.primary, 1, 0.25)));
	}
	return out;
}

function cycleScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'cycle');
	const out = [];
	const radius = 58;
	for (let i = 0; i < 3; i++) {
		const start = 20 + i * 120;
		out.push(arcPath(0, 0, radius, start, start + 88, stroke(i % 2 === 0 ? p.primary : p.secondary, 1.6, 0.45)));
		const angle = ((start + 88) * Math.PI) / 180;
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;
		out.push(polygon([[x, y], [x + 8, y - 8], [x - 8, y - 6]], { fill: i % 2 === 0 ? p.primary : p.secondary, opacity: 0.6 }));
	}
	out.push(...subjectAt(context, subject, { y: -2, scale: 1.02 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -104, y: -38, scale: 0.76 },
		{ x: 104, y: -38, scale: 0.76 },
		{ x: 0, y: 62, scale: 0.55 }
	], 0.5));
	for (let i = 0; i < 4 + variant; i++) {
		const angle = (i / (4 + variant)) * Math.PI * 2;
		out.push(circle(Math.cos(angle) * 78, Math.sin(angle) * 48, 2.2, filled(i % 2 === 0 ? p.gold : p.secondary, 0.55)));
	}
	sparkField(out, rand, 6 + Math.round(density * 5), [-120, -60, 120, 60], [p.secondary, p.gold, p.tertiary], 1);
	if (variant === 2) out.push(ellipse(0, 0, 94, 54, { ...stroke(p.primary, 0.9, 0.18), dash: '2 7' }));
	return out;
}

function decayScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'ruin');
	const out = [
		line(-150, 66, 150, 66, stroke(p.soft, 1.2)),
		ellipse(0, 68, 106, 7, { fill: p.stoneDark, opacity: 0.12 })
	];
	for (let i = 0; i < 4; i++) {
		const x = -112 + i * 62;
		out.push(rect(x, -24 + (i % 2) * 12, 12, 90 - (i % 2) * 12, { fill: p.stoneDark, opacity: 0.18, stroke: p.primary, sw: 0.8 }));
	}
	out.push(path('M -120 20 Q -86 -10 -54 18 Q -18 46 18 14 Q 54 -18 92 10 Q 116 28 142 10', stroke(p.stone, 1.2, 0.18)));
	out.push(...subjectAt(context, subject, { y: -2, scale: 1.04 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -110, y: 38, scale: 0.78 },
		{ x: 110, y: 38, scale: 0.78 },
		{ x: 0, y: -66, scale: 0.54 }
	], 0.5));
	for (let i = 0; i < 9 + Math.round(density * 7); i++) {
		const x = rand.range(-120, 120);
		const y = rand.range(-60, 58);
		const size = rand.range(1.2, 3.6);
		out.push(polygon([[x, y], [x + size, y - size * 0.7], [x + size * 1.5, y + size * 0.4]], { fill: i % 3 === 0 ? p.gold : p.stone, opacity: 0.22 }));
	}
	if (variant === 1) {
		out.push(path('M -126 54 Q -90 40 -54 54 Q -18 68 18 52 Q 54 36 88 52 Q 112 62 134 50', stroke(p.foliage, 1, 0.28)));
	}
	if (variant === 2) out.push(circle(-92, -56, 12, { fill: p.secondary, opacity: 0.08 }));
	return out;
}

function growthScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'sprout');
	const out = [
		rect(-160, 34, 320, 56, { fill: p.woodDark, opacity: 0.14 }),
		line(-160, 34, 160, 34, stroke(p.primary, 1.3, 0.5)),
		ellipse(0, 34, 118, 7, { fill: p.wood, opacity: 0.1 }),
		circle(102, -54, 16, { fill: p.gold, opacity: 0.18, stroke: p.primary, sw: 0.8 })
	];
	const stages = 3 + variant;
	for (let i = 0; i < stages; i++) {
		const x = -124 + (i / Math.max(stages - 1, 1)) * 248;
		const height = 16 + i * 12;
		out.push(line(x, 34, x, 34 - height, stroke(p.foliageDark, 1.7, 0.4)));
		out.push(ellipse(x - 6, 34 - height + 5, 6, 3, { fill: p.foliage, opacity: 0.35, rot: -24 }));
		if (i > 0) out.push(ellipse(x + 6, 34 - height + 12, 6, 3, { fill: p.foliage, opacity: 0.3, rot: 24 }));
	}
	for (let i = 0; i < 5; i++) {
		out.push(path(`M ${n(-120 + i * 58)} 34 Q ${n(-114 + i * 58)} 52 ${n(-126 + i * 58)} 70`, stroke(p.wood, 0.9, 0.25)));
	}
	out.push(...subjectAt(context, subject, { y: -10, scale: 1.02 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -104, y: 8, scale: 0.76 },
		{ x: 104, y: 8, scale: 0.76 },
		{ x: 0, y: 60, scale: 0.55 }
	], 0.5));
	sparkField(out, rand, 6 + Math.round(density * 6), [-120, -68, 120, 24], [p.gold, p.secondary, p.foliage], 1);
	if (variant === 2) {
		out.push(path('M -136 20 Q -60 -2 0 18 Q 64 36 136 10', stroke(p.primary, 1, 0.22)));
	}
	return out;
}

function transformationScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'butterfly');
	const out = [
		rect(-160, -90, 160, 180, { fill: p.primary, opacity: 0.035 }),
		rect(0, -90, 160, 180, { fill: p.secondary, opacity: 0.035 }),
		line(0, -82, 0, 82, { ...stroke(p.primary, 1, 0.2), dash: '4 6' })
	];
	for (let i = 0; i < 5; i++) {
		const y = -58 + i * 28;
		out.push(path(`M -150 ${n(y)} Q -100 ${n(y - 18)} -52 ${n(y)}`, stroke(p.primary, 1, 0.16)));
		out.push(path(`M 52 ${n(y)} Q 100 ${n(y + 18)} 150 ${n(y)}`, stroke(p.secondary, 1, 0.16)));
	}
	out.push(path('M -112 54 Q -54 16 0 0 Q 54 -16 112 54', { ...stroke(p.gold, 1.5, 0.55), dash: '5 5' }));
	out.push(polygon([[112, 54], [96, 38], [108, 32]], { fill: p.gold, opacity: 0.7 }));
	out.push(...subjectAt(context, subject, { y: -2, scale: 1.1 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -108, y: 30, scale: 0.8 },
		{ x: 108, y: 30, scale: 0.8 },
		{ x: 0, y: -66, scale: 0.55 }
	], 0.5));
	sparkField(out, rand, 7 + Math.round(density * 6), [-120, -70, 120, 60], [p.gold, p.secondary, p.tertiary], 1.1);
	if (variant === 1) {
		out.push(circle(-70, -42, 18, { fill: p.primary, opacity: 0.08, stroke: p.primary, sw: 0.8 }));
		out.push(circle(70, -42, 18, { fill: p.secondary, opacity: 0.08, stroke: p.secondary, sw: 0.8 }));
	}
	return out;
}

function throneScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'throne');
	const out = [
		rect(-128, -76, 256, 142, { fill: p.primary, opacity: 0.035, stroke: p.primary, sw: 1, ...{ opacity: 0.3 } }),
		line(-128, -76, 128, -76, stroke(p.primary, 1.2, 0.35)),
		rect(-136, 58, 272, 8, { fill: p.stoneDark, opacity: 0.32, stroke: p.primary, sw: 1 }),
		rect(-116, 66, 232, 8, { fill: p.stoneDark, opacity: 0.24, stroke: p.primary, sw: 1 })
	];
	for (let i = 0; i < 3 + variant; i++) {
		const x = -110 + i * (220 / Math.max(2 + variant, 1));
		out.push(rect(x, -58, 10, 116, { fill: p.stoneDark, opacity: 0.2, stroke: p.primary, sw: 0.9 }));
		out.push(line(x + 3, -50, x + 3, 52, stroke(p.primary, 0.7, 0.25)));
	}
	out.push(...subjectAt(context, subject, { y: -4, scale: 1.08 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -104, y: 24, scale: 0.8 },
		{ x: 104, y: 24, scale: 0.8 },
		{ x: 0, y: -66, scale: 0.55 }
	], 0.5));
	sparkField(out, rand, 7 + Math.round(density * 6), [-114, -68, 114, 50], [p.gold, p.secondary, p.tertiary], 1.1);
	if (variant === 1) {
		out.push(path('M -124 -60 Q -80 -82 -36 -60 M 124 -60 Q 80 -82 36 -60', stroke(p.gold, 1, 0.3)));
	}
	return out;
}

function templeScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'temple');
	const out = [
		line(-150, 72, 150, 72, stroke(p.soft, 1.2)),
		rect(-142, 64, 284, 8, { fill: p.stoneDark, opacity: 0.24, stroke: p.primary, sw: 1 }),
		rect(-124, 56, 248, 8, { fill: p.stoneDark, opacity: 0.2, stroke: p.primary, sw: 1 }),
		polygon([[-120, -58], [0, -82], [120, -58]], { fill: p.stone, opacity: 0.14, stroke: p.primary, sw: 1.2 }),
		rect(-112, -58, 224, 8, { fill: p.stoneDark, opacity: 0.18, stroke: p.primary, sw: 1 })
	];
	const columns = 4 + variant;
	for (let i = 0; i < columns; i++) {
		const x = -104 + (i / Math.max(columns - 1, 1)) * 208;
		out.push(rect(x - 5, -48, 10, 104, { fill: p.stone, opacity: 0.14, stroke: p.primary, sw: 0.9 }));
		out.push(line(x - 1, -42, x - 1, 48, stroke(p.primary, 0.7, 0.2)));
	}
	out.push(...subjectAt(context, subject, { y: -2, scale: 1 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -108, y: 34, scale: 0.76 },
		{ x: 108, y: 34, scale: 0.76 },
		{ x: 0, y: -70, scale: 0.54 }
	], 0.5));
	sparkField(out, rand, 6 + Math.round(density * 6), [-110, -64, 110, 44], [p.gold, p.secondary, p.stone], 1);
	if (variant === 1) {
		out.push(path('M -92 -80 Q -54 -96 -18 -80 M 92 -80 Q 54 -96 18 -80', stroke(p.secondary, 1, 0.3)));
	}
	if (variant === 2) {
		out.push(path('M -44 56 L -44 12 Q 0 -14 44 12 L 44 56 Z', { fill: p.primary, opacity: 0.08, stroke: p.primary, sw: 1 }));
	}
	return out;
}

function ritualScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'altar');
	const out = [
		line(-150, 70, 150, 70, stroke(p.soft, 1.1)),
		rect(-140, 42, 280, 28, { fill: p.stoneDark, opacity: 0.18, stroke: p.primary, sw: 1 }),
		rect(-152, 36, 304, 8, { fill: p.stone, opacity: 0.14, stroke: p.primary, sw: 1 }),
		circle(0, 0, 58, { ...stroke(p.gold, 0.9, 0.14), dash: '2 7' })
	];
	for (let i = 0; i < 5 + variant; i++) {
		const x = -112 + (i / Math.max(4 + variant, 1)) * 224;
		const height = 10 + (i % 3) * 8;
		out.push(rect(x - 4, 36 - height, 8, height, { fill: p.paper, opacity: 0.24, stroke: p.primary, sw: 0.8 }));
		out.push(circle(x, 32 - height, 2.2, { fill: p.ember, opacity: 0.65, stroke: p.gold, sw: 0.6 }));
	}
	out.push(...subjectAt(context, subject, { y: -8, scale: 1.04 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -104, y: 14, scale: 0.76 },
		{ x: 104, y: 14, scale: 0.76 },
		{ x: 0, y: -68, scale: 0.54 }
	], 0.5));
	for (let i = 0; i < 10 + Math.round(density * 8); i++) {
		out.push(circle(rand.range(-80, 80), rand.range(-78, 28), rand.range(0.8, 1.7), filled(i % 2 === 0 ? p.gold : p.secondary, 0.4)));
	}
	if (variant === 1) {
		out.push(path('M -90 -64 Q -48 -82 0 -66 Q 48 -50 90 -68', stroke(p.primary, 1, 0.25)));
	}
	if (variant === 2) {
		out.push(ellipse(0, 38, 64, 6, { fill: p.gold, opacity: 0.16 }));
	}
	return out;
}

function silhouetteScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'figure');
	const out = [
		circle(0, -6, 44 + variant * 4, { fill: p.gold, opacity: 0.16, stroke: p.primary, sw: 0.8 }),
		circle(0, -6, 32 + variant * 3, { fill: p.gold, opacity: 0.24 }),
		line(-150, 54, 150, 54, stroke(p.primary, 1.1, 0.4)),
		ellipse(0, 56, 118, 6, { fill: p.primary, opacity: 0.1 })
	];
	for (let i = 0; i < 6 + variant; i++) {
		const x = -132 + (i / Math.max(5 + variant, 1)) * 264;
		const s = 0.38 + ((i * 5) % 4) * 0.06;
		out.push(circle(x, 50 - 38 * s, 6 * s, { fill: p.faint, opacity: 0.4 }));
		out.push(path(`M ${n(x - 8 * s)} 54 L ${n(x - 6 * s)} ${n(50 - 30 * s)} L ${n(x + 6 * s)} ${n(50 - 30 * s)} L ${n(x + 8 * s)} 54 Z`, { fill: p.faint, opacity: 0.32 }));
	}
	out.push(...subjectAt(context, subject, { y: -2, scale: 1.12 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -110, y: 30, scale: 0.78 },
		{ x: 110, y: 30, scale: 0.78 },
		{ x: 0, y: -66, scale: 0.54 }
	], 0.5));
	sparkField(out, rand, 6 + Math.round(density * 6), [-120, -64, 120, 36], [p.gold, p.secondary, p.snow], 1);
	if (variant === 1) {
		out.push(path('M -128 44 L -96 38 L -64 44 L -32 38 L 0 44 L 32 38 L 64 44 L 96 38 L 128 44', stroke(p.primary, 1, 0.25)));
	}
	return out;
}

function snowfieldScene(context) {
	const { palette: p, rand, variant, density, family } = context;
	const subject = resolveSubject(context, 'snowflake');
	const out = [
		// Obloha a obzor — žádné hory, jen otevřená pláň.
		line(-150, 54, 150, 54, stroke(p.primary, 1, 0.35)),
		ellipse(0, 58, 132, 9, { fill: p.snow, opacity: 0.07 })
	];

	// Vrstvy závějí
	for (let i = 0; i < 3 + variant; i++) {
		const y = 58 + i * 7;
		out.push(
			path(
				`M -150 ${n(y)} Q -90 ${n(y - 14 - i * 2)} -30 ${n(y)} Q 30 ${n(y - 10 + i * 2)} 90 ${n(y)} Q 122 ${n(y - 6)} 150 ${n(y)}`,
				stroke(i === 0 ? p.snow : p.primary, 1.1, i === 0 ? 0.35 : 0.18)
			)
		);
	}

	// Dvě tiché mraky nad krajinou
	for (const [cx, cy, s] of [
		[-92, -46, 1],
		[98, -54, 0.82]
	]) {
		out.push(
			path(
				`M ${n(cx - 30 * s)} ${n(cy)} Q ${n(cx - 26 * s)} ${n(cy - 16 * s)} ${n(cx - 6 * s)} ${n(cy - 13 * s)} Q ${n(cx + 8 * s)} ${n(cy - 24 * s)} ${n(cx + 24 * s)} ${n(cy - 11 * s)} Q ${n(cx + 36 * s)} ${n(cy - 8 * s)} ${n(cx + 30 * s)} ${n(cy)} Z`,
				{ fill: p.snow, opacity: 0.12, stroke: p.primary, sw: 1 }
			)
		);
	}

	// Vítr — šikmé poryvy, které nesou sníh
	for (let i = 0; i < 3 + Math.round(density * 2); i++) {
		const x = rand.range(-120, 70);
		const y = rand.range(-32, 26);
		const len = rand.range(26, 64);
		out.push(line(x, y, x + len, y + len * 0.16, stroke(i % 2 === 0 ? p.secondary : p.snow, 1, i % 2 === 0 ? 0.35 : 0.25)));
	}

	out.push(...subjectAt(context, subject, { y: -1, scale: 1.02 + density * 0.08 }));
	out.push(...placeSupports(context, [
		{ x: -112, y: 34, scale: 0.7 },
		{ x: 112, y: 30, scale: 0.7, flip: true }
	], 0.48));

	// Padající vločky
	sparkField(out, rand, 10 + Math.round(density * 10), [-138, -70, 138, 60], [p.snow, p.secondary, p.primary], 1.15);
	if (variant === 2) {
		out.push(path('M -132 -70 Q -60 -38 0 -70 Q 60 -38 132 -70', stroke(p.secondary, 1.2, 0.22)));
	}
	return out;
}

const BASE_SYMBOLIC_FAMILIES = [
	{ key: 'flame', label: 'Oheň', note: 'živly, energie, obřad, spalování', defaultSubject: 'flame', build: flameRitual },
	{ key: 'storm', label: 'Bouře', note: 'počasí, elektřina, vítr, déšť', defaultSubject: 'lightning', build: stormScene },
	{ key: 'celestial', label: 'Nebeská tělesa', note: 'slunce, měsíc, hvězdy, zatmění', defaultSubject: 'sun', build: celestialScene },
	{ key: 'bloom', label: 'Rozkvět', note: 'květy, rostliny, krása', defaultSubject: 'flower', build: bloomScene },
	{ key: 'undergrowth', label: 'Podhoubí', note: 'houby, kořeny, půda', defaultSubject: 'mushroom', build: undergrowthScene },
	{ key: 'canopy', label: 'Koruna', note: 'větve, listy, les, ptáci', defaultSubject: 'branch', build: canopyScene },
	{ key: 'peak', label: 'Vrchol', note: 'hory, ledovce, krajina', defaultSubject: 'mountain', build: peakScene },
	{ key: 'snowfield', label: 'Sněhová pláň', note: 'sníh, led, mráz, polární poušť', defaultSubject: 'snowflake', build: snowfieldScene },
	{ key: 'clash', label: 'Střet', note: 'konflikt, souboj, protilehlé síly', defaultSubject: 'sword', build: clashScene },
	{ key: 'rupture', label: 'Zlom', note: 'prasklina, exploze, rozpad', defaultSubject: 'crack', build: ruptureScene },
	{ key: 'armory', label: 'Zbrojnice', note: 'zbraně, štíty, rytířství', defaultSubject: 'shield', build: armoryScene },
	{ key: 'crowd', label: 'Dav', note: 'lidé, společnost, veřejnost', defaultSubject: 'crowd', build: crowdScene },
	{ key: 'gaze', label: 'Pohled', note: 'oko, maska, pozorování', defaultSubject: 'eye', build: gazeScene },
	{ key: 'heart', label: 'Srdce', note: 'láska, emoce, vášeň', defaultSubject: 'heart', build: heartScene },
	{ key: 'labyrinth', label: 'Labyrint', note: 'hledání, složitost, bludiště', defaultSubject: 'labyrinth', build: labyrinthScene },
	{ key: 'knot', label: 'Uzel', note: 'propletení, problém, spojení', defaultSubject: 'knot', build: knotScene },
	{ key: 'hourglass', label: 'Přesýpací hodiny', note: 'čas, odpočet, pomíjivost', defaultSubject: 'hourglass', build: hourglassScene },
	{ key: 'cycle', label: 'Cyklus', note: 'opakování, období, návrat', defaultSubject: 'cycle', build: cycleScene },
	{ key: 'decay', label: 'Zánik', note: 'trosky, úpadek, rozklad', defaultSubject: 'ruin', build: decayScene },
	{ key: 'growth', label: 'Růst', note: 'klíčení, vývoj, naděje', defaultSubject: 'sprout', build: growthScene },
	{ key: 'transformation', label: 'Proměna', note: 'metamorfóza, identita, zvrat', defaultSubject: 'butterfly', build: transformationScene },
	{ key: 'throne', label: 'Trůn', note: 'moc, autorita, panovník', defaultSubject: 'throne', build: throneScene },
	{ key: 'temple', label: 'Chrám', note: 'víra, civilizace, posvátno', defaultSubject: 'temple', build: templeScene },
	{ key: 'ritual', label: 'Obřad', note: 'oltář, svíčky, oběť', defaultSubject: 'altar', build: ritualScene },
	{ key: 'silhouette', label: 'Silueta', note: 'jedinec, svědek, gesto', defaultSubject: 'figure', build: silhouetteScene }
];

export const SYMBOLIC_FAMILIES = BASE_SYMBOLIC_FAMILIES.map((family) => ({
	...family,
	subjects: Object.values(MOTIF_BY_KEY)
		.filter((motif) => motif.role !== 'support' && motif.families.includes(family.key))
		.map((motif) => motif.key),
	supports: supportsForFamily(family.key)
}));
