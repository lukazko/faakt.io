/**
 * Geometrické ilustrace pro dark mode — experimentální vrstva.
 *
 * Jeden rozpoznatelný motiv bez doplňkových objektů. Plochy se
 * překrývají a nechávají průhledné pozadí, takže kresba sedí přímo na
 * kartě. Využívá stejný IR, viewBox i renderer jako klasický systém.
 *
 * Vrstva je hlavní ilustrační cestou feedu i stránky příspěvku.
 */

import { createRandom, clamp, hashString, round } from './prng.js';
import { mixHex, paletteForCategory } from './palettes.js';
import { analyzePost } from './concepts.js';
import { VIEWBOX } from './scenes.js';
import { circle, ellipse, group, line, path, polygon, rect } from './primitives.js';
import { deriveSeed } from './select.js';

const W = VIEWBOX.width;

// --- Společná paleta ------------------------------------------------------

export const GEOMETRIC_COLORS = {
	bg: '#0A0D10',
	forest: '#173C36',
	forestDeep: '#102B27',
	teal: '#216E83',
	tealDeep: '#164A58',
	sage: '#78917A',
	sageDeep: '#5A705D',
	amber: '#F0C56D',
	terracotta: '#D95738',
	light: '#E9E0CC'
};

const C = GEOMETRIC_COLORS;

/**
 * Paleta scény: jednotné zelené a petrolejové plochy, jantar a terakota
 * jako střídmé akcenty. Barva kategorie zůstává identifikačním akcentem,
 * ale nebarví celý objekt.
 */
export function geometricPalette(category) {
	const base = paletteForCategory(category);
	const accent = base.primary;
	return {
		...C,
		accent,
		accentSoft: mixHex(accent, C.forest, 0.45),
		accentPale: mixHex(accent, C.bg, 0.55),
		lightSoft: mixHex(C.light, C.sage, 0.35),
		// Role, které očekává zbytek systému.
		primary: C.light,
		secondary: C.amber,
		dark: C.forestDeep,
		muted: C.sageDeep,
		soft: C.tealDeep,
		faint: C.forestDeep
	};
}

// --- Kresebné pomocníky ---------------------------------------------------

const stroke = (color, sw = 1.4, opacity = 1) => ({
	fill: 'none',
	stroke: color,
	sw,
	opacity,
	linecap: 'round',
	linejoin: 'round'
});

const shape = (fill, color = C.light, sw = 1.3, opacity = 1) => ({
	fill,
	stroke: color,
	sw,
	opacity,
	linejoin: 'round'
});

/** Společná linka podstavce — jediná země, žádné dekorativní pozadí. */
function baseline(p, y = 150, opacity = 0.24) {
	return [line(26, y, W - 26, y, { stroke: p.light, sw: 1, opacity })];
}

// --- Hlavní motivy --------------------------------------------------------

/** Busta z profilu — geometrická silueta, tmavé vlasy, akcentní šerpa. */
function geoBust({ palette: p, variant }) {
	const out = [];
	// Sokl
	out.push(rect(-34, 48, 68, 6, { fill: p.sageDeep, stroke: p.light, sw: 1 }));
	out.push(rect(-26, 54, 52, 4, { fill: p.forestDeep, stroke: p.light, sw: 0.8 }));
	// Ramena a draperie
	out.push(
		path('M -44 46 L -36 32 Q -24 20 -6 18 L 12 18 Q 34 22 44 34 L 48 46 Z', {
			...shape(p.forest, p.light, 1.4)
		})
	);
	// Šerpa v barvě kategorie
	out.push(
		path('M -32 36 L -4 28 L 6 38 L -20 46 Z', {
			fill: p.accent,
			stroke: p.light,
			sw: 0.9,
			opacity: 0.92
		})
	);
	// Krk
	out.push(rect(-12, 2, 24, 20, { fill: p.sage, stroke: p.light, sw: 1.2 }));
	// Hlava z profilu — rovné hrany drží geometrický ráz
	out.push(
		path(
			'M -20 -54 L 6 -58 L 20 -48 L 24 -34 L 20 -24 L 30 -18 L 32 -10 L 24 -6 L 26 0 L 18 6 L 8 8 L 8 18 L -16 18 L -18 6 L -26 -4 L -28 -22 Z',
			{ ...shape(p.sage, p.light, 1.5) }
		)
	);
	// Vlasy jako samostatná tmavá plocha
	out.push(
		path('M -22 -52 L 6 -58 L 20 -48 L 18 -38 L 4 -44 L -10 -38 L -18 -26 L -26 -34 Z', {
			...shape(p.forestDeep, p.light, 1.1)
		})
	);
	// Ucho a oko
	out.push(circle(-10, -18, 4.5, { fill: p.sageDeep, stroke: p.light, sw: 0.9 }));
	out.push(circle(12, -28, 1.8, { fill: p.forestDeep }));
	// Stín na tváři
	out.push(path('M -18 6 L -24 -4 L -26 -18 L -18 -8 L -12 4 Z', { fill: p.sageDeep, opacity: 0.55 }));
	// Varianta: zrcadlově otočený profil a jiný sokl
	if (variant === 2) out.push(line(-26, 46, 26, 46, { stroke: p.light, sw: 0.8, opacity: 0.5 }));
	return out;
}

/** Erlenmeyerova baňka — sklo, hladina a bubliny. */
function geoFlask({ palette: p, variant }) {
	const out = [];
	const level = variant === 2 ? 8 : 14;
	// Tělo baňky
	out.push(
		path('M -8 -40 L 8 -40 L 8 -22 L 34 26 Q 40 40 24 42 L -24 42 Q -40 40 -34 26 L -8 -22 Z', {
			fill: p.light,
			fillOpacity: 0.07,
			stroke: p.light,
			sw: 1.6,
			linejoin: 'round'
		})
	);
	// Kapalina
	out.push(
		path(
			`M -31 ${level + 4} L 31 ${level + 4} L 34 26 Q 40 40 24 42 L -24 42 Q -40 40 -34 26 Z`,
			{ fill: variant === 1 ? p.tealDeep : p.teal, opacity: 0.95 }
		)
	);
	out.push(line(-31, level + 4, 31, level + 4, { stroke: p.amber, sw: 1.4, opacity: 0.85 }));
	// Hrdlo a zátka
	out.push(rect(-9, -50, 18, 8, { fill: p.forest, stroke: p.light, sw: 1.2 }));
	out.push(line(8, -22, 34, 26, { stroke: p.light, sw: 0.9, opacity: 0.35 }));
	out.push(line(-8, -22, -34, 26, { stroke: p.light, sw: 0.9, opacity: 0.35 }));
	// Bubliny — jen nad hladinou
	const bubbles = variant === 2 ? 2 : 3;
	for (let i = 0; i < bubbles; i++) {
		out.push(circle(-8 + i * 8, level - 8 - i * 4, 1.8 + (i % 2), { fill: p.amber, opacity: 0.7 }));
	}
	return out;
}

