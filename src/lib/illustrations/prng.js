/**
 * Deterministické pomocníky pro ilustrace.
 *
 * Všechno tady je čisté a bez závislostí — stejný vstup dá vždy stejný výsledek, bez ohledu na pořadí vykreslení ani pozici ve feedu.
 */

/**
 * 32bitový FNV-1a hash řetězce — stabilní napříč prohlížeči i běhy.
 * @param {unknown} value
 * @returns {number} celé číslo 0..2^32-1
 */
export function hashString(value) {
	const text = String(value ?? '');
	let hash = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		hash ^= text.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

/**
 * Mulberry32 — malý, rychlý a deterministický PRNG.
 * @param {number} seed
 */
function mulberry32(seed) {
	let state = seed >>> 0;
	return function next() {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Vytvoří deterministický generátor z čísla nebo řetězce.
 * @param {number | string} seed
 */
export function createRandom(seed) {
	const numeric = typeof seed === 'number' ? seed >>> 0 : hashString(seed);
	const next = mulberry32(numeric);

	// Generátor je zároveň funkce (`rand()`) i objekt s pomocníky —
	// scény tak můžou psát přirozeně `rand()` i `rand.int(0, 2)`.
	const random = () => next();
	random.next = next;
	random.range = (min, max) => min + next() * (max - min);
	random.int = (min, max) => Math.floor(min + next() * (max - min + 1));
	random.pick = (items) => items[Math.floor(next() * items.length)];
	random.chance = (probability) => next() < probability;

	return random;
}

/** Omezí číslo do uzavřeného rozsahu. */
export function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

/** Lineární interpolace. */
export function lerp(a, b, t) {
	return a + (b - a) * t;
}

/** Zaokrouhlí na daný počet desetinných míst (pro krátké SVG atributy). */
export function round(value, decimals = 2) {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}
