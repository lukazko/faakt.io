/**
 * Sémantické motivy — malé znovupoužitelné objekty.
 *
 * Každý motiv se kreslí v lokálních souřadnicích kolem počátku (cca 100 × 80
 * jednotek), kompozice ho pak umístí pomocí `group()` z `primitives.js`.
 * Motiv nese metadata pro výběr: české kmeny, kategorie, které mu sedí,
 * a kompoziční rodiny, ve kterých smí vystupovat.
 *
 * Kmeny jsou bez diakritiky. Hvězdička na konci znamená prefix
 * („knih*“ sedí na kniha, knihy, knihovna); bez hvězdičky jde o celé slovo.
 * Díky tomu se krátká slova jako „čas“ neshodují s „část“.
 */

import { arcPath, circle, ellipse, group, line, n, path, polygon, polyline, rect, tick } from './primitives.js';
import { SYMBOLIC_MOTIFS } from './motifs-symbolic.js';

const stroke = (color, sw = 1.5, opacity = 1) => ({
	fill: 'none',
	stroke: color,
	sw,
	opacity,
	linecap: 'round',
	linejoin: 'round'
});

const filled = (color, opacity = 1) => ({ fill: color, opacity });

// --- Příběh, literatura, kultura -----------------------------------------

function book({ palette: p }) {
	const out = [];
	// Desky a hřbet
	out.push(
		path('M -54 26 Q -28 14 0 22 Q 28 14 54 26 L 54 -18 Q 28 -30 0 -22 Q -28 -30 -54 -18 Z', {
			fill: p.woodDark,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		})
	);
	// Stránky — levá a pravá
	out.push(
		path('M -48 20 Q -26 10 0 16 L 0 -16 Q -26 -24 -48 -15 Z', {
			fill: p.paper,
			fillOpacity: 0.34,
			stroke: p.primary,
			sw: 1.1,
			linejoin: 'round'
		})
	);
	out.push(
		path('M 48 20 Q 26 10 0 16 L 0 -16 Q 26 -24 48 -15 Z', {
			fill: p.paper,
			fillOpacity: 0.24,
			stroke: p.primary,
			sw: 1.1,
			linejoin: 'round'
		})
	);
	out.push(line(0, -15, 0, 17, { stroke: p.primary, sw: 2 }));
	// Řádky textu — jen náznak, žádná skutečná písmena
	for (let i = 0; i < 3; i++) {
		const y = -7 + i * 8;
		out.push(
			path(`M -40 ${n(y + 3)} Q -22 ${n(y)} -7 ${n(y + 4)}`, stroke(p.primary, 1, 0.42))
		);
		out.push(
			path(`M 7 ${n(y + 4)} Q 22 ${n(y)} 40 ${n(y + 3)}`, stroke(p.primary, 1, 0.32))
		);
	}
	out.push(rect(7, -14, 5, 26, { fill: p.secondary, opacity: 0.85 }));
	return out;
}

function scroll({ palette: p, rand }) {
	const out = [
		rect(-34, -30, 68, 58, {
			rx: 2,
			fill: p.paper,
			fillOpacity: 0.32,
			stroke: p.primary,
			sw: 1.4
		}),
		ellipse(-34, -2, 7, 30, { fill: p.wood, stroke: p.primary, sw: 1.2 }),
		ellipse(34, -2, 7, 30, { fill: p.wood, stroke: p.primary, sw: 1.2 }),
		line(-34, -32, -34, 28, { stroke: p.primary, sw: 1 }),
		line(34, -32, 34, 28, { stroke: p.primary, sw: 1 })
	];
	for (let i = 0; i < 5; i++) {
		const width = 34 + rand() * 14;
		out.push(tick(-22, -18 + i * 9, width, stroke(p.primary, 1, 0.45)));
	}
	out.push(circle(24, 20, 5.5, { ...filled(p.gold, 0.85), stroke: p.primary, sw: 1 }));
	out.push(circle(24, 20, 2, filled(p.faint, 0.8)));
	return out;
}

function quill({ palette: p }) {
	const out = [
		// Brk
		path('M -30 36 Q -16 6 16 -34 Q 24 -20 18 -2 Q 8 22 -30 36 Z', {
			fill: p.paper,
			fillOpacity: 0.32,
			stroke: p.primary,
			sw: 1.3,
			linejoin: 'round'
		}),
		path('M -28 32 Q -10 8 18 -24', stroke(p.primary, 1.2, 0.8)),
		// Prachové větve
		path('M -8 18 L 2 30 M 0 10 L 10 20 M 8 0 L 18 9 M -16 26 L -8 34', stroke(p.primary, 0.9, 0.45)),
		// Hrot
		path('M -30 36 L -36 44 L -26 40 Z', filled(p.primary, 0.9)),
		// Kalamář
		ellipse(28, 32, 13, 5, { fill: p.waterDark, stroke: p.primary, sw: 1.2 }),
		path('M 20 30 L 22 20 L 34 20 L 36 30', { fill: p.waterDark, stroke: p.primary, sw: 1.2 }),
		ellipse(28, 20, 6, 2, { fill: p.primary, opacity: 0.75 })
	];
	return out;
}

function wolf({ palette: p }) {
	return [
		// Tělo, hlava, uši a nohy v jednom obrysu
		path(
			'M -50 34 L -46 10 Q -44 -6 -30 -10 L -12 -12 L -8 -28 L 2 -18 L 10 -30 L 16 -14 Q 30 -12 38 -2 L 50 2 L 40 10 L 28 10 L 26 34 L 20 34 L 16 14 L 4 16 L 2 34 L -4 34 L -8 16 L -26 14 L -28 34 Z',
			{ fill: p.stoneDark, stroke: p.primary, sw: 1.4, linejoin: 'round' }
		),
		// Světlejší srst na hrudi
		path('M -12 -12 Q -4 2 2 16 Q -8 8 -18 6 Z', { fill: p.stone, opacity: 0.5 }),
		// Ocas
		path('M -46 10 Q -62 2 -58 -14 Q -50 -8 -48 4', stroke(p.stone, 1.4, 0.85)),
		// Oko a čumák
		circle(-2, -8, 1.8, filled(p.gold, 0.95)),
		path('M 38 -2 L 50 2', stroke(p.stone, 1.4, 0.7)),
		path('M -12 -12 L -8 -4 M 16 -14 L 12 -4', stroke(p.primary, 0.8, 0.35))
	];
}

function forest({ palette: p, rand, variant }) {
	const out = [];
	const trees = [
		{ x: -30, scale: 1.08, y: 36 },
		{ x: 2, scale: 1.28, y: 38 },
		{ x: 32, scale: 0.92, y: 36 }
	];
	trees.forEach((tree, index) => {
		const h = 30 * tree.scale;
		out.push(line(tree.x, tree.y, tree.x, tree.y - h * 0.55, { stroke: p.wood, sw: 2 }));
		for (let layer = 0; layer < 3; layer++) {
			const width = (20 - layer * 4) * tree.scale;
			const y = tree.y - h * 0.28 - layer * h * 0.3;
			out.push(
				polygon(
					[
						[tree.x - width / 2, y],
						[tree.x, y - h * 0.62],
						[tree.x + width / 2, y]
					],
					{
						fill: index === 1 ? p.primary : index === 0 ? p.foliageDark : p.foliage,
						opacity: index === 1 ? 0.3 : 0.62,
						stroke: p.primary,
						sw: 1.1,
						linejoin: 'round'
					}
				)
			);
		}
	});
	if (variant === 1) {
		for (let i = 0; i < 3; i++) {
			out.push(circle(rand.range(-40, 40), rand.range(-20, 20), 1.4, filled(p.secondary, 0.5)));
		}
	}
	out.push(line(-46, 38, 46, 38, stroke(p.soft, 1)));
	return out;
}

function castle({ palette: p }) {
	const out = [
		// Hlavní věž
		rect(-14, -18, 28, 54, { fill: p.stoneDark, stroke: p.primary, sw: 1.3 }),
		// Boční věže
		rect(-44, 4, 18, 32, { fill: p.stone, opacity: 0.55, stroke: p.primary, sw: 1.1 }),
		rect(26, 4, 18, 32, { fill: p.stone, opacity: 0.55, stroke: p.primary, sw: 1.1 }),
		// Cimbuří
		rect(-14, -24, 7, 7, { fill: p.primary, opacity: 0.8 }),
		rect(7, -24, 7, 7, { fill: p.primary, opacity: 0.8 }),
		rect(-44, -2, 6, 7, { fill: p.primary, opacity: 0.65 }),
		rect(38, -2, 6, 7, { fill: p.primary, opacity: 0.65 })
	];
	// Stanové střechy
	out.push(
		polygon(
			[
				[-49, 4],
				[-35, -22],
				[-21, 4]
			],
			{ fill: p.primary, opacity: 0.24, stroke: p.primary, sw: 1.1 }
		),
		polygon(
			[
				[21, 4],
				[35, -22],
				[49, 4]
			],
			{ fill: p.primary, opacity: 0.24, stroke: p.primary, sw: 1.1 }
		),
		polygon(
			[
				[-14, -18],
				[0, -42],
				[14, -18]
			],
			{ fill: p.primary, opacity: 0.18, stroke: p.primary, sw: 1.2 }
		)
	);
	// Brána a okna
	out.push(
		path('M -6 36 L -6 18 Q 0 10 6 18 L 6 36 Z', {
			fill: p.woodDark,
			stroke: p.primary,
			sw: 1.1
		})
	);
	out.push(rect(-9, -8, 4, 8, { fill: p.gold, opacity: 0.7 }));
	out.push(rect(5, -8, 4, 8, { fill: p.gold, opacity: 0.7 }));
	// Vlajka
	out.push(line(0, -42, 0, -54, { stroke: p.primary, sw: 1.2 }));
	out.push(path('M 0 -54 L 18 -49 L 0 -44 Z', { fill: p.secondary, opacity: 0.85 }));
	out.push(line(-54, 36, 54, 36, stroke(p.soft, 1)));
	return out;
}