/** Dalekohled na stativu — tubus, okulár a pozorovaná planeta. */
function geoScope({ palette: p, variant }) {
	const out = [];
	const angle = variant === 1 ? -28 : -36;
	const rot = `rotate(${angle} 0 -8)`;
	// Stativ
	out.push(line(0, -8, -32, 52, { stroke: p.light, sw: 2.2 }));
	out.push(line(0, -8, 32, 52, { stroke: p.light, sw: 2.2 }));
	out.push(line(0, -8, 3, 52, { stroke: p.sage, sw: 2 }));
	out.push(line(-35, 52, -29, 52, { stroke: p.light, sw: 1.4 }));
	out.push(line(29, 52, 35, 52, { stroke: p.light, sw: 1.4 }));
	// Tubus
	out.push(rect(-10, -36, 74, 20, { ...shape(p.teal, p.light, 1.6), transform: rot, rx: 4 }));
	out.push(rect(58, -34, 10, 16, { fill: p.amber, stroke: p.light, sw: 1.1, transform: rot }));
	out.push(rect(-16, -34, 8, 16, { fill: p.forest, stroke: p.light, sw: 1.1, transform: rot }));
	out.push(line(16, -26, 42, -26, { stroke: p.light, sw: 0.9, opacity: 0.4, transform: rot }));
	// Montáž
	out.push(circle(0, -8, 8, { fill: p.forest, stroke: p.light, sw: 1.3 }));
	out.push(circle(0, -8, 3, { fill: p.amber }));
	// Planeta
	const px = variant === 2 ? 58 : 64;
	out.push(circle(px, -58, 9, { fill: p.sage, stroke: p.light, sw: 1.2 }));
	out.push(ellipse(px, -58, 17, 4.5, { fill: 'none', stroke: p.terracotta, sw: 1.6, opacity: 0.9 }));
	return out;
}

/** Otevřená kniha — desky, stránky a záložka v barvě kategorie. */
function geoBook({ palette: p, variant }) {
	const out = [];
	// Spodní deska
	out.push(
		path('M -62 24 L -62 -4 L 0 -14 L 62 -4 L 62 24 L 0 34 Z', {
			...shape(p.forest, p.light, 1.5)
		})
	);
	// Stránky
	out.push(
		path('M -57 17 L -57 -7 L -3 -13 L -3 11 Z', {
			fill: p.light,
			fillOpacity: 0.94,
			stroke: p.light,
			sw: 1,
			linejoin: 'round'
		})
	);
	out.push(
		path('M 57 17 L 57 -7 L 3 -13 L 3 11 Z', {
			fill: p.light,
			fillOpacity: 0.86,
			stroke: p.light,
			sw: 1,
			linejoin: 'round'
		})
	);
	// Řádky — náznak textu, ne dekorace
	for (let i = 0; i < 3; i++) {
		const y = -2 + i * 5;
		out.push(line(-48, y, -12, y + 1, { stroke: p.forest, sw: 0.8, opacity: 0.45 }));
		out.push(line(12, y + 1, 48, y, { stroke: p.forest, sw: 0.8, opacity: 0.45 }));
	}
	// Hřbet
	out.push(path('M -3 -13 L 3 -13 L 3 11 L -3 11 Z', { fill: p.teal, stroke: p.light, sw: 1 }));
	// Záložka
	out.push(rect(variant === 1 ? -22 : 12, -15, 6, 24, { fill: p.accent, stroke: p.light, sw: 0.8 }));
	return out;
}

/** Amfora — keramické tělo, ucha a pás s akcentem kategorie. */
function geoAmphora({ palette: p, variant }) {
	const out = [];
	// Ucha
	out.push(
		path('M -20 -38 Q -48 -34 -45 -4 Q -44 10 -27 8 L -25 1 Q -37 3 -37 -6 Q -37 -27 -18 -31 Z', {
			...shape(p.tealDeep, p.light, 1.2)
		})
	);
	out.push(
		path('M 20 -38 Q 48 -34 45 -4 Q 44 10 27 8 L 25 1 Q 37 3 37 -6 Q 37 -27 18 -31 Z', {
			...shape(p.tealDeep, p.light, 1.2)
		})
	);
	// Tělo
	out.push(
		path('M -16 -44 L 16 -44 L 14 -30 Q 40 -18 40 8 Q 40 40 0 46 Q -40 40 -40 8 Q -40 -18 -14 -30 Z', {
			...shape(p.teal, p.light, 1.6)
		})
	);
	// Pás kategorie
	out.push(
		path('M -38 -2 Q 0 10 38 -2 L 38 10 Q 0 22 -38 10 Z', {
			fill: p.accent,
			stroke: p.light,
			sw: 0.9,
			opacity: 0.94
		})
	);
	// Geometrický meandr
	const marks = variant === 2 ? 4 : 3;
	for (let i = 0; i < marks; i++) {
		const x = -18 + i * 12;
		out.push(path(`M ${x} 6 L ${x} 0 L ${x + 6} 0 L ${x + 6} 4`, { ...stroke(p.light, 1, 1) }));
	}
	// Hrdlo a okraj
	out.push(rect(-13, -52, 26, 9, { fill: p.terracotta, stroke: p.light, sw: 1.1 }));
	out.push(rect(-16, -44, 32, 4, { fill: p.terracotta, opacity: 0.85 }));
	out.push(ellipse(0, -52, 17, 4, { fill: p.sageDeep, stroke: p.light, sw: 1 }));
	// Stín
	out.push(path('M -34 16 Q -26 30 -16 38 Q -30 34 -36 24 Z', { fill: p.forestDeep, opacity: 0.4 }));
	return out;
}

