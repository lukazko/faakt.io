/**
 * Tvary ilustračních rodin.
 *
 * Původních deset abstraktních kompozic zůstává pro obsah, který nemá
 * konkrétní předmět. Šest sémantických rodin (`semantic-scenes.js`) staví
 * z motivů knihy, busty, baňky, amfory, stromu a pojmových objektů.
 *
 * Každá rodina je čistá funkce parametrů na seznam SVG primitiv. Žádné
 * externí assety, žádné filtry ani text — jen rect, circle, ellipse, line,
 * path a polyline (s volitelnou transformací). Díky tomu je scéna malá,
 * čitelná a testovatelná.
 *
 * Scéna se kreslí do viewBoxu 320 × 180. `scale` řeší renderer jako
 * transformaci kolem středu, `balance` posouvá ohnisko kompozice.
 */

import { clamp, round } from './prng.js';
import { SEMANTIC_FAMILIES } from './semantic-scenes.js';
import { EXTRA_ABSTRACT_FAMILIES } from './abstract-extra.js';

export const VIEWBOX = { width: 320, height: 180 };

const W = VIEWBOX.width;
const H = VIEWBOX.height;

/** Zaokrouhlení souřadnic — kratší DOM i stabilní serializace. */
const n = (value) => round(value, 2);

const rect = (x, y, w, h, opts = {}) => ({
	t: 'rect',
	x: n(x),
	y: n(y),
	w: n(w),
	h: n(h),
	...opts
});

const circle = (cx, cy, r, opts = {}) => ({
	t: 'circle',
	cx: n(cx),
	cy: n(cy),
	r: n(r),
	...opts
});

const ellipse = (cx, cy, rx, ry, opts = {}) => ({
	t: 'ellipse',
	cx: n(cx),
	cy: n(cy),
	rx: n(rx),
	ry: n(ry),
	...opts
});

const line = (x1, y1, x2, y2, opts = {}) => ({
	t: 'line',
	x1: n(x1),
	y1: n(y1),
	x2: n(x2),
	y2: n(y2),
	...opts
});

const path = (d, opts = {}) => ({ t: 'path', d, ...opts });

const polyline = (points, opts = {}) => ({
	t: 'polyline',
	points: points.map(([x, y]) => `${n(x)} ${n(y)}`).join(' '),
	...opts
});

/** Společný střed kompozice, posunutý parametrem `balance`. */
function focus(ctx, spread = 16) {
	return { x: W / 2 + ctx.balance * spread, y: H / 2 };
}

// --- 1. Geometrická mřížka ------------------------------------------------

function geometricGrid(ctx) {
	const { rand, variant, density, palette: p } = ctx;
	const cols = 4 + variant;
	const rows = 3;
	const gap = 10;
	const boxW = 216 + density * 28;
	const boxH = 126;
	const x0 = W / 2 - boxW / 2 + ctx.balance * 8;
	const y0 = H / 2 - boxH / 2;
	const cellW = (boxW - gap * (cols - 1)) / cols;
	const cellH = (boxH - gap * (rows - 1)) / rows;

	const out = [
		// Velký obrys za mřížkou — hloubka a negativní prostor
		rect(x0 - 12, y0 - 12, boxW + 24, boxH + 24, {
			rx: 2,
			fill: 'none',
			stroke: p.faint,
			sw: 1
		})
	];

	const featuredCol = rand.int(0, cols - 1);
	const featuredRow = rand.int(0, rows - 1);
	const circleCol = (featuredCol + 1 + rand.int(0, 1)) % cols;

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const x = x0 + col * (cellW + gap);
			const y = y0 + row * (cellH + gap);
			out.push(rect(x, y, cellW, cellH, { fill: 'none', stroke: p.faint, sw: 1 }));

			if (rand() < 0.14 + density * 0.34) {
				const tint = (row + col) % 3 === 0 ? p.tertiary : p.accent;
				out.push(rect(x, y, cellW, cellH, { fill: tint, opacity: 0.16 }));
			}
			if (row === featuredRow && col === featuredCol) {
				out.push(rect(x, y, cellW, cellH, { fill: p.accent, opacity: 0.82 }));
			}
		}
	}

	const cx = x0 + circleCol * (cellW + gap) + cellW / 2;
	const cy = y0 + (rows - 1) * (cellH + gap) + cellH / 2;
	out.push(circle(cx, cy, Math.min(cellW, cellH) * 0.32, { fill: p.secondary, opacity: 0.9 }));
	out.push(circle(cx, cy, Math.min(cellW, cellH) * 0.16, { fill: p.gold, opacity: 0.8 }));

	return out;
}

// --- 2. Oběžná dráha a systém --------------------------------------------