function film({ palette: p, rand }) {
	const out = [
		rect(-25, -40, 50, 80, {
			rx: 2,
			fill: p.metalDark,
			fillOpacity: 0.55,
			stroke: p.primary,
			sw: 1.4
		})
	];
	// Děrné otvory
	for (let i = 0; i < 7; i++) {
		const y = -34 + i * 11;
		out.push(rect(-21, y, 4, 5, { fill: p.dark, stroke: p.primary, sw: 0.6 }));
		out.push(rect(17, y, 4, 5, { fill: p.dark, stroke: p.primary, sw: 0.6 }));
	}
	// Tři okénka se scénou
	for (let i = 0; i < 3; i++) {
		const y = -30 + i * 22;
		out.push(
			rect(-12, y, 24, 16, {
				fill: i === 1 ? p.primary : i === 0 ? p.water : p.gold,
				fillOpacity: i === 1 ? 0.3 : 0.16,
				stroke: p.primary,
				sw: 1
			})
		);
		out.push(path(`M -9 ${n(y + 12)} L -2 ${n(y + 6)} L 4 ${n(y + 11)} L 9 ${n(y + 4)}`, stroke(p.primary, 0.9, 0.5)));
	}
	// Světlo projektoru
	out.push(path('M 25 -18 L 58 -34 L 58 -2 Z', { fill: p.primary, opacity: 0.12 }));
	out.push(circle(rand.range(-8, 8), 0, 1.2, filled(p.secondary, 0.45)));
	return out;
}

// --- Lidé a myšlenky ------------------------------------------------------

function bust({ palette: p }) {
	const out = [
		// Halo
		circle(0, -6, 44, { ...stroke(p.primary, 1, 0.22), dash: '3 7' }),
		// Hlava z profilu
		path(
			'M -14 -34 Q 8 -40 20 -24 Q 26 -14 20 -5 L 27 1 Q 26 5 19 6 L 21 14 Q 16 20 6 18 L 4 30 L -12 30 L -14 18 Q -26 10 -27 -4 Q -28 -26 -14 -34 Z',
			{ fill: p.stone, opacity: 0.75, stroke: p.primary, sw: 1.4, linejoin: 'round' }
		),
		// Stín na krku a tváři
		path('M -16 4 Q -6 12 2 18 L 4 30 L -12 30 L -14 18 Q -22 12 -24 6 Z', {
			fill: p.stoneDark,
			opacity: 0.45
		}),
		// Vlasová linie a oko
		path('M -16 -30 Q 2 -34 13 -22', stroke(p.snow, 1.2, 0.5)),
		circle(5, -12, 1.7, filled(p.gold, 0.95)),
		// Sokl
		rect(-30, 30, 60, 5, { fill: p.stoneDark, stroke: p.primary, sw: 1 }),
		rect(-24, 35, 48, 5, { fill: p.stoneDark, opacity: 0.8, stroke: p.primary, sw: 1 }),
		rect(-34, 40, 68, 4, { fill: p.stoneDark, stroke: p.primary, sw: 1 })
	];
	return out;
}

function laurel({ palette: p }) {
	const out = [path('M -2 38 Q -34 24 -40 -6 Q -26 -2 -16 10', stroke(p.primary, 1.4, 0.75))];
	for (let i = 0; i < 6; i++) {
		const t = i / 5;
		const x = -4 - t * 34;
		const y = 34 - t * 34;
		out.push(
			ellipse(x - 3, y - 3, 6, 2.4, {
				fill: p.foliage,
				opacity: 0.35 + i * 0.07,
				stroke: p.primary,
				sw: 0.9,
				rot: -34
			})
		);
	}
	out.push(circle(-38, 32, 2.2, filled(p.gold, 0.9)));
	out.push(circle(-30, 24, 1.8, filled(p.gold, 0.7)));
	return out;
}

function column({ palette: p }) {
	const out = [
		// Stupně
		rect(-34, 36, 68, 5, { fill: p.stoneDark, stroke: p.primary, sw: 1 }),
		rect(-29, 31, 58, 5, { fill: p.stoneDark, opacity: 0.85, stroke: p.primary, sw: 1 }),
		// Dřík
		rect(-16, -20, 32, 51, {
			fill: p.stone,
			fillOpacity: 0.38,
			stroke: p.primary,
			sw: 1.3
		}),
		// Kanelury
		line(-9, -16, -9, 27, stroke(p.primary, 0.8, 0.35)),
		line(0, -16, 0, 27, stroke(p.primary, 0.8, 0.25)),
		line(9, -16, 9, 27, stroke(p.primary, 0.8, 0.35)),
		// Hlavice
		rect(-23, -25, 46, 6, { fill: p.dark, stroke: p.primary, sw: 1.1 }),
		rect(-19, -31, 38, 6, { fill: p.dark, stroke: p.primary, sw: 1.1 }),
		// Voluty
		circle(-23, -21, 4, { fill: 'none', stroke: p.secondary, sw: 1.2 }),
		circle(23, -21, 4, { fill: 'none', stroke: p.secondary, sw: 1.2 }),
		// Štít
		polygon(
			[
				[-25, -31],
				[0, -46],
				[25, -31]
			],
			{ fill: p.primary, opacity: 0.12, stroke: p.primary, sw: 1 }
		)
	];
	return out;
}

function scrollOfLaw({ palette: p, rand }) {
	// Varianta svitku pro politiku a právo — pečeť a stužka
	const out = scroll({ palette: p, rand });
	out.push(path('M 18 16 L 34 34 L 27 34 L 31 43 L 20 40 L 15 32 Z', { fill: p.secondary, opacity: 0.35, stroke: p.primary, sw: 1 }));
	return out;
}

function brain({ palette: p }) {
	return [
		path(
			'M -2 28 Q -20 30 -28 16 Q -38 6 -29 -4 Q -34 -16 -22 -22 Q -16 -34 -4 -28 Q 2 -40 13 -30 Q 27 -32 29 -18 Q 40 -9 32 4 Q 37 18 24 23 Q 19 33 8 28 Z',
			{ fill: p.emberDark, fillOpacity: 0.7, stroke: p.primary, sw: 1.4, linejoin: 'round' }
		),
		path('M 0 27 Q -2 12 -12 4 Q 2 2 2 -12 Q 4 -20 10 -24', stroke(p.ember, 1.1, 0.7)),
		path('M -12 4 Q -22 0 -24 -10 M 2 -12 Q 12 -12 18 -6 M 10 -24 Q 20 -20 22 -12 M -8 22 Q -16 16 -18 8', stroke(p.primary, 1, 0.4)),
		circle(-2, 6, 2, filled(p.secondary, 0.8))
	];
}

// --- Věda a objevování ----------------------------------------------------