/** Antický sloup — stupně, dřík s kanelami a hlavice. */
function geoColumn({ palette: p, variant }) {
	const out = [];
	// Stupně
	out.push(rect(-42, 42, 84, 7, { fill: p.sageDeep, stroke: p.light, sw: 1.1 }));
	out.push(rect(-34, 34, 68, 8, { fill: p.sage, stroke: p.light, sw: 1.1 }));
	// Dřík
	out.push(rect(-18, -24, 36, 58, { fill: p.light, opacity: 0.92 }));
	out.push(line(-18, -24, -18, 34, { stroke: p.sageDeep, sw: 1, opacity: 0.8 }));
	out.push(line(18, -24, 18, 34, { stroke: p.sageDeep, sw: 1, opacity: 0.8 }));
	const flutes = variant === 2 ? 5 : 4;
	for (let i = 0; i < flutes; i++) {
		const x = -12 + (24 / (flutes - 1)) * i;
		out.push(line(x, -20, x, 30, { stroke: p.sageDeep, sw: 0.8, opacity: 0.45 }));
	}
	// Pás kategorie
	out.push(rect(-18, 6, 36, 6, { fill: p.accent, opacity: 0.9 }));
	// Hlavice
	out.push(rect(-24, -32, 48, 8, { fill: p.sage, stroke: p.light, sw: 1.1 }));
	out.push(circle(-17, -35, 4, { fill: p.forest, stroke: p.light, sw: 0.9 }));
	out.push(circle(17, -35, 4, { fill: p.forest, stroke: p.light, sw: 0.9 }));
	if (variant !== 1) out.push(rect(-26, -40, 52, 5, { fill: p.teal, stroke: p.light, sw: 1 }));
	return out;
}

/** Strom — kmen, tři vrstvy koruny a plody. */
function geoTree({ palette: p, variant }) {
	const out = [];
	// Kmen
	out.push(
		path('M -6 46 L -10 10 L -5 -10 L 3 -10 L 9 10 L 6 46 Z', {
			...shape(p.sageDeep, p.light, 1.3)
		})
	);
	// Větve
	out.push(line(-4, -6, -24, -24, { stroke: p.sageDeep, sw: 2.4 }));
	out.push(line(4, -6, 24, -22, { stroke: p.sageDeep, sw: 2.4 }));
	// Koruna
	const crowns =
		variant === 2
			? [
					{ x: -24, y: -26, r: 21, fill: p.teal },
					{ x: 24, y: -26, r: 21, fill: p.sage },
					{ x: 0, y: -52, r: 25, fill: p.forest }
				]
			: [
					{ x: -22, y: -30, r: 23, fill: p.forest },
					{ x: 22, y: -28, r: 21, fill: p.teal },
					{ x: 0, y: -52, r: 25, fill: p.sage }
				];
	crowns.forEach((crown) => {
		out.push(circle(crown.x, crown.y, crown.r, { ...shape(crown.fill, p.light, 1.3) }));
	});
	// Plody
	const fruits = variant === 1 ? 2 : 3;
	const spots = [
		[-14, -40],
		[18, -46],
		[-2, -66]
	];
	for (let i = 0; i < fruits; i++) {
		out.push(circle(spots[i][0], spots[i][1], 3, { fill: p.amber }));
	}
	// Kořeny
	out.push(line(-6, 46, -24, 50, { stroke: p.light, sw: 1.2, opacity: 0.5 }));
	out.push(line(6, 46, 24, 50, { stroke: p.light, sw: 1.2, opacity: 0.5 }));
	return out;
}

/** Chobotnice — plášť, chapadla a tři srdce. */
function geoOctopus({ palette: p, variant }) {
	const out = [];
	// Chapadla
	const curls =
		variant === 2
			? [
					'M -20 8 Q -46 18 -44 40 Q -42 50 -30 48',
					'M -12 12 Q -24 34 -14 46 Q -8 52 0 46',
					'M 0 14 Q 2 36 12 44 Q 20 50 24 42',
					'M 12 12 Q 28 30 40 36 Q 48 40 50 32'
				]
			: [
					'M -22 8 Q -48 16 -46 38 Q -44 50 -30 46',
					'M -12 12 Q -28 32 -18 46 Q -10 54 0 46',
					'M 12 12 Q 28 32 18 46 Q 10 54 0 46',
					'M 22 8 Q 48 16 46 38 Q 44 50 30 46'
				];
	curls.forEach((d, index) => {
		out.push(
			path(d, {
				fill: 'none',
				stroke: index % 2 === 0 ? p.teal : p.tealDeep,
				sw: 7,
				linecap: 'round',
				linejoin: 'round'
			})
		);
	});
	// Plášť
	out.push(
		path('M -30 2 Q -34 -44 0 -50 Q 34 -44 30 2 Q 24 16 0 18 Q -24 16 -30 2 Z', {
			...shape(p.teal, p.light, 1.5)
		})
	);
	// Oči
	out.push(circle(-11, -20, 5.5, { fill: p.light }));
	out.push(circle(11, -20, 5.5, { fill: p.light }));
	out.push(circle(-11, -20, 2.2, { fill: p.forestDeep }));
	out.push(circle(11, -20, 2.2, { fill: p.forestDeep }));
	// Tři srdce — odpovídají obsahu příspěvku
	const hearts = [
		[0, -2],
		[-10, 5],
		[10, 5]
	];
	hearts.forEach(([x, y]) => {
		out.push(
			path(`M ${x} ${y + 3} L ${x - 4} ${y - 1} Q ${x - 4} ${y - 5} ${x} ${y - 3} Q ${x + 4} ${y - 5} ${x + 4} ${y - 1} Z`, {
				fill: p.amber,
				opacity: 0.95
			})
		);
	});
	return out;
}