function orbitSystem(ctx) {
	const { rand, variant, density, palette: p } = ctx;
	const { x: cx, y: cy } = focus(ctx, 18);
	const rings = 2 + (density > 0.55 ? 1 : 0);
	const tilt = variant === 1 ? -14 : variant === 2 ? 10 : 0;
	const out = [];

	for (let ring = 0; ring < rings; ring++) {
		const rx = 46 + ring * 32;
		const ry = rx * (0.4 + playerOffset(ring, rand) * 0.16);
		out.push(
			ellipse(cx, cy, rx, ry, {
				fill: 'none',
				stroke: ring === 1 ? p.accent : p.soft,
				sw: ring === 1 ? 1.4 : 1,
				opacity: ring === 1 ? 0.6 : 1,
				dash: ring === 1 ? '4 7' : undefined,
				rot: tilt
			})
		);

		const angle = rand.range(0, Math.PI * 2);
		const px = cx + Math.cos(angle) * rx;
		const py = cy + Math.sin(angle) * ry;
		const radius = 3 + rand() * (4 - ring * 0.5);
		const planetColors = [p.secondary, p.tertiary, p.gold];
		out.push(
			circle(px, py, Math.max(2.2, radius), {
				fill: ring < planetColors.length ? planetColors[ring] : p.muted,
				opacity: ring === 0 ? 0.95 : 0.8
			})
		);
	}

	// Centrální těleso
	out.push(circle(cx, cy, 9 + density * 5, { fill: p.accent, opacity: 0.9 }));
	out.push(circle(cx, cy, 3.2, { fill: p.faint, opacity: 0.9 }));

	// Drobné hvězdy — jen pár, ať zůstane negativní prostor
	const stars = 3 + Math.round(density * 5);
	for (let i = 0; i < stars; i++) {
		out.push(
			circle(rand.range(24, W - 24), rand.range(18, H - 18), rand.range(0.7, 1.6), {
				fill: p.muted,
				opacity: 0.5
			})
		);
	}

	return out;
}

/** Pomocná deterministická odchylka elipsy (bez Math.random). */
function playerOffset(index, rand) {
	return 0.5 + (index % 2) * 0.2 + rand() * 0.15;
}

// --- 3. Data a trendy -----------------------------------------------------

function dataTrends(ctx) {
	const { rand, variant, density, palette: p } = ctx;
	const left = 46;
	const right = W - 42;
	const top = 34;
	const bottom = 142;
	const out = [];

	// Vodorovné linky mřížky
	for (let i = 0; i < 3; i++) {
		const y = top + ((bottom - top) / 2) * i;
		out.push(line(left, y, right, y, { stroke: p.faint, sw: 1 }));
	}
	out.push(line(left, bottom, right, bottom, { stroke: p.soft, sw: 1.4 }));

	if (variant === 0) {
		const count = 6 + Math.round(density * 5);
		const slot = (right - left) / count;
		const barW = slot * 0.58;
		let peak = 0;
		const heights = [];
		for (let i = 0; i < count; i++) {
			const h = rand.range(0.18, 1) * (bottom - top);
			heights.push(h);
			if (h > heights[peak]) peak = i;
		}
		heights.forEach((h, i) => {
			const x = left + i * slot + (slot - barW) / 2;
			out.push(
				rect(x, bottom - h, barW, h, {
					rx: 1,
					fill: i === peak ? p.accent : p.soft,
					opacity: i === peak ? 0.9 : 1
				})
			);
		});
		out.push(circle(left + peak * slot + slot / 2, bottom - heights[peak] - 7, 3, { fill: p.gold }));
	} else if (variant === 1) {
		const count = 7 + Math.round(density * 4);
		const points = [];
		for (let i = 0; i < count; i++) {
			const x = left + (i / (count - 1)) * (right - left);
			const y = bottom - rand.range(0.12, 1) * (bottom - top);
			points.push([x, y]);
		}
		const area = `M ${n(points[0][0])} ${n(bottom)} ${points
			.map(([x, y]) => `L ${n(x)} ${n(y)}`)
			.join(' ')} L ${n(points[points.length - 1][0])} ${n(bottom)} Z`;
		out.push(path(area, { fill: p.accent, opacity: 0.12 }));
		out.push(
			polyline(points, { fill: 'none', stroke: p.accent, sw: 2, opacity: 0.9, linejoin: 'round' })
		);
		const pointColors = [p.secondary, p.tertiary, p.gold];
		points.forEach(([x, y], i) => {
			out.push(circle(x, y, i % 3 === 0 ? 3 : 2, { fill: pointColors[i % pointColors.length], opacity: 0.85 }));
		});
	} else {
		const count = 8 + Math.round(density * 5);
		for (let i = 0; i < count; i++) {
			const x = left + rand() * (right - left);
			const y = bottom - rand() * (bottom - top);
			const dotColors = [p.accent, p.secondary, p.tertiary, p.gold];
			out.push(circle(x, y, 1.6 + rand() * 2, { fill: dotColors[i % dotColors.length], opacity: 0.85 }));
		}
		out.push(
			line(left + 6, bottom - 12, right - 6, top + 14, {
				stroke: p.secondary,
				sw: 1.6,
				opacity: 0.7,
				dash: '5 6'
			})
		);
	}

	return out;
}