function flask({ palette: p, rand }) {
	const out = [
		rect(-8, -42, 16, 20, { fill: p.faint, stroke: p.primary, sw: 1.2 }),
		ellipse(0, -42, 8, 3, { fill: 'none', stroke: p.primary, sw: 1.2 }),
		path('M -8 -22 L -8 -6 L -34 28 Q -38 36 -28 36 L 28 36 Q 38 36 34 28 L 8 -6 L 8 -22', {
			fill: p.light,
			fillOpacity: 0.08,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		// Kapalina
		path('M -30 27 Q 0 20 30 27 L 34 28 Q 38 36 28 36 L -28 36 Q -38 36 -34 28 Z', {
			fill: p.water,
			opacity: 0.4
		}),
		line(-30, 27, 30, 27, stroke(p.primary, 1, 0.55))
	];
	for (let i = 0; i < 3; i++) {
		out.push(circle(rand.range(-14, 14), rand.range(-16, 12), 1.6 + rand() * 1.2, {
			fill: 'none',
			stroke: i % 2 === 0 ? p.tertiary : p.gold,
			sw: 0.9,
			opacity: 0.7
		}));
	}
	// Ryska
	out.push(tick(-14, 8, 8, stroke(p.primary, 0.9, 0.45)));
	out.push(tick(-16, 14, 10, stroke(p.primary, 0.9, 0.45)));
	return out;
}

function microscope({ palette: p }) {
	return [
		// Podstava
		path('M -34 38 Q -22 28 -8 28 L 30 28 Q 38 28 38 34 L 38 38 Z', {
			fill: p.metalDark,
			stroke: p.primary,
			sw: 1.2,
			linejoin: 'round'
		}),
		// Stojan
		path('M 10 30 Q 2 10 6 -10 L 10 -26', stroke(p.primary, 4, 0.75)),
		// Tubus
		path('M -2 -34 L 18 -42 L 28 -16 L 8 -8 Z', {
			fill: p.metal,
			fillOpacity: 0.3,
			stroke: p.primary,
			sw: 1.3,
			linejoin: 'round'
		}),
		ellipse(10, -25, 7, 11, { ...stroke(p.primary, 1.1, 0.8), rot: -20 }),
		// Okulár
		path('M -4 -36 L 2 -48', stroke(p.primary, 3, 0.9)),
		// Stolek
		line(-26, 8, 24, 8, { stroke: p.primary, sw: 2 }),
		rect(-18, 8, 18, 2.5, { fill: p.water, opacity: 0.65 }),
		// Zaostřovací šroub
		circle(18, 12, 4, { fill: 'none', stroke: p.gold, sw: 1.2 }),
		line(18, 8, 18, 16, stroke(p.gold, 1, 0.8)),
		// Světlo
		path('M -8 14 L -16 26 L 4 26 Z', { fill: p.primary, opacity: 0.12 })
	];
}

function magnifier({ palette: p, rand }) {
	const out = [
		circle(-8, -6, 25, { fill: p.water, fillOpacity: 0.14, stroke: p.primary, sw: 3 }),
		circle(-8, -6, 20, { ...stroke(p.primary, 1, 0.35), dash: '2 4' }),
		line(10, 12, 36, 38, { stroke: p.primary, sw: 5, linecap: 'round' }),
		line(10, 12, 36, 38, { stroke: p.wood, sw: 2, linecap: 'round' }),
		// Zkoumaný vzorek
		circle(-14, -10, 3, filled(p.secondary, 0.6)),
		circle(-2, -2, 2, filled(p.secondary, 0.4)),
		path('M -20 -2 Q -10 -16 0 -10', stroke(p.secondary, 1, 0.55)),
		arcPath(-8, -6, 17, 200, 250, stroke(p.light, 1.4, 0.4))
	];
	if (rand() > 0.5) out.push(tick(-18, 2, 14, stroke(p.primary, 0.8, 0.3)));
	return out;
}

function telescope({ palette: p }) {
	const out = [
		// Stativ
		line(0, 2, -30, 40, { stroke: p.wood, sw: 1.8, linecap: 'round' }),
		line(0, 2, 28, 40, { stroke: p.wood, sw: 1.8, linecap: 'round' }),
		line(0, 2, 2, 42, { stroke: p.woodDark, sw: 1.4, linecap: 'round' }),
		// Tubus
		path('M -34 -4 L 26 -32 L 34 -18 L -26 10 Z', {
			fill: p.goldDark,
			fillOpacity: 0.72,
			stroke: p.primary,
			sw: 1.4,
			linejoin: 'round'
		}),
		ellipse(30, -25, 6, 10, { fill: p.gold, opacity: 0.35, stroke: p.primary, sw: 1.2, rot: 26 }),
		ellipse(30, -25, 3, 6, { fill: p.water, opacity: 0.65, rot: 26 }),
		line(-26, 6, -18, -2, stroke(p.goldDark, 2)),
		// Nohavice okuláru
		path('M -34 -4 L -42 -10 L -34 -17 L -26 4 Z', { fill: p.faint, stroke: p.primary, sw: 1 })
	];
	// Hvězdy v zorném poli
	out.push(circle(44, -46, 1.4, filled(p.secondary, 0.7)));
	out.push(circle(20, -52, 1, filled(p.secondary, 0.45)));
	out.push(circle(56, -24, 1.2, filled(p.secondary, 0.5)));
	return out;
}

function atom({ palette: p }) {
	const out = [];
	const orbits = [
		{ rx: 44, ry: 16, rot: 0 },
		{ rx: 44, ry: 16, rot: 60 },
		{ rx: 44, ry: 16, rot: 120 }
	];
	orbits.forEach((orbit, index) => {
		out.push(
			ellipse(0, 0, orbit.rx, orbit.ry, {
				...stroke(index === 1 ? p.primary : index === 2 ? p.tertiary : p.soft, index === 1 ? 1.5 : 1, index === 1 ? 0.85 : 0.6),
				rot: orbit.rot
			})
		);
	});
	out.push(circle(0, 0, 7, filled(p.primary, 0.9)));
	out.push(circle(0, 0, 3, filled(p.faint, 0.9)));
	// Elektrony na drahách
	out.push(circle(42, 0, 3, filled(p.secondary, 0.9)));
	out.push(circle(-22, -13, 2.6, filled(p.tertiary, 0.85)));
	out.push(circle(22, 13, 2.6, filled(p.gold, 0.85)));
	return out;
}

function dna({ palette: p }) {
	const out = [];
	const left = 'M -16 -44 C 20 -32 -20 -20 -16 -8 C 12 4 -20 16 -16 28 C 8 38 -20 44 -16 48';
	const right = 'M 16 -44 C -20 -32 20 -20 16 -8 C -12 4 20 16 16 28 C -8 38 20 44 16 48';
	out.push(path(left, stroke(p.primary, 1.8, 0.9)));
	out.push(path(right, stroke(p.secondary, 1.8, 0.75)));
	for (let i = 0; i < 7; i++) {
		const y = -38 + i * 13;
		const curve = Math.sin((i / 6) * Math.PI * 3) * 15;
		out.push(
			line(-curve, y, curve, y, {
				stroke: i % 3 === 0 ? p.tertiary : p.primary,
				sw: 1,
				opacity: 0.55,
				linecap: 'round'
			})
		);
	}
	out.push(circle(-15, -40, 2, filled(p.secondary, 0.9)));
	out.push(circle(15, 44, 2, filled(p.gold, 0.9)));
	return out;
}

function planet({ palette: p, rand, variant }) {
	const out = [];
	if (variant === 1) {
		out.push(circle(0, 0, 44, { ...stroke(p.primary, 1, 0.2), dash: '2 6' }));
	}
	out.push(ellipse(0, 0, 48, 12, { fill: 'none', stroke: p.secondary, sw: 1.6, opacity: 0.65, rot: -16 }));
	out.push(circle(0, 0, 24, { fill: p.waterDark, stroke: p.primary, sw: 1.6 }));
	// Pevnina a led — planeta není jednobarevná koule
	out.push(path('M -18 -8 Q -8 -18 4 -12 Q 14 -8 12 0 Q 2 4 -6 0 Q -14 4 -18 -8 Z', {
		fill: p.foliage,
		opacity: 0.5
	}));
	out.push(path('M -2 14 Q 8 10 18 14 Q 12 20 0 20 Z', { fill: p.wood, opacity: 0.45 }));
	out.push(path('M 8 -20 Q 16 -16 18 -8 L 10 -8 Z', { fill: p.snow, opacity: 0.5 }));
	out.push(ellipse(0, 0, 48, 12, { fill: 'none', stroke: p.secondary, sw: 1.6, opacity: 0.35, rot: -16 }));
	out.push(path('M -18 -8 Q -8 -18 4 -12 Q 16 -8 18 2', stroke(p.light, 1.2, 0.35)));
	out.push(circle(7, 7, 3, filled(p.primary, 0.35)));
	out.push(circle(42, -28, 3.4, filled(p.secondary, 0.9)));
	for (let i = 0; i < 3; i++) {
		out.push(circle(rand.range(-58, 58), rand.range(-40, -24), rand.range(0.8, 1.6), filled(p.muted, 0.55)));
	}
	return out;
}

function blackhole({ palette: p, rand }) {
	const out = [
		// Akreční disk
		ellipse(0, 0, 52, 13, { fill: 'none', stroke: p.primary, sw: 2, opacity: 0.85, rot: -8 }),
		ellipse(0, 0, 46, 11, { fill: 'none', stroke: p.ember, sw: 1.6, opacity: 0.6, rot: -8 }),
		ellipse(0, 0, 41, 9, { fill: 'none', stroke: p.gold, sw: 1, opacity: 0.65, rot: -8 }),
		// Horizont událostí
		circle(0, 0, 17, { fill: '#050505', stroke: p.primary, sw: 1.8 }),
		// Ohnuté světlo
		arcPath(0, 0, 25, 190, 350, stroke(p.light, 1.6, 0.55)),
		arcPath(0, 0, 30, 10, 170, stroke(p.secondary, 1.2, 0.4)),
		// Trysky
		line(0, -20, 0, -44, stroke(p.primary, 1.2, 0.35)),
		line(0, 20, 0, 44, stroke(p.primary, 1.2, 0.25))
	];
	for (let i = 0; i < 4; i++) {
		out.push(circle(rand.range(-58, 58), rand.range(-36, 36), rand.range(0.7, 1.4), filled(p.muted, 0.5)));
	}
	return out;
}

function rocket({ palette: p, rand }) {
	const out = [
		path('M 0 -48 Q 16 -30 14 8 L 10 30 L -10 30 L -14 8 Q -16 -30 0 -48 Z', {
			fill: p.metal,
			fillOpacity: 0.28,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		path('M -14 8 L -30 30 L -12 26 Z', { fill: p.emberDark, stroke: p.primary, sw: 1.1 }),
		path('M 14 8 L 30 30 L 12 26 Z', { fill: p.emberDark, stroke: p.primary, sw: 1.1 }),
		circle(0, -18, 6, { fill: p.water, opacity: 0.45, stroke: p.gold, sw: 1.2 }),
		path('M -8 32 Q 0 52 8 32 Q 4 44 0 46 Q -4 44 -8 32 Z', {
			fill: p.ember,
			opacity: 0.7
		}),
		line(-9, 22, 9, 22, stroke(p.primary, 1, 0.6))
	];
	for (let i = 0; i < 4; i++) {
		out.push(circle(rand.range(-50, 50), rand.range(-44, 20), rand.range(0.7, 1.5), filled(p.muted, 0.5)));
	}
	return out;
}

// --- Historie, místa, artefakty -------------------------------------------

function map({ palette: p }) {
	const out = [
		path('M -54 -26 L -18 -34 L 12 -26 L 50 -34 L 50 30 L 14 38 L -16 30 L -54 38 Z', {
			fill: p.paper,
			fillOpacity: 0.26,
			stroke: p.primary,
			sw: 1.3,
			linejoin: 'round'
		}),
		// Naznačená pevnina a voda
		path('M -34 -18 Q -14 -26 2 -16 Q -6 -4 -24 -8 Q -34 -10 -34 -18 Z', {
			fill: p.foliage,
			opacity: 0.35
		}),
		path('M 8 18 Q 24 10 40 20 Q 34 30 18 28 Q 8 26 8 18 Z', {
			fill: p.foliage,
			opacity: 0.28
		}),
		path('M 16 -22 Q 26 -28 38 -24 Q 30 -16 18 -16 Z', {
			fill: p.water,
			opacity: 0.4
		}),
		line(-16, -31, -16, 33, stroke(p.primary, 0.8, 0.35)),
		line(14, -28, 14, 36, stroke(p.primary, 0.8, 0.35)),
		// Trasa
		polyline(
			[
				[-40, 18],
				[-24, 2],
				[-4, 8],
				[8, -8],
				[30, -14]
			],
			{ ...stroke(p.secondary, 1.6, 0.8), dash: '4 5' }
		),
		// Křížek cíle
		line(30, -20, 30, -8, stroke(p.primary, 2)),
		line(24, -14, 36, -14, stroke(p.primary, 2)),
		// Kompas
		circle(-32, -16, 7, { fill: 'none', stroke: p.gold, sw: 1 }),
		polygon(
			[
				[-32, -21],
				[-29, -16],
				[-32, -11],
				[-35, -16]
			],
			{ fill: p.gold, opacity: 0.8 }
		)
	];
	return out;
}

function amphora({ palette: p }) {
	return [
		// Tělo
		path('M -22 -26 Q -4 -34 22 -26 Q 18 -6 14 10 Q 10 30 0 40 Q -10 30 -14 10 Q -18 -6 -22 -26 Z', {
			fill: p.wood,
			fillOpacity: 0.4,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		rect(-10, -34, 20, 8, { fill: p.woodDark, stroke: p.primary, sw: 1.1 }),
		ellipse(0, -34, 11, 3, { fill: 'none', stroke: p.primary, sw: 1.2 }),
		// Ucha
		path('M -20 -22 Q -40 -18 -34 2 Q -30 10 -16 6', stroke(p.primary, 1.6, 0.85)),
		path('M 20 -22 Q 40 -18 34 2 Q 30 10 16 6', stroke(p.primary, 1.6, 0.85)),
		// Pásy a vzor
		line(-19, -14, 19, -14, stroke(p.primary, 1, 0.55)),
		line(-16, 4, 16, 4, stroke(p.primary, 1, 0.55)),
		line(-12, 12, 12, 12, stroke(p.primary, 1, 0.4)),
		circle(-8, -4, 2.2, filled(p.gold, 0.85)),
		circle(0, -4, 2.2, filled(p.secondary, 0.6)),
		circle(8, -4, 2.2, filled(p.gold, 0.85)),
		// Stín
		ellipse(0, 42, 24, 4, { fill: p.primary, opacity: 0.1 })
	];
}

function stele({ palette: p }) {
	const out = [
		path('M -30 42 L -30 -18 Q -30 -40 0 -42 Q 30 -40 30 -18 L 30 42 Z', {
			fill: p.stoneDark,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		path('M -24 36 L -24 -18 Q -24 -34 0 -36 Q 24 -34 24 -18 L 24 36 Z', {
			fill: p.stone,
			fillOpacity: 0.18,
			stroke: p.primary,
			sw: 0.9,
			opacity: 0.45
		})
	];
	// Nápis — abstraktní řádky a symboly, žádná písmena
	for (let i = 0; i < 6; i++) {
		const y = -24 + i * 9;
		const width = i % 2 === 0 ? 30 : 22;
		out.push(tick(-width / 2, y, width, stroke(p.primary, 1.2, 0.55)));
		if (i % 2 === 1) {
			out.push(circle(-8, y - 1, 1.4, { fill: 'none', stroke: p.secondary, sw: 0.8 }));
			out.push(circle(8, y - 1, 1.4, { fill: 'none', stroke: p.secondary, sw: 0.8 }));
		}
	}
	out.push(path('M 14 8 L 18 16 L 14 24 L 20 31', stroke(p.primary, 0.9, 0.5)));
	// Střepy
	out.push(polygon([[-30, 42], [-20, 36], [-14, 44]], { fill: p.primary, opacity: 0.18 }));
	return out;
}

function crown({ palette: p }) {
	const out = [
		path('M -38 -8 L -34 20 L 34 20 L 38 -8 L 22 6 L 12 -22 L 0 2 L -12 -22 L -22 6 Z', {
			fill: p.gold,
			fillOpacity: 0.45,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		rect(-34, 20, 68, 6, { fill: p.goldDark, stroke: p.primary, sw: 1.2 }),
		line(-30, 10, 30, 10, stroke(p.primary, 1, 0.5)),
		circle(0, 10, 3, filled(p.ember, 0.9)),
		circle(-18, 10, 2.2, filled(p.water, 0.8)),
		circle(18, 10, 2.2, filled(p.water, 0.8)),
		circle(0, -1, 2, filled(p.primary, 0.9))
	];
	return out;
}

function key({ palette: p }) {
	return [
		circle(-28, 0, 16, { fill: 'none', stroke: p.primary, sw: 3 }),
		circle(-28, 0, 8, { fill: 'none', stroke: p.gold, sw: 2, opacity: 0.9 }),
		line(-12, 0, 42, 0, { stroke: p.primary, sw: 4, linecap: 'round' }),
		rect(20, 0, 5, 10, { fill: p.gold, opacity: 0.95 }),
		rect(32, 0, 5, 13, { fill: p.gold, opacity: 0.95 }),
		line(42, 0, 46, 0, { stroke: p.gold, sw: 3 })
	];
}

// --- Příroda a živé systémy ------------------------------------------------

function tree({ palette: p, rand }) {
	const out = [
		line(0, 40, 0, 4, { stroke: p.wood, sw: 4, linecap: 'round' }),
		path('M 0 18 L -14 6 M 0 10 L 13 -2 M 0 0 L -9 -14', stroke(p.woodDark, 2, 0.85)),
		circle(-15, -14, 17, { fill: p.foliageDark, opacity: 0.5, stroke: p.primary, sw: 1.2 }),
		circle(14, -18, 18, { fill: p.foliage, opacity: 0.38, stroke: p.primary, sw: 1.2 }),
		circle(0, -30, 19, { fill: p.primary, opacity: 0.22, stroke: p.primary, sw: 1.3 }),
		line(-46, 40, 46, 40, stroke(p.soft, 1))
	];
	for (let i = 0; i < 4; i++) {
		out.push(circle(rand.range(-24, 24), rand.range(-36, -6), 1.3, filled(p.gold, 0.65)));
	}
	return out;
}

function leaf({ palette: p }) {
	const out = [
		path('M 0 40 Q -4 16 0 -10 Q 0 -34 26 -40 Q 30 -14 20 4 Q 12 22 0 40 Z', {
			fill: p.foliage,
			fillOpacity: 0.42,
			stroke: p.primary,
			sw: 1.4,
			linejoin: 'round'
		}),
		path('M 0 38 Q 4 16 20 2 Q 26 -10 26 -38', stroke(p.primary, 1.3, 0.85)),
		path('M 4 22 Q 14 18 18 10 M 8 6 Q 18 2 22 -6 M 14 -10 Q 20 -14 23 -22', stroke(p.primary, 1, 0.45)),
		path('M 0 38 Q -8 44 -12 50', stroke(p.foliageDark, 1.8, 0.9))
	];
	return out;
}

function octopus({ palette: p }) {
	const out = [
		path('M -28 8 Q -28 -30 0 -32 Q 28 -30 28 8 Q 20 18 8 14 L 10 26 Q 6 30 2 20 L 0 28 Q -4 30 -6 20 L -10 26 Q -14 28 -14 16 Q -22 18 -28 8 Z', {
			fill: p.emberDark,
			fillOpacity: 0.75,
			stroke: p.primary,
			sw: 1.4,
			linejoin: 'round'
		}),
		circle(-9, -12, 3.4, filled(p.gold, 0.9)),
		circle(9, -12, 3.4, filled(p.gold, 0.9)),
		circle(-9, -12, 1.5, filled(p.faint, 0.9)),
		circle(9, -12, 1.5, filled(p.faint, 0.9))
	];
	// Chapadla
	[
		'M -22 4 Q -40 16 -36 34 Q -30 26 -24 22',
		'M -10 14 Q -18 34 -8 42 Q -4 30 0 22',
		'M 10 14 Q 18 34 8 42 Q 4 30 0 22',
		'M 22 4 Q 40 16 36 34 Q 30 26 24 22'
	].forEach((d) => out.push(path(d, stroke(p.primary, 2, 0.8))));
	for (let i = 0; i < 4; i++) {
		out.push(circle(-14 + i * 9, 24 + (i % 2) * 4, 1.3, filled(p.gold, 0.65)));
	}
	return out;
}

function bird({ palette: p }) {
	return [
		path('M -36 4 Q -8 -10 0 2 Q 8 -6 22 -8 L 34 -2 L 22 6 Q 4 10 -6 16 Q -18 20 -26 6 Z', {
			fill: p.stoneDark,
			stroke: p.primary,
			sw: 1.3,
			linejoin: 'round'
		}),
		path('M -2 4 Q 8 -24 30 -30 Q 26 -16 18 -8 Q 8 0 2 6 Z', {
			fill: p.primary,
			opacity: 0.32,
			stroke: p.primary,
			sw: 1.1
		}),
		path('M -18 8 Q -8 2 -2 6 Q -8 12 -18 8 Z', { fill: p.stone, opacity: 0.5 }),
		circle(29, -2, 1.3, filled(p.gold, 0.95)),
		path('M 34 -2 L 41 0 L 34 3 Z', { fill: p.gold, opacity: 0.9 }),
		line(-54, 34, 54, 34, stroke(p.soft, 1))
	];
}

function mountain({ palette: p, rand }) {
	const out = [
		polygon(
			[
				[-58, 38],
				[-22, -28],
				[10, 38]
			],
			{ fill: p.stoneDark, stroke: p.primary, sw: 1.3, linejoin: 'round' }
		),
		polygon(
			[
				[-22, -28],
				[-14, -14],
				[-24, -10],
				[-30, -18]
			],
			{ fill: p.snow, opacity: 0.55 }
		),
		polygon(
			[
				[-6, 38],
				[32, -20],
				[60, 38]
			],
			{ fill: p.stone, opacity: 0.55, stroke: p.primary, sw: 1.2, linejoin: 'round' }
		),
		polygon(
			[
				[32, -20],
				[40, -4],
				[30, -10],
				[24, -2]
			],
			{ fill: p.snow, opacity: 0.6 }
		),
		circle(44, -34, 9, { fill: p.gold, opacity: 0.6 }),
		line(-58, 38, 60, 38, stroke(p.soft, 1.2))
	];
	for (let i = 0; i < 3; i++) {
		out.push(circle(rand.range(-50, 50), rand.range(-40, -24), 1.2, filled(p.muted, 0.45)));
	}
	return out;
}

function cat({ palette: p }) {
	return [
		// Sedící kočka
		path('M -18 16 Q -24 -2 -14 -8 L -20 -28 L -6 -20 Q 0 -24 6 -20 L 20 -28 L 14 -8 Q 24 -2 18 16 Q 14 30 0 32 Q -14 30 -18 16 Z', {
			fill: p.woodDark,
			stroke: p.primary,
			sw: 1.4,
			linejoin: 'round'
		}),
		// Tělo a tlapičky
		path('M -18 16 Q -30 30 -20 40 L 20 40 Q 30 30 18 16', {
			fill: p.woodDark,
			stroke: p.primary,
			sw: 1.3,
			linejoin: 'round'
		}),
		path('M -10 18 Q 0 26 10 18 L 8 38 L -8 38 Z', { fill: p.wood, opacity: 0.35 }),
		path('M 18 26 Q 42 26 38 8 Q 36 0 30 2', stroke(p.wood, 2.2, 0.9)),
		circle(-6, -6, 1.8, filled(p.gold, 0.95)),
		circle(6, -6, 1.8, filled(p.gold, 0.95)),
		path('M -2 2 L 0 4 L 2 2', stroke(p.ember, 1.2, 0.95)),
		path('M -12 -2 L -24 -4 M -12 2 L -24 6 M 12 -2 L 24 -4 M 12 2 L 24 6', stroke(p.primary, 0.7, 0.4)),
		line(-40, 40, 40, 40, stroke(p.soft, 1))
	];
}

// --- Abstraktní koncepty a vztahy -----------------------------------------

function balance({ palette: p }) {
	return [
		line(0, -32, 0, 38, { stroke: p.primary, sw: 2.4 }),
		line(-26, 38, 26, 38, { stroke: p.primary, sw: 2.4, linecap: 'round' }),
		polygon(
			[
				[-9, 38],
				[0, 24],
				[9, 38]
			],
			{ fill: p.primary, opacity: 0.35 }
		),
		line(-48, -26, 48, -18, { stroke: p.primary, sw: 2, linecap: 'round' }),
		circle(0, -24, 4, filled(p.secondary, 0.9)),
		// Řetízky a misky
		line(-44, -26, -54, -2, stroke(p.muted, 1, 0.7)),
		line(-44, -26, -34, -2, stroke(p.muted, 1, 0.7)),
		path('M -58 -2 Q -44 14 -30 -2', stroke(p.primary, 1.6, 0.85)),
		line(44, -18, 54, 4, stroke(p.muted, 1, 0.7)),
		line(44, -18, 34, 4, stroke(p.muted, 1, 0.7)),
		path('M 30 4 Q 44 20 58 4', stroke(p.primary, 1.6, 0.85)),
		// Mince v miskách — peníze jsou ovály, ne hranaté bloky
		ellipse(-48, -8, 12, 4.5, { fill: p.gold, opacity: 0.55, stroke: p.primary, sw: 1 }),
		ellipse(-48, -13, 12, 4.5, { fill: p.gold, opacity: 0.4, stroke: p.primary, sw: 1 }),
		ellipse(-48, -18, 12, 4.5, { fill: p.gold, opacity: 0.28, stroke: p.primary, sw: 1 }),
		ellipse(40, -6, 10, 4, { fill: p.metal, opacity: 0.5, stroke: p.primary, sw: 1 }),
		ellipse(40, -11, 10, 4, { fill: p.metal, opacity: 0.34, stroke: p.primary, sw: 1 })
	];
}

function clock({ palette: p, variant }) {
	const out = [
		circle(0, 0, 34, { fill: p.paper, fillOpacity: 0.16, stroke: p.primary, sw: 1.8 }),
		circle(0, 0, 34, { fill: 'none', stroke: p.woodDark, sw: 4, opacity: 0.55 }),
		circle(0, 0, 29, { ...stroke(p.primary, 1, 0.3), dash: '2 4' })
	];
	for (let i = 0; i < 12; i++) {
		const angle = (i / 12) * Math.PI * 2;
		const inner = i % 3 === 0 ? 22 : 25;
		out.push(
			line(Math.cos(angle) * inner, Math.sin(angle) * inner, Math.cos(angle) * 28, Math.sin(angle) * 28, {
				stroke: i % 3 === 0 ? p.primary : p.muted,
				sw: i % 3 === 0 ? 1.6 : 0.9,
				opacity: i % 3 === 0 ? 0.8 : 0.45
			})
		);
	}
	const hourAngle = variant === 1 ? -0.9 : -0.35;
	out.push(line(0, 0, Math.cos(hourAngle) * 16, Math.sin(hourAngle) * 16, { stroke: p.primary, sw: 2.4, linecap: 'round' }));
	out.push(line(0, 0, Math.cos(1.65) * 23, Math.sin(1.65) * 23, { stroke: p.ember, sw: 1.5, linecap: 'round' }));
	out.push(circle(0, 0, 2.6, filled(p.gold, 0.95)));
	return out;
}

function gear({ palette: p }) {
	const out = [circle(0, 0, 22, { fill: p.metalDark, fillOpacity: 0.75, stroke: p.primary, sw: 1.5 })];
	for (let i = 0; i < 8; i++) {
		out.push(
			rect(-4.5, -30, 9, 10, {
				rx: 1,
				fill: p.metal,
				fillOpacity: 0.55,
				stroke: p.primary,
				sw: 1.1,
				transform: `rotate(${i * 45})`
			})
		);
	}
	out.push(circle(0, 0, 7, { fill: p.woodDark, stroke: p.primary, sw: 1.2 }));
	out.push(circle(-28, 24, 11, { fill: p.goldDark, fillOpacity: 0.7, stroke: p.gold, sw: 1.2 }));
	out.push(circle(-28, 24, 3, { fill: p.gold, opacity: 0.8 }));
	return out;
}

function coin({ palette: p }) {
	const out = [
		ellipse(0, 24, 34, 6, { fill: p.primary, opacity: 0.1 }),
		circle(0, -2, 28, { fill: p.light, fillOpacity: 0.12, stroke: p.primary, sw: 2 }),
		circle(0, -2, 23, { fill: 'none', stroke: p.primary, sw: 1, opacity: 0.5 }),
		// Abstraktní nominál — svislé čárky, žádné písmo
		line(-8, -16, -8, 12, { stroke: p.primary, sw: 2 }),
		line(0, -20, 0, 16, { stroke: p.primary, sw: 2 }),
		line(8, -16, 8, 12, { stroke: p.primary, sw: 2 }),
		path('M -17 4 Q 0 16 17 4', stroke(p.secondary, 1.2, 0.7)),
		// Další mince v pozadí
		ellipse(24, 10, 18, 5, { fill: 'none', stroke: p.primary, sw: 1, opacity: 0.35 }),
		ellipse(30, 18, 16, 4, { fill: 'none', stroke: p.primary, sw: 1, opacity: 0.2 })
	];
	return out;
}

function periodicTable({ palette: p }) {
	const out = [];
	const cols = 5;
	const rows = 4;
	const w = 20;
	const h = 16;
	const gap = 3;
	const totalW = cols * w + (cols - 1) * gap;
	const totalH = rows * h + (rows - 1) * gap;
	const x0 = -totalW / 2;
	const y0 = -totalH / 2 - 2;
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			// Poslední řádek je kratší — stejně jako v periodické tabulce.
			if (r === rows - 1 && c > 1) continue;
			const highlighted = (r === 1 && c === 2) || (r === 2 && c === 4);
			const x = x0 + c * (w + gap);
			const y = y0 + r * (h + gap);
			out.push(
				rect(x, y, w, h, {
					rx: 2,
					fill: highlighted ? p.accent : p.paper,
					fillOpacity: highlighted ? 0.32 : 0.06,
					stroke: highlighted ? p.accent : p.primary,
					sw: highlighted ? 1.4 : 0.9
				})
			);
			// Naznačený symbol prvku — jedna krátká čárka, žádné písmo.
			out.push(line(x + 5, y + 8, x + w - 5, y + 8, stroke(highlighted ? p.accent : p.muted, 0.8, 0.4)));
		}
	}
	out.push(circle(0, totalH / 2 + 18, 2, filled(p.gold, 0.6)));
	return out;
}

function snowflake({ palette: p, variant = 0 }) {
	const out = [circle(0, 0, 46, { fill: p.snow, opacity: 0.04 })];
	const arms = 6;
	for (let i = 0; i < arms; i++) {
		const angle = (i / arms) * Math.PI * 2 - Math.PI / 2;
		const dx = Math.cos(angle);
		const dy = Math.sin(angle);
		out.push(line(0, 0, dx * 46, dy * 46, { stroke: p.primary, sw: 2, opacity: 0.85, linecap: 'round' }));
		for (const [at, len] of [
			[0.45, 12],
			[0.68, 9]
		]) {
			const bx = dx * 46 * at;
			const by = dy * 46 * at;
			for (const side of [-1, 1]) {
				const branch = angle + side * 0.7;
				out.push(
					line(bx, by, bx + Math.cos(branch) * len, by + Math.sin(branch) * len, {
						stroke: p.secondary,
						sw: 1.3,
						opacity: 0.7,
						linecap: 'round'
					})
				);
			}
		}
	}
	out.push(circle(0, 0, 7, { fill: p.snow, opacity: 0.18, stroke: p.primary, sw: 1.2 }));
	out.push(circle(0, 0, 2.5, filled(p.primary, 0.9)));
	if (variant === 1) out.push(circle(0, 0, 54, stroke(p.secondary, 0.9, 0.2)));
	if (variant === 2) out.push(polygon([[0, -56], [8, -44], [-8, -44]], filled(p.gold, 0.3)));
	return out;
}

function knife({ palette: p, variant = 0 }) {
	const out = [];
	// Čepel — ostrý klín, ať je násilí čitelné bez doslovné scény.
	out.push(
		polygon(
			[
				[-4, -38],
				[8, -8],
				[4, 16],
				[-4, 16],
				[-8, -8]
			],
			{ fill: p.metal, fillOpacity: 0.6, stroke: p.primary, sw: 1.2, linejoin: 'round' }
		)
	);
	out.push(line(0, -30, 0, 12, stroke(p.snow, 0.9, 0.35)));
	out.push(rect(-6, 16, 12, 24, { rx: 3, fill: p.woodDark, fillOpacity: 0.8, stroke: p.gold, sw: 1.1 }));
	out.push(line(-9, 20, 9, 20, { stroke: p.gold, sw: 1.4 }));
	out.push(line(-9, 36, 9, 36, { stroke: p.gold, sw: 1.4 }));
	if (variant === 1) {
		out.push(line(-16, -30, 16, -14, stroke(p.primary, 1, 0.35)));
		out.push(line(-16, -18, 16, -2, stroke(p.primary, 1, 0.25)));
	}
	return out;
}

function palette({ palette: p }) {
	const out = [
		path('M -40 8 Q -46 -18 -22 -28 Q 6 -40 30 -24 Q 42 -14 34 2 Q 28 12 16 10 Q 8 8 7 16 Q 5 28 -8 30 Q -30 34 -40 8 Z', {
			fill: p.wood,
			fillOpacity: 0.38,
			stroke: p.primary,
			sw: 1.5,
			linejoin: 'round'
		}),
		circle(12, 18, 6, { fill: p.woodDark, stroke: p.primary, sw: 1.1 }),
		circle(-14, -12, 4.5, filled(p.primary, 0.85)),
		circle(2, -20, 4.5, filled(p.secondary, 0.8)),
		circle(20, -12, 4, filled(p.tertiary, 0.85)),
		circle(-4, -2, 3.5, filled(p.foliage, 0.8)),
		circle(-22, 2, 3, filled(p.gold, 0.85)),
		circle(8, -6, 3, filled(p.water, 0.8)),
		// Štětec
		line(24, -30, 48, -48, { stroke: p.muted, sw: 3, linecap: 'round' }),
		path('M 22 -28 L 16 -20 L 25 -21 Z', { fill: p.secondary, opacity: 0.85 })
	];
	return out;
}

function polyhedron({ palette: p }) {
	const out = [
		polygon(
			[
				[0, -38],
				[34, -18],
				[34, 18],
				[0, 38],
				[-34, 18],
				[-34, -18]
			],
			{ fill: p.primary, opacity: 0.08, stroke: p.primary, sw: 1.4, linejoin: 'round' }
		),
		// Tři stěny dostanou vlastní tón, aby těleso působilo plasticky
		polygon([[0, -38], [34, -18], [0, 0], [-34, -18]], { fill: p.primary, opacity: 0.16 }),
		polygon([[-34, -18], [0, 0], [-34, 18]], { fill: p.water, opacity: 0.13 }),
		polygon([[34, -18], [34, 18], [0, 0]], { fill: p.tertiary, opacity: 0.13 }),
		line(0, -38, 0, 38, stroke(p.primary, 1, 0.5)),
		line(-34, -18, 0, 0, stroke(p.primary, 1, 0.5)),
		line(34, -18, 0, 0, stroke(p.primary, 1, 0.5)),
		line(-34, 18, 0, 0, stroke(p.primary, 1, 0.5)),
		line(34, 18, 0, 0, stroke(p.primary, 1, 0.5)),
		path('M -34 -18 L 0 -38 L 34 -18 M -34 18 L 0 0 L 34 18', stroke(p.primary, 1, 0.5)),
		circle(0, -38, 2.4, filled(p.secondary, 0.9)),
		circle(-34, 18, 2.4, filled(p.secondary, 0.7)),
		circle(34, -18, 2.4, filled(p.secondary, 0.7)),
		circle(0, 38, 2.4, filled(p.secondary, 0.5))
	];
	return out;
}

function entropy({ palette: p, rand }) {
	const out = [];
	// Uspořádaná mřížka vlevo
	for (let row = 0; row < 4; row++) {
		for (let col = 0; col < 3; col++) {
			out.push(circle(-40 + col * 14, -24 + row * 16, 2.4, filled(p.primary, 0.7)));
		}
	}
	// Přechod
	out.push(line(-6, 0, 10, 0, { ...stroke(p.gold, 1.2, 0.8), dash: '3 4' }));
	out.push(polygon([[4, -4], [12, 0], [4, 4]], { fill: p.gold, opacity: 0.8 }));
	// Rozpad vpravo
	const scatter = [p.primary, p.secondary, p.tertiary, p.ember, p.water];
	for (let i = 0; i < 12; i++) {
		out.push(
			circle(
				24 + rand() * 34,
				-32 + rand() * 64,
				1.4 + rand() * 2,
				filled(scatter[i % scatter.length], 0.3 + rand() * 0.4)
			)
		);
	}
	return out;
}

function infinity({ palette: p }) {
	return [
		path('M 0 0 C 0 -30 30 -34 38 -18 C 48 4 16 20 0 0 C -16 -20 -48 -4 -38 18 C -30 34 0 30 0 0 Z', {
			fill: 'none',
			stroke: p.primary,
			sw: 2.4,
			linejoin: 'round',
			linecap: 'round'
		}),
		path('M 0 0 C 0 -22 22 -26 30 -14 C 38 2 14 14 0 0', stroke(p.secondary, 1, 0.55)),
		path('M 0 0 C -16 -20 -48 -4 -38 18 C -30 34 0 30 0 0', stroke(p.tertiary, 0.9, 0.4)),
		circle(-38, 18, 2.4, filled(p.gold, 0.85)),
		circle(38, -18, 2.4, filled(p.gold, 0.85))
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
export const MOTIFS = [
	...SYMBOLIC_MOTIFS,
	{
		key: 'book',
		label: 'Otevřená kniha',
		note: 'literatura, příběhy, pohádky, eposy',
		role: 'subject',
		families: ['storybook'],
		tags: ['knih*', 'roman','romany','romanu','romanum','romanech','romanem','romanovy*', 'pohadk*', 'povest*', 'povídk*', 'povidk*', 'detektiv*', 'basen*', 'básen*', 'epos*', 'pribeh*', 'literatur*', 'spisovatel*', 'autor','autora','autorem','autorovi','autoru','autory','autorech','autorum','autorka*','autorstvi', 'stran*', 'kapitol*', 'rukopis*', 'ctenar*', 'bajk*', 'komiks*', 'grimm*', 'divadl*', 'poezi*'],
		categories: { literatura: 3, filmy: 1, umeni: 0.5 },
		build: book
	},
	{
		key: 'scroll',
		label: 'Svitek a listina',
		note: 'dokumenty, zákony, kroniky, rukopisy',
		role: 'both',
		families: ['storybook', 'portrait', 'relic'],
		tags: ['svitek*', 'pergamen*', 'rukopis*', 'listin*', 'dokument*', 'ustava','ustavy','ustavu','ustave','ustavou','ustavni*','ustavnim','ustavnich', 'zakonik*', 'zákoník*', 'dekret*', 'chart*', 'smlouv*', 'zapis*', 'kronik*', 'text','texty','textu','textem','textum','textech','textove*','textovy*'],
		categories: { literatura: 1, historie: 1.5, politika: 1.5, filozofie: 0.5 },
		build: scroll
	},
	{
		key: 'quill',
		label: 'Bruk a kalamář',
		note: 'psaní, autoři, myšlenky',
		role: 'support',
		families: ['storybook', 'portrait'],
		tags: ['brylo*', 'inkoust*', 'kalamar*', 'pisar*', 'pero*', 'psac*'],
		categories: { literatura: 1.5, filozofie: 0.5 },
		build: quill
	},
	{
		key: 'wolf',
		label: 'Vlk',
		note: 'pohádky, příroda, archetypy',
		role: 'support',
		families: ['storybook', 'nature'],
		tags: ['vlk*', 'vlci', 'vlka', 'vlkem', 'grimm*', 'silen*', 'šelma*', 'selma*'],
		categories: { literatura: 1.5 },
		build: wolf
	},
	{
		key: 'forest',
		label: 'Les',
		note: 'příroda, pohádky, ekosystémy',
		role: 'both',
		families: ['storybook', 'nature', 'canopy'],
		tags: ['les','lesa','lese','lesu','lesem','lesy','lesich','lesum','lesni*','lesnim','lesnich', 'hvozd*', 'prales*', 'strom*', 'dub', 'dubu', 'dubem', 'duby', 'dubech', 'lipa*', 'lipu*', 'sekvoj*', 'koren*', 'lesnim*'],
		categories: { literatura: 1, zajimavost: 0.5, veda: 0.5 },
		build: forest
	},
	{
		key: 'castle',
		label: 'Hrad a zámek',
		note: 'středověk, šlechta, pohádky',
		role: 'support',
		families: ['storybook', 'relic'],
		tags: ['hrad*', 'zamek*', 'zámek*', 'pevnost*', 'tvrz', 'tvrzi', 'palac*', 'zricenin*', 'hradb*', 'veza*', 'vez','veze','vezi','vezich','vezemi','vezicka*'],
		categories: { historie: 1, literatura: 1, politika: 0.5 },
		build: castle
	},
	{
		key: 'film',
		label: 'Filmový pás',
		note: 'film, střih, kamera, projekce',
		role: 'subject',
		families: ['metaphor'],
		tags: ['film*', 'reziser*', 'režisér*', 'kino*', 'kamer*', 'zaber*', 'záběr*', 'strih*', 'střih*', 'herec*', 'hereck*', 'animac*', 'promit*', 'projekc*'],
		categories: { filmy: 3 },
		build: film
	},
	{
		key: 'bust',
		label: 'Busta myslitele',
		note: 'filozofové, vědci, historické osobnosti',
		role: 'subject',
		families: ['portrait'],
		tags: ['filozof*', 'myslitel*', 'sokrates*', 'platon*', 'aristotel*', 'konfucius*', 'lao*', 'buddha*', 'herakleit*', 'pythagoras*', 'descartes*', 'kant*', 'hegel*', 'nietzsche*', 'jung*', 'freud*', 'stoik*', 'epikur*', 'zenon*', 'seneca*', 'augustin*', 'akvinsk*', 'hobbes*', 'locke*', 'rousseau*', 'voltair*', 'kierkegaard*', 'schopenhauer*', 'marx*', 'wittgenstein*', 'camus*', 'sartre*', 'portret*', 'busta*', 'mudrc*', 'osobnost*'],
		categories: { filozofie: 2.5, psychologie: 1, historie: 0.5 },
		build: bust
	},
	{
		key: 'laurel',
		label: 'Vavřín',
		note: 'vítězství, odkaz, antičtí myslitelé',
		role: 'support',
		families: ['portrait'],
		tags: ['vavrin*', 'vítěz*', 'vitez*', 'odkaz*', 'antik*', 'slav*', 'ocenen*', 'oceněn*'],
		categories: { filozofie: 0.5, historie: 0.5 },
		build: laurel
	},
	{
		key: 'column',
		label: 'Antický sloup',
		note: 'architektura, chrámy, instituce',
		role: 'both',
		families: ['portrait', 'relic'],
		tags: ['sloup*', 'chram*', 'chrám*', 'akropol*', 'katedral*', 'architektur*', 'stavb*', 'klenb*', 'portal*', 'korint*', 'ionsk*', 'antick*', 'chramu*'],
		categories: { umeni: 1.5, historie: 1, filozofie: 0.5, politika: 0.5 },
		build: column
	},
	{
		key: 'lawScroll',
		label: 'Listina s pečetí',
		note: 'právo, ústava, politické dokumenty',
		role: 'subject',
		families: ['relic', 'storybook'],
		tags: ['listin*', 'ustava','ustavy','ustavu','ustave','ustavou','ustavni*','ustavnim','ustavnich', 'prava*', 'práva*', 'zakon*', 'zákon*', 'chart*', 'dokument*', 'dekret*'],
		categories: { politika: 2.5, historie: 1 },
		// Hlavní dokument je dost nosný; vedlejší objekty ho jen zaplevelují.
		maxSupports: 0,
		build: scrollOfLaw
	},
	{
		key: 'brain',
		label: 'Mozek a mysl',
		note: 'psychologie, vědomí, kognitivní zkreslení',
		role: 'subject',
		families: ['metaphor', 'portrait'],
		tags: ['mozek*', 'mysl*','myslenk*','mysleni*', 'vedomi*', 'vědomí*', 'pamet*', 'psychik*', 'psycholog*', 'vniman*', 'vnímán*', 'kognitiv*', 'zkreslen*', 'efekt*', 'experiment*', 'chovan*', 'archetyp*'],
		categories: { psychologie: 2.5, veda: 0.5, filozofie: 0.5 },
		build: brain
	},
	{
		key: 'flask',
		label: 'Laboratorní baňka',
		note: 'chemie, pokusy, objevy',
		role: 'subject',
		families: ['discovery'],
		tags: ['chemie*', 'chemik*', 'laborator*', 'pokus*', 'experiment*', 'pliesen*', 'penicilin*', 'prvek*', 'mendelejev*', 'curie*', 'sloucenin*', 'reakc*', 'katalyz*', 'molekul*'],
		categories: { veda: 2.5 },
		build: flask
	},
	{
		key: 'microscope',
		label: 'Mikroskop',
		note: 'biologie, buňky, mikrobiologie',
		role: 'subject',
		families: ['discovery'],
		tags: ['mikroskop*', 'bunk*', 'bakteri*', 'vir','viru','viry','virum','virech','virov*','virus*','viraln*', 'mikrob*', 'vzorek*', 'tkan*', 'tkán*', 'mikroskopick*'],
		categories: { veda: 2.5 },
		build: microscope
	},
	{
		key: 'telescope',
		label: 'Dalekohled',
		note: 'astronomie, pozorování oblohy',
		role: 'subject',
		families: ['discovery'],
		tags: ['dalekohled*', 'teleskop*', 'hvezd*', 'hvězd*', 'planet*', 'vesmir*', 'vesmír*', 'komet*', 'galaxi*', 'astronom*', 'obloh*', 'souprav*', 'orbit*', 'mesic*', 'měsíc*', 'slunce*'],
		categories: { astronomie: 2.5, fyzika: 0.5 },
		build: telescope
	},
	{
		key: 'atom',
		label: 'Atom',
		note: 'fyzika částic, kvantová mechanika',
		role: 'subject',
		families: ['discovery'],
		tags: ['atom*', 'castic*', 'částic*', 'kvant*', 'elektron*', 'proton*', 'neutron*', 'jader*', 'jáder*', 'radioaktiv*', 'fyzik*', 'molekul*'],
		categories: { fyzika: 2.5, veda: 1 },
		build: atom
	},
	{
		key: 'dna',
		label: 'DNA',
		note: 'genetika, dědičnost, biologie',
		role: 'subject',
		families: ['discovery'],
		tags: ['dna', 'gen','genu','geny','genem','genech','genum','genom*','genetik*','genetick*', 'dedicnost*', 'dědičnost*', 'chromozom*', 'mendel*', 'genetik*', 'helix*', 'bunecn*', 'buněčn*'],
		categories: { veda: 2.5 },
		build: dna
	},
	{
		key: 'magnifier',
		label: 'Lupa',
		note: 'zkoumání, důkazy, detaily',
		role: 'support',
		families: ['discovery'],
		tags: ['lupa*', 'zvetsov*', 'zvětšov*', 'detail*', 'stopa*', 'dukaz*', 'důkaz*', 'zkoumat*', 'zkuman*'],
		categories: { veda: 1, historie: 0.5 },
		build: magnifier
	},
	{
		key: 'planet',
		label: 'Planeta',
		note: 'planety, sluneční soustava, exoplanety',
		role: 'subject',
		families: ['discovery'],
		tags: ['planet*', 'mars*', 'venuse*', 'venuše*', 'jupiter*', 'saturn*', 'neptun*', 'uran*', 'zeme','zemi','zem','zemich','zememi','zemekoule*', 'zeme','zemi','zem','zemich','zememi','zemekoule*', 'exoplanet*', 'obloha*'],
		categories: { astronomie: 2.5 },
		build: planet
	},
	{
		key: 'blackhole',
		label: 'Černá díra',
		note: 'gravitace, horizont událostí',
		role: 'subject',
		families: ['discovery'],
		tags: ['cerna*', 'černá*', 'cernou*', 'černou*', 'cerny*', 'černý*', 'horizont*', 'singularit*', 'gravitac*', 'pohlti*', 'pohlcen*'],
		categories: { astronomie: 2.5, fyzika: 1 },
		build: blackhole
	},
	{
		key: 'rocket',
		label: 'Raketa',
		note: 'kosmonautika, lety do vesmíru',
		role: 'subject',
		families: ['discovery'],
		tags: ['raket*', 'kosmonaut*', 'kosmick*', 'apollo*', 'start*', 'startu*'],
		categories: { astronomie: 2, veda: 1 },
		build: rocket
	},
	{
		key: 'map',
		label: 'Mapa',
		note: 'objevování, území, expedice',
		role: 'subject',
		families: ['relic', 'discovery'],
		tags: ['mapa*', 'mapy*', 'mapu*', 'atlas*', 'mapov*', 'uzemi*', 'území*', 'expedic*', 'cestovatel*', 'zemepis*', 'zeměpis*', 'kontinent*', 'kolonie*'],
		categories: { historie: 2, zajimavost: 1 },
		build: map
	},
	{
		key: 'amphora',
		label: 'Amfora',
		note: 'archeologie, antické artefakty',
		role: 'subject',
		families: ['relic'],
		tags: ['amfor*', 'vaza*', 'váza*', 'nadob*', 'nádob*', 'artefakt*', 'archeolog*', 'vykopavk*', 'keramik*', 'pohreb*', 'pohřeb*', 'hrobk*'],
		categories: { historie: 2.5, umeni: 1 },
		build: amphora
	},
	{
		key: 'stele',
		label: 'Kamenná deska',
		note: 'nápisy, hieroglyfy, Rosettská deska',
		role: 'subject',
		families: ['relic'],
		tags: ['deska*', 'kamen*', 'kámen*', 'hieroglyf*', 'rosetta*', 'napisu*', 'napisy*', 'tabule*', 'stela*', 'klinopis*', 'klínopis*', 'zapis*', 'zápis*'],
		categories: { historie: 2.5, veda: 0.5 },
		// Kamenná deska je sama dost čitelná — doplňky by ubíraly pozornost.
		maxSupports: 0,
		build: stele
	},
	{
		key: 'crown',
		label: 'Koruna',
		note: 'panovníci, dynastie, říše',
		role: 'both',
		families: ['relic', 'throne', 'temple'],
		tags: ['kral*', 'král*', 'cisar*', 'císař*', 'korun*', 'monarch*', 'dynast*', 'vlada*', 'vláda*', 'panovnik*', 'knez*', 'kněz*'],
		categories: { historie: 2, politika: 1.5 },
		build: crown
	},
	{
		key: 'key',
		label: 'Klíč',
		note: 'tajemství, šifry, odemknutí',
		role: 'support',
		families: ['metaphor', 'labyrinth'],
		tags: ['klic*', 'klíč*', 'odemkn*', 'tajemstv*', 'sifra*', 'šifra*', 'kod','kody','kodu','kodem','kodech','kodum','kodovani*','kodovany*', 'kod','kody','kodu','kodem','kodech','kodum','kodovani*','kodovany*', 'heslo*', 'pristup*', 'přístup*'],
		categories: { 'pocitacove-vedy': 1.5, historie: 0.5 },
		build: key
	},
	{
		key: 'tree',
		label: 'Strom',
		note: 'příroda, ekosystémy, růst',
		role: 'subject',
		families: ['nature', 'canopy', 'growth'],
		tags: ['strom*', 'dub', 'dubu', 'dubem', 'duby', 'dubech', 'lipa*', 'lipu*', 'sekvoj*', 'lesnim*', 'prales*'],
		categories: { zajimavost: 2, veda: 1.5 },
		build: tree
	},
	{
		key: 'leaf',
		label: 'List',
		note: 'botanika, fotosyntéza, rostliny',
		role: 'both',
		families: ['nature', 'canopy', 'growth', 'bloom'],
		tags: ['list', 'listy', 'listu', 'listem', 'listech', 'listi', 'listím', 'rostlin*', 'botanik*', 'fotosyntez*', 'fotosyntéz*', 'zelena*', 'zelená*'],
		categories: { veda: 2, zajimavost: 1 },
		build: leaf
	},
	{
		key: 'octopus',
		label: 'Chobotnice',
		note: 'mořští živočichové, biologie',
		role: 'subject',
		families: ['nature'],
		tags: ['chobotnic*', 'hlavonoz*', 'hlavonož*', 'kraken*', 'chapadl*', 'more*', 'moře*', 'morsk*', 'mořsk*', 'ocean*', 'oceán*', 'ryb*', 'zralok*'],
		categories: { zajimavost: 2.5, veda: 1 },
		build: octopus
	},
	{
		key: 'bird',
		label: 'Pták',
		note: 'ptáci, migrace, obloha',
		role: 'both',
		families: ['nature', 'canopy'],
		tags: ['ptak*', 'pták*', 'orel*', 'orla*', 'vrabec*', 'holub*', 'kridl*', 'křídl*', 'migrac*', 'hnizd*', 'hnízd*', 'peri','perim','pery','perami','perech','pericka*', 'peri','perim','pery','perami','perech','pericka*'],
		categories: { zajimavost: 2, veda: 1 },
		build: bird
	},
	{
		key: 'mountain',
		label: 'Hory',
		note: 'krajina, geologie, expedice',
		role: 'both',
		families: ['nature', 'relic', 'peak'],
		tags: ['hora*', 'hory*', 'pohori*', 'pohoří*', 'vulkan*', 'vulkán*', 'horstv*', 'vrchol*', 'krajin*', 'alpy*', 'everest*'],
		categories: { zajimavost: 2, veda: 1, historie: 0.5 },
		build: mountain
	},
	{
		key: 'cat',
		label: 'Kočka',
		note: 'Schrödingerova kočka, zvířata',
		role: 'subject',
		families: ['metaphor', 'nature'],
		tags: ['kock*', 'kočk*', 'schrodinger*', 'schrödinger*', 'micka*', 'mička*'],
		categories: { fyzika: 2, zajimavost: 1 },
		build: cat
	},
	{
		key: 'balance',
		label: 'Váhy',
		note: 'rovnováha, spravedlnost, protiklady',
		role: 'subject',
		families: ['metaphor'],
		tags: ['rovnovah*', 'vaha*', 'váha*', 'vahy*', 'váhy*', 'spravedln*', 'nabidk*', 'nabídk*', 'poptavk*', 'poptávk*', 'stredni*', 'střední*', 'kompromis*', 'protiklad*', 'srovnan*', 'srovnán*', 'kontrast*', 'paradox*', 'dualit*', 'ctnost*', 'ctností*'],
		categories: { filozofie: 2, ekonomie: 2, psychologie: 1 },
		build: balance
	},
	{
		key: 'coin',
		label: 'Mince',
		note: 'peníze, měna, oběh, hodnota',
		role: 'both',
		families: ['metaphor'],
		tags: ['peniz*', 'penez*', 'penezen*', 'minc*', 'mena*', 'meny*', 'menou*', 'platidl*', 'obeziv*', 'oběži*', 'razb*', 'ražb*'],
		categories: { ekonomie: 3, historie: 1 },
		build: coin
	},
	{
		key: 'periodicTable',
		label: 'Periodická tabulka',
		note: 'chemické prvky, Mendělejev, soustava',
		role: 'subject',
		families: ['discovery', 'metaphor'],
		tags: ['tabulk*', 'prvk*', 'prvku*', 'periodick*', 'mendelejev*', 'chemik*', 'chemie*', 'chemick*', 'atomov*'],
		categories: { veda: 3, fyzika: 1.5, matematika: 1, zajimavost: 0.5 },
		build: periodicTable
	},
	{
		key: 'snowflake',
		label: 'Sněhová vločka',
		note: 'sníh, led, mráz, polární krajina',
		role: 'subject',
		families: ['snowfield'],
		tags: ['snih*', 'sníh*', 'snehu*', 'sněhu*', 'snehem*', 'sněhem*', 'snehov*', 'sněhov*', 'led','ledu','ledem','ledy','ledech','ledovy*','ledove*','ledovc*','ledni*', 'ledu*', 'ledem*', 'mraz*', 'mráz*', 'antarktid*', 'poust*', 'poušť*', 'polarn*', 'polární*', 'arktid*'],
		categories: { zajimavost: 2.5, veda: 2 },
		build: snowflake
	},
	{
		key: 'knife',
		label: 'Nůž',
		note: 'násilí, hrozba, ostrý řez',
		role: 'support',
		families: ['metaphor', 'clash', 'rupture'],
		tags: ['nuz*', 'nůž*', 'nozem*', 'nožem*', 'ostry*','ostre*','ostrim','ostrou','ostrost*','ostri','ostří*', 'ubliz*', 'ublíž*', 'nasili*', 'násilí*', 'bodn*', 'zran*', 'vrazd*', 'vražd*'],
		categories: { psychologie: 2, historie: 1, literatura: 1, filmy: 0.5 },
		build: knife
	},
	{
		key: 'clock',
		label: 'Hodiny',
		note: 'čas, období, věčnost',
		role: 'subject',
		families: ['metaphor', 'hourglass', 'cycle'],
		tags: ['cas', 'casu', 'casem', 'casove*', 'casovy*', 'hodin*', 'kalendar*', 'kalendář*', 'stoleti*', 'století*', 'obdobi*', 'období*', 'era', 'eru', 'vecnost*', 'věčnost*', 'budoucnost*', 'minulost*'],
		categories: { historie: 1, filozofie: 1, fyzika: 0.5 },
		build: clock
	},
	{
		key: 'gear',
		label: 'Ozubená kola',
		note: 'stroje, průmysl, technologie',
		role: 'subject',
		families: ['metaphor'],
		tags: ['stroj*', 'tovarn*', 'továrn*', 'prumysl*', 'průmysl*', 'technolog*', 'mechan*', 'automatiz*', 'vyrob*', 'výrob*', 'produkc*', 'motor*'],
		categories: { 'pocitacove-vedy': 1.5, ekonomie: 1, veda: 1 },
		build: gear
	},
	{
		key: 'palette',
		label: 'Malířská paleta',
		note: 'výtvarné umění, malíři, obrazy',
		role: 'subject',
		families: ['metaphor'],
		tags: ['obraz*', 'malir*', 'malíř*', 'malba*', 'malovat*', 'picasso*', 'gogh*', 'michelangelo*', 'barv*', 'umeni*', 'umění*', 'galeri*', 'platen*', 'kresba*', 'soch*'],
		categories: { umeni: 3 },
		build: palette
	},
	{
		key: 'polyhedron',
		label: 'Mnohostěn',
		note: 'geometrie, důkazy, matematika',
		role: 'subject',
		families: ['metaphor'],
		tags: ['geometrie*', 'mnohosten*', 'krychle*', 'trojuheln*', 'trojúheln*', 'dukaz*', 'důkaz*', 'veta*', 'věta*', 'matematik*', 'cisl*', 'čísl*', 'prvocisl*', 'prvočísl*', 'rovnic*', 'topolog*', 'symetri*'],
		categories: { matematika: 3 },
		build: polyhedron
	},
	{
		key: 'entropy',
		label: 'Entropie',
		note: 'chaos, neuspořádanost, pravděpodobnost',
		role: 'subject',
		families: ['metaphor'],
		tags: ['entropie*', 'chaos*', 'neusporadan*', 'neuspořádan*', 'rozpad*', 'nahod*', 'náhod*', 'pravdepodobnost*', 'pravděpodobnost*', 'nejistot*', 'zmatek*'],
		categories: { fyzika: 2.5, matematika: 1 },
		build: entropy
	},
	{
		key: 'infinity',
		label: 'Nekonečno',
		note: 'nekonečno, cykly, rekurze',
		role: 'subject',
		families: ['metaphor', 'cycle'],
		tags: ['nekonec*', 'nekoneč*', 'infinit*', 'limita*', 'opakovan*', 'fractal*', 'fraktál*', 'rekurz*'],
		categories: { matematika: 2.5, filozofie: 1 },
		build: infinity
	}
];

/** @type {Record<string, Motif>} */
export const MOTIF_BY_KEY = Object.fromEntries(MOTIFS.map((motif) => [motif.key, motif]));

export const MOTIF_KEYS = MOTIFS.map((motif) => motif.key);

/**
 * Vykreslí motiv do lokálních souřadnic a umístí ho.
 * @param {string} key
 * @param {object} context
 */
export function renderMotif(key, context) {
	const motif = MOTIF_BY_KEY[key] || MOTIF_BY_KEY.book;
	return group(motif.build(context), context.placement || {});
}

/**
 * Motivy vhodné jako doplněk ke zvolené kompozici.
 * @param {string} family
 */
export function supportsForFamily(family) {
	return MOTIFS.filter(
		(motif) => motif.role !== 'subject' && motif.families.includes(family)
	).map((motif) => motif.key);
}