/** Váhy — základna, břevno a misky s protizávažím. */
function geoBalance({ palette: p, variant }) {
	const tilt = variant === 2 ? -6 : variant === 1 ? 4 : 2;
	const out = [];
	// Základna a stojan zůstávají pevné, kývá se jen břevno s miskami.
	out.push(rect(-38, 42, 76, 7, { fill: p.sageDeep, stroke: p.light, sw: 1.1 }));
	out.push(path('M -13 42 L 13 42 L 8 30 L -8 30 Z', { fill: p.sage, stroke: p.light, sw: 1 }));
	out.push(rect(-5, -20, 10, 50, { fill: p.light, opacity: 0.9 }));
	// Břevno a misky
	const assembly = [];
	assembly.push(line(-54, -20, 54, -20, { stroke: p.light, sw: 3 }));
	assembly.push(circle(0, -24, 5, { fill: p.amber, stroke: p.light, sw: 1 }));
	for (const side of [-1, 1]) {
		const x = side * 52;
		assembly.push(line(x, -20, x - 16, 6, { stroke: p.light, sw: 1.2, opacity: 0.9 }));
		assembly.push(line(x, -20, x + 16, 6, { stroke: p.light, sw: 1.2, opacity: 0.9 }));
		assembly.push(
			path(`M ${x - 20} 6 Q ${x} 20 ${x + 20} 6`, {
				fill: side < 0 ? p.forest : p.teal,
				stroke: p.light,
				sw: 1.3
			})
		);
		assembly.push(line(x - 20, 6, x + 20, 6, { stroke: p.light, sw: 1.3 }));
	}
	// Závaží vlevo, předmět vpravo
	assembly.push(rect(-59, 0, 14, 11, { fill: p.terracotta, stroke: p.light, sw: 1 }));
	assembly.push(circle(55, 2, 6, { fill: p.accent, stroke: p.light, sw: 1 }));
	// Břevno se kývá kolem čepu, ne kolem středu scény.
	const pivot = `rotate(${round(tilt, 2)} 0 -24)`;
	out.push(...assembly.map((el) => ({ ...el, transform: pivot })));
	return out;
}

/** Mozek — silueta se zřetelnými laloky a střední rýhou. */
function geoBrain({ palette: p, variant }) {
	const out = [];
	// Levá a pravá hemisféra jako dvě překrývající se plochy.
	out.push(
		path('M -2 -6 Q -8 -40 -30 -38 Q -50 -34 -48 -10 Q -46 12 -30 20 Q -14 26 -6 14 Z', {
			...shape(p.teal, p.light, 1.5)
		})
	);
	out.push(
		path('M 2 -6 Q 8 -40 30 -38 Q 50 -34 48 -10 Q 46 12 30 20 Q 14 26 6 14 Z', {
			...shape(p.sage, p.light, 1.5)
		})
	);
	// Střední rýha
	out.push(path('M 0 -38 Q -2 -10 0 16', { ...stroke(p.forestDeep, 1.6, 0.9) }));
	// Záhyby — jen pár, aby plocha zůstala čitelná.
	out.push(path('M -42 -20 Q -28 -14 -24 -2', { ...stroke(p.forestDeep, 1.2, 0.55) }));
	out.push(path('M -38 8 Q -24 4 -16 12', { ...stroke(p.forestDeep, 1.2, 0.55) }));
	out.push(path('M 42 -20 Q 28 -14 24 -2', { ...stroke(p.forestDeep, 1.2, 0.55) }));
	out.push(path('M 38 8 Q 24 4 16 12', { ...stroke(p.forestDeep, 1.2, 0.55) }));
	// Mozkový kmen
	out.push(rect(-7, 14, 14, 18, { fill: p.forest, stroke: p.light, sw: 1.1 }));
	// Akcentní jádro
	out.push(circle(0, -18, 4, { fill: p.amber, opacity: 0.9 }));
	if (variant === 2) out.push(circle(0, 34, 4, { fill: p.accent, opacity: 0.85 }));
	return out;
}

/** Malířská paleta s barvami a štětcem. */
function geoPalette({ palette: p, variant }) {
	const out = [];
	out.push(
		path('M -44 4 Q -48 -28 -18 -36 Q 14 -44 38 -26 Q 50 -16 44 -2 Q 38 10 26 6 Q 16 2 10 12 Q 2 28 -14 26 Q -34 24 -44 4 Z', {
			...shape(p.forest, p.light, 1.5)
		})
	);
	// Otvor na palec
	out.push(ellipse(28, 0, 7, 5, { fill: p.bg, stroke: p.light, sw: 1 }));
	// Barvy
	const dabs = [
		[-34, -18, p.amber],
		[-22, -26, p.terracotta],
		[-8, -30, p.teal],
		[6, -28, p.sage],
		[-30, -4, p.accent]
	];
	dabs.forEach(([x, y, fill]) => out.push(circle(x, y, 4.2, { fill })));
	// Štětec
	out.push(line(6, 20, 42, -16, { ...stroke(p.sage, 4, 1), linecap: 'round' }));
	out.push(line(40, -14, 46, -22, { ...stroke(p.light, 3, 1), linecap: 'round' }));
	out.push(polygon([[46, -22], [50, -28], [44, -30]], { fill: p.terracotta }));
	if (variant === 2) out.push(path('M -40 4 Q -20 18 4 8', { ...stroke(p.light, 1, 0.35) }));
	return out;
}

/** Geometrický mnohostěn — šestistěn s vnitřními fazetami. */
function geoPolyhedron({ palette: p, variant }) {
	const r = 38;
	const points = [];
	for (let i = 0; i < 6; i++) {
		const angle = (Math.PI / 3) * i - Math.PI / 2;
		points.push([Math.cos(angle) * r, Math.sin(angle) * r * 0.92]);
	}
	const out = [
		polygon(points, { ...shape(p.tealDeep, p.light, 1.6) }),
		// Jednotlivé fazety
		polygon([points[0], points[1], [0, 0]], { fill: p.teal, opacity: 0.95 }),
		polygon([points[2], points[3], [0, 0]], { fill: p.forest, opacity: 0.95 }),
		polygon([points[4], points[5], [0, 0]], { fill: p.sage, opacity: 0.95 }),
		polygon([points[1], points[2], [0, 0]], { fill: p.sageDeep, opacity: 0.8 }),
		polygon([points[3], points[4], [0, 0]], { fill: p.tealDeep, opacity: 0.9 }),
		polygon([points[5], points[0], [0, 0]], { fill: p.forestDeep, opacity: 0.9 }),
		line(points[0][0], points[0][1], points[3][0], points[3][1], { ...stroke(p.light, 1, 0.5) }),
		line(points[1][0], points[1][1], points[4][0], points[4][1], { ...stroke(p.light, 1, 0.5) }),
		line(points[2][0], points[2][1], points[5][0], points[5][1], { ...stroke(p.light, 1, 0.5) }),
		circle(0, 0, 4, { fill: p.amber, opacity: 0.9 })
	];
	if (variant === 1) out.splice(3, 0, polygon([points[0], points[2], [0, 0]], { fill: p.light, opacity: 0.12 }));
	return out;
}