// --- 4. Časová osa --------------------------------------------------------

function timeline(ctx) {
	const { rand, variant, density, palette: p } = ctx;
	const y = 96 + ctx.balance * 8;
	const left = 26;
	const right = W - 26;
	const count = 5 + Math.round(density * 5);
	const out = [];

	if (variant === 1) {
		out.push(line(left, y - 13, right, y - 13, { stroke: p.faint, sw: 1 }));
		out.push(line(left, y + 13, right, y + 13, { stroke: p.faint, sw: 1 }));
	}

	// Jemný světelný pás drží časovou osu v barvě kategorie, i když jsou
	// jednotlivé uzly neutrální. Barevné tečky uvnitř uzlů pak dodají
	// rytmus, aniž by přebily zvýrazněný bod.
	out.push(line(left, y, right, y, { stroke: p.primary, sw: 7, opacity: 0.08 }));
	out.push(line(left, y, right, y, { stroke: p.soft, sw: 2 }));

	for (const [position, color] of [
		[0.28, p.gold],
		[0.72, p.tertiary]
	]) {
		const x = left + position * (right - left);
		out.push(line(x, y - 25, x, y - 17, { stroke: color, sw: 1.2, opacity: 0.6 }));
		out.push(circle(x, y - 28, 2, { fill: color, opacity: 0.8 }));
	}

	const featured = rand.int(1, count - 2);
	for (let i = 0; i < count; i++) {
		const x = left + (i / (count - 1)) * (right - left);
		const stem = 6 + rand() * 8;
		const core = i % 3 === 0 ? p.gold : i % 3 === 1 ? p.tertiary : p.secondary;
		if (variant === 2) {
			const up = i % 2 === 0;
			out.push(
				line(x, y, x, y + (up ? -stem : stem), {
					stroke: i === featured ? p.accent : i % 2 === 0 ? p.tertiary : p.soft,
					sw: i === featured ? 2 : 1
				})
			);
			out.push(
				rect(x - 2.4, y + (up ? -stem : stem) - 2.4, 4.8, 4.8, {
					fill: i === featured ? p.accent : p.faint,
					stroke: i === featured ? p.accent : core,
					sw: 1
				})
			);
			if (i !== featured) {
				out.push(circle(x, y + (up ? -stem : stem), 1.2, { fill: core, opacity: 0.9 }));
			}
		} else {
			out.push(
				circle(x, y, i === featured ? 7 : 3.4, {
					fill: i === featured ? p.accent : p.faint,
					stroke: i === featured ? p.secondary : p.muted,
					sw: i === featured ? 1.6 : 1
				})
			);
			if (i !== featured) {
				out.push(circle(x, y, 1.6, { fill: core, opacity: 0.9 }));
			}
			if (variant === 1) {
				out.push(
					circle(x, y - 13, 2.4, { fill: i % 2 === 0 ? p.gold : p.tertiary, opacity: 0.85 })
				);
			}
		}
	}

	out.push(circle(left + (featured / (count - 1)) * (right - left), y, 13, {
		fill: 'none',
		stroke: p.accent,
		sw: 1,
		opacity: 0.35
	}));

	return out;
}

// --- 5. Síť a propojení ---------------------------------------------------

