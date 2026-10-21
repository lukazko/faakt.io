/**
 * Základní stavební kameny scén.
 *
 * Všechno jsou jen čistá data — žádné Svelte, žádné DOM. Díky společným
 * helperům zůstávají souřadnice krátké a zaokrouhlené, takže serializace
 * scény je stabilní a testy determinismu mají smysl.
 */

import { round } from './prng.js';

/** Zaokrouhlení souřadnic — kratší DOM i stabilní serializace. */
export const n = (value) => round(value, 2);

export const rect = (x, y, w, h, opts = {}) => ({
	t: 'rect',
	x: n(x),
	y: n(y),
	w: n(w),
	h: n(h),
	...opts
});

export const circle = (cx, cy, r, opts = {}) => ({
	t: 'circle',
	cx: n(cx),
	cy: n(cy),
	r: n(r),
	...opts
});

export const ellipse = (cx, cy, rx, ry, opts = {}) => ({
	t: 'ellipse',
	cx: n(cx),
	cy: n(cy),
	rx: n(rx),
	ry: n(ry),
	...opts
});

export const line = (x1, y1, x2, y2, opts = {}) => ({
	t: 'line',
	x1: n(x1),
	y1: n(y1),
	x2: n(x2),
	y2: n(y2),
	...opts
});

export const path = (d, opts = {}) => ({ t: 'path', d, ...opts });

export const polyline = (points, opts = {}) => ({
	t: 'polyline',
	points: points.map(([x, y]) => `${n(x)} ${n(y)}`).join(' '),
	...opts
});

/** Mnohoúhelník jako uzavřená path — renderer pak nepotřebuje nový tvar. */
export const polygon = (points, opts = {}) =>
	path(`M ${points.map(([x, y]) => `${n(x)} ${n(y)}`).join(' L ')} Z`, opts);

/**
 * Přidá všem prvkům skupinovou transformaci. Motývy se tak kreslí
 * v lokálních souřadnicích kolem nuly a umístění řeší kompozice.
 * @param {Array<Record<string, unknown>>} elements
 * @param {{ x?: number, y?: number, scale?: number, rotate?: number, flip?: boolean }} placement
 */
export function group(elements, placement = {}) {
	const { x = 0, y = 0, scale = 1, rotate = 0, flip = false } = placement;
	const sx = flip ? -scale : scale;
	const transform = [
		`translate(${n(x)} ${n(y)})`,
		rotate ? `rotate(${n(rotate)})` : '',
		sx !== 1 || scale !== 1 ? `scale(${n(sx)} ${n(scale)})` : ''
	]
		.filter(Boolean)
		.join(' ');

	return elements.map((el) => ({
		...el,
		transform: el.transform ? `${transform} ${el.transform}` : transform
	}));
}

/** Kruhový oblouk jako path (bez potřeby dalšího tvaru v rendereru). */
export function arcPath(cx, cy, r, startDeg, endDeg, opts = {}) {
	const toPoint = (deg) => {
		const rad = (deg * Math.PI) / 180;
		return [cx + Math.cos(rad) * r, cy + Math.sin(rad) * r];
	};
	const [x1, y1] = toPoint(startDeg);
	const [x2, y2] = toPoint(endDeg);
	const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
	const sweep = endDeg >= startDeg ? 1 : 0;
	return path(`M ${n(x1)} ${n(y1)} A ${n(r)} ${n(r)} 0 ${large} ${sweep} ${n(x2)} ${n(y2)}`, opts);
}

/** Krátká vodorovná čárka — textury, zářezy, linky dokumentů. */
export const tick = (x, y, length, opts = {}) => line(x, y, x + length, y, opts);