/** Filmový pás se třemi okénky a přehrávacím trojúhelníkem. */
function geoFilm({ palette: p, variant }) {
	const out = [];
	const strip = [];
	strip.push(rect(-30, -48, 60, 96, { fill: p.forest, stroke: p.light, sw: 1.5, rx: 3 }));
	for (let i = 0; i < 5; i++) {
		const y = -40 + i * 18;
		strip.push(rect(-25, y, 7, 9, { fill: p.light, opacity: 0.9 }));
		strip.push(rect(18, y, 7, 9, { fill: p.light, opacity: 0.9 }));
	}
	strip.push(rect(-13, -38, 26, 76, { fill: p.tealDeep, stroke: p.light, sw: 1 }));
	// Tři okénka
	for (let i = 0; i < 3; i++) {
		strip.push(rect(-9, -32 + i * 25, 18, 17, { fill: i === 1 ? p.amber : p.sage, opacity: 0.9 }));
	}
	// Přehrávací trojúhelník v prostředním okénku
	strip.push(polygon([[-2, -10], [-2, 2], [7, -4]], { fill: p.forestDeep }));
	const rot = variant === 2 ? 6 : -8;
	out.push(...strip.map((el) => ({ ...el, transform: `rotate(${rot} 0 0)` })));
	return out;
}

/** Ozubené kolo — osm zubů a středový náboj. */
function geoGear({ palette: p, variant }) {
	const teeth = 8;
	const outer = 36;
	const inner = 25;
	const pts = [];
	for (let i = 0; i < teeth * 2; i++) {
		const angle = (Math.PI / teeth) * i - Math.PI / 2;
		const radius = i % 2 === 0 ? outer : inner;
		pts.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
	}
	const out = [
		polygon(pts, { ...shape(p.sageDeep, p.light, 1.6) }),
		circle(0, 0, 17, { fill: p.forest, stroke: p.light, sw: 1.4 }),
		circle(0, 0, 7, { fill: p.amber, stroke: p.light, sw: 1 })
	];
	const spokes = variant === 1 ? 3 : 4;
	for (let i = 0; i < spokes; i++) {
		const angle = (Math.PI * 2 * i) / spokes;
		out.push(
			line(Math.cos(angle) * 8, Math.sin(angle) * 8, Math.cos(angle) * 16, Math.sin(angle) * 16, {
				...stroke(p.light, 1.4, 0.7)
			})
		);
	}
	if (variant !== 2) out.push(circle(-9, -8, 2.4, { fill: p.teal }));
	return out;
}

/** Hodiny — ciferník s ručičkami a dvanácti značkami. */
function geoClock({ palette: p, variant }) {
	const out = [
		circle(0, 0, 38, { fill: p.lightSoft, stroke: p.light, sw: 1.8 }),
		circle(0, 0, 32, { fill: 'none', stroke: p.forest, sw: 1.2, opacity: 0.7 })
	];
	for (let i = 0; i < 12; i++) {
		const angle = (Math.PI / 6) * i - Math.PI / 2;
		const len = i % 3 === 0 ? 6 : 3;
		out.push(
			line(
				Math.cos(angle) * (32 - len),
				Math.sin(angle) * (32 - len),
				Math.cos(angle) * 32,
				Math.sin(angle) * 32,
				{ ...stroke(p.forestDeep, i % 3 === 0 ? 1.8 : 1, 0.8) }
			)
		);
	}
	// Ručičky ukazují na deset a dvě — jako na ikoně času.
	out.push(line(0, 0, 0, -20, { ...stroke(p.forestDeep, 2.6, 1) }));
	out.push(line(0, 0, 16, 6, { ...stroke(p.terracotta, 2.2, 1) }));
	out.push(circle(0, 0, 3.4, { fill: p.amber }));
	if (variant === 2) out.push(circle(0, -38, 3, { fill: p.accent }));
	return out;
}

/** Atom — jádro a tři dráhy. Jeden objekt, žádné doplňky. */
function geoAtom({ palette: p }) {
	const out = [];
	for (const angle of [0, 60, -60]) {
		out.push(
			ellipse(0, 0, 48, 17, {
				fill: 'none',
				stroke: p.sage,
				sw: 1.3,
				opacity: 0.8,
				transform: `rotate(${angle})`
			})
		);
	}
	out.push(circle(0, 0, 11, { fill: p.teal, stroke: p.light, sw: 1.3 }));
	out.push(circle(-4, -3, 4.4, { fill: p.terracotta }));
	out.push(circle(4, 3, 3.6, { fill: p.amber }));
	out.push(circle(34, -18, 3.2, { fill: p.light }));
	return out;
}

/** Planeta s prstencem — hlavní motiv astronomických příspěvků. */
function geoPlanet({ palette: p, variant }) {
	const tilt = variant === 1 ? -26 : -18;
	return [
		circle(0, 0, 40, { ...shape(p.teal, p.light, 1.5) }),
		path('M -34 -6 Q 0 12 34 -6', { fill: 'none', stroke: p.forestDeep, sw: 5, opacity: 0.7 }),
		path('M -30 14 Q 0 28 30 14', { fill: 'none', stroke: p.sageDeep, sw: 4, opacity: 0.6 }),
		ellipse(0, 0, 64, 15, {
			fill: 'none',
			stroke: p.amber,
			sw: 3,
			opacity: 0.9,
			transform: `rotate(${tilt})`
		}),
		circle(-14, -16, 4, { fill: p.light, opacity: 0.55 })
	];
}

/** Slunce — kotouč a paprsky. */
function geoSun({ palette: p }) {
	const out = [circle(0, 0, 30, { fill: p.amber, stroke: p.light, sw: 1.4 })];
	out.push(circle(0, 0, 17, { fill: p.terracotta, opacity: 0.85 }));
	for (let i = 0; i < 12; i++) {
		const angle = (i * Math.PI) / 6;
		out.push(
			line(
				Math.cos(angle) * 40,
				Math.sin(angle) * 40,
				Math.cos(angle) * 52,
				Math.sin(angle) * 52,
				{ stroke: p.amber, sw: 2.4 }
			)
		);
	}
	return out;
}

