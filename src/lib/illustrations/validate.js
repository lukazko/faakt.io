/**
 * Validace scén pro testy a vývojovou galerii.
 *
 * Produkční feed tyto funkce nevolá — kontrolují se jimi jen generované
 * scény, aby se do rendereru nedostal NaN, neznámý tvar nebo rozbitá barva.
 */

/**
 * Ověří, že scéna je použitelná jako SVG a všechny parametry jsou v mezích.
 * Slouží testům i showcase — odhalí NaN, neznámé tvary nebo rozbité barvy.
 * @param {Array<Record<string, unknown>>} elements
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateElements(elements) {
	const errors = [];
	const allowed = new Set(['rect', 'circle', 'ellipse', 'line', 'path', 'polyline']);
	if (!Array.isArray(elements) || elements.length === 0) {
		return { ok: false, errors: ['scéna je prázdná'] };
	}

	elements.forEach((el, index) => {
		if (!el || typeof el !== 'object') {
			errors.push(`#${index}: prvek není objekt`);
			return;
		}
		if (!allowed.has(el.t)) errors.push(`#${index}: neznámý tvar ${el.t}`);

		for (const [key, value] of Object.entries(el)) {
			if (key === 't' || key === 'd' || key === 'points') continue;
			if (typeof value === 'number' && !Number.isFinite(value)) {
				errors.push(`#${index}.${key}: není konečné číslo`);
			}
		}

		if (el.t === 'rect' && !(el.w > 0 && el.h > 0)) errors.push(`#${index}: neplatný rect`);
		if ((el.t === 'circle' || el.t === 'ellipse') && !(el.r > 0 || el.rx > 0)) {
			errors.push(`#${index}: neplatný poloměr`);
		}
		if (el.opacity !== undefined && !(el.opacity >= 0 && el.opacity <= 1)) {
			errors.push(`#${index}: opacity mimo 0..1`);
		}
		for (const key of ['fill', 'stroke']) {
			if (el[key] && !/^(#[0-9a-f]{3,8}|none|currentColor)$/i.test(String(el[key]))) {
				errors.push(`#${index}.${key}: neplatná barva`);
			}
		}
	});

	return { ok: errors.length === 0, errors };
}

/**
 * Ověří, že kompozice zůstává v rozumných mezích viewBoxu (s tolerancí
 * na záměrný přesah). Slouží hlavně testům parametrů.
 */
export function boundsOf(elements) {
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	for (const el of elements) {
		const points = [];
		if (el.t === 'rect') {
			points.push([el.x, el.y], [el.x + el.w, el.y + el.h]);
		} else if (el.t === 'circle') {
			points.push([el.cx - el.r, el.cy - el.r], [el.cx + el.r, el.cy + el.r]);
		} else if (el.t === 'ellipse') {
			points.push([el.cx - el.rx, el.cy - el.ry], [el.cx + el.rx, el.cy + el.ry]);
		} else if (el.t === 'line') {
			points.push([el.x1, el.y1], [el.x2, el.y2]);
		} else if (el.t === 'polyline') {
			el.points.split(' ').forEach((value, index, all) => {
				if (index % 2 === 0) points.push([Number(value), Number(all[index + 1])]);
			});
		}
		for (const [x, y] of points) {
			if (Number.isFinite(x)) {
				minX = Math.min(minX, x);
				maxX = Math.max(maxX, x);
			}
			if (Number.isFinite(y)) {
				minY = Math.min(minY, y);
				maxY = Math.max(maxY, y);
			}
		}
	}

	return { minX, minY, maxX, maxY };
}
