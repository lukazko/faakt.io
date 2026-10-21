/**
 * Symbolické motivy pro rozšířené rodiny.
 *
 * Drží stejná pravidla jako `motifs.js`: lokální souřadnice kolem počátku,
 * jen existující primitiva, žádný text ani externí assety. Motivy jsou
 * záměrně rozpoznatelné siluety — plamen, meč, oko, hodiny — aby ilustrace
 * nesplynuly v abstraktní dekoraci.
 */

import { arcPath, circle, ellipse, line, n, path, polygon, polyline, rect, tick } from './primitives.js';

const stroke = (color, sw = 1.5, opacity = 1) => ({
	fill: 'none',
	stroke: color,
	sw,
	opacity,
	linecap: 'round',
	linejoin: 'round'
});

const filled = (color, opacity = 1) => ({ fill: color, opacity });

/** Pravidelná hvězda jako polygon — používá se pro záři a pečetě. */
function starPoints(cx, cy, outer, inner, count = 5, rotation = -Math.PI / 2) {
	const points = [];
	for (let i = 0; i < count * 2; i++) {
		const radius = i % 2 === 0 ? outer : inner;
		const angle = rotation + (i / (count * 2)) * Math.PI * 2;
		points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
	}
	return points;
}

// --- Živly a energie -------------------------------------------------------

function flame({ palette: p, rand }) {
	const out = [
		ellipse(0, 45, 30, 5, { fill: p.ember, opacity: 0.18 }),
		path(
			'M 0 46 C -26 30 -24 12 -10 -6 C -8 8 -2 12 2 2 C 10 14 16 24 12 34 C 26 26 24 8 14 -2 C 34 14 38 34 22 46 Q 10 52 0 46 Z',
			{ fill: p.emberDark, fillOpacity: 0.8, stroke: p.primary, sw: 1.5, linejoin: 'round' }
		),
		path(
			'M 0 36 C -12 24 -8 12 0 2 C 2 12 8 16 8 24 C 14 18 14 8 8 0 C 20 14 20 30 10 38 Q 4 42 0 36 Z',
			{ fill: p.ember, opacity: 0.85, stroke: p.gold, sw: 1 }
		),
		path('M 0 30 C -4 22 -2 16 2 12 C 6 18 6 26 2 30 Z', filled(p.gold, 0.9)),
		ellipse(0, 46, 12, 2.6, filled(p.gold, 0.65))
	];
	for (let i = 0; i < 5; i++) {
		out.push(
			circle(rand.range(-24, 24), rand.range(-34, 22), rand.range(1, 2.2), {
				fill: i % 2 === 0 ? p.gold : p.secondary,
				opacity: 0.55 + rand() * 0.35
			})
		);
	}
	return out;
}

function torch({ palette: p }) {
	return [
		line(10, 44, -4, 2, { stroke: p.woodDark, sw: 6, linecap: 'round' }),
		line(10, 44, -4, 2, { stroke: p.wood, sw: 3, linecap: 'round' }),
		line(-9, 12, 4, 8, stroke(p.primary, 3, 0.8)),
		path('M -14 -2 L 6 -6 L 12 8 L -8 12 Z', {
			fill: p.metalDark,
			stroke: p.primary,
			sw: 1.3,
			linejoin: 'round'
		}),
		path('M -2 2 C -18 -10 -14 -26 -4 -36 C -4 -24 2 -20 6 -28 C 14 -16 16 -2 8 6 Q 3 10 -2 2 Z', {
			fill: p.ember,
			opacity: 0.72,
			stroke: p.gold,
			sw: 1.2
		}),
		path('M 0 -4 C -6 -12 -4 -20 0 -26 C 4 -18 6 -10 3 -4 Z', filled(p.gold, 0.9)),
		arcPath(0, -12, 24, 210, 330, stroke(p.secondary, 1.2, 0.35))
	];
}

function volcano({ palette: p, rand }) {
	const out = [
		polygon(
			[
				[-58, 40],
				[-26, -18],
				[-12, -12],
				[0, -2],
				[12, -12],
				[26, -18],
				[58, 40]
			],
			{ fill: p.stoneDark, stroke: p.primary, sw: 1.4, linejoin: 'round' }
		),
		polygon(
			[
				[-26, -18],
				[-14, -10],
				[-12, -2],
				[0, -4],
				[12, -2],
				[14, -10],
				[26, -18],
				[18, 6],
				[-18, 6]
			],
			{ fill: p.emberDark, opacity: 0.75, stroke: p.primary, sw: 1 }
		),
		path('M -8 -2 Q -20 18 -30 40 M 6 -2 Q 4 20 18 40 M 0 -4 Q 0 18 -4 40', stroke(p.ember, 2.2, 0.85)),
		polygon([[-26, -18], [-12, -12], [-18, -8], [-30, -12]], filled(p.gold, 0.55)),
		circle(44, -26, 9, { fill: p.stone, opacity: 0.28 }),
		circle(50, -38, 6, { fill: p.stone, opacity: 0.2 }),
		circle(-46, -28, 7, { fill: p.stone, opacity: 0.18 })
	];
	for (let i = 0; i < 4; i++) {
		out.push(circle(rand.range(-28, 24), rand.range(6, 36), rand.range(1, 2), filled(p.gold, 0.55)));
	}
	return out;
}

function candle({ palette: p }) {
	return [
		ellipse(0, 40, 22, 4, { fill: p.primary, opacity: 0.12 }),
		path('M 22 40 L 14 10 L -14 10 L -22 40 Z', {
			fill: p.goldDark,
			fillOpacity: 0.55,
			stroke: p.primary,
			sw: 1.3,
			linejoin: 'round'
		}),
		rect(-10, -6, 20, 38, { rx: 2, fill: p.paper, fillOpacity: 0.55, stroke: p.primary, sw: 1.2 }),
		path('M -10 -2 Q -14 8 -10 16 Q -6 10 -8 2 Z M 10 -2 Q 14 8 10 18 Q 6 10 8 2 Z', filled(p.paper, 0.7)),
		line(0, -6, 0, -12, { stroke: p.woodDark, sw: 2 }),
		path('M 0 -12 C -8 -20 -6 -32 0 -38 C 6 -30 8 -20 0 -12 Z', {
			fill: p.ember,
			opacity: 0.8,
			stroke: p.gold,
			sw: 1.1
		}),
		path('M 0 -18 C -3 -24 -1 -30 0 -33 C 3 -28 3 -22 0 -18 Z', filled(p.gold, 0.95)),
		arcPath(0, -20, 18, 208, 332, stroke(p.secondary, 1, 0.35))
	];
}

function lightning({ palette: p }) {
	return [
		polygon(
			[
				[-4, -50],
				[20, -12],
				[5, -8],
				[20, 18],
				[7, 16],
				[18, 50],
				[-16, 6],
				[-2, 2],
				[-22, -24]
			],
			{ fill: p.gold, fillOpacity: 0.55, stroke: p.primary, sw: 1.4, linejoin: 'round' }
		),
		polyline(
			[
				[-4, -42],
				[10, -12],
				[0, -7],
				[12, 12],
				[4, 34]
			],
			{ ...stroke(p.snow, 1.4, 0.75), linejoin: 'round' }
		),
		path('M 18 -12 L 38 -22 M 20 18 L 42 14 M -16 6 L -36 14', stroke(p.primary, 1.2, 0.45)),
		arcPath(0, 0, 34, 215, 325, { ...stroke(p.secondary, 1, 0.25), dash: '3 7' })
	];
}

function cloud({ palette: p, rand }) {
	const out = [
		path(
			'M -52 8 Q -56 -12 -36 -16 Q -32 -34 -10 -32 Q 6 -42 20 -26 Q 42 -28 48 -8 Q 60 -2 52 12 Q 38 22 20 18 L -38 20 Q -52 20 -52 8 Z',
			{ fill: p.stone, fillOpacity: 0.4, stroke: p.primary, sw: 1.4, linejoin: 'round' }
		),
		path('M -30 -18 Q -6 -28 12 -18 Q 28 -26 38 -14', stroke(p.snow, 1.2, 0.35)),
		circle(-20, 4, 8, { fill: p.stoneDark, opacity: 0.24 }),
		circle(18, 2, 10, { fill: p.stoneDark, opacity: 0.18 })
	];
	for (let i = 0; i < 3; i++) {
		out.push(line(-30 + i * 22, 28, -36 + i * 22, 42, stroke(p.water, 1.3, 0.55)));
	}
	out.push(circle(rand.range(-24, 28), rand.range(-16, 6), 1.4, filled(p.secondary, 0.6)));
	return out;
}

function wind({ palette: p }) {
	return [
		path('M -56 -22 Q -18 -38 18 -18 Q 42 -6 54 -18', stroke(p.primary, 2, 0.8)),
		path('M -54 0 Q -14 -12 20 4 Q 44 14 56 2', stroke(p.secondary, 1.6, 0.65)),
		path('M -48 24 Q -12 12 18 26 Q 38 34 50 26', stroke(p.tertiary, 1.2, 0.5)),
		path('M 26 -20 Q 40 -24 44 -12 Q 46 -2 34 -2 Q 26 -2 26 -10', stroke(p.primary, 1.4, 0.65)),
		path('M -26 8 Q -14 2 -10 10 Q -8 18 -18 18', stroke(p.secondary, 1.2, 0.55)),
		circle(-34, -8, 2, filled(p.gold, 0.7)),
		circle(42, 16, 1.6, filled(p.foliage, 0.7))
	];
}