/** Dvojitá šroubovice — dvě vlákna a příčky. */
function geoHelix({ palette: p }) {
	const out = [
		path('M -18 -52 C 22 -34 -22 -8 18 14 C -22 32 20 42 -18 52', {
			...stroke(p.teal, 3.2)
		}),
		path('M 18 -52 C -22 -34 22 -8 -18 14 C 22 32 -20 42 18 52', {
			...stroke(p.sage, 3.2)
		})
	];
	for (let i = 0; i < 6; i++) {
		const y = -40 + i * 16;
		const sway = i % 2 === 0 ? 11 : -11;
		out.push(
			line(-sway, y, sway, y, {
				stroke: p.amber,
				sw: 1.8,
				opacity: 0.85
			})
		);
	}
	return out;
}

/** Koruna — hlavní motiv moci a panovníků. */
function geoCrownHero({ palette: p }) {
	return [
		polygon(
			[
				[-42, 22],
				[-42, -20],
				[-21, -4],
				[0, -32],
				[21, -4],
				[42, -20],
				[42, 22]
			],
			{ ...shape(p.amber, p.light, 1.5) }
		),
		rect(-42, 22, 84, 9, { fill: p.terracotta, stroke: p.light, sw: 1.1 }),
		circle(0, -12, 4, { fill: p.terracotta }),
		circle(-25, 14, 3.2, { fill: p.teal }),
		circle(25, 14, 3.2, { fill: p.teal }),
		circle(-42, -20, 4, { fill: p.teal }),
		circle(42, -20, 4, { fill: p.teal })
	];
}

/** Meč — čepel, záštita, rukojeť. */
function geoSword({ palette: p }) {
	return [
		polygon(
			[
				[0, -56],
				[9, -38],
				[7, 18],
				[-7, 18],
				[-9, -38]
			],
			{ ...shape(p.lightSoft, p.light, 1.3) }
		),
		line(0, -48, 0, 12, { stroke: p.sageDeep, sw: 1.2, opacity: 0.7 }),
		rect(-27, 18, 54, 7, { fill: p.amber, stroke: p.light, sw: 1.1, rx: 2 }),
		rect(-6, 25, 12, 23, { fill: p.teal, stroke: p.light, sw: 1.1 }),
		circle(0, 53, 6, { fill: p.amber, stroke: p.light, sw: 1.1 })
	];
}

/** Skupina postav — dav jako jeden hlavní motiv. */
function geoCrowd({ palette: p }) {
	const person = (x, y, scale, fill) =>
		group(
			[
				circle(0, -10, 10, { fill: p.sage, stroke: p.light, sw: 1.1 }),
				path('M -16 20 Q -16 2 0 2 Q 16 2 16 20 Z', {
					fill,
					stroke: p.light,
					sw: 1.1,
					linejoin: 'round'
				})
			],
			{ x, y, scale }
		);
	return [
		...person(-38, 8, 0.82, p.tealDeep),
		...person(38, 6, 0.9, p.forest),
		...person(0, -4, 1.08, p.teal)
	];
}

/** Svitek — zákoník či dokument. */
function geoScroll({ palette: p, variant }) {
	const out = [
		rect(-48, -26, 96, 52, {
			fill: p.lightSoft,
			stroke: p.light,
			sw: 1.3,
			rx: 3
		}),
		ellipse(-48, 0, 8, 28, { fill: p.tealDeep, stroke: p.light, sw: 1.2 }),
		ellipse(48, 0, 8, 28, { fill: p.tealDeep, stroke: p.light, sw: 1.2 }),
		ellipse(-48, 0, 3, 20, { fill: p.amber, opacity: 0.85 }),
		ellipse(48, 0, 3, 20, { fill: p.amber, opacity: 0.85 })
	];
	for (let i = 0; i < 4; i++) {
		const y = -15 + i * 10;
		out.push(
			line(-36, y, variant === 1 && i === 3 ? 12 : 34, y, {
				stroke: p.forestDeep,
				sw: 1.2,
				opacity: 0.6
			})
		);
	}
	return out;
}

/** Ruka — geometrická silueta dlaně a prstů. */
function geoHand({ palette: p }) {
	return [
		path(
			'M -26 44 L -30 -4 Q -30 -11 -23 -11 Q -16 -11 -16 -4 L -16 -28 Q -16 -35 -9 -35 Q -2 -35 -2 -28 L -2 -40 Q -2 -47 5 -47 Q 12 -47 12 -40 L 12 -26 Q 12 -33 19 -33 Q 26 -33 26 -26 L 26 -2 Q 26 20 18 44 Z',
			{ ...shape(p.sage, p.light, 1.4) }
		),
		path('M -26 10 Q -38 2 -40 -8 Q -41 -15 -35 -16 Q -29 -17 -26 -9 L -20 2 Z', {
			...shape(p.sageDeep, p.light, 1.2)
		}),
		line(-14, -2, -14, 30, { stroke: p.forestDeep, sw: 1, opacity: 0.45 }),
		line(2, -6, 2, 30, { stroke: p.forestDeep, sw: 1, opacity: 0.45 })
	];
}

/** Oko — oko jako hlavní motiv. */
function geoEye({ palette: p }) {
	return [
		path('M -52 0 Q -28 -30 0 -30 Q 28 -30 52 0 Q 28 30 0 30 Q -28 30 -52 0 Z', {
			...shape(p.forest, p.light, 1.5)
		}),
		circle(0, 0, 17, { fill: p.teal, stroke: p.light, sw: 1.2 }),
		circle(0, 0, 8, { fill: p.forestDeep }),
		circle(-5, -5, 2.8, { fill: p.amber })
	];
}

/** Srdce — jeden uzavřený tvar, žádné doplňky. */
function geoHeart({ palette: p }) {
	return [
		path(
			'M 0 46 C -10 32 -46 12 -46 -14 C -46 -34 -22 -44 -4 -26 L 0 -22 L 4 -26 C 22 -44 46 -34 46 -14 C 46 12 10 32 0 46 Z',
			{ ...shape(p.terracotta, p.light, 1.4) }
		),
		path('M -26 -16 Q -20 -30 -6 -28', {
			fill: 'none',
			stroke: p.light,
			sw: 2,
			opacity: 0.55
		})
	];
}

/** Plamen — vnější a vnitřní plocha. */
function geoFlame({ palette: p }) {
	return [
		path(
			'M 0 -54 C 20 -28 34 -12 30 8 C 27 30 12 44 0 44 C -12 44 -27 30 -30 8 C -33 -8 -18 -18 -8 -34 C -6 -20 0 -16 4 -24 C 10 -34 8 -44 0 -54 Z',
			{ ...shape(p.terracotta, p.light, 1.3) }
		),
		path('M 0 -20 C 12 -4 18 6 15 18 C 12 30 5 36 0 36 C -5 36 -12 30 -15 18 C -18 6 -8 0 0 -20 Z', {
			...shape(p.amber, p.light, 1)
		})
	];
}