function network(ctx) {
	const { rand, variant, density, palette: p } = ctx;
	const { x: cx, y: cy } = focus(ctx, 14);
	const innerCount = 5;
	const outerCount = 7 + Math.round(density * 4);
	const innerRadius = 40 + variant * 5;
	const outerRadius = 78 + density * 16;
	const inner = [];
	const outer = [];

	for (let i = 0; i < innerCount; i++) {
		const angle = (i / innerCount) * Math.PI * 2 + rand.range(-0.15, 0.15);
		inner.push([cx + Math.cos(angle) * innerRadius, cy + Math.sin(angle) * innerRadius * 0.8]);
	}
	for (let i = 0; i < outerCount; i++) {
		const angle = (i / outerCount) * Math.PI * 2 + rand.range(-0.12, 0.12);
		outer.push([
			cx + Math.cos(angle) * outerRadius,
			cy + Math.sin(angle) * outerRadius * 0.72
		]);
	}

	// Spojnice ke středu a po obvodu vnitřního kruhu
	const nodes = [];
	inner.forEach(([x, y]) => {
		nodes.push(line(cx, cy, x, y, { stroke: p.soft, sw: 1, opacity: 0.9 }));
	});
	for (let i = 0; i < innerCount; i++) {
		const a = inner[i];
		const b = inner[(i + 1) % innerCount];
		nodes.push(line(a[0], a[1], b[0], b[1], { stroke: p.soft, sw: 1 }));
	}
	for (let i = 0; i < outerCount; i++) {
		const a = outer[i];
		const b = outer[(i + 1) % outerCount];
		nodes.push(line(a[0], a[1], b[0], b[1], { stroke: p.faint, sw: 1 }));
		if (variant >= 1 && i % 2 === 0) {
			const target = inner[i % innerCount];
			nodes.push(
				line(a[0], a[1], target[0], target[1], {
					stroke: p.faint,
					sw: 1,
					opacity: 0.8
				})
			);
		}
		if (variant === 2 && i % 3 === 1) {
			const target = outer[(i + 2) % outerCount];
			nodes.push(line(a[0], a[1], target[0], target[1], { stroke: p.accent, sw: 1, opacity: 0.22 }));
		}
	}

	nodes.push(circle(cx, cy, 7 + density * 2, { fill: p.accent, opacity: 0.9 }));
	const innerColors = [p.secondary, p.tertiary, p.gold, p.water, p.foliage];
	inner.forEach(([x, y], i) => {
		nodes.push(
			circle(x, y, i === 0 ? 5.4 : 4.2, {
				fill: i === 0 ? p.secondary : innerColors[i % innerColors.length],
				opacity: 0.9
			})
		);
	});
	const outerColors = [p.tertiary, p.gold, p.water, p.ember];
	outer.forEach(([x, y], i) => {
		nodes.push(
			circle(x, y, 2.6 + rand() * 1.4, {
				fill: i % 3 === 0 ? outerColors[i % outerColors.length] : p.faint,
				stroke: i % 3 === 0 ? p.primary : p.muted,
				sw: 1
			})
		);
	});

	return nodes;
}

// --- 6. Vrstvy a řezy -----------------------------------------------------

function layers(ctx) {
	const { rand, variant, density, palette: p } = ctx;
	const count = 4 + Math.round(density * 3);
	const boxW = 246;
	const x0 = W / 2 - boxW / 2 + ctx.balance * 8;
	const out = [];

	if (variant === 2) {
		// Vnořené obrysy — řez krajinou
		for (let i = 0; i < count; i++) {
			const inset = i * 13;
			out.push(
				rect(x0 + inset, 34 + inset * 0.7, boxW - inset * 2, 112 - inset * 1.4, {
					rx: 10,
					fill: i === 0 ? p.accent : i === 2 ? p.stoneDark : 'none',
					opacity: i === 0 ? 0.1 : i === 2 ? 0.25 : 1,
					stroke: i === 1 ? p.accent : i === 2 ? p.secondary : p.soft,
					sw: i === 1 ? 1.4 : 1
				})
			);
		}
		out.push(circle(W / 2 + ctx.balance * 10, 90, 11, { fill: p.accent, opacity: 0.55 }));
		out.push(circle(W / 2 + ctx.balance * 10, 90, 5, { fill: p.gold, opacity: 0.6 }));
		return out;
	}

	const bandH = 16;
	const step = 21;
	for (let i = 0; i < count; i++) {
		const inset = variant === 1 ? i * 7 : 0;
		const y = 38 + i * step;
		const w = boxW - inset * 2;
		const x = x0 + inset + (i % 2 === 0 ? -4 : 5) + ctx.balance * 4;
		// Geologické vrstvy: kámen, hlína a jeden zvýrazněný řez barvou kategorie
		const stratum = i % 3 === 0 ? p.stoneDark : i % 3 === 1 ? p.woodDark : p.faint;
		out.push(
			rect(x, y, w, bandH, {
				rx: 3,
				fill: i === 1 ? p.accent : stratum,
				opacity: i === 1 ? 0.32 : i % 3 === 0 ? 0.55 : 1,
				stroke: i === 1 ? p.accent : p.soft,
				sw: 1
			})
		);
		// Kontura uvnitř vrstvy
		if (rand() < 0.7) {
			out.push(
				line(x + 12, y + bandH * 0.5, x + w - 12 - rand() * 30, y + bandH * 0.5, {
					stroke: i === 1 ? p.accent : p.muted,
					sw: 1,
					opacity: i === 1 ? 0.5 : 0.35
				})
			);
		}
		// Drobné inkluze v hornině
		if (i % 2 === 0) {
			const px = x + 20 + rand() * (w - 40);
			out.push(circle(px, y + bandH * 0.55, rand.range(1.6, 3.2), { fill: p.stone, opacity: 0.45 }));
		}
	}

	// Svislý vrtný řez
	const boreX = x0 + boxW * (0.3 + rand() * 0.4) + ctx.balance * 6;
	out.push(line(boreX, 30, boreX, 38 + count * step, { stroke: p.gold, sw: 1.2, opacity: 0.65, dash: '3 5' }));

	return out;
}

// --- 7. Signály a vlny ----------------------------------------------------