function rain({ palette: p, rand }) {
	const out = [
		path('M -50 -30 Q -48 -48 -28 -48 Q -20 -60 0 -52 Q 18 -62 30 -46 Q 50 -42 48 -26 Q 34 -16 16 -20 L -34 -18 Q -50 -18 -50 -30 Z', {
			fill: p.stoneDark,
			fillOpacity: 0.6,
			stroke: p.primary,
			sw: 1.3
		}),
		ellipse(0, 44, 44, 5, { fill: p.water, opacity: 0.18 })
	];
	for (let i = 0; i < 14; i++) {
		const x = -44 + i * 7;
		const y = -8 + rand() * 20 + (i % 3) * 6;
		out.push(line(x, y, x - 5, y + 20, { stroke: p.water, sw: 1.4, opacity: 0.45 + rand() * 0.35 }));
	}
	out.push(ellipse(-10, 42, 18, 3, { ...stroke(p.water, 1, 0.45), dash: '3 4' }));
	out.push(ellipse(20, 38, 12, 2.4, { ...stroke(p.water, 1, 0.3), dash: '2 4' }));
	return out;
}

// --- Nebe a kosmos ---------------------------------------------------------

function sun({ palette: p }) {
	const out = [];
	for (let i = 0; i < 12; i++) {
		const angle = (i / 12) * Math.PI * 2;
		const inner = 28;
		const outer = i % 3 === 0 ? 48 : 39;
		out.push(
			line(Math.cos(angle) * inner, Math.sin(angle) * inner, Math.cos(angle) * outer, Math.sin(angle) * outer, {
				stroke: i % 3 === 0 ? p.gold : p.secondary,
				sw: i % 3 === 0 ? 2 : 1.2,
				opacity: i % 3 === 0 ? 0.9 : 0.55,
				linecap: 'round'
			})
		);
	}
	out.push(circle(0, 0, 26, { fill: p.gold, opacity: 0.28, stroke: p.primary, sw: 1.5 }));
	out.push(circle(0, 0, 18, { fill: p.gold, opacity: 0.65 }));
	out.push(circle(0, 0, 9, { fill: p.snow, opacity: 0.75 }));
	out.push(circle(0, 0, 44, { ...stroke(p.secondary, 1, 0.2), dash: '2 6' }));
	out.push(circle(-12, -10, 3, filled(p.secondary, 0.3)));
	return out;
}