/** Mikroskop — stativ, tubus a stolek. */
function geoMicroscope({ palette: p }) {
	return [
		line(-34, 46, 34, 46, { stroke: p.light, sw: 3 }),
		path('M 26 44 L 26 4 Q 26 -10 12 -10', { ...stroke(p.forest, 5) }),
		rect(-30, 8, 46, 6, { fill: p.sageDeep, stroke: p.light, sw: 1.2 }),
		rect(-12, -44, 22, 40, {
			fill: p.teal,
			stroke: p.light,
			sw: 1.3,
			rx: 3,
			transform: 'rotate(14)'
		}),
		rect(-16, -52, 28, 9, {
			fill: p.amber,
			stroke: p.light,
			sw: 1.1,
			rx: 2,
			transform: 'rotate(14)'
		}),
		circle(-8, 2, 5, { fill: p.light, fillOpacity: 0.18, stroke: p.light, sw: 1.2 }),
		line(-2, 44, 18, 24, { stroke: p.forestDeep, sw: 2, opacity: 0.6 })
	];
}

/** Složená mapa — panely, ohyby a trasa. */
function geoMap({ palette: p }) {
	return [
		polygon(
			[
				[-54, -30],
				[-18, -38],
				[-18, 32],
				[-54, 40]
			],
			{ ...shape(p.lightSoft, p.light, 1.2), fillOpacity: 0.9 }
		),
		polygon(
			[
				[-18, -38],
				[18, -30],
				[18, 40],
				[-18, 32]
			],
			{ ...shape(p.sageDeep, p.light, 1.2) }
		),
		polygon(
			[
				[18, -30],
				[54, -38],
				[54, 32],
				[18, 40]
			],
			{ ...shape(p.tealDeep, p.light, 1.2) }
		),
		line(-18, -38, -18, 32, { stroke: p.forestDeep, sw: 0.9, opacity: 0.7 }),
		line(18, -30, 18, 40, { stroke: p.forestDeep, sw: 0.9, opacity: 0.7 }),
		path('M -40 20 Q -14 -18 4 2 Q 20 18 40 -20', {
			fill: 'none',
			stroke: p.amber,
			sw: 2,
			dash: '5 5'
		}),
		circle(40, -20, 4, { fill: p.terracotta })
	];
}

/** Mince — kotouč s vnitřním prstencem a rytými značkami. */
function geoCoin({ palette: p }) {
	const out = [
		circle(0, 0, 38, { ...shape(p.amber, p.light, 1.4) }),
		circle(0, 0, 30, { fill: 'none', stroke: p.forestDeep, sw: 1.4, opacity: 0.75 }),
		polygon(
			[
				[0, -16],
				[14, -8],
				[14, 8],
				[0, 16],
				[-14, 8],
				[-14, -8]
			],
			{ fill: p.terracotta, stroke: p.light, sw: 0.9 }
		)
	];
	for (let i = 0; i < 12; i++) {
		const angle = (i * Math.PI) / 6;
		out.push(
			line(
				Math.cos(angle) * 32,
				Math.sin(angle) * 32,
				Math.cos(angle) * 36,
				Math.sin(angle) * 36,
				{ stroke: p.forestDeep, sw: 1.2, opacity: 0.8 }
			)
		);
	}
	return out;
}

/** Nekonečno — dvě propojené smyčky. */
function geoInfinity({ palette: p }) {
	return [
		path(
			'M 0 0 C -14 -28 -52 -28 -52 0 C -52 28 -14 28 0 0 C 14 -28 52 -28 52 0 C 52 28 14 28 0 0 Z',
			{ fill: 'none', stroke: p.amber, sw: 7, linejoin: 'round', linecap: 'round' }
		),
		circle(0, 0, 3.6, { fill: p.terracotta })
	];
}

/** Stojící postava — celá silueta, ne jen busta. */
function geoFigure({ palette: p }) {
	return [
		circle(0, -38, 12, { fill: p.sage, stroke: p.light, sw: 1.3 }),
		path('M -19 -24 Q 0 -33 19 -24 L 24 8 L 10 13 L 8 54 L -8 54 L -10 13 L -24 8 Z', {
			...shape(p.forest, p.light, 1.4)
		}),
		line(0, -18, 0, 8, { stroke: p.accent, sw: 3, opacity: 0.9 })
	];
}

/** Vítr — tři proudnice. */
function geoWind({ palette: p }) {
	return [
		path('M -54 -20 Q -20 -34 12 -20 Q 34 -10 52 -20', { ...stroke(p.sage, 3.2) }),
		path('M -54 2 Q -12 -10 20 2 Q 38 9 54 2', { ...stroke(p.light, 3) }),
		path('M -44 24 Q -8 12 22 24 Q 38 30 46 24', { ...stroke(p.teal, 2.6) })
	];
}

/** Blesk — jeden jasný tvar. */
function geoBolt({ palette: p }) {
	return [
		polygon(
			[
				[10, -52],
				[-16, -8],
				[2, -8],
				[-10, 48],
				[20, -4],
				[2, -4],
				[18, -52]
			],
			{ ...shape(p.amber, p.light, 1.2) }
		)
	];
}

/** Hory — dva vrcholy jako jeden hlavní motiv. */
function geoMountain({ palette: p }) {
	return [
		polygon(
			[
				[-58, 44],
				[-10, -42],
				[40, 44]
			],
			{ ...shape(p.tealDeep, p.light, 1.3) }
		),
		polygon(
			[
				[-10, -42],
				[2, -24],
				[-8, -26],
				[-16, -20],
				[-22, -26]
			],
			{ fill: p.light, opacity: 0.85 }
		),
		polygon(
			[
				[4, 44],
				[40, -22],
				[74, 44]
			],
			{ ...shape(p.forest, p.light, 1.3) }
		),
		polygon(
			[
				[40, -22],
				[48, -9],
				[42, -10],
				[37, -5],
				[32, -10]
			],
			{ fill: p.light, opacity: 0.85 }
		)
	];
}

