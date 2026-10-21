/**
 * Palety ilustrací.
 *
 * Zdroj pravdy jsou barvy kategorií v `app.css` (--cat-*). Každá paleta má
 * proto stabilní sémantické role:
 *
 * - `primary`  — hlavní barva kategorie, vždy stejná pro stejnou kategorii,
 * - `secondary` — druhá barva kategorie pro doplňkové akcenty,
 * - `light`    — světlejší tint primární barvy pro velké plochy,
 * - `dark`     — tmavší odstín pro siluety a obrysy na tmavé kartě,
 * - `tertiary` — odvozený harmonický akcent pro drobné detaily,
 * - `muted`, `soft`, `faint` — sdílené neutrály pro linky a pozadí,
 * - materiálové role (`wood`, `foliage`, `stone`, `metal`, `paper`, `skin`,
 *   `water`, `ember`, `gold`, `snow`) — přirozené barvy konkrétních objektů.
 *
 * Materiálové role drží rozpoznatelnost předmětu (dřevo je hnědé, listy
 * zelené), ale obrysy a signaturu vždy kreslí `primary`, takže ilustrace
 * zůstává vizuálně ukotvená v barvě kategorie. `accent` je alias `primary`
 * kvůli starším scénám a veřejnému API.
 * Primární barva se nikdy nevybírá náhodou — náhoda smí jen volit mezi
 * kompozicemi, ne přebarvovat kategorii.
 */

/**
 * @typedef {{
 *   primary: string,
 *   secondary: string,
 *   light: string,
 *   dark: string,
 *   tertiary: string,
 *   accent: string,
 *   muted: string,
 *   soft: string,
 *   faint: string,
 *   wood: string,
 *   woodDark: string,
 *   foliage: string,
 *   foliageDark: string,
 *   stone: string,
 *   stoneDark: string,
 *   metal: string,
 *   metalDark: string,
 *   paper: string,
 *   paperDark: string,
 *   skin: string,
 *   skinDark: string,
 *   water: string,
 *   waterDark: string,
 *   ember: string,
 *   emberDark: string,
 *   gold: string,
 *   goldDark: string,
 *   snow: string
 * }} Palette
 */

/** @type {Record<string, [string, string]>} */
export const CATEGORY_PALETTES = {
	historie: ['#f59e0b', '#fb923c'],
	filozofie: ['#a78bfa', '#c084fc'],
	veda: ['#34d399', '#10b981'],
	umeni: ['#f472b6', '#e879f9'],
	literatura: ['#fb923c', '#f59e0b'],
	politika: ['#f87171', '#fb923c'],
	fyzika: ['#22d3ee', '#38bdf8'],
	astronomie: ['#818cf8', '#a78bfa'],
	zajimavost: ['#38bdf8', '#22d3ee'],
	ekonomie: ['#84cc16', '#34d399'],
	psychologie: ['#c084fc', '#a78bfa'],
	filmy: ['#e879f9', '#f472b6'],
	matematika: ['#2dd4bf', '#22d3ee'],
	'pocitacove-vedy': ['#10b981', '#34d399']
};

/** Neutrální barvy sdílené všemi paletami. */
export const NEUTRALS = {
	muted: '#6f6f6f',
	soft: '#333333',
	faint: '#232323'
};

/**
 * Přirozené materiálové barvy. Nejsou náhodné: každý objekt si drží
 * rozpoznatelnou barvu bez ohledu na kategorii. Jsou záměrně tlumené,
 * aby na tmavém pozadí nepřebily `primary` a nepůsobily jako duhová paleta.
 */
export const MATERIALS = {
	wood: '#b0793f',
	woodDark: '#6d4526',
	foliage: '#5cb85c',
	foliageDark: '#2f6b3a',
	stone: '#9aa5b5',
	stoneDark: '#4b5563',
	metal: '#bcc6d4',
	metalDark: '#5f6b7c',
	paper: '#ead9b8',
	paperDark: '#b9a27a',
	skin: '#d9a077',
	skinDark: '#9c6644',
	water: '#4aa8d8',
	waterDark: '#1f5f80',
	ember: '#e86a5e',
	emberDark: '#94372f',
	gold: '#e3b341',
	goldDark: '#9a6d1a',
	snow: '#e6edf5'
};