function moon({ palette: p, rand }) {
	const out = [
		path('M 4 -40 A 40 40 0 1 0 4 40 A 31 31 0 1 1 4 -40 Z', {
			fill: p.paper,
			fillOpacity: 0.55,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		path('M -10 -26 A 30 30 0 0 0 -10 30', stroke(p.snow, 1.2, 0.35)),
		circle(-14, -12, 4, { fill: p.stoneDark, opacity: 0.32 }),
		circle(2, 6, 5, { fill: p.stoneDark, opacity: 0.24 }),
		circle(-18, 14, 2.6, { fill: p.stoneDark, opacity: 0.25 }),
		circle(30, -30, 1.5, filled(p.gold, 0.85)),
		circle(36, 18, 1.2, filled(p.secondary, 0.7)),
		arcPath(0, 0, 48, 120, 240, { ...stroke(p.primary, 1, 0.18), dash: '3 8' })
	];
	for (let i = 0; i < 3; i++) {
		out.push(circle(rand.range(22, 46), rand.range(-36, -18), 0.8 + rand(), filled(p.snow, 0.55)));
	}
	return out;
}

function star({ palette: p }) {
	const out = [
		polygon(starPoints(0, 0, 42, 16, 5), {
			fill: p.gold,
			fillOpacity: 0.55,
			stroke: p.primary,
			sw: 1.4,
			linejoin: 'round'
		}),
		polygon(starPoints(0, 0, 24, 9, 5), { fill: p.secondary, opacity: 0.45 }),
		circle(0, 0, 56, { ...stroke(p.primary, 1, 0.18), dash: '2 7' })
	];
	for (let i = 0; i < 4; i++) {
		const angle = (i / 4) * Math.PI * 2 + 0.4;
		out.push(
			circle(Math.cos(angle) * 52, Math.sin(angle) * 52, 1.2 + (i % 2) * 0.8, filled(i % 2 === 0 ? p.gold : p.secondary, 0.6))
		);
	}
	out.push(circle(-8, -8, 3, filled(p.snow, 0.75)));
	return out;
}

function eclipse({ palette: p }) {
	const out = [
		circle(0, 0, 34, { ...stroke(p.gold, 1.2, 0.3), dash: '2 5' }),
		circle(0, 0, 25, { fill: p.gold, opacity: 0.22 }),
		circle(0, 0, 20, { fill: '#080808', stroke: p.primary, sw: 1.6 }),
		circle(0, 0, 24, { fill: 'none', stroke: p.snow, sw: 2.2, opacity: 0.75 })
	];
	for (let i = 0; i < 12; i++) {
		const angle = (i / 12) * Math.PI * 2;
		out.push(
			line(Math.cos(angle) * 28, Math.sin(angle) * 28, Math.cos(angle) * (40 + (i % 3) * 5), Math.sin(angle) * (40 + (i % 3) * 5), {
				stroke: i % 2 === 0 ? p.gold : p.secondary,
				sw: i % 2 === 0 ? 1.4 : 0.9,
				opacity: 0.65
			})
		);
	}
	out.push(circle(-22, -20, 3, { fill: p.snow, opacity: 0.95 }));
	out.push(circle(-22, -20, 8, { fill: 'none', stroke: p.snow, sw: 1, opacity: 0.35 }));
	return out;
}

// --- Rostliny, houby a krajina --------------------------------------------

function flower({ palette: p }) {
	const out = [
		path('M 0 44 Q -8 18 0 0', stroke(p.foliageDark, 2.2, 0.9)),
		path('M -2 24 Q -22 16 -26 2 Q -10 4 -2 16 Z', { fill: p.foliage, opacity: 0.5, stroke: p.primary, sw: 1 }),
		path('M 2 16 Q 20 10 26 -4 Q 10 -2 2 8 Z', { fill: p.foliage, opacity: 0.42, stroke: p.primary, sw: 1 })
	];
	const cx = 0;
	const cy = -18;
	for (let i = 0; i < 6; i++) {
		const angle = (i / 6) * 360;
		const rad = (angle * Math.PI) / 180;
		out.push(
			ellipse(cx + Math.cos(rad) * 17, cy + Math.sin(rad) * 17, 7.5, 15, {
				fill: i % 2 === 0 ? p.secondary : p.tertiary,
				opacity: 0.55,
				stroke: p.primary,
				sw: 1,
				rot: angle + 90
			})
		);
	}
	out.push(circle(cx, cy, 9, { fill: p.gold, opacity: 0.85, stroke: p.primary, sw: 1.1 }));
	out.push(circle(cx, cy, 4, filled(p.ember, 0.75)));
	out.push(circle(cx, cy, 27, { ...stroke(p.primary, 1, 0.2), dash: '2 6' }));
	return out;
}

function petal({ palette: p }) {
	const out = [];
	for (let i = 0; i < 4; i++) {
		const angle = -60 + i * 40;
		const rad = (angle * Math.PI) / 180;
		const cx = Math.cos(rad) * 18;
		const cy = Math.sin(rad) * 18;
		out.push(
			ellipse(cx, cy, 9, 24, {
				fill: i % 2 === 0 ? p.secondary : p.tertiary,
				opacity: 0.35 + i * 0.05,
				stroke: p.primary,
				sw: 1.1,
				rot: angle + 90
			})
		);
		out.push(
			line(cx, cy - 16, cx, cy + 16, {
				stroke: p.primary,
				sw: 0.8,
				opacity: 0.4,
				transform: `rotate(${n(angle + 90)} ${n(cx)} ${n(cy)})`
			})
		);
	}
	out.push(circle(0, 0, 5, filled(p.gold, 0.8)));
	out.push(circle(-40, 34, 3, filled(p.secondary, 0.5)));
	out.push(circle(42, 28, 2.4, filled(p.tertiary, 0.45)));
	return out;
}

function seed({ palette: p }) {
	const out = [
		ellipse(0, 6, 24, 34, { fill: p.wood, fillOpacity: 0.45, stroke: p.primary, sw: 1.5, rot: -14 }),
		path('M -8 -20 Q 6 -8 10 26', stroke(p.woodDark, 1.4, 0.75)),
		path('M -16 2 Q 0 10 16 0', stroke(p.primary, 1, 0.4)),
		path('M 0 -28 Q -10 -44 -2 -54 Q 8 -46 6 -32 Z', { fill: p.foliage, opacity: 0.6, stroke: p.primary, sw: 1.1 }),
		path('M 2 -26 Q 8 -36 15 -38', stroke(p.foliageDark, 1.6, 0.8)),
		ellipse(0, 46, 34, 5, { fill: p.primary, opacity: 0.1 })
	];
	out.push(circle(-8, 12, 2.2, filled(p.gold, 0.6)));
	out.push(circle(7, 22, 1.6, filled(p.secondary, 0.5)));
	return out;
}

function mushroom({ palette: p, rand }) {
	const out = [
		ellipse(0, 44, 34, 4, { fill: p.primary, opacity: 0.1 }),
		path('M -8 38 L -6 -8 L 6 -8 L 8 38 Q 0 42 -8 38 Z', {
			fill: p.paper,
			fillOpacity: 0.6,
			stroke: p.primary,
			sw: 1.3
		}),
		path('M -40 0 Q -38 -30 0 -36 Q 38 -30 40 0 Q 22 12 0 10 Q -22 12 -40 0 Z', {
			fill: p.emberDark,
			fillOpacity: 0.75,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		path('M -30 0 Q -12 8 0 6 Q 14 8 30 0', stroke(p.primary, 1.2, 0.6)),
		circle(-18, -16, 3.2, filled(p.paper, 0.85)),
		circle(2, -24, 2.6, filled(p.paper, 0.8)),
		circle(18, -10, 2.2, filled(p.paper, 0.75)),
		line(-8, 6, -8, 34, stroke(p.primary, 0.8, 0.35)),
		line(6, 6, 6, 34, stroke(p.primary, 0.8, 0.3))
	];
	for (let i = 0; i < 3; i++) {
		out.push(circle(rand.range(-44, 40), rand.range(12, 28), 1.2, filled(p.secondary, 0.45)));
	}
	return out;
}

function roots({ palette: p, rand }) {
	const out = [
		line(-50, -34, 50, -34, stroke(p.soft, 1)),
		path('M -12 -34 L -12 -10 L -8 32 L 8 32 L 12 -10 L 12 -34 Z', {
			fill: p.wood,
			opacity: 0.55,
			stroke: p.primary,
			sw: 1.3
		}),
		path('M -10 8 Q -32 18 -38 38', stroke(p.woodDark, 2.6, 0.85)),
		path('M 10 6 Q 34 16 40 38', stroke(p.woodDark, 2.6, 0.85)),
		path('M -6 18 Q -18 30 -16 44', stroke(p.wood, 2, 0.8)),
		path('M 6 20 Q 18 32 14 44', stroke(p.wood, 2, 0.8)),
		path('M -18 26 Q -26 32 -24 40 M 18 26 Q 28 32 26 40', stroke(p.woodDark, 1.4, 0.65)),
		line(-48, 42, 48, 42, stroke(p.primary, 1, 0.2))
	];
	for (let i = 0; i < 5; i++) {
		out.push(circle(rand.range(-42, 38), rand.range(20, 42), rand.range(1, 2.2), filled(i % 2 === 0 ? p.gold : p.foliage, 0.5)));
	}
	return out;
}

function sprout({ palette: p }) {
	const out = [
		ellipse(0, 42, 40, 5, { fill: p.primary, opacity: 0.12 }),
		path('M 0 42 Q -4 16 0 -8', stroke(p.foliageDark, 2.4, 0.9)),
		path('M 0 8 Q -30 -2 -34 -24 Q -10 -26 0 0 Z', {
			fill: p.foliage,
			opacity: 0.62,
			stroke: p.primary,
			sw: 1.2
		}),
		path('M 0 -2 Q 30 -12 34 -34 Q 10 -34 0 -8 Z', {
			fill: p.foliage,
			opacity: 0.5,
			stroke: p.primary,
			sw: 1.2
		}),
		path('M 0 0 Q -10 8 -14 18 M 0 0 Q 10 8 14 18', stroke(p.primary, 1, 0.45)),
		circle(0, -10, 3.4, filled(p.gold, 0.75)),
		ellipse(0, 44, 22, 3, { fill: p.woodDark, opacity: 0.4 })
	];
	out.push(circle(-8, -6, 1.6, filled(p.snow, 0.55)));
	out.push(circle(12, 4, 1.2, filled(p.snow, 0.45)));
	return out;
}

function branch({ palette: p, rand }) {
	const out = [
		path('M -48 38 Q -14 16 6 -12 Q 20 -34 46 -44', stroke(p.woodDark, 4, 0.9)),
		path('M -18 16 Q -36 2 -42 -16 M 4 -8 Q -4 -30 -18 -40 M 24 -30 Q 38 -20 48 -22', stroke(p.wood, 2.4, 0.8))
	];
	const leaves = [
		[-36, -18, -30],
		[-24, -34, -12],
		[-8, 4, -48],
		[4, -16, -38],
		[28, -34, 24],
		[42, -40, 52],
		[-42, 4, -54]
	];
	leaves.forEach(([x, y, rot], i) => {
		out.push(
			ellipse(x, y, 7, 15, {
				fill: i % 2 === 0 ? p.foliage : p.foliageDark,
				opacity: 0.48,
				stroke: p.primary,
				sw: 1,
				rot
			})
		);
	});
	for (let i = 0; i < 3; i++) {
		out.push(circle(rand.range(-30, 36), rand.range(-36, 6), 2, filled(p.gold, 0.5)));
	}
	return out;
}

function glacier({ palette: p, rand }) {
	const out = [
		ellipse(0, 44, 56, 6, { fill: p.water, opacity: 0.18 }),
		polygon(
			[
				[-56, 40],
				[-40, -6],
				[-25, 8],
				[-10, -30],
				[4, -8],
				[20, -36],
				[38, 2],
				[52, -8],
				[58, 40]
			],
			{ fill: p.water, fillOpacity: 0.35, stroke: p.primary, sw: 1.5, linejoin: 'round' }
		),
		polygon(
			[
				[-40, -6],
				[-28, -18],
				[-22, 4],
				[-10, -30],
				[0, -12],
				[12, -22],
				[20, -36],
				[30, -14],
				[38, 2],
				[26, 8]
			],
			{ fill: p.snow, opacity: 0.55 }
		),
		path('M -26 2 L -18 16 L -24 32 M 8 -10 L 2 8 L 12 22 M 34 -4 L 28 14 L 36 30', stroke(p.snow, 1.2, 0.55)),
		path('M -48 34 Q -24 26 0 34 Q 28 26 52 34', stroke(p.waterDark, 1.4, 0.6)),
		circle(40, -34, 8, { fill: p.gold, opacity: 0.45 })
	];
	for (let i = 0; i < 4; i++) {
		out.push(circle(rand.range(-44, 44), rand.range(-30, 10), 1, filled(p.snow, 0.6)));
	}
	return out;
}

// --- Konflikt, zbraň a rozpad ---------------------------------------------

function sword({ palette: p }) {
	return [
		polygon(
			[
				[0, -52],
				[7, -40],
				[8, 10],
				[0, 22],
				[-8, 10],
				[-7, -40]
			],
			{ fill: p.metal, fillOpacity: 0.42, stroke: p.primary, sw: 1.4, linejoin: 'round' }
		),
		line(0, -44, 0, 16, stroke(p.snow, 1.2, 0.6)),
		line(-5, -34, -5, 8, stroke(p.primary, 0.8, 0.35)),
		rect(-25, 10, 50, 6, { rx: 2, fill: p.goldDark, stroke: p.primary, sw: 1.1 }),
		rect(-6, 16, 12, 22, { rx: 2, fill: p.woodDark, stroke: p.primary, sw: 1.1 }),
		line(-4, 22, 4, 22, stroke(p.gold, 1.2, 0.7)),
		line(-4, 28, 4, 28, stroke(p.gold, 1.2, 0.7)),
		circle(0, 42, 5, { fill: p.gold, stroke: p.primary, sw: 1.2 }),
		circle(0, -52, 2.4, filled(p.secondary, 0.9))
	];
}

function shield({ palette: p }) {
	return [
		path('M -34 -38 L 34 -38 L 32 -2 Q 28 26 0 44 Q -28 26 -32 -2 Z', {
			fill: p.metalDark,
			fillOpacity: 0.6,
			stroke: p.primary,
			sw: 1.6,
			linejoin: 'round'
		}),
		path('M -26 -30 L 26 -30 L 24 -2 Q 20 20 0 34 Q -20 20 -24 -2 Z', {
			fill: p.primary,
			fillOpacity: 0.15,
			stroke: p.primary,
			sw: 1
		}),
		path('M -20 -22 L 0 -4 L 20 -22 M -18 8 L 0 -4 L 18 8', stroke(p.gold, 2, 0.75)),
		circle(0, 2, 7, { fill: p.gold, stroke: p.primary, sw: 1.2 }),
		circle(0, 2, 3, filled(p.ember, 0.8)),
		circle(-22, -28, 2, filled(p.gold, 0.7)),
		circle(22, -28, 2, filled(p.gold, 0.7)),
		circle(-18, 22, 2, filled(p.gold, 0.55)),
		circle(18, 22, 2, filled(p.gold, 0.55))
	];
}

function helmet({ palette: p }) {
	return [
		path('M -32 8 Q -34 -34 -6 -40 Q 8 -46 24 -34 Q 34 -26 34 8 L 28 26 L -28 26 Z', {
			fill: p.metalDark,
			fillOpacity: 0.65,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		path('M -24 4 Q -22 -22 -4 -28 Q 14 -34 26 -20 Q 30 -8 28 8 L -24 8 Z', {
			fill: p.metal,
			opacity: 0.3
		}),
		line(-22, 6, 22, 6, stroke(p.primary, 2, 0.8)),
		line(-18, 14, -2, 14, stroke(p.primary, 1.4, 0.7)),
		line(4, 14, 20, 14, stroke(p.primary, 1.4, 0.7)),
		line(0, -2, 0, 24, stroke(p.primary, 1.4, 0.65)),
		path('M 0 -42 Q 18 -54 32 -46 Q 22 -34 8 -34 Z', { fill: p.secondary, opacity: 0.55, stroke: p.primary, sw: 1 }),
		circle(-22, 2, 2, filled(p.gold, 0.7)),
		circle(22, 2, 2, filled(p.gold, 0.7))
	];
}

function crack({ palette: p, rand }) {
	const out = [
		rect(-44, -42, 88, 84, { fill: p.stoneDark, fillOpacity: 0.22, stroke: p.primary, sw: 1.2 }),
		path('M 0 -42 L -6 -20 L 8 -8 L -4 6 L 10 22 L 2 42', {
			...stroke(p.primary, 2.4, 0.95),
			linejoin: 'round'
		}),
		path('M -6 -20 L -28 -10 L -38 -22 M 8 -8 L 30 -16 L 40 -6 M -4 6 L -24 18 L -34 12 M 10 22 L 28 32', {
			...stroke(p.primary, 1.6, 0.7),
			linejoin: 'round'
		}),
		polygon([[-44, -42], [-28, -34], [-36, -18]], { fill: p.stone, opacity: 0.3 }),
		polygon([[30, 20], [44, 10], [42, 36]], { fill: p.stone, opacity: 0.22 }),
		circle(-18, -26, 2, filled(p.secondary, 0.6)),
		circle(26, -22, 1.6, filled(p.secondary, 0.5)),
		circle(-30, 30, 1.4, filled(p.secondary, 0.4))
	];
	for (let i = 0; i < 3; i++) {
		out.push(circle(rand.range(-36, 36), rand.range(-32, 32), 1, filled(p.soft, 0.7)));
	}
	return out;
}

function explosion({ palette: p, rand }) {
	const points = starPoints(0, 0, 50, 18, 9, -Math.PI / 2);
	const out = [
		polygon(points, { fill: p.emberDark, fillOpacity: 0.7, stroke: p.primary, sw: 1.3, linejoin: 'round' }),
		polygon(starPoints(0, 0, 30, 12, 7, -Math.PI / 2 + 0.2), { fill: p.ember, opacity: 0.65 }),
		polygon(starPoints(0, 0, 16, 7, 5, -Math.PI / 2 + 0.6), { fill: p.gold, opacity: 0.8 }),
		circle(0, 0, 5, filled(p.snow, 0.7))
	];
	for (let i = 0; i < 8; i++) {
		const angle = (i / 8) * Math.PI * 2 + rand.range(-0.12, 0.12);
		const distance = 40 + rand() * 22;
		out.push(circle(Math.cos(angle) * distance, Math.sin(angle) * distance, 1.2 + rand() * 2, filled(i % 2 === 0 ? p.gold : p.secondary, 0.55)));
	}
	return out;
}

// --- Lidé, společnost a psychika ------------------------------------------

function figure({ palette: p }) {
	return [
		ellipse(0, 44, 24, 4, { fill: p.primary, opacity: 0.1 }),
		circle(0, -28, 9, { fill: p.stoneDark, stroke: p.primary, sw: 1.2 }),
		path('M -11 -18 Q 0 -24 11 -18 L 16 16 L 6 18 L 5 42 L -5 42 L -6 18 L -16 16 Z', {
			fill: p.stoneDark,
			stroke: p.primary,
			sw: 1.3,
			linejoin: 'round'
		}),
		path('M -10 -14 L -22 10 M 10 -14 L 22 10', stroke(p.stoneDark, 4, 0.9)),
		line(-8, 30, -8, 42, stroke(p.primary, 0.8, 0.35)),
		circle(2, -30, 1.2, filled(p.gold, 0.6))
	];
}

function crowd({ palette: p }) {
	const out = [line(-52, 42, 52, 42, stroke(p.soft, 1))];
	const figures = [
		{ x: -40, s: 0.72, tone: p.faint },
		{ x: -22, s: 0.9, tone: p.stoneDark },
		{ x: 0, s: 1.04, tone: p.primary },
		{ x: 22, s: 0.86, tone: p.stoneDark },
		{ x: 40, s: 0.7, tone: p.faint }
	];
	figures.forEach(({ x, s, tone }, index) => {
		const head = circle(x, 4 - 36 * s, 6.5 * s, {
			fill: index === 2 ? p.primary : tone,
			opacity: index === 2 ? 0.9 : 0.75,
			stroke: p.primary,
			sw: 0.8
		});
		const body = path(
			`M ${n(x - 8 * s)} ${n(14 - 26 * s)} Q ${n(x)} ${n(4 - 30 * s)} ${n(x + 8 * s)} ${n(14 - 26 * s)} L ${n(x + 12 * s)} 42 L ${n(x - 12 * s)} 42 Z`,
			{ fill: index === 2 ? p.primary : tone, opacity: index === 2 ? 0.85 : 0.7 }
		);
		out.push(head, body);
	});
	out.push(circle(0, -34, 2.2, filled(p.gold, 0.8)));
	return out;
}

function hand({ palette: p }) {
	return [
		path('M -24 34 Q -34 8 -24 -6 Q -16 -16 -8 -6 L -8 4 Q -16 -8 -22 0 Q -28 12 -20 34 Z', {
			fill: p.skin,
			opacity: 0.55,
			stroke: p.primary,
			sw: 1.3,
			linejoin: 'round'
		}),
		path('M -24 34 Q -30 12 -20 0 Q -10 -12 0 -4 L 0 40 L -18 42 Z', {
			fill: p.skin,
			opacity: 0.45,
			stroke: p.primary,
			sw: 1.2
		}),
		rect(-6, -38, 9, 42, { rx: 4.5, fill: p.skin, opacity: 0.5, stroke: p.primary, sw: 1.1 }),
		rect(4, -44, 9, 48, { rx: 4.5, fill: p.skin, opacity: 0.5, stroke: p.primary, sw: 1.1 }),
		rect(14, -38, 8, 42, { rx: 4, fill: p.skin, opacity: 0.48, stroke: p.primary, sw: 1.1 }),
		rect(23, -24, 7, 30, { rx: 3.5, fill: p.skin, opacity: 0.45, stroke: p.primary, sw: 1 }),
		path('M -18 18 Q -4 12 8 20 Q 16 26 14 38', stroke(p.primary, 1.1, 0.55)),
		path('M -8 40 Q 0 34 12 40', stroke(p.primary, 1, 0.4)),
		circle(-14, 26, 2, filled(p.gold, 0.7))
	];
}

function mask({ palette: p }) {
	const out = [
		path('M -34 -34 Q 0 -48 34 -34 Q 40 0 20 32 Q 2 46 -18 32 Q -38 0 -34 -34 Z', {
			fill: p.paper,
			fillOpacity: 0.35,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		ellipse(-13, -10, 7, 5, { fill: p.faint, opacity: 0.85, stroke: p.primary, sw: 1 }),
		ellipse(13, -10, 7, 5, { fill: p.faint, opacity: 0.85, stroke: p.primary, sw: 1 }),
		path('M -16 14 Q 0 26 16 14', stroke(p.primary, 1.5, 0.8)),
		path('M -24 -24 Q -8 -32 6 -24 M 10 -26 Q 22 -30 30 -20', stroke(p.secondary, 1.2, 0.55)),
		path('M -2 -30 L 0 -20 L 2 -30', stroke(p.primary, 1, 0.45)),
		circle(0, 8, 2, filled(p.gold, 0.65)),
		path('M 36 -20 Q 54 -8 48 12 Q 42 28 30 22', { ...stroke(p.primary, 1, 0.2), dash: '3 5' })
	];
	return out;
}

function eye({ palette: p }) {
	const out = [
		path('M -52 0 Q 0 -40 52 0 Q 0 40 -52 0 Z', {
			fill: p.paper,
			fillOpacity: 0.18,
			stroke: p.primary,
			sw: 1.8,
			linejoin: 'round'
		}),
		circle(0, 0, 20, { fill: p.water, fillOpacity: 0.45, stroke: p.primary, sw: 1.2 }),
		circle(0, 0, 12, { fill: p.waterDark, opacity: 0.75 }),
		circle(0, 0, 6, { fill: p.faint, opacity: 0.95 }),
		circle(-4, -5, 2.6, filled(p.snow, 0.85)),
		path('M -52 0 Q -26 -20 0 -24 Q 26 -20 52 0', { ...stroke(p.primary, 1.2, 0.45), dash: '3 5' }),
		path('M -48 0 Q -24 18 0 22 Q 24 18 48 0', stroke(p.primary, 1.2, 0.35))
	];
	for (let i = 0; i < 6; i++) {
		const x = -40 + i * 16;
		out.push(line(x, -14 + Math.abs(i - 2.5) * 2.5, x - (i - 2.5) * 3, -26 + Math.abs(i - 2.5) * 2, stroke(p.secondary, 1, 0.35)));
	}
	return out;
}

function heart({ palette: p }) {
	return [
		path('M 0 38 C -46 8 -46 -26 -22 -33 C -8 -37 0 -22 0 -12 C 0 -22 8 -37 22 -33 C 46 -26 46 8 0 38 Z', {
			fill: p.emberDark,
			fillOpacity: 0.7,
			stroke: p.primary,
			sw: 1.6,
			linejoin: 'round'
		}),
		path('M -12 -20 Q -2 -26 0 -12', stroke(p.snow, 1.4, 0.55)),
		path('M -54 8 L -30 8 L -22 -6 L -12 22 L 0 4 L 12 12 L 22 -2 L 30 8 L 54 8', stroke(p.gold, 1.6, 0.8)),
		circle(0, 2, 4, filled(p.gold, 0.55)),
		circle(0, 0, 48, { ...stroke(p.secondary, 1, 0.15), dash: '2 7' })
	];
}

// --- Čas, řád a proměna ----------------------------------------------------

function labyrinth({ palette: p }) {
	const out = [
		rect(-46, -40, 92, 80, { fill: 'none', stroke: p.primary, sw: 1.6 }),
		rect(-36, -30, 72, 60, { fill: 'none', stroke: p.soft, sw: 1.2 }),
		rect(-24, -20, 48, 40, { fill: 'none', stroke: p.soft, sw: 1.2 }),
		rect(-12, -10, 24, 20, { fill: 'none', stroke: p.soft, sw: 1.2 }),
		line(-36, -30, -36, 10, { stroke: p.primary, sw: 2.2 }),
		line(-24, -20, 12, -20, { stroke: p.primary, sw: 2.2 }),
		line(24, -10, 24, 30, { stroke: p.primary, sw: 2.2 }),
		line(-12, 10, 36, 10, { stroke: p.primary, sw: 2.2 }),
		line(12, -30, 12, 0, { stroke: p.primary, sw: 2.2 }),
		line(36, -30, 36, 20, { stroke: p.primary, sw: 2.2 }),
		line(-46, 20, -12, 20, { stroke: p.primary, sw: 2.2 }),
		polyline(
			[
				[-46, 30],
				[-16, 30],
				[-16, 0],
				[8, 0],
				[8, 20],
				[30, 20],
				[30, -16],
				[0, -16],
				[0, -6]
			],
			{ ...stroke(p.gold, 1.6, 0.8), dash: '4 4' }
		),
		circle(0, -6, 4, { fill: p.gold, opacity: 0.9 }),
		polygon([[4, -6], [14, -10], [14, -2]], { fill: p.gold, opacity: 0.8 })
	];
	return out;
}

function knot({ palette: p }) {
	return [
		path('M -46 0 C -46 -32 -14 -32 0 -12 C 14 -32 46 -32 46 0 C 46 32 14 32 0 12 C -14 32 -46 32 -46 0 Z', {
			...stroke(p.primary, 2.6, 0.9)
		}),
		path('M -30 -4 C -30 -22 -12 -22 0 -6 C 12 -22 30 -22 30 -4 C 30 14 12 14 0 -2 C -12 14 -30 14 -30 -4 Z', {
			...stroke(p.secondary, 1.6, 0.65)
		}),
		path('M -38 18 Q -18 6 0 18 Q 18 30 38 18', stroke(p.tertiary, 1.2, 0.45)),
		circle(-46, 0, 3, filled(p.gold, 0.75)),
		circle(46, 0, 3, filled(p.gold, 0.75)),
		circle(0, 0, 4, filled(p.primary, 0.9)),
		path('M -20 -18 Q 0 -28 20 -18', stroke(p.gold, 1, 0.4))
	];
}

function thread({ palette: p }) {
	return [
		rect(-34, -26, 30, 52, { rx: 4, fill: p.wood, opacity: 0.55, stroke: p.primary, sw: 1.3 }),
		ellipse(-19, -26, 15, 4, { fill: p.woodDark, opacity: 0.7, stroke: p.primary, sw: 1 }),
		ellipse(-19, 26, 15, 4, { fill: p.woodDark, opacity: 0.7, stroke: p.primary, sw: 1 }),
		line(-30, -18, -8, -18, stroke(p.secondary, 1.2, 0.7)),
		line(-30, -8, -8, -8, stroke(p.secondary, 1.2, 0.65)),
		line(-30, 2, -8, 2, stroke(p.secondary, 1.2, 0.6)),
		line(-30, 12, -8, 12, stroke(p.secondary, 1.2, 0.55)),
		path('M -4 -6 Q 18 -30 36 -12 Q 52 4 34 22 Q 22 32 12 22', stroke(p.secondary, 1.4, 0.85)),
		path('M 34 22 L 48 18', stroke(p.metal, 2, 0.7)),
		circle(50, 17, 2.4, filled(p.metal, 0.8))
	];
}

function hourglass({ palette: p, rand }) {
	const out = [
		rect(-30, -42, 60, 5, { rx: 2, fill: p.woodDark, stroke: p.primary, sw: 1.1 }),
		rect(-30, 37, 60, 5, { rx: 2, fill: p.woodDark, stroke: p.primary, sw: 1.1 }),
		path('M -24 -37 L 24 -37 L 5 -4 L 24 37 L -24 37 L -5 -4 Z', {
			fill: p.water,
			fillOpacity: 0.12,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		path('M -20 -36 Q -18 -16 -2 -4 Q -18 8 -20 36 L 20 36 Q 18 8 2 -4 Q 18 -16 20 -36 Z', {
			fill: p.paper,
			fillOpacity: 0.2,
			stroke: p.primary,
			sw: 1
		}),
		polygon([[-18, -34], [18, -34], [2, -4]], { fill: p.gold, opacity: 0.55 }),
		polygon([[-16, 34], [16, 34], [0, 12]], { fill: p.gold, opacity: 0.7 }),
		line(0, -2, 0, 14, stroke(p.gold, 1, 0.7)),
		circle(0, 18, 2.4, filled(p.gold, 0.9)),
		circle(-8, -20, 1.2, filled(p.gold, 0.6)),
		circle(7, -12, 1, filled(p.gold, 0.55))
	];
	for (let i = 0; i < 3; i++) {
		out.push(circle(rand.range(-4, 4), rand.range(-2, 12), 0.8, filled(p.gold, 0.65)));
	}
	return out;
}

function cycle({ palette: p }) {
	const out = [];
	const radius = 38;
	out.push(circle(0, 0, radius, { ...stroke(p.primary, 1.2, 0.35), dash: '4 7' }));
	const arcs = [
		[200, 320, p.primary],
		[80, 200, p.secondary],
		[-40, 80, p.tertiary]
	];
	arcs.forEach(([start, end, color]) => {
		out.push(arcPath(0, 0, radius, start, end, stroke(color, 2.2, 0.8)));
		const rad = (end * Math.PI) / 180;
		const x = Math.cos(rad) * radius;
		const y = Math.sin(rad) * radius;
		const tangent = rad + Math.PI / 2;
		const tip = [x + Math.cos(tangent) * 9, y + Math.sin(tangent) * 9];
		const left = [x + Math.cos(tangent + 2.4) * 7, y + Math.sin(tangent + 2.4) * 7];
		const right = [x + Math.cos(tangent - 2.4) * 7, y + Math.sin(tangent - 2.4) * 7];
		out.push(polygon([tip, left, right], { fill: color, opacity: 0.9 }));
	});
	out.push(circle(0, 0, 13, { fill: p.accent, opacity: 0.22, stroke: p.primary, sw: 1.2 }));
	out.push(circle(0, 0, 5, filled(p.gold, 0.85)));
	for (let i = 0; i < 3; i++) {
		const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
		out.push(circle(Math.cos(angle) * 24, Math.sin(angle) * 24, 2.4, filled(i === 0 ? p.gold : p.secondary, 0.75)));
	}
	return out;
}

function ruin({ palette: p, rand }) {
	const out = [
		line(-52, 42, 52, 42, stroke(p.soft, 1.3)),
		rect(-38, 20, 76, 8, { fill: p.stoneDark, opacity: 0.65, stroke: p.primary, sw: 1 }),
		rect(-28, -18, 18, 38, { fill: p.stoneDark, opacity: 0.55, stroke: p.primary, sw: 1.1 }),
		path('M -28 -18 L -20 -32 L -10 -18 Z', { fill: p.stone, opacity: 0.4, stroke: p.primary, sw: 1 }),
		rect(4, -6, 20, 26, { fill: p.stoneDark, opacity: 0.45, stroke: p.primary, sw: 1.1 }),
		path('M 4 -6 L 14 -20 L 24 -6 Z', { fill: p.stone, opacity: 0.35, stroke: p.primary, sw: 1 }),
		path('M -10 20 L 4 -2 M 14 20 L 24 2', stroke(p.primary, 1.4, 0.55)),
		polygon([[-48, 42], [-38, 28], [-28, 42]], { fill: p.stone, opacity: 0.3 }),
		polygon([[26, 42], [36, 30], [44, 42]], { fill: p.stone, opacity: 0.25 }),
		path('M -22 38 Q -16 30 -8 38 Q 0 30 8 38', stroke(p.foliage, 1.2, 0.45)),
		circle(-34, 30, 1.6, filled(p.gold, 0.45)),
		circle(40, 36, 1.4, filled(p.gold, 0.4))
	];
	for (let i = 0; i < 3; i++) {
		out.push(circle(rand.range(-40, 40), rand.range(-20, 20), 1, filled(p.stone, 0.4)));
	}
	return out;
}

function butterfly({ palette: p }) {
	return [
		ellipse(0, 0, 4, 24, { fill: p.woodDark, stroke: p.primary, sw: 1.1 }),
		circle(0, -26, 5, { fill: p.woodDark, stroke: p.primary, sw: 1 }),
		path('M 0 -8 C -42 -46 -58 -14 -40 2 C -26 12 -8 8 0 0 Z', {
			fill: p.secondary,
			opacity: 0.52,
			stroke: p.primary,
			sw: 1.3
		}),
		path('M 0 -8 C 42 -46 58 -14 40 2 C 26 12 8 8 0 0 Z', {
			fill: p.tertiary,
			opacity: 0.52,
			stroke: p.primary,
			sw: 1.3
		}),
		path('M 0 2 C -34 2 -44 28 -26 36 C -12 42 -4 24 0 10 Z', {
			fill: p.secondary,
			opacity: 0.36,
			stroke: p.primary,
			sw: 1.2
		}),
		path('M 0 2 C 34 2 44 28 26 36 C 12 42 4 24 0 10 Z', {
			fill: p.tertiary,
			opacity: 0.36,
			stroke: p.primary,
			sw: 1.2
		}),
		circle(-24, -12, 4, filled(p.gold, 0.65)),
		circle(24, -12, 4, filled(p.gold, 0.65)),
		path('M 0 -26 Q -8 -42 -18 -44 M 0 -26 Q 8 -42 18 -44', stroke(p.primary, 1, 0.65)),
		circle(0, -14, 2, filled(p.gold, 0.8))
	];
}

function cocoon({ palette: p }) {
	return [
		path('M -36 -38 Q -10 -44 18 -36', stroke(p.woodDark, 3.4, 0.9)),
		line(-6, -38, -2, -18, { stroke: p.paper, sw: 1.2, opacity: 0.65 }),
		line(10, -38, 4, -16, { stroke: p.paper, sw: 1.2, opacity: 0.5 }),
		path('M -2 -18 Q -22 4 -14 28 Q -6 44 8 36 Q 24 26 16 2 Q 10 -14 -2 -18 Z', {
			fill: p.paper,
			fillOpacity: 0.28,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		path('M -12 -6 Q -18 12 -8 28 M 2 -12 Q 10 4 4 26 M 12 -4 Q 18 12 10 28', stroke(p.secondary, 1, 0.45)),
		path('M 16 2 Q 40 -12 48 2 Q 38 18 18 12 Z', { fill: p.secondary, opacity: 0.45, stroke: p.primary, sw: 1 }),
		path('M 16 10 Q 34 18 38 30 Q 22 30 12 18 Z', { fill: p.tertiary, opacity: 0.35, stroke: p.primary, sw: 1 }),
		circle(30, 2, 2, filled(p.gold, 0.7))
	];
}

// --- Moc, víra a civilizace -----------------------------------------------

function throne({ palette: p }) {
	return [
		ellipse(0, 44, 46, 5, { fill: p.primary, opacity: 0.1 }),
		path('M -32 40 L -32 -28 Q 0 -54 32 -28 L 32 40 Z', {
			fill: p.woodDark,
			fillOpacity: 0.75,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		path('M -22 34 L -22 -20 Q 0 -40 22 -20 L 22 34 Z', {
			fill: p.primary,
			fillOpacity: 0.12,
			stroke: p.primary,
			sw: 1
		}),
		rect(-30, 8, 60, 9, { rx: 2, fill: p.wood, stroke: p.primary, sw: 1.1 }),
		rect(-36, 18, 10, 24, { fill: p.wood, stroke: p.primary, sw: 1.1 }),
		rect(26, 18, 10, 24, { fill: p.wood, stroke: p.primary, sw: 1.1 }),
		rect(-30, 34, 8, 8, { fill: p.woodDark, stroke: p.primary, sw: 1 }),
		rect(22, 34, 8, 8, { fill: p.woodDark, stroke: p.primary, sw: 1 }),
		circle(-22, -22, 3, filled(p.gold, 0.75)),
		circle(22, -22, 3, filled(p.gold, 0.75)),
		path('M -12 -34 Q 0 -44 12 -34', stroke(p.gold, 1.4, 0.65)),
		line(-42, 42, 42, 42, stroke(p.soft, 1.2))
	];
}

function scepter({ palette: p }) {
	return [
		line(0, 44, 0, -18, { stroke: p.goldDark, sw: 5, linecap: 'round' }),
		line(0, 44, 0, -18, { stroke: p.gold, sw: 2, linecap: 'round' }),
		circle(0, -30, 13, { fill: p.gold, fillOpacity: 0.5, stroke: p.primary, sw: 1.5 }),
		circle(0, -30, 7, { fill: p.gold, opacity: 0.75, stroke: p.primary, sw: 1 }),
		polygon(starPoints(0, -30, 5, 2, 4), filled(p.snow, 0.75)),
		line(-12, -30, 12, -30, stroke(p.primary, 1.2, 0.65)),
		line(0, -42, 0, -18, stroke(p.primary, 1.2, 0.65)),
		rect(-8, -12, 16, 5, { fill: p.secondary, opacity: 0.8, stroke: p.primary, sw: 1 }),
		rect(-7, 8, 14, 4, { fill: p.secondary, opacity: 0.65, stroke: p.primary, sw: 1 }),
		circle(0, 24, 4, { fill: p.ember, opacity: 0.75, stroke: p.primary, sw: 1 }),
		arcPath(0, -30, 25, 210, 330, { ...stroke(p.secondary, 1, 0.3), dash: '2 5' })
	];
}

function seal({ palette: p }) {
	const out = [
		polygon(
			[
				[-30, 34],
				[-18, 44],
				[-8, 38],
				[4, 46],
				[16, 38],
				[28, 42],
				[24, 28],
				[32, 18],
				[22, 8],
				[26, -6],
				[14, -10],
				[12, -24],
				[0, -18],
				[-12, -26],
				[-16, -12],
				[-28, -6],
				[-22, 8],
				[-32, 20],
				[-22, 28]
			],
			{ fill: p.emberDark, fillOpacity: 0.65, stroke: p.primary, sw: 1.4, linejoin: 'round' }
		),
		circle(0, 6, 19, { fill: p.ember, opacity: 0.35, stroke: p.primary, sw: 1.1 }),
		circle(0, 6, 14, { fill: 'none', stroke: p.gold, sw: 1.1, opacity: 0.75 }),
		polygon(starPoints(0, 6, 9, 3.5, 5), filled(p.gold, 0.6)),
		path('M -16 30 Q -24 42 -36 44 L -30 34 Q -22 28 -14 26 Z', { fill: p.secondary, opacity: 0.45, stroke: p.primary, sw: 1 }),
		path('M 16 30 Q 24 42 36 44 L 30 34 Q 22 28 14 26 Z', { fill: p.secondary, opacity: 0.35, stroke: p.primary, sw: 1 })
	];
	return out;
}

function temple({ palette: p }) {
	const out = [
		line(-50, 42, 50, 42, stroke(p.soft, 1.3)),
		rect(-42, 36, 84, 6, { fill: p.stoneDark, stroke: p.primary, sw: 1 }),
		rect(-36, 30, 72, 6, { fill: p.stoneDark, opacity: 0.8, stroke: p.primary, sw: 1 }),
		polygon(
			[
				[-42, -24],
				[0, -46],
				[42, -24]
			],
			{ fill: p.stone, fillOpacity: 0.35, stroke: p.primary, sw: 1.4, linejoin: 'round' }
		),
		rect(-36, -24, 72, 6, { fill: p.stoneDark, opacity: 0.7, stroke: p.primary, sw: 1 }),
		rect(-34, -18, 68, 48, { fill: p.primary, fillOpacity: 0.05, stroke: p.primary, sw: 1 })
	];
	for (let i = 0; i < 4; i++) {
		const x = -26 + i * 17;
		out.push(rect(x, -18, 8, 42, { fill: p.stone, opacity: 0.4, stroke: p.primary, sw: 1 }));
		out.push(line(x + 2.5, -14, x + 2.5, 20, stroke(p.primary, 0.7, 0.35)));
		out.push(line(x + 5.5, -14, x + 5.5, 20, stroke(p.primary, 0.7, 0.25)));
	}
	out.push(path('M -8 24 L -8 8 Q 0 0 8 8 L 8 24 Z', { fill: p.faint, stroke: p.primary, sw: 1.1 }));
	out.push(circle(0, -34, 4, { fill: p.gold, opacity: 0.65, stroke: p.primary, sw: 1 }));
	out.push(tick(-30, -12, 60, stroke(p.primary, 0.8, 0.25)));
	return out;
}

function altar({ palette: p, rand }) {
	const out = [
		line(-48, 44, 48, 44, stroke(p.soft, 1.2)),
		rect(-42, 12, 84, 32, { fill: p.stoneDark, opacity: 0.7, stroke: p.primary, sw: 1.3 }),
		rect(-48, 6, 96, 8, { fill: p.stone, opacity: 0.45, stroke: p.primary, sw: 1.2 }),
		path('M -42 14 Q -20 22 0 18 Q 22 22 42 14', stroke(p.secondary, 1.4, 0.65)),
		path('M -26 6 Q -18 -8 -10 6 Z', { fill: p.goldDark, opacity: 0.65, stroke: p.primary, sw: 1 }),
		path('M 10 6 Q 18 -8 26 6 Z', { fill: p.goldDark, opacity: 0.55, stroke: p.primary, sw: 1 }),
		path('M -10 6 C -18 -10 -12 -26 -2 -32 C -2 -18 4 -14 8 -22 C 14 -8 12 2 4 6 Z', {
			fill: p.ember,
			opacity: 0.65,
			stroke: p.gold,
			sw: 1.1
		}),
		circle(0, -8, 2.6, filled(p.gold, 0.85)),
		path('M -18 -30 Q -24 -44 -34 -48 M 10 -26 Q 16 -40 26 -44', stroke(p.stone, 1.2, 0.35)),
		circle(-20, 4, 3, filled(p.secondary, 0.55)),
		circle(20, 4, 2.6, filled(p.tertiary, 0.5))
	];
	for (let i = 0; i < 3; i++) {
		out.push(circle(rand.range(-10, 10), rand.range(-38, -22), 1, filled(p.gold, 0.55)));
	}
	return out;
}

function chalice({ palette: p }) {
	return [
		ellipse(0, 42, 24, 4, { fill: p.primary, opacity: 0.12 }),
		path('M -26 -34 L 26 -34 Q 24 -6 12 8 L 6 18 L 6 34 L 20 38 L -20 38 L -6 34 L -6 18 L -12 8 Q -24 -6 -26 -34 Z', {
			fill: p.gold,
			fillOpacity: 0.35,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		path('M -20 -28 Q 0 -20 20 -28 Q 18 -8 10 2 L -10 2 Q -18 -8 -20 -28 Z', {
			fill: p.emberDark,
			opacity: 0.55
		}),
		path('M -20 -28 Q 0 -20 20 -28', stroke(p.gold, 1.6, 0.85)),
		circle(0, 14, 3, filled(p.secondary, 0.8)),
		line(-6, 24, 6, 24, stroke(p.primary, 1, 0.6)),
		circle(-10, -6, 2, filled(p.snow, 0.55)),
		circle(8, -2, 1.5, filled(p.snow, 0.45)),
		arcPath(0, -12, 34, 200, 340, { ...stroke(p.secondary, 1, 0.3), dash: '2 5' })
	];
}

// --- Katalog --------------------------------------------------------------

/**
 * @typedef {{
 *   key: string,
 *   label: string,
 *   note: string,
 *   role: 'subject' | 'support' | 'both',
 *   families: string[],
 *   tags: string[],
 *   categories?: Record<string, number>,
 *   build: Function
 * }} Motif
 */

/** @type {Motif[]} */
export const SYMBOLIC_MOTIFS = [
	// Živly a energie
	{
		key: 'flame',
		label: 'Plamen',
		note: 'oheň, energie, vášeň, spalování',
		role: 'both',
		families: ['flame', 'ritual', 'storybook'],
		tags: ['plamen*', 'ohen*', 'ohniv*', 'horeni*', 'hoření*', 'spalit*','spalil*','spalovat*','spalen*','spalovani*', 'spalit*','spalil*','spalovat*','spalen*','spalovani*', 'pochoden*'],
		categories: { historie: 1, filozofie: 1, veda: 1, fyzika: 0.5 },
		build: flame
	},
	{
		key: 'torch',
		label: 'Pochodeň',
		note: 'světlo, předávání, pochod',
		role: 'both',
		families: ['flame', 'ritual'],
		tags: ['pochoden*', 'pochodn*', 'nositel*', 'predani*', 'předání*'],
		categories: { historie: 1, filozofie: 1, politika: 0.5 },
		build: torch
	},
	{
		key: 'volcano',
		label: 'Vulkán',
		note: 'erupce, láva, geologie',
		role: 'subject',
		families: ['flame', 'peak'],
		tags: ['vulkan*', 'vulkán*', 'sopk*', 'lava*', 'láv*', 'erupc*', 'magma*'],
		categories: { veda: 2, zajimavost: 2 },
		build: volcano
	},
	{
		key: 'candle',
		label: 'Svíčka',
		note: 'světlo, vzpomínka, obřad',
		role: 'both',
		families: ['ritual', 'flame'],
		tags: ['svick*', 'svíčk*', 'svice*', 'svíce*', 'vosk*', 'plamen*'],
		categories: { filozofie: 1, historie: 1, umeni: 0.5 },
		build: candle
	},
	// Bouře
	{
		key: 'lightning',
		label: 'Blesk',
		note: 'bouře, elektřina, náhlý zásah',
		role: 'subject',
		families: ['storm'],
		tags: ['blesk*', 'hrom','hromu','hromy','hromem','hromech','hromovy*','hromosvod*', 'vyboj*', 'výboj*', 'boure*', 'bouř*', 'burka*', 'bouřka*'],
		categories: { fyzika: 2, zajimavost: 1.5, veda: 0.5 },
		build: lightning
	},
	{
		key: 'cloud',
		label: 'Mrak',
		note: 'obloha, počasí, nejistota',
		role: 'both',
		families: ['storm', 'peak', 'canopy'],
		tags: ['mrak*', 'oblac*', 'oblacn*', 'mracn*', 'mračn*', 'nebe','nebi','nebem','nebes*','nebesa','nebesich','nebesky*', 'nebes*'],
		categories: { zajimavost: 1.5, veda: 1, fyzika: 0.5 },
		build: cloud
	},
	{
		key: 'wind',
		label: 'Vítr',
		note: 'pohyb, vzduch, změna',
		role: 'both',
		families: ['storm', 'peak'],
		tags: ['vitr*', 'větr*', 'vanek*', 'vánek*', 'proud*', 'proudění*', 'vzduch*', 'foukan*', 'fouká*'],
		categories: { fyzika: 1.5, zajimavost: 1.5, veda: 0.5 },
		build: wind
	},
	{
		key: 'rain',
		label: 'Déšť',
		note: 'srážky, počasí, úroda',
		role: 'both',
		families: ['storm'],
		tags: ['dest','deste','destem','desti','destovy*','destove*','destiv*', 'dest','deste','destem','desti','destovy*','destove*','destiv*', 'prsel*', 'prší*', 'srazk*', 'srážk*', 'vlhk*'],
		categories: { zajimavost: 1.5, veda: 1 },
		build: rain
	},
	// Nebe
	{
		key: 'sun',
		label: 'Slunce',
		note: 'světlo, teplo, život',
		role: 'subject',
		families: ['celestial'],
		tags: ['slunce*', 'slunci*', 'solarn*', 'solární*', 'svetlo*', 'světlo*'],
		categories: { astronomie: 2.5, fyzika: 1, zajimavost: 0.5 },
		build: sun
	},
	{
		key: 'moon',
		label: 'Měsíc',
		note: 'noc, příliv, cyklus',
		role: 'subject',
		families: ['celestial', 'cycle'],
		tags: ['mesic*', 'měsíc*', 'luna*', 'lunarn*', 'lunární*'],
		categories: { astronomie: 2.5, filozofie: 0.5 },
		build: moon
	},
	{
		key: 'star',
		label: 'Hvězda',
		note: 'hvězdy, souhvězdí, orientace',
		role: 'both',
		families: ['celestial'],
		tags: ['hvezda*', 'hvězd*', 'souhvezd*', 'souhvězd*', 'supernov*', 'pulsar*'],
		categories: { astronomie: 2.5, filozofie: 0.5 },
		build: star
	},
	{
		key: 'eclipse',
		label: 'Zatmění',
		note: 'zatmění, korona, vzácný úkaz',
		role: 'subject',
		families: ['celestial'],
		tags: ['zatmeni*', 'zatmění*', 'korona*', 'eclipse*'],
		categories: { astronomie: 2.5 },
		build: eclipse
	},
	// Rostliny
	{
		key: 'flower',
		label: 'Květina',
		note: 'květy, rozkvět, krása',
		role: 'subject',
		families: ['bloom'],
		tags: ['kvetina*', 'květin*', 'kvet','kvetu','kvety','kvetem','kvetech','kvetina*','kvetiny','kvetin*','kvetouci*','kveteni*', 'kvet','kvetu','kvety','kvetem','kvetech','kvetina*','kvetiny','kvetin*','kvetouci*','kveteni*', 'rozkvet*', 'rozkvět*', 'kvetouc*', 'květouc*'],
		categories: { zajimavost: 2, veda: 1, umeni: 1 },
		build: flower
	},
	{
		key: 'petal',
		label: 'Okvětní lístek',
		note: 'jemnost, pomíjivost, detail',
		role: 'both',
		families: ['bloom'],
		tags: ['okvetni*', 'okvětní*', 'petal*', 'listek*', 'lístek*'],
		categories: { umeni: 1.5, zajimavost: 1, literatura: 0.5 },
		build: petal
	},
	{
		key: 'seed',
		label: 'Semeno',
		note: 'počátek, dědičnost, úroda',
		role: 'both',
		families: ['growth', 'undergrowth', 'bloom'],
		tags: ['semen*', 'semink*', 'semínk*', 'osivo*', 'zrno*', 'zrn*'],
		categories: { veda: 1.5, zajimavost: 1.5 },
		build: seed
	},
	{
		key: 'mushroom',
		label: 'Houba',
		note: 'houby, podhoubí, rozklad',
		role: 'subject',
		families: ['undergrowth', 'decay'],
		tags: ['houb*', 'houba*', 'mycel*', 'podhoub*', 'hliva*', 'hlíva*', 'muchomork*', 'muchomůrk*'],
		categories: { zajimavost: 2, veda: 1 },
		build: mushroom
	},
	{
		key: 'roots',
		label: 'Kořeny',
		note: 'původ, podzemí, ukotvení',
		role: 'both',
		families: ['undergrowth', 'growth', 'canopy'],
		tags: ['koren*', 'kořen*', 'koreny*', 'kořeny*', 'podzem*', 'rhizom*', 'odden*'],
		categories: { veda: 1.5, zajimavost: 1.5, filozofie: 0.5 },
		build: roots
	},
	{
		key: 'sprout',
		label: 'Klíček',
		note: 'růst, začátek, naděje',
		role: 'subject',
		families: ['growth'],
		tags: ['klicek*', 'klíček*', 'sazenice*', 'vyhonek*', 'výhonek*', 'puceni*', 'pučení*', 'vzklice*', 'vzklíče*'],
		categories: { veda: 1.5, zajimavost: 1, ekonomie: 0.5 },
		build: sprout
	},
	{
		key: 'branch',
		label: 'Větev',
		note: 'větve, koruna, propojení',
		role: 'both',
		families: ['canopy', 'growth'],
		tags: ['vetev*', 'větev*', 'vetvi*', 'větvi*', 'vetven*', 'větven*'],
		categories: { zajimavost: 1.5, veda: 1, umeni: 0.5 },
		build: branch
	},
	{
		key: 'glacier',
		label: 'Ledovec',
		note: 'led, klima, ledovce',
		role: 'subject',
		families: ['peak'],
		tags: ['ledovec*', 'ledovc*', 'glacier*', 'kryosfer*', 'kryosféra*', 'tundr*', 'polarn*', 'polární*'],
		categories: { zajimavost: 2, veda: 1.5 },
		build: glacier
	},
	// Konflikt
	{
		key: 'sword',
		label: 'Meč',
		note: 'boj, konflikt, rozhodnutí',
		role: 'both',
		families: ['clash', 'armory'],
		tags: ['mec','mece','mecem','meci','mecu','mecich','mecum', 'mec','mece','mecem','meci','mecu','mecich','mecum', 'serm*', 'šerm*', 'souboj*', 'duel*', 'zbran*', 'zbraň*', 'ostri*', 'ostří*', 'cepel*', 'valk*', 'válk*', 'bitv*', 'bitva*', 'konflikt*'],
		categories: { historie: 1.5, umeni: 0.5, literatura: 0.5 },
		build: sword
	},
	{
		key: 'shield',
		label: 'Štít',
		note: 'obrana, ochrana, hradba',
		role: 'both',
		families: ['clash', 'armory'],
		tags: ['stit*', 'štít*', 'stity*', 'štíty*', 'obrana*', 'branit*', 'bránit*', 'ochrana*', 'heraldik*', 'erbu*', 'erb*'],
		categories: { historie: 1.5, politika: 1 },
		build: shield
	},
	{
		key: 'helmet',
		label: 'Přilba',
		note: 'rytíři, válka, ochrana',
		role: 'both',
		families: ['armory'],
		tags: ['helma*', 'helm*', 'prilba*', 'přilba*', 'rytir*', 'rytíř*', 'bojovnik*', 'bojovník*'],
		categories: { historie: 1.5, umeni: 0.5 },
		build: helmet
	},
	{
		key: 'crack',
		label: 'Prasklina',
		note: 'zlom, krize, narušení',
		role: 'both',
		families: ['rupture', 'decay'],
		tags: ['prasklin*', 'praskl*', 'trhlin*', 'zlom*', 'rozpuk*', 'krize*', 'kriz*'],
		categories: { psychologie: 1.5, politika: 1, fyzika: 0.5 },
		build: crack
	},
	{
		key: 'explosion',
		label: 'Výbuch',
		note: 'exploze, náraz, zvrat',
		role: 'both',
		families: ['rupture', 'clash'],
		tags: ['vybuch*', 'výbuch*', 'exploz*', 'detonac*', 'trhavin*', 'trask*', 'třask*', 'tresk*'],
		categories: { fyzika: 1.5, historie: 1, politika: 1 },
		build: explosion
	},
	// Lidé
	{
		key: 'figure',
		label: 'Postava',
		note: 'člověk, jedinec, svědek',
		role: 'both',
		families: ['silhouette', 'crowd', 'portrait'],
		tags: ['clovek*', 'člověk*', 'osoba*', 'postava*', 'postavy', 'postavu', 'postavou', 'jedinec*'],
		categories: { filozofie: 1, psychologie: 1, umeni: 0.5 },
		build: figure
	},
	{
		key: 'crowd',
		label: 'Dav',
		note: 'společnost, skupina, veřejnost',
		role: 'subject',
		families: ['crowd', 'silhouette'],
		tags: ['dav','davu','davem','davech','davy','davum', 'davu*', 'skupin*', 'skupina*', 'mnozstvi*', 'množstv*', 'spolecnost*', 'společnost*', 'obcan*', 'občan*', 'volici*', 'voliči*', 'publikum*'],
		categories: { politika: 1.5, psychologie: 1.5, historie: 1 },
		build: crowd
	},
	{
		key: 'hand',
		label: 'Ruka',
		note: 'gesto, pomoc, tvorba',
		role: 'both',
		families: ['silhouette', 'crowd', 'ritual'],
		tags: ['ruka*', 'ruce*', 'rukou*', 'dlan*', 'dlaň*', 'prst','prstu','prsty','prstem','prstech','prstum','prstovy*', 'podani*', 'podání*', 'pomoc', 'pomocnik*', 'gest*'],
		categories: { umeni: 1, psychologie: 1, filozofie: 0.5 },
		build: hand
	},
	{
		key: 'mask',
		label: 'Maska',
		note: 'identita, přetvářka, divadlo',
		role: 'both',
		families: ['gaze', 'transformation', 'crowd'],
		tags: ['maska*', 'masky*', 'maskovani*', 'maskování*', 'divadl*', 'role*', 'pretvarka*', 'přetvářka*', 'identit*'],
		categories: { psychologie: 1.5, umeni: 1.5, literatura: 0.5 },
		build: mask
	},
	// Psychika
	{
		key: 'eye',
		label: 'Oko',
		note: 'pohled, pozorování, vědomí',
		role: 'subject',
		families: ['gaze'],
		tags: ['oci','ocima','ocich','ocim','ocou','oko','oka','oku','okem','oky','okum', 'oci','ocima','ocich','ocim','ocou','oko','oka','oku','okem','oky','okum', 'oci','ocima','ocich','ocim','ocou','oko','oka','oku','okem','oky','okum', 'pohled*', 'zrak*', 'videni*', 'vidění*', 'pozorovani*', 'pozorování*'],
		categories: { psychologie: 1.5, filozofie: 1, umeni: 1 },
		build: eye
	},
	{
		key: 'heart',
		label: 'Srdce',
		note: 'láska, emoce, vášeň',
		role: 'both',
		families: ['heart'],
		tags: ['srdce*', 'srdci*', 'laska*', 'láska*', 'cit','city','citu','citum','citech','citovy*','citove*','citliv*', 'city*', 'emoce*', 'emoc*', 'vase*', 'vášeň*', 'soucit*'],
		categories: { psychologie: 2, umeni: 1, literatura: 0.5 },
		build: heart
	},
	// Čas a řád
	{
		key: 'labyrinth',
		label: 'Labyrint',
		note: 'bludiště, hledání, složitost',
		role: 'subject',
		families: ['labyrinth'],
		tags: ['labyrint*', 'bludist*', 'bludišt*', 'minotaur*'],
		categories: { filozofie: 1.5, psychologie: 1, matematika: 0.5 },
		build: labyrinth
	},
	{
		key: 'knot',
		label: 'Uzel',
		note: 'propletení, problém, spojení',
		role: 'both',
		families: ['knot'],
		tags: ['uzel*', 'uzly*', 'uzl*', 'spleten*', 'splét*', 'propleten*', 'provaz','provazy','provazu','provazem','provazech','provazku*','provazek*', 'lano*'],
		categories: { filozofie: 1, psychologie: 1, veda: 0.5 },
		build: knot
	},
	{
		key: 'thread',
		label: 'Nit',
		note: 'spojení, stopa, Ariadnina nit',
		role: 'both',
		families: ['knot', 'labyrinth'],
		tags: ['nit*', 'niti*', 'nitka*', 'vlakno*', 'vlákno*', 'klubko*', 'ariadn*', 'ariadna*', 'provazec*'],
		categories: { filozofie: 1, literatura: 1, historie: 0.5 },
		build: thread
	},
	{
		key: 'hourglass',
		label: 'Přesýpací hodiny',
		note: 'čas, odpočet, pomíjivost',
		role: 'subject',
		families: ['hourglass', 'cycle'],
		tags: ['presypaci*', 'přesýpací*', 'pisek*', 'písek*', 'odpocet*', 'odpočet*', 'lhut*', 'lhůt*'],
		categories: { filozofie: 1.5, historie: 1, fyzika: 0.5 },
		build: hourglass
	},
	{
		key: 'cycle',
		label: 'Cyklus',
		note: 'opakování, období, návrat',
		role: 'subject',
		families: ['cycle'],
		tags: ['cyklus*', 'cykly*', 'cyklick*', 'rocni*', 'roční*', 'obdobi*', 'období*', 'navrat*', 'návrat*'],
		categories: { filozofie: 1.5, veda: 1, astronomie: 0.5 },
		build: cycle
	},
	// Zánik a proměna
	{
		key: 'ruin',
		label: 'Zřícenina',
		note: 'zánik, trosky, paměť místa',
		role: 'both',
		families: ['decay'],
		tags: ['zricenin*', 'zřícenin*', 'ruina*', 'ruiny*', 'trosky*', 'trosk*', 'upadek*', 'úpadek*', 'zanik*', 'zánik*', 'chatar*', 'chátr*'],
		categories: { historie: 2, umeni: 1 },
		build: ruin
	},
	{
		key: 'butterfly',
		label: 'Motýl',
		note: 'proměna, metamorfóza, svoboda',
		role: 'subject',
		families: ['transformation'],
		tags: ['motyl*', 'motýl*', 'metamorfoz*', 'metamorfóz*', 'promena*', 'proměna*', 'kukla*', 'kridla*', 'křídla*'],
		categories: { zajimavost: 1.5, veda: 1, psychologie: 0.5 },
		build: butterfly
	},
	{
		key: 'cocoon',
		label: 'Kukla',
		note: 'klid, čekání, zrození',
		role: 'both',
		families: ['transformation'],
		tags: ['kukla*', 'kokon*', 'zavije*', 'zavíje*', 'promena*', 'proměna*'],
		categories: { veda: 1, zajimavost: 1, psychologie: 0.5 },
		build: cocoon
	},
	// Moc a víra
	{
		key: 'throne',
		label: 'Trůn',
		note: 'moc, autorita, panovník',
		role: 'subject',
		families: ['throne'],
		tags: ['trun*', 'trůn*', 'vladce*', 'vládce*', 'moc','moci','mocne*','mocny*','mocni*', 'moci*', 'autorita*', 'panovnik*', 'panovník*', 'kralovst*', 'královst*'],
		categories: { politika: 2.5, historie: 2, filozofie: 0.5 },
		build: throne
	},
	{
		key: 'scepter',
		label: 'Žezlo',
		note: 'vláda, moc, symbol',
		role: 'both',
		families: ['throne', 'ritual'],
		tags: ['zezl*', 'žezl*', 'berla*', 'berly*', 'berlou*'],
		categories: { politika: 2, historie: 1.5 },
		build: scepter
	},
	{
		key: 'seal',
		label: 'Pečeť',
		note: 'úřední moc, závazek, tajemství',
		role: 'both',
		families: ['throne', 'ritual'],
		tags: ['pecet*', 'pečet*', 'peceti*', 'pečeti*', 'razitko*', 'razítk*', 'pecetid*', 'pečetid*'],
		categories: { politika: 1.5, historie: 1.5 },
		build: seal
	},
	{
		key: 'temple',
		label: 'Chrám',
		note: 'víra, civilizace, posvátno',
		role: 'subject',
		families: ['temple'],
		tags: ['chram*', 'chrám*', 'svatyn*', 'svatyne*', 'svatyně*', 'kostel*', 'katedral*', 'bazilik*'],
		categories: { historie: 2, umeni: 1.5, filozofie: 0.5, politika: 0.5 },
		build: temple
	},
	{
		key: 'altar',
		label: 'Oltář',
		note: 'oběť, obřad, posvátné místo',
		role: 'both',
		families: ['ritual', 'temple'],
		tags: ['oltar*', 'oltář*', 'obetist*', 'obětišt*', 'obet*', 'oběť*', 'ritual*', 'rituál*', 'bohosluzb*', 'bohoslužb*'],
		categories: { historie: 1.5, filozofie: 1, umeni: 1 },
		build: altar
	},
	{
		key: 'chalice',
		label: 'Kalich',
		note: 'obřad, víno, posvátný předmět',
		role: 'both',
		families: ['ritual'],
		tags: ['kalich*', 'pohar*', 'pohár*', 'gral*', 'grál*'],
		categories: { historie: 1, umeni: 1, filozofie: 0.5 },
		build: chalice
	}
];
