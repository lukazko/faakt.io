/**
 * Paleta geometrické vrstvy a společné kreslicí pomocníky.
 *
 * Tmavá, ale barevně bohatá paleta: hluboká indigová a námořnická modř
 * jako hmota, sytý teal jako světlo, jantar a korál jako teplé akcenty
 * a teplá kostní běloba pro obrysy. Zelená už není nosná barva scény.
 *
 * Klíče `forest`, `teal` a `sage` jsou historické názvy materiálových rolí
 * a zůstávají kvůli veřejnému API i kreslicím funkcím. Jejich hodnoty jsou
 * ale znovu namíchané, takže scéna působí jinak, aniž by se měnil kontrakt.
 */

import { mixHex, paletteForCategory } from '../palettes.js';

// --- Společná paleta ------------------------------------------------------

export const GEOMETRIC_COLORS = {
	// Pozadí karty — ilustrace zůstává průhledná, `bg` jen míchá stíny.
	bg: '#0B0E17',

	// Hmota: hluboká indigová modř místo zelené.
	forest: '#27325F',
	forestDeep: '#151B38',

	// Světlo: sytý teal a jeho tmavší hlas.
	teal: '#1AA6B7',
	tealDeep: '#0D6C80',

	// Druhá hmota: levandulový inkoust pro kůži, látky a jemné plochy.
	sage: '#8F97CE',
	sageDeep: '#5C639C',

	// Botanická zeleň — jen pro rostlinné motivy, aby listy nevypadaly
	// jako modré plochy. Nenese scénu, drží se v objektu.
	green: '#4E9B72',
	greenDeep: '#2C6249',

	// Teplé akcenty.
	amber: '#F6B94A',
	terracotta: '#E96A4B',

	// Obrysy a papír — teplá běloba, ne šedá.
	light: '#F2E8D5'
};

const C = GEOMETRIC_COLORS;

/**
 * Paleta scény: jednotná indigovo-tealová hmota, teplé akcenty a barva
 * kategorie v roli identifikačního akcentu. Kategorie nikdy nepřebarvuje
 * celý objekt — drží se v detailech (šerpa, záložka, jádro, pás).
 */
export function geometricPalette(category) {
	const base = paletteForCategory(category);
	const accent = base.primary;
	return {
		...C,
		accent,
		accentSoft: mixHex(accent, C.forest, 0.45),
		accentPale: mixHex(accent, C.bg, 0.55),
		lightSoft: mixHex(C.light, C.sage, 0.32),
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

export const stroke = (color, sw = 1.4, opacity = 1) => ({
	fill: 'none',
	stroke: color,
	sw,
	opacity,
	linecap: 'round',
	linejoin: 'round'
});

export const shape = (fill, color = C.light, sw = 1.3, opacity = 1) => ({
	fill,
	stroke: color,
	sw,
	opacity,
	linejoin: 'round'
});