/** Sytost a světlost se počítají jen pro odvozený `tertiary` akcent. */
function rgbToHsl([r, g, b]) {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	if (max === min) return [0, 0, l];
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h;
	if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
	else if (max === gn) h = (bn - rn) / d + 2;
	else h = (rn - gn) / d + 4;
	return [h / 6, s, l];
}

function hslToRgb([h, s, l]) {
	if (s === 0) {
		const v = clampChannel(l * 255);
		return [v, v, v];
	}
	const hue = (p, q, t) => {
		let value = t;
		if (value < 0) value += 1;
		if (value > 1) value -= 1;
		if (value < 1 / 6) return p + (q - p) * 6 * value;
		if (value < 1 / 2) return q;
		if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
		return p;
	};
	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;
	return [hue(p, q, h + 1 / 3) * 255, hue(p, q, h) * 255, hue(p, q, h - 1 / 3) * 255];
}

/**
 * Posune odstín a upraví sytost/světlost. Používá se pro `tertiary`,
 * aby vznikl barevně příbuzný, ale odlišitelný akcent.
 */
export function shiftHsl(hex, { hue = 0, saturation = 1, lightness = 0 } = {}) {
	const [h, s, l] = rgbToHsl(parseHex(hex));
	const nextHue = (((h * 360 + hue) % 360) + 360) % 360 / 360;
	return toHex(
		hslToRgb([
			nextHue,
			Math.max(0, Math.min(1, s * saturation)),
			Math.max(0, Math.min(1, l + lightness))
		])
	);
}

/** Paleta pro neznámou nebo chybějící kategorii — brand gradient. */
export const FALLBACK_PALETTE = ['#f59e0b', '#c2410c'];

/** Bezpečný fallback, když kategorie chybí nebo není v mapě. */
export const MISSING_CATEGORY_NOTE =
	'Kategorie nemá definovanou paletu — používá se brandová oranžová (--accent).';

function clampChannel(value) {
	return Math.max(0, Math.min(255, Math.round(value)));
}

function parseHex(hex) {
	const clean = String(hex).replace('#', '');
	const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
	const value = Number.parseInt(full.slice(0, 6), 16);
	if (!Number.isFinite(value)) return [245, 158, 11];
	return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex([r, g, b]) {
	return `#${[r, g, b].map((v) => clampChannel(v).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Smíchá dvě barvy. `t = 0` vrátí první, `t = 1` druhou.
 * Pomáhá odvodit light/dark role bez ruční tabulky pro každou kategorii.
 */
export function mixHex(from, to, t) {
	const a = parseHex(from);
	const b = parseHex(to);
	return toHex(a.map((channel, index) => channel + (b[index] - channel) * t));
}

/**
 * Sestaví paletu z dvojice barev kategorie.
 * @param {[string, string]} pair
 * @returns {Palette}
 */
export function buildPalette(pair) {
	const primary = pair[0];
	const secondary = pair[1];
	return {
		primary,
		secondary,
		light: mixHex(primary, '#ffffff', 0.62),
		dark: mixHex(primary, '#0a0a0a', 0.52),
		// Barevně příbuzný, ale zřetelně odlišný akcent pro drobné detaily.
		tertiary: shiftHsl(primary, { hue: -36, saturation: 0.6, lightness: 0.07 }),
		accent: primary,
		...MATERIALS,
		...NEUTRALS
	};
}

/**
 * Vrátí paletu pro kategorii. Primární barva je vždy stabilní; volitelný
 * `swap` jen prohodí doplňkovou dvojici pro showcase, nikdy ne hlavní barvu.
 * @param {string | null | undefined} category
 * @param {boolean} [swap]
 * @returns {Palette}
 */
export function paletteForCategory(category, swap = false) {
	const key = typeof category === 'string' ? category.trim().toLowerCase() : '';
	const pair = CATEGORY_PALETTES[key] || FALLBACK_PALETTE;
	const palette = buildPalette(pair);
	if (!swap) return palette;

	// Prohození znamená jen jinou roli doplňkové barvy; primary zůstává.
	return { ...palette, secondary: pair[0], light: mixHex(pair[1], '#ffffff', 0.62) };
}

/**
 * Zpětně kompatibilní varianta pro starší volající. Náhodu už nepoužívá
 * k přebarvení kategorie — výsledná paleta je pro stejný vstup stabilní.
 * @param {string | null | undefined} category
 * @param {() => number} [_random]
 * @returns {Palette}
 */
export function resolvePalette(category, _random) {
	return paletteForCategory(category);
}