function signals(ctx) {
	const { rand, variant, density, palette: p } = ctx;
	const out = [];

	if (variant === 1) {
		// Koncentrické signály z jednoho bodu
		const cx = W / 2 + ctx.balance * 20;
		const cy = 96;
		const rings = 3 + Math.round(density * 2);
		for (let i = 0; i < rings; i++) {
			const r = 26 + i * 22;
			out.push(
				path(`M ${n(cx - r)} ${n(cy)} A ${n(r)} ${n(r)} 0 0 1 ${n(cx + r)} ${n(cy)}`, {
					fill: 'none',
					stroke: i === 1 ? p.accent : p.soft,
					sw: i === 1 ? 2 : 1.2,
					opacity: i === 1 ? 0.8 : 0.6
				})
			);
			out.push(
				path(`M ${n(cx - r * 0.72)} ${n(cy + 22)} A ${n(r * 0.72)} ${n(r * 0.72)} 0 0 0 ${n(cx + r * 0.72)} ${n(cy + 22)}`, {
					fill: 'none',
					stroke: p.faint,
					sw: 1
				})
			);
		}
		out.push(circle(cx, cy, 5, { fill: p.secondary }));
		out.push(circle(cx, cy + 22, 2.6, { fill: p.gold, opacity: 0.85 }));
		// Zachycené body na vlnoplochách — signál se šíří, ne jen kreslí.
		for (let i = 0; i < rings; i++) {
			const r = 26 + i * 22;
			for (const side of [-1, 1]) {
				out.push(
					circle(cx + side * r * 0.72, cy - r * 0.7, 1.6, {
						fill: i === 1 ? p.accent : p.secondary,
						opacity: 0.45 + (i === 1 ? 0.3 : 0)
					})
				);
			}
		}
		out.push(line(cx - 118, cy + 52, cx + 118, cy + 52, { stroke: p.faint, sw: 1, opacity: 0.5 }));
		return out;
	}

	if (variant === 2) {
		// Sloupce signálu + jedna procházející vlna
		const count = 11;
		const slot = 240 / count;
		for (let i = 0; i < count; i++) {
			const h = 10 + rand() * 54 * density;
			out.push(
				rect(40 + i * slot + slot * 0.28, 126 - h, slot * 0.44, h, {
					rx: 1.5,
					fill: i % 4 === 0 ? p.accent : i % 4 === 2 ? p.waterDark : p.soft,
					opacity: i % 4 === 0 ? 0.85 : 1
				})
			);
		}
		out.push(wavePath(88 + ctx.balance * 10, 16 + density * 8, rand.range(0, 6.28), p.secondary, 1.6));
		out.push(wavePath(88 + ctx.balance * 10, 16 + density * 8, rand.range(0, 6.28), p.accent, 1, 0.25));
		return out;
	}

	const count = 3 + Math.round(density * 2);
	for (let i = 0; i < count; i++) {
		const y = 50 + i * (86 / Math.max(1, count - 1)) + ctx.balance * 6;
		const amplitude = 7 + rand() * 13 * density;
		const color = i === 0 ? p.accent : i === count - 1 ? p.secondary : p.soft;
		out.push(wavePath(y, amplitude, rand.range(0, Math.PI * 2), color, i === 0 ? 2 : 1.2, i === 0 ? 0.9 : 0.8));
	}
	out.push(circle(38, 50 + (count - 1) * 10, 2.4, { fill: p.muted, opacity: 0.6 }));

	return out;
}

/**
 * Hladká vlna z quadratic křivek — kompaktní a bez velkého počtu bodů.
 */
function wavePath(y, amplitude, phase, color, width, opacity = 1) {
	const start = 26;
	const end = W - 26;
	const segments = 6;
	const step = (end - start) / segments;
	let d = `M ${n(start)} ${n(y + Math.sin(phase) * amplitude)}`;
	for (let i = 0; i < segments; i++) {
		const x1 = start + i * step + step * 0.5;
		const x2 = start + (i + 1) * step;
		const phase1 = phase + (i + 0.5) * 1.15;
		const phase2 = phase + (i + 1) * 1.15;
		d += ` Q ${n(x1)} ${n(y + Math.sin(phase1) * amplitude)} ${n(x2)} ${n(y + Math.sin(phase2) * amplitude)}`;
	}
	return path(d, { fill: 'none', stroke: color, sw: width, opacity, linecap: 'round' });
}

// --- 8. Struktura a architektura -----------------------------------------