/** Sněhová vločka — šest ramen. */
function geoSnowflake({ palette: p }) {
	const out = [];
	for (let i = 0; i < 3; i++) {
		const angle = (i * Math.PI) / 3;
		const dx = Math.cos(angle) * 44;
		const dy = Math.sin(angle) * 44;
		out.push(line(-dx, -dy, dx, dy, { stroke: p.light, sw: 2.6, linecap: 'round' }));
		for (const sign of [-1, 1]) {
			const ox = dx * 0.56 * sign;
			const oy = dy * 0.56 * sign;
			out.push(
				line(ox, oy, ox + Math.cos(angle + 0.7) * 12, oy + Math.sin(angle + 0.7) * 12, {
					stroke: p.sage,
					sw: 1.8
				}),
				line(ox, oy, ox + Math.cos(angle - 0.7) * 12, oy + Math.sin(angle - 0.7) * 12, {
					stroke: p.sage,
					sw: 1.8
				})
			);
		}
	}
	out.push(circle(0, 0, 5, { fill: p.amber }));
	return out;
}

// --- Scény ----------------------------------------------------------------

const HEROES = {
	bust: geoBust,
	flask: geoFlask,
	telescope: geoScope,
	book: geoBook,
	amphora: geoAmphora,
	column: geoColumn,
	tree: geoTree,
	octopus: geoOctopus,
	balance: geoBalance,
	brain: geoBrain,
	palette: geoPalette,
	polyhedron: geoPolyhedron,
	film: geoFilm,
	gear: geoGear,
	clock: geoClock,
	atom: geoAtom,
	planet: geoPlanet,
	sun: geoSun,
	heelix: geoHelix,
	crown: geoCrownHero,
	sword: geoSword,
	crowd: geoCrowd,
	scroll: geoScroll,
	hand: geoHand,
	eye: geoEye,
	heart: geoHeart,
	flame: geoFlame,
	microscope: geoMicroscope,
	map: geoMap,
	coin: geoCoin,
	infinity: geoInfinity,
	figure: geoFigure,
	wind: geoWind,
	bolt: geoBolt,
	mountain: geoMountain,
	snowflake: geoSnowflake
};

const DEFAULT_SUBJECT = {
	portrait: 'bust',
	discovery: 'flask',
	storybook: 'book',
	relic: 'amphora',
	metaphor: 'balance',
	nature: 'tree',
	layers: null
};

// Některé předměty mají v klasickém systému jiné jméno než náš motiv.
// Mapování drží jednu rozpoznatelnou věc na příspěvek, ne dekoraci navíc.
const SUBJECT_ALIAS = {
	lawScroll: 'scroll',
	periodicTable: 'flask',
	throne: 'crown',
	temple: 'column',
	altar: 'column',
	stele: 'column',
	entropy: 'clock',
	knot: 'infinity',
	roots: 'tree',
	leaf: 'tree',
	forest: 'tree',
	bird: 'tree',
	cloud: 'wind',
	lightning: 'bolt'
};

const FAMILY_FALLBACK = {
	grid: 'layers',
	orbit: 'discovery',
	data: 'layers',
	timeline: 'layers',
	network: 'layers',
	signals: 'discovery',
	structure: 'relic',
	contrast: 'metaphor',
	organic: 'nature',
	silhouette: 'portrait',
	crowd: 'portrait',
	gaze: 'portrait',
	armory: 'relic',
	throne: 'relic',
	temple: 'relic',
	ritual: 'relic',
	storm: 'nature',
	snowfield: 'nature',
	peak: 'nature',
	undergrowth: 'nature',
	transformation: 'nature',
	rupture: 'layers',
	decay: 'layers',
	descent: 'layers',
	lattice: 'layers',
	meander: 'layers',
	cascade: 'layers',
	divergence: 'layers',
	threshold: 'layers',
	monolith: 'relic',
	arch: 'relic'
};

function geometricFamilyFor(family) {
	if (DEFAULT_SUBJECT[family] !== undefined) return family;
	return FAMILY_FALLBACK[family] || 'metaphor';
}

function resolveSubject(family, subject) {
	const key = SUBJECT_ALIAS[subject] || subject;
	if (key && HEROES[key]) return key;
	return DEFAULT_SUBJECT[family];
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

const SCENES = {
	portrait: scenePortrait,
	discovery: sceneDiscovery,
	storybook: sceneStorybook,
	relic: sceneRelic,
	metaphor: sceneMetaphor,
	nature: sceneNature,
	layers: sceneLayers
};

export const GEOMETRIC_FAMILY_KEYS = Object.keys(SCENES);

/**
 * Sestaví geometrickou scénu pro příspěvek nebo explicitní parametry.
 * Vrací stejný tvar spec jako `createIllustration`, takže ho zvládne
 * stávající renderer i testy.
 *
 * @param {{
 *   family?: string,
 *   post?: { id?: string, title?: string, content?: string, category?: string } | null,
 *   seed?: string | number,
 *   category?: string,
 *   subject?: string | null,
 *   variant?: number,
 *   density?: number,
 *   scale?: number,
 *   balance?: number
 * }} [options]
 */
export function createGeometricIllustration(options = {}) {
	const analysis = options.post ? analyzePost(options.post) : null;
	const requested = options.family || analysis?.family || 'metaphor';
	const family = geometricFamilyFor(requested);
	const seed = options.seed == null ? deriveSeed(options.post) : String(options.seed);
	const random = createRandom(seed);

	// Stejné pevné pořadí losování jako klasický systém.
	const variant = clamp(Math.round(options.variant ?? random.int(0, 2)), 0, 2);
	const density = clamp(options.density ?? round(random.range(0.35, 1), 2), 0.35, 1);
	const scale = clamp(options.scale ?? round(random.range(0.9, 1.1), 2), 0.9, 1.1);
	const balance = clamp(options.balance ?? round(random.range(-1, 1), 2), -1, 1);

	const category = options.category ?? options.post?.category;
	const palette = geometricPalette(category);

	// Předmět: explicitní, jinak z textu; neznámý předmět spadne na motiv rodiny.
	let subject = options.subject;
	if (subject === undefined) {
		subject = analysis?.subject ?? null;
	}
	subject = family === 'layers' ? null : resolveSubject(family, subject);
	const context = {
		family,
		subject,
		rand: random,
		random,
		variant,
		density,
		scale,
		balance,
		palette
	};

	return {
		style: 'geometric',
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
		elements: SCENES[family](context)
	};
}
