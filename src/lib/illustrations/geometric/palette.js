/**
 * Paleta geometrické vrstvy a společné kreslicí pomocníky.
 *
 * Tmavé zeleno-petrolejové plochy, jantar a terakota jako akcenty.
 * Barva kategorie zůstává identifikačním akcentem, ale nebarví celý objekt.
 */

import { mixHex, paletteForCategory } from '../palettes.js';

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