function structure(ctx) {
	const { rand, variant, density, palette: p } = ctx;
	const ground = 150;
	const count = 4 + Math.round(density * 3);
	const out = [line(24, ground, W - 24, ground, { stroke: p.soft, sw: 1.4 })];

	if (variant === 2) {
		// Tenké sloupy / skyline
		const slot = 238 / count;
		for (let i = 0; i < count; i++) {
			const h = 30 + rand() * (72 + density * 20);
			const w = 6 + rand() * 8;
			out.push(
				rect(41 + i * slot + slot / 2 - w / 2, ground - h, w, h, {
					fill: i === count - 2 ? p.accent : p.faint,
					opacity: i === count - 2 ? 0.75 : 1,
					stroke: i === count - 2 ? p.accent : p.soft,
					sw: 1
				})
			);
		}
		out.push(circle(W - 62, 52, 14, { fill: p.gold, fillOpacity: 0.2, stroke: p.gold, sw: 1.4, opacity: 0.75 }));
		return out;
	}

	const widths = [];
	let total = 0;
	for (let i = 0; i < count; i++) {
		const w = 24 + rand() * 30;
		widths.push(w);
		total += w;
	}
	const gap = (240 - total) / Math.max(1, count - 1);
	let x = 40 + ctx.balance * 8;
	let accentIndex = rand.int(0, count - 1);

	widths.forEach((w, i) => {
		const h = 36 + rand() * (76 + density * 16);
		out.push(
			rect(x, ground - h, w, h, {
				fill: i === accentIndex ? p.accent : p.faint,
				opacity: i === accentIndex ? 0.8 : 1,
				stroke: i === accentIndex ? p.accent : p.soft,
				sw: 1
			})
		);

		// Okenní rastr na jednom bloku — střídmě, jen náznak
		if (i === accentIndex) {
			const cols = Math.max(2, Math.floor(w / 13));
			const rows = Math.max(2, Math.floor(h / 17));
			for (let ry = 0; ry < rows; ry++) {
				for (let cx = 0; cx < cols; cx++) {
					out.push(
						rect(x + 6 + cx * ((w - 12) / cols), ground - h + 8 + ry * ((h - 16) / rows), 3.4, 4.2, {
							fill: (cx + ry) % 3 === 0 ? p.gold : p.faint,
							opacity: 0.9
						})
					);
				}
			}
		}
		x += w + gap;
	});

	out.push(line(30, 72 + ctx.balance * 6, W - 30, 72 + ctx.balance * 6, { stroke: p.secondary, sw: 1, opacity: 0.45 }));

	if (variant === 1) {
		// Oblouk mezi bloky
		const archX = W / 2 + ctx.balance * 24;
		out.push(
			path(`M ${n(archX - 34)} ${ground} L ${n(archX - 34)} ${ground - 46} A 34 34 0 0 1 ${n(archX + 34)} ${ground - 46} L ${n(archX + 34)} ${ground}`, {
				fill: 'none',
				stroke: p.accent,
				sw: 2,
				opacity: 0.75
			})
		);
	}

	return out;
}

// --- 9. Kontrast a rovnováha ---------------------------------------------

function contrast(ctx) {
	const { rand, variant, density, palette: p } = ctx;
	const cx = W / 2 + ctx.balance * 14;
	const cy = 92;
	const out = [];

	if (variant === 1) {
		const r = 40 + density * 10;
		out.push(path(`M ${n(cx)} ${n(cy - r)} A ${n(r)} ${n(r)} 0 0 1 ${n(cx)} ${n(cy + r)} Z`, {
			fill: p.accent,
			opacity: 0.85
		}));
		out.push(path(`M ${n(cx)} ${n(cy - r)} A ${n(r)} ${n(r)} 0 0 0 ${n(cx)} ${n(cy + r)} Z`, {
			fill: p.secondary,
			opacity: 0.35
		}));
		// Tenká mezera mezi protiklady
		out.push(line(cx, cy - r - 8, cx, cy + r + 8, { stroke: '#101010', sw: 4 }));
		out.push(line(cx, cy - r - 8, cx, cy + r + 8, { stroke: p.soft, sw: 1 }));
		out.push(circle(cx, cy, r + 12, { fill: 'none', stroke: p.faint, sw: 1 }));
		for (let i = 0; i < 4; i++) {
			const yy = cy - 30 + i * 20;
			out.push(line(cx - r - 22, yy, cx - r - 12, yy, { stroke: p.secondary, sw: 1.2, opacity: 0.6 }));
			out.push(line(cx + r + 12, yy, cx + r + 22, yy, { stroke: p.accent, sw: 1.2, opacity: 0.6 }));
		}
		return out;
	}

	if (variant === 2) {
		const size = 78;
		out.push(
			rect(cx - size * 0.9, cy - size / 2, size, size, {
				rx: 6,
				fill: 'none',
				stroke: p.soft,
				sw: 1.2
			})
		);
		out.push(
			rect(cx - size * 0.55, cy - size / 2 + 10, size, size, {
				rx: 6,
				fill: p.accent,
				opacity: 0.3,
				stroke: p.accent,
				sw: 1.4
			})
		);
		out.push(
			line(cx - 58, cy + 44, cx + 58, cy - 44, { stroke: p.secondary, sw: 1.6, opacity: 0.7, dash: '4 6' })
		);
		// Drobné značky na obou stranách pomyslné osy — kontrast zůstává čitelný
		for (let i = 0; i < 5; i++) {
			const t = 18 + i * 14;
			out.push(circle(cx - size * 0.9 - 14, cy - 30 + t, 2.2, { fill: p.soft, opacity: 0.7 }));
			out.push(circle(cx + size * 0.45 + 14, cy - 30 + t, 2.2, { fill: p.accent, opacity: 0.55 }));
		}
		out.push(line(cx - size * 0.9 - 22, cy + 52, cx + size * 0.45 + 22, cy + 52, { stroke: p.faint, sw: 1 }));
		return out;
	}

	// Čtverec proti kruhu, mezera jako třetí prvek
	const gap = 22 + density * 12;
	const size = 66 + density * 8;
	const leftX = cx - gap - size;
	out.push(
		rect(leftX, cy - size / 2, size, size, {
			rx: 3,
			fill: p.secondary,
			opacity: 0.18,
			stroke: p.secondary,
			sw: 1.4
		})
	);
	out.push(circle(cx + gap + size / 2, cy, size / 2, { fill: p.accent, opacity: 0.8 }));
	out.push(line(cx, cy - 62, cx, cy + 62, { stroke: p.faint, sw: 1 }));
	out.push(circle(cx, cy, 3, { fill: p.muted, opacity: 0.7 }));

	if (rand() < 0.6) {
		out.push(circle(cx, cy, size / 2 + 18, { fill: 'none', stroke: p.faint, sw: 1, dash: '2 6' }));
	}

	// Drobné protiváhy po stranách — drží kompozici i při nízké hustotě
	for (let i = 0; i < 3; i++) {
		const off = 20 + i * 13;
		out.push(circle(cx - gap - size - off * 0.6, cy + off * 0.5, 2, { fill: p.secondary, opacity: 0.55 }));
		out.push(circle(cx + gap + size + off * 0.6, cy - off * 0.5, 2, { fill: p.accent, opacity: 0.55 }));
	}
	out.push(line(cx - size - gap - 30, cy + 54, cx + size + gap + 30, cy + 54, { stroke: p.soft, sw: 1, opacity: 0.8 }));

	return out;
}

// --- 10. Organické formy --------------------------------------------------

function organic(ctx) {
	const { rand, variant, density, palette: p } = ctx;
	const { x: cx, y: cy } = focus(ctx, 12);
	const out = [];

	if (variant === 2) {
		// Listy — překrývající se elipsy s žilkami
		const leaves = 3 + Math.round(density * 2);
		for (let i = 0; i < leaves; i++) {
			const lx = cx + (i - (leaves - 1) / 2) * 44 + rand.range(-6, 6);
			const ly = cy + (i % 2 === 0 ? -14 : 16) + ctx.balance * 10;
			const rx = 16 + rand() * 12;
			const ry = 34 + rand() * 12;
			const rot = (i - (leaves - 1) / 2) * 16 + ctx.balance * 8;
			out.push(
				ellipse(lx, ly, rx, ry, {
					fill: i === 1 ? p.accent : i % 2 === 0 ? p.foliageDark : p.foliage,
					opacity: i === 1 ? 0.24 : 0.42,
					stroke: i === 1 ? p.accent : p.primary,
					sw: 1.2,
					rot
				})
			);
			out.push(
				line(lx, ly - ry * 0.72, lx, ly + ry * 0.72, {
					stroke: i === 1 ? p.accent : p.muted,
					sw: 1,
					opacity: 0.55,
					transform: `rotate(${n(rot)} ${n(lx)} ${n(ly)})`
				})
			);
			// Postranní žilky — list není jen obrys
			out.push(
				line(lx - rx * 0.42, ly - ry * 0.32, lx + rx * 0.3, ly - ry * 0.48, {
					stroke: p.muted,
					sw: 0.9,
					opacity: 0.4,
					transform: `rotate(${n(rot)} ${n(lx)} ${n(ly)})`
				})
			);
			out.push(
				line(lx - rx * 0.42, ly + ry * 0.32, lx + rx * 0.3, ly + ry * 0.48, {
					stroke: p.muted,
					sw: 0.9,
					opacity: 0.4,
					transform: `rotate(${n(rot)} ${n(lx)} ${n(ly)})`
				})
			);
		}
		return out;
	}

	const blobs = variant === 1 ? 3 : 2;
	for (let i = 0; i < blobs; i++) {
		const bx = cx + (i === 0 ? -26 : i === 1 ? 42 : 4) + ctx.balance * 8;
		const by = cy + (i === 0 ? 8 : i === 1 ? -18 : 26) + ctx.balance * 4;
		const rx = (i === 0 ? 56 : 40) * (0.85 + density * 0.3);
		const ry = rx * (0.58 + rand() * 0.2);
		const filled = i === (variant === 1 ? 2 : 0);
		out.push(
			path(blobPath(bx, by, rx, ry, 7, rand), {
				fill: filled ? p.accent : 'none',
				fillOpacity: filled ? 0.16 : undefined,
				stroke: filled ? p.accent : i === 1 ? p.secondary : p.soft,
				sw: filled ? 1.8 : 1.2,
				opacity: 0.88
			})
		);
	}

	// Vnitřní obrysy hlavní formy — buněčná struktura
	for (let i = 0; i < 4; i++) {
		const bx = cx + rand.range(-34, 34);
		const by = cy + rand.range(-14, 20);
		const rx = rand.range(10, 22);
		const ry = rx * rand.range(0.55, 0.85);
		out.push(
			path(blobPath(bx, by, rx, ry, 6, rand), {
				fill: 'none',
				stroke: i === 0 ? p.secondary : p.soft,
				sw: 1,
				opacity: i === 0 ? 0.55 : 0.4
			})
		);
	}

	// Stonek a pár semínek
	const stemX = cx - 70 + ctx.balance * 6;
	out.push(
		path(`M ${n(stemX)} ${n(cy + 54)} Q ${n(stemX - 8)} ${n(cy + 18)} ${n(stemX + 22)} ${n(cy - 16)}`, {
			fill: 'none',
			stroke: p.muted,
			sw: 1.4,
			opacity: 0.6,
			linecap: 'round'
		})
	);
	const seeds = 3 + Math.round(density * 3);
	for (let i = 0; i < seeds; i++) {
		out.push(
			circle(rand.range(cx + 40, W - 40), rand.range(30, H - 30), rand.range(1.4, 3), {
				fill: i % 2 === 0 ? p.gold : p.foliage,
				opacity: 0.45
			})
		);
	}

	return out;
}

/**
 * Uzavřená organická křivka z radiálních bodů a quadratic vyhlazení.
 */
function blobPath(cx, cy, rx, ry, points, rand) {
	const pts = [];
	for (let i = 0; i < points; i++) {
		const angle = (i / points) * Math.PI * 2;
		const wobble = 0.76 + rand() * 0.28;
		pts.push([cx + Math.cos(angle) * rx * wobble, cy + Math.sin(angle) * ry * wobble]);
	}
	const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
	const start = mid(pts[pts.length - 1], pts[0]);
	let d = `M ${n(start[0])} ${n(start[1])}`;
	for (let i = 0; i < points; i++) {
		const current = pts[i];
		const next = mid(current, pts[(i + 1) % points]);
		d += ` Q ${n(current[0])} ${n(current[1])} ${n(next[0])} ${n(next[1])}`;
	}
	return d + ' Z';
}

// --- Katalog rodin --------------------------------------------------------

/** @typedef {string} Family */

/** Abstraktní rodiny — fallback pro text bez konkrétního předmětu. */
export const ABSTRACT_FAMILIES = [
	{ key: 'grid', label: 'Geometrická mřížka', note: 'umění, design, architektura', build: geometricGrid },
	{ key: 'orbit', label: 'Oběžná dráha', note: 'věda, astronomie, technologie', build: orbitSystem },
	{ key: 'data', label: 'Data a trendy', note: 'ekonomie, statistiky, výzkum', build: dataTrends },
	{ key: 'timeline', label: 'Časová osa', note: 'výslovně chronologický obsah', build: timeline },
	{ key: 'network', label: 'Síť a spojení', note: 'AI, komunikace, vztahy', build: network },
	{ key: 'layers', label: 'Vrstvy a řezy', note: 'příroda, geologie, systémy', build: layers },
	{ key: 'signals', label: 'Signály a vlny', note: 'fyzika, média, komunikace', build: signals },
	{ key: 'structure', label: 'Struktura', note: 'města, infrastruktura, instituce', build: structure },
	{ key: 'contrast', label: 'Kontrast a rovnováha', note: 'debaty, srovnání, protiklady', build: contrast },
	{ key: 'organic', label: 'Organické formy', note: 'biologie, příroda, prostředí', build: organic },
	...EXTRA_ABSTRACT_FAMILIES
];

/** @type {Array<{ key: Family, label: string, note: string, build: Function, subjects?: string[], supports?: string[], defaultSubject?: string }>} */
export const FAMILIES = [
	...ABSTRACT_FAMILIES,
	...SEMANTIC_FAMILIES.map(({ key, label, note, build, subjects, supports, defaultSubject }) => ({
		key,
		label,
		note,
		build,
		subjects,
		supports,
		defaultSubject
	}))
];

/** @type {Record<string, Function>} */
export const FAMILY_BUILDERS = Object.fromEntries(FAMILIES.map((family) => [family.key, family.build]));

export const FAMILY_KEYS = FAMILIES.map((family) => family.key);

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

/** Krátká kontrola mezí parametrů — používá ji select i testy. */
export function clampParams(params) {
	return {
		variant: clamp(Math.round(params.variant), 0, 2),
		density: clamp(params.density, 0.35, 1),
		scale: clamp(params.scale, 0.9, 1.1),
		balance: clamp(params.balance, -1, 1)
	};
}
