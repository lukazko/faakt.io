/**
 * Rozšířené abstraktní kompozice.
 *
 * Každá rodina má vlastní vizuální logiku — ne jen jiné parametry stejné
 * šablony. Staví na stejných primitivech, paletě a deterministickém PRNG jako
 * původní `scenes.js`, takže se chová stejně předvídatelně.
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

function wavePath(y, amplitude, phase, width = 300) {
	const points = [];
	const steps = 28;
	for (let i = 0; i <= steps; i++) {
		const x = -width / 2 + (i / steps) * width;
		const py = y + Math.sin(phase + (i / steps) * Math.PI * 2) * amplitude;
		points.push(`${i === 0 ? 'M' : 'L'} ${n(x)} ${n(py)}`);
	}
	return points.join(' ');
}

function ringDots(out, rand, cx, cy, radius, count, colors, size = 1.5) {
	for (let i = 0; i < count; i++) {
		const angle = (i / count) * Math.PI * 2 + rand.range(-0.2, 0.2);
		out.push(
			circle(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, size, {
				fill: rand.pick(colors),
				opacity: 0.45 + rand() * 0.4
			})
		);
	}
}

function radialBurst({ palette: p, rand, variant, density, balance }) {
	const out = [];
	const cx = 160 + balance * 22;
	const cy = 92;
	const count = 14 + variant * 5 + Math.round(density * 6);
	out.push(circle(cx, cy, 10 + density * 8, { fill: p.primary, opacity: 0.18 }));
	for (let i = 0; i < count; i++) {
		const angle = (i / count) * Math.PI * 2 + rand.range(-0.08, 0.08);
		const inner = 14 + rand.range(4, 18);
		const outer = inner + rand.range(18, 54) * (i % 3 === 0 ? 1.35 : 1);
		const color = i % 4 === 0 ? p.gold : i % 3 === 0 ? p.secondary : p.primary;
		out.push(
			line(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner, cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer, {
				stroke: color,
				sw: i % 3 === 0 ? 2 : 1,
				opacity: 0.35 + rand() * 0.45,
				linecap: 'round'
			})
		);
		if (i % 4 === 0) {
			out.push(circle(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer, rand.range(1, 2.4), filled(p.gold, 0.7)));
		}
	}
	out.push(circle(cx, cy, 4 + density * 3, { fill: p.snow, opacity: 0.75 }));
	if (variant === 1) out.push(polygon([[-160, -90], [160, -90], [160, 90], [-160, 90]], { fill: p.primary, opacity: 0.03 }));
	if (variant === 2) {
		for (let i = 0; i < 5; i++) {
			out.push(circle(cx, cy, 26 + i * 13, { ...stroke(p.secondary, 0.8, 0.2 - i * 0.025), dash: '2 6' }));
		}
	}
	return out;
}

function spiral({ palette: p, rand, variant, density }) {
	const out = [];
	const cx = 160;
	const cy = 90;
	const turns = 2.1 + variant * 0.45;
	const points = [];
	const steps = 60;
	const direction = variant === 2 ? -1 : 1;
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const angle = direction * t * Math.PI * 2 * turns;
		const radius = 4 + t * (44 + density * 22);
		points.push(`${i === 0 ? 'M' : 'L'} ${n(cx + Math.cos(angle) * radius)} ${n(cy + Math.sin(angle) * radius)}`);
	}
	out.push(path(points.join(' '), stroke(p.primary, 2.2, 0.85)));
	const offset = variant === 1 ? 14 : 8;
	for (let i = 0; i < 6; i++) {
		const angle = (i / 6) * Math.PI * 2 + 0.4;
		out.push(circle(cx + Math.cos(angle) * (offset + i * 6), cy + Math.sin(angle) * (offset + i * 6), 2.4, filled(i % 2 === 0 ? p.secondary : p.gold, 0.65)));
	}
	out.push(circle(cx, cy, 5, { fill: p.snow, opacity: 0.8 }));
	ringDots(out, rand, cx, cy, 64 + density * 12, 10, [p.secondary, p.tertiary, p.gold], 1.2);
	if (variant === 2) {
		out.push(path(wavePath(52, 8, 0.6), stroke(p.tertiary, 1, 0.35)));
	}
	return out;
}

function threshold({ palette: p, variant, density }) {
	const out = [
		rect(104, 22, 112, 132, { fill: p.primary, opacity: 0.06 }),
		rect(112, 30, 96, 118, { fill: 'none', stroke: p.primary, sw: 2 }),
		rect(122, 40, 76, 98, { fill: p.accent, opacity: 0.12, stroke: p.secondary, sw: 1 })
	];
	if (variant === 0) {
		out.push(rect(136, 46, 48, 92, { fill: p.accent, opacity: 0.16, stroke: p.primary, sw: 1.2 }));
		out.push(polygon([[112, 148], [208, 148], [222, 164], [98, 164]], { fill: p.primary, opacity: 0.18, stroke: p.primary, sw: 1 }));
	} else if (variant === 1) {
		out.push(path('M 130 148 L 130 76 Q 160 40 190 76 L 190 148 Z', { fill: p.accent, opacity: 0.18, stroke: p.primary, sw: 1.3 }));
		out.push(arcPath(160, 76, 30, 180, 360, stroke(p.secondary, 1.2, 0.6)));
	} else {
		out.push(rect(130, 46, 26, 92, { fill: p.primary, opacity: 0.14, stroke: p.primary, sw: 1 }));
		out.push(rect(164, 46, 26, 92, { fill: p.secondary, opacity: 0.1, stroke: p.primary, sw: 1 }));
	}
	for (let i = 0; i < 5; i++) {
		out.push(line(160, 154, 160 - 52 + i * 26, 174, stroke(p.secondary, 0.8, 0.35)));
	}
	out.push(line(160, 30, 160, 10, stroke(p.gold, 1.2, 0.5)));
	out.push(circle(160, 8, 2.4, filled(p.gold, 0.75)));
	out.push(ellipse(160, 166, 62 + density * 8, 3, { fill: p.primary, opacity: 0.15 }));
	return out;
}

function ascent({ palette: p, variant, density }) {
	const out = [];
	const steps = 7 + variant * 2;
	const startX = -126;
	const startY = 58;
	const stepW = 28;
	const stepH = 13;
	for (let i = 0; i < steps; i++) {
		const x = startX + i * stepW;
		const y = startY - i * stepH;
		out.push(
			rect(x, y, stepW, stepH + 2, {
				fill: i === steps - 1 ? p.gold : i % 2 === 0 ? p.primary : p.secondary,
				opacity: i === steps - 1 ? 0.28 : 0.1 + i * 0.025,
				stroke: p.primary,
				sw: 1
			})
		);
	}
	out.push(
		polyline(
			Array.from({ length: steps }, (_, i) => [startX + i * stepW + stepW / 2, startY - i * stepH - 2]),
			stroke(p.gold, 1.6, 0.8)
		)
	);
	const topX = startX + (steps - 1) * stepW + stepW / 2;
	const topY = startY - (steps - 1) * stepH - 18;
	out.push(line(topX, topY + 14, topX, topY, stroke(p.primary, 2)));
	out.push(polygon([[topX, topY], [topX + 22, topY + 6], [topX, topY + 12]], { fill: p.gold, opacity: 0.75 }));
	out.push(line(-140, 84, 140, 84, stroke(p.soft, 1)));
	for (let i = 0; i < 4 + density * 4; i++) {
		out.push(circle(-130 + i * 22, 76 - i * 3, 1.2, filled(i % 2 === 0 ? p.secondary : p.gold, 0.4)));
	}
	return out;
}

function descent({ palette: p, variant, density }) {
	const out = [line(-144, -60, 144, 76, { ...stroke(p.primary, 1, 0.15), dash: '4 6' })];
	if (variant === 0) {
		let x = -120;
		let y = -58;
		for (let i = 0; i < 9; i++) {
			out.push(
				rect(x, y, 30, 12, {
					fill: i % 2 === 0 ? p.primary : p.secondary,
					opacity: 0.08 + i * 0.025,
					stroke: p.primary,
					sw: 1
				})
			);
			x += 28;
			y += 14;
		}
	} else if (variant === 1) {
		for (let i = 0; i < 8; i++) {
			const x = -40 + i * 12;
			const y = -64 + i * 18 + (i % 2) * 6;
			out.push(
				rect(x, y, 22 + (i % 3) * 7, 14 + (i % 2) * 5, {
					fill: i % 2 === 0 ? p.secondary : p.primary,
					opacity: 0.24,
					stroke: p.primary,
					sw: 1,
					transform: `rotate(${n(-24 + i * 7)} ${n(x + 12)} ${n(y + 7)})`
				})
			);
		}
	} else {
		for (let i = 0; i < 5; i++) {
			out.push(rect(-110 + i * 48, -54 + i * 22, 18, 58 - i * 7, { fill: p.primary, opacity: 0.1, stroke: p.primary, sw: 1 }));
			out.push(line(-104 + i * 48, -18 + i * 22, 100 + i * 12, 30 + i * 8, stroke(p.secondary, 0.8, 0.3)));
		}
	}
	out.push(polyline([[-120, -64], [-90, -30], [-58, -38], [-20, 4], [16, 0], [48, 34], [92, 30]], stroke(p.gold, 1.8, 0.8)));
	for (let i = 0; i < 5 + density * 8; i++) {
		out.push(circle(-130 + i * 26, 52 - i * 3, 1.2 + (i % 2), filled(i % 2 === 0 ? p.ember : p.secondary, 0.4)));
	}
	out.push(line(-140, 78, 140, 78, stroke(p.soft, 1)));
	return out;
}

function waveField({ palette: p, variant, density }) {
	const out = [];
	const bands = 4 + Math.round(density * 4);
	for (let i = 0; i < bands; i++) {
		const y = -54 + i * (108 / (bands - 1 || 1));
		const amplitude = 5 + (i % 3) * 4 + variant * 2;
		const phase = i * 0.8 + variant * 0.5;
		out.push(path(wavePath(y, amplitude, phase), stroke(i === Math.floor(bands / 2) ? p.gold : i % 2 === 0 ? p.primary : p.secondary, i === 1 ? 2.2 : 1.1, i === Math.floor(bands / 2) ? 0.85 : 0.35)));
	}
	out.push(line(-150, 74, 150, 74, stroke(p.soft, 1)));
	for (let i = 0; i < 10; i++) {
		const x = -130 + i * 28;
		const y = -30 + Math.sin(i * 0.9 + variant) * 26;
		out.push(circle(x, y, 1.2 + (i % 3), filled(i % 3 === 0 ? p.gold : p.secondary, 0.5)));
	}
	if (variant === 2) {
		out.push(ellipse(0, 40, 92, 8, { fill: p.water, opacity: 0.12 }));
	}
	return out;
}

function scatter({ palette: p, rand, variant, density }) {
	const out = [];
	const cx = variant === 1 ? -18 : 8;
	const cy = -4;
	out.push(circle(cx, cy, 18 + density * 10, { ...stroke(p.primary, 1.2, 0.18), dash: '2 6' }));
	const count = 34 + Math.round(density * 26);
	for (let i = 0; i < count; i++) {
		const angle = rand.range(0, Math.PI * 2);
		const spread = variant === 0 ? 8 + Math.pow(rand(), 0.45) * 78 : rand.range(10, 100);
		const px = cx + Math.cos(angle) * spread;
		const py = cy + Math.sin(angle) * spread * 0.62;
		out.push(
			circle(px, py, rand.range(1, 3.4), {
				fill: i % 5 === 0 ? p.gold : i % 3 === 0 ? p.secondary : p.primary,
				opacity: 0.3 + rand() * 0.5
			})
		);
	}
	out.push(circle(cx, cy, 8, { fill: p.accent, opacity: 0.28, stroke: p.primary, sw: 1 }));
	if (variant === 2) {
		for (let i = 0; i < 4; i++) {
			out.push(rect(-80 + i * 42, -50 + i * 22, 32, 10, { fill: p.secondary, opacity: 0.08, stroke: p.primary, sw: 0.8 }));
		}
	}
	return out;
}

function convergence({ palette: p, variant, density }) {
	const out = [];
	const cx = 8;
	const cy = 2;
	const lines = 12 + Math.round(density * 8);
	for (let i = 0; i < lines; i++) {
		const angle = (i / lines) * Math.PI * 2;
		const radius = 96;
		const startX = cx + Math.cos(angle) * radius;
		const startY = cy + Math.sin(angle) * radius * 0.62;
		if (variant === 1) {
			const midX = cx + Math.cos(angle + 0.5) * 48;
			const midY = cy + Math.sin(angle + 0.5) * 30;
			out.push(path(`M ${n(startX)} ${n(startY)} Q ${n(midX)} ${n(midY)} ${n(cx)} ${n(cy)}`, stroke(i % 4 === 0 ? p.gold : p.primary, i % 4 === 0 ? 1.8 : 1, 0.25 + (i % 3) * 0.12)));
		} else {
			out.push(line(startX, startY, cx, cy, { stroke: i % 4 === 0 ? p.gold : p.primary, sw: i % 4 === 0 ? 1.8 : 1, opacity: 0.25 + (i % 3) * 0.12 }));
		}
	}
	for (let i = 0; i < 3; i++) {
		out.push(circle(cx, cy, 14 + i * 10, { ...stroke(i === 1 ? p.gold : p.secondary, 1, 0.4 - i * 0.08), dash: variant === 2 ? '3 5' : undefined }));
	}
	out.push(circle(cx, cy, 10, { fill: p.accent, opacity: 0.22, stroke: p.primary, sw: 1.2 }));
	out.push(circle(cx, cy, 4, filled(p.gold, 0.85)));
	for (let i = 0; i < 10; i++) {
		const angle = (i / 10) * Math.PI * 2;
		out.push(circle(cx + Math.cos(angle) * 98, cy + Math.sin(angle) * 61, 1.4, filled(i % 2 === 0 ? p.secondary : p.primary, 0.5)));
	}
	return out;
}

function divergence({ palette: p, variant, density }) {
	const out = [];
	out.push(path('M -118 58 Q -60 34 -28 6', stroke(p.primary, 2.4, 0.85)));
	const branches = 3 + variant;
	for (let i = 0; i < branches; i++) {
		const endX = -4 + i * (108 / Math.max(branches - 1, 1));
		const endY = -62 + (i % 2) * 16 + (i === Math.floor(branches / 2) ? -10 : 0);
		const midX = (endX - 10) * 0.45;
		const midY = 4 - (i - branches / 2) * 3;
		out.push(
			path(`M -28 6 Q ${n(midX)} ${n(midY)} ${n(endX)} ${n(endY)}`, stroke(i === Math.floor(branches / 2) ? p.gold : i % 2 === 0 ? p.secondary : p.primary, i === Math.floor(branches / 2) ? 2.2 : 1.3, 0.65))
		);
		out.push(circle(endX, endY, 4 + (i === Math.floor(branches / 2) ? 2 : 0), { fill: i === Math.floor(branches / 2) ? p.gold : p.primary, opacity: 0.7, stroke: p.primary, sw: 1 }));
		if (density > 0.55) {
			out.push(line(endX, endY, endX + (i - branches / 2) * 8, endY - 18, stroke(p.secondary, 1, 0.35)));
		}
	}
	out.push(circle(-118, 58, 5, { fill: p.primary, opacity: 0.6, stroke: p.primary, sw: 1 }));
	out.push(circle(-28, 6, 3.4, filled(p.gold, 0.75)));
	// Nedosažené větve — rozhodnutí znamená i to, co zůstalo stranou.
	for (let i = 0; i < 3; i++) {
		const ex = -8 + i * 54;
		const ey = 40 + (i % 2) * 8;
		out.push(path(`M -34 12 Q ${n(-18 + i * 8)} ${n(28 + i * 2)} ${n(ex)} ${n(ey)}`, { ...stroke(p.faint, 0.9, 0.45), dash: '2 4' }));
		out.push(circle(ex, ey, 2, filled(p.muted, 0.45)));
	}
	// Měřítko rozhodnutí
	for (let i = 0; i < 6; i++) out.push(line(-110 + i * 38, 68, -110 + i * 38, 72, stroke(p.faint, 0.8, 0.4)));
	if (variant === 2) {
		out.push(path('M -100 64 Q -20 48 70 64', stroke(p.water, 1.3, 0.35)));
	}
	return out;
}

function lattice({ palette: p, variant }) {
	const out = [];
	const cols = variant === 1 ? 7 : 8;
	const rows = variant === 1 ? 5 : 5;
	const w = 26;
	const h = 26;
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const x = -cols * w / 2 + c * w + w / 2;
			const y = -rows * h / 2 + r * h + h / 2;
			if (variant === 1 && (r + c) % 3 === 0) {
				out.push(circle(x, y, 10, { fill: 'none', stroke: (r + c) % 2 === 0 ? p.primary : p.secondary, sw: 1, opacity: 0.5 }));
			} else {
				out.push(
					polygon(
						[
							[x, y - h * 0.48],
							[x + w * 0.48, y],
							[x, y + h * 0.48],
							[x - w * 0.48, y]
						],
						{
							fill: (r + c) % 5 === 0 ? p.accent : p.primary,
							opacity: (r + c) % 5 === 0 ? 0.16 : 0.04,
							stroke: (r + c) % 4 === 0 ? p.secondary : p.primary,
							sw: 0.9
						}
					)
				);
			}
		}
	}
	out.push(circle(-20 + variant * 22, 0, 7, { fill: p.gold, opacity: 0.55, stroke: p.primary, sw: 1 }));
	out.push(circle(-20 + variant * 22, 0, 2, filled(p.snow, 0.8)));
	if (variant === 2) {
		out.push(circle(0, 0, 76, { ...stroke(p.secondary, 1, 0.25), dash: '3 7' }));
	}
	return out;
}

function fracture({ palette: p, rand, variant, density }) {
	const out = [
		ellipse(0, 0, 104, 64, { fill: p.stoneDark, opacity: 0.08, stroke: p.primary, sw: 1 })
	];
	if (variant === 0) {
		out.push(path('M -8 -66 L 4 -34 L -12 -12 L 6 8 L -6 32 L 4 66', stroke(p.primary, 2.6, 0.95)));
		out.push(line(0, -66, 0, 66, stroke(p.primary, 0.8, 0.2)));
		out.push(path('M 4 -34 L 28 -44 M -12 -12 L -38 -20 M 6 8 L 34 18 M -6 32 L -30 42', stroke(p.primary, 1.4, 0.55)));
	} else if (variant === 1) {
		for (let i = 0; i < 8; i++) {
			const angle = (i / 8) * Math.PI * 2;
			out.push(path(`M 0 0 L ${n(Math.cos(angle) * 34)} ${n(Math.sin(angle) * 22)} L ${n(Math.cos(angle + 0.18) * 92)} ${n(Math.sin(angle + 0.18) * 58)}`, stroke(i % 3 === 0 ? p.gold : p.primary, i % 3 === 0 ? 2 : 1.2, 0.55)));
		}
	} else {
		out.push(polygon([[-96, -54], [-18, -62], [-10, 12], [-72, 34]], { fill: p.primary, opacity: 0.08, stroke: p.primary, sw: 1 }));
		out.push(polygon([[14, -58], [96, -48], [76, 36], [6, 16]], { fill: p.secondary, opacity: 0.08, stroke: p.primary, sw: 1 }));
		out.push(line(-10, -58, 8, 20, stroke(p.gold, 2, 0.8)));
	}
	out.push(circle(0, 0, 6, { fill: p.accent, opacity: 0.2, stroke: p.gold, sw: 1 }));
	for (let i = 0; i < 8 + density * 8; i++) {
		out.push(circle(rand.range(-90, 90), rand.range(-54, 54), rand.range(0.8, 2.2), filled(i % 3 === 0 ? p.gold : p.secondary, 0.4)));
	}
	return out;
}

function pulse({ palette: p, variant, density }) {
	const out = [];
	if (variant === 0) {
		for (let i = 0; i < 5; i++) {
			out.push(circle(0, 0, 14 + i * 12, { ...stroke(i % 2 === 0 ? p.primary : p.secondary, 1.6 - i * 0.18, 0.65 - i * 0.1), dash: i % 2 === 0 ? undefined : '4 6' }));
		}
		out.push(circle(0, 0, 7, { fill: p.accent, opacity: 0.3, stroke: p.gold, sw: 1.2 }));
		out.push(circle(0, 0, 2.6, filled(p.gold, 0.9)));
	} else if (variant === 1) {
		out.push(path('M -140 0 L -104 0 L -92 -8 L -80 0 L -66 0 L -54 36 L -40 -36 L -26 0 L -8 0 L 2 -12 L 14 0 L 44 0 L 56 -18 L 68 0 L 140 0', stroke(p.primary, 2, 0.85)));
		out.push(line(-140, 0, 140, 0, stroke(p.soft, 0.8, 0.2)));
		out.push(circle(68, 0, 3, filled(p.gold, 0.8)));
		out.push(circle(-40, -36, 3, filled(p.gold, 0.65)));
	} else {
		for (let i = 0; i < 6; i++) {
			out.push(arcPath(-58, 0, 34 + i * 20, -52, 52, stroke(i % 2 === 0 ? p.primary : p.secondary, 1.8 - i * 0.2, 0.6 - i * 0.07)));
		}
		out.push(circle(-58, 0, 5, { fill: p.accent, opacity: 0.3, stroke: p.gold, sw: 1 }));
		out.push(polyline([[-54, 0], [22, -56], [40, -44], [22, -30]], stroke(p.secondary, 1, 0.35)));
	}
	for (let i = 0; i < 6 + density * 6; i++) {
		out.push(circle(-100 + i * 34, 44 - (i % 3) * 8, 1.2, filled(i % 2 === 0 ? p.gold : p.secondary, 0.4)));
	}
	return out;
}

function meander({ palette: p, variant, density }) {
	const out = [];
	const points = variant === 2
		? [[-134, 52], [-92, 20], [-112, -18], [-62, -44], [-14, -16], [-30, 22], [18, 48], [56, 16], [36, -24], [92, -50], [132, -20], [114, 30]]
		: [[-134, 42], [-72, 46], [-54, 4], [-98, -34], [-28, -48], [18, -10], [-2, 28], [58, 44], [88, 4], [58, -34], [110, -48], [136, -12]];
	out.push(polyline(points, { ...stroke(p.water, 4.5, 0.2), linejoin: 'round', linecap: 'round' }));
	out.push(polyline(points, { ...stroke(p.primary, 2, 0.8), linejoin: 'round', linecap: 'round', dash: variant === 1 ? '5 5' : undefined }));
	points.forEach(([x, y], i) => {
		if (i % 2 === 0) out.push(circle(x, y, 2.6, { fill: i === points.length - 1 ? p.gold : p.secondary, opacity: 0.7 }));
	});
	out.push(circle(points[0][0], points[0][1], 5, { fill: p.accent, opacity: 0.3, stroke: p.gold, sw: 1 }));
	out.push(circle(points.at(-1)[0], points.at(-1)[1], 5, { fill: p.gold, opacity: 0.35, stroke: p.gold, sw: 1 }));
	for (let i = 0; i < 5 + density * 5; i++) {
		out.push(circle(-120 + i * 48, 62 - (i % 2) * 12, 1.2, filled(i % 2 === 0 ? p.secondary : p.tertiary, 0.35)));
	}
	return out;
}

function constellation({ palette: p, rand, variant, density }) {
	const out = [circle(0, 0, 92, { ...stroke(p.primary, 1, 0.12), dash: '2 8' })];
	const count = 13 + Math.round(density * 7);
	const nodes = [];
	for (let i = 0; i < count; i++) {
		const angle = (i / count) * Math.PI * 2 + variant * 0.35 + rand.range(-0.1, 0.1);
		const radius = 22 + (i % 4) * 13 + rand.range(-4, 4);
		nodes.push([Math.cos(angle) * radius, Math.sin(angle) * radius * 0.66, i === 0 ? 3.6 : 1.2 + rand() * 1.8]);
	}
	for (let i = 0; i < nodes.length - 1; i++) {
		const [x1, y1] = nodes[i];
		const [x2, y2] = nodes[i + 1];
		out.push(line(x1, y1, x2, y2, { stroke: i % 4 === 0 ? p.gold : p.primary, sw: i % 4 === 0 ? 1.4 : 0.8, opacity: 0.25 + (i % 3) * 0.1 }));
	}
	nodes.forEach(([x, y, r], i) => {
		out.push(circle(x, y, r, { fill: i === 0 ? p.gold : i % 3 === 0 ? p.secondary : p.snow, opacity: 0.55 + (i === 0 ? 0.35 : 0) }));
		if (i === 0) out.push(circle(x, y, 15, { ...stroke(p.gold, 1, 0.3), dash: '2 5' }));
	});
	if (variant === 2) out.push(polyline([[-80, 46], [-40, 12], [0, 30], [44, -16], [88, -42]], stroke(p.tertiary, 0.9, 0.25)));
	return out;
}

function monolith({ palette: p, variant, density }) {
	const out = [ellipse(0, 58, 82, 8, { fill: p.primary, opacity: 0.12 })];
	if (variant === 0) {
		out.push(polygon([[-30, -66], [26, -58], [34, 54], [-24, 62]], { fill: p.stoneDark, fillOpacity: 0.7, stroke: p.primary, sw: 1.4 }));
		out.push(polygon([[-30, -66], [-4, -58], [-2, 58], [-24, 62]], { fill: p.stone, opacity: 0.28 }));
		out.push(polygon([[26, -58], [34, 54], [10, 58], [-2, 58], [-4, -58]], { fill: p.primary, opacity: 0.06 }));
	} else if (variant === 1) {
		out.push(polygon([[-16, -70], [8, -76], [18, 58], [-10, 62]], { fill: p.stoneDark, fillOpacity: 0.65, stroke: p.primary, sw: 1.3 }));
		out.push(polygon([[-16, -70], [8, -76], [2, 58], [-10, 62]], { fill: p.stone, opacity: 0.24 }));
		out.push(circle(4, -80, 3, filled(p.gold, 0.7)));
	} else {
		out.push(rect(-62, -46, 40, 100, { fill: p.stoneDark, fillOpacity: 0.5, stroke: p.primary, sw: 1.2 }));
		out.push(rect(18, -58, 44, 112, { fill: p.stoneDark, fillOpacity: 0.6, stroke: p.primary, sw: 1.2 }));
		out.push(rect(-50, -36, 16, 76, { fill: p.stone, opacity: 0.2 }));
		out.push(rect(28, -46, 18, 84, { fill: p.stone, opacity: 0.22 }));
		// Spáry zdiva a mezera — zeď je stavěná z bloků, ne monolit.
		for (let r = 0; r < 7; r++) {
			const y = -38 + r * 14;
			out.push(line(-62, y, -22, y, stroke(p.primary, 0.7, 0.22)));
			out.push(line(18, y - 6, 62, y - 6, stroke(p.primary, 0.7, 0.22)));
		}
		out.push(line(-2, -58, 2, -20, stroke(p.gold, 1.2, 0.55)));
		out.push(line(2, -14, -1, 30, stroke(p.gold, 1.1, 0.45)));
		out.push(line(-6, 22, 8, 14, stroke(p.gold, 0.9, 0.3)));
	}
	for (let i = 0; i < 4 + density * 3; i++) {
		out.push(line(-14, -38 + i * 18, 14, -42 + i * 18, stroke(p.secondary, 0.8, 0.3)));
	}
	// Spáry, odštěpky a stín — kámen není prázdný obrys.
	for (let i = 0; i < 5; i++) {
		const y = -52 + i * 20;
		out.push(line(-30, y, 32, y - 2, stroke(p.primary, 0.7, 0.16)));
	}
	out.push(line(-4, -24, 4, 4, stroke(p.gold, 1, 0.4)));
	out.push(line(4, 10, -2, 40, stroke(p.gold, 0.9, 0.3)));
	out.push(circle(10, -14, 1.8, filled(p.secondary, 0.5)));
	out.push(circle(-12, 22, 1.4, filled(p.secondary, 0.35)));
	out.push(path('M -90 62 L -64 52 L -38 62 M 38 60 L 66 50 L 92 62', stroke(p.primary, 1.1, 0.35)));
	return out;
}

function arch({ palette: p, variant, density }) {
	const out = [line(-144, 62, 144, 62, stroke(p.soft, 1))];
	if (variant === 1) {
		for (let i = 0; i < 5; i++) {
			const x = -88 + i * 44;
			out.push(rect(x, -34, 12, 86, { fill: p.stoneDark, opacity: 0.5, stroke: p.primary, sw: 1.1 }));
		}
		for (let i = 0; i < 5; i++) {
			const x = -112 + i * 44;
			out.push(arcPath(x, -34, 22, 180, 360, stroke(p.stone, 2.2, 0.45)));
		}
		out.push(rect(-100, -18, 200, 6, { fill: p.primary, opacity: 0.12, stroke: p.primary, sw: 0.8 }));
		// Řetěz zavěšený mezi sloupy — stejný princip jako u klenby.
		out.push(path('M -96 6 Q 0 64 96 6', { ...stroke(p.secondary, 1.1, 0.45), dash: '3 4' }));
		for (let i = 1; i < 5; i++) {
			const t = i / 5;
			const x = -96 + t * 192;
			const y = 6 + Math.sin(t * Math.PI) * 26;
			out.push(line(x, y, x, y + 6, stroke(p.secondary, 0.9, 0.4)));
			out.push(circle(x, y + 8, 1.6, filled(p.gold, 0.5)));
		}
	} else if (variant === 2) {
		out.push(path('M -120 52 Q 0 -26 120 52', stroke(p.primary, 4, 0.75)));
		out.push(path('M -92 52 Q 0 -6 92 52', stroke(p.primary, 1.2, 0.35)));
		for (let i = 0; i < 7; i++) {
			const x = -108 + i * 36;
			const y = 52 - Math.sin((i / 6) * Math.PI) * 38;
			out.push(line(x, y, x, 54, { stroke: p.secondary, sw: 0.9, opacity: 0.35 }));
		}
	} else {
		out.push(path('M -82 60 L -82 4 Q -82 -52 0 -58 Q 82 -52 82 4 L 82 60', { ...stroke(p.primary, 2), linejoin: 'round' }));
		out.push(path('M -62 60 L -62 10 Q -62 -32 0 -38 Q 62 -32 62 10 L 62 60', { ...stroke(p.stone, 1.4, 0.45), linejoin: 'round' }));
		out.push(polygon([[0, -54], [16, -36], [-16, -36]], { fill: p.gold, opacity: 0.45 }));
		for (let i = 0; i < 6; i++) {
			out.push(line(-54 + i * 22, 60, -54 + i * 22, 72, stroke(p.primary, 1, 0.3)));
		}
		// Závěsný řetěz obrácený vzhůru — princip, ze kterého vzniká tlakový oblouk.
		out.push(path('M -72 46 Q 0 106 72 46', { ...stroke(p.secondary, 1.2, 0.5), dash: '3 4' }));
		for (let i = 1; i < 6; i++) {
			const t = i / 6;
			const x = -72 + t * 144;
			const y = 46 + Math.sin(t * Math.PI) * 30;
			out.push(line(x, y, x, y + 7, stroke(p.secondary, 1, 0.45)));
			out.push(circle(x, y + 9, 1.8, filled(p.gold, 0.55)));
		}
	}
	for (let i = 0; i < 4 + density * 4; i++) {
		out.push(circle(-100 + i * 40, 70, 1.2, filled(i % 2 === 0 ? p.secondary : p.gold, 0.35)));
	}
	return out;
}

function mosaic({ palette: p, variant, density }) {
	const out = [];
	const cols = 6;
	const rows = 4;
	const w = 44;
	const h = 30;
	const offset = variant === 2 ? 6 : 0;
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const x = -cols * w / 2 + c * w + 3 + ((r + variant) % 2) * offset;
			const y = -rows * h / 2 + r * h + 3;
			const highlighted = (r * cols + c) % 7 === 0;
			const shape = variant === 1 && (r + c) % 3 === 0;
			if (shape) {
				out.push(polygon([[x, y + h / 2], [x + w / 2 - 3, y], [x + w - 6, y + h - 6], [x + w / 3, y + h - 2]], { fill: highlighted ? p.gold : p.secondary, opacity: highlighted ? 0.3 : 0.07, stroke: p.primary, sw: 0.8 }));
			} else {
				out.push(rect(x, y, w - 6, h - 6, { rx: variant === 2 ? 3 : 0, fill: highlighted ? p.gold : (r + c) % 4 === 0 ? p.primary : p.secondary, opacity: highlighted ? 0.28 : 0.05 + ((r + c) % 3) * 0.03, stroke: p.primary, sw: 0.8 }));
			}
		}
	}
	out.push(rect(-cols * w / 2, -rows * h / 2, cols * w, rows * h, { fill: 'none', stroke: p.primary, sw: 1.4 }));
	out.push(circle(0, 0, 4, { fill: p.accent, opacity: 0.25, stroke: p.gold, sw: 1 }));
	for (let i = 0; i < 5 + density * 4; i++) {
		out.push(circle(-110 + i * 48, -54 + (i % 2) * 108, 1.2, filled(i % 2 === 0 ? p.gold : p.secondary, 0.3)));
	}
	return out;
}

function pendulum({ palette: p, variant, density }) {
	const out = [line(-142, -54, 142, -54, stroke(p.soft, 1))];
	const pivotX = 0;
	const pivotY = -48;
	if (variant === 2) {
		out.push(ellipse(0, 30, 74, 20, { fill: 'none', stroke: p.primary, sw: 1.4 }));
		out.push(ellipse(0, 30, 50, 13, { ...stroke(p.secondary, 1, 0.5), dash: '3 5' }));
		out.push(line(pivotX, pivotY, 32, 28, stroke(p.primary, 1.6, 0.8)));
		out.push(circle(32, 28, 6, { fill: p.gold, opacity: 0.7, stroke: p.primary, sw: 1 }));
	} else {
		const amplitude = variant === 1 ? 52 : 34;
		out.push(arcPath(pivotX, pivotY, 94, 90 - amplitude, 90 + amplitude, { ...stroke(p.secondary, 1.2, 0.35), dash: '3 5' }));
		out.push(line(pivotX, pivotY, 0, 34, stroke(p.primary, 2, 0.85)));
		out.push(circle(0, 34, 9, { fill: p.gold, opacity: 0.45, stroke: p.primary, sw: 1.2 }));
		out.push(circle(0, 34, 3, filled(p.snow, 0.75)));
		out.push(circle(pivotX, pivotY, 4, { fill: p.primary, opacity: 0.7, stroke: p.primary, sw: 1 }));
		if (variant === 1) {
			out.push(line(0, 34, 26, 58, stroke(p.primary, 1.4, 0.7)));
			out.push(circle(26, 58, 6, { fill: p.secondary, opacity: 0.5, stroke: p.primary, sw: 1 }));
		}
	}
	for (let i = 0; i < 4 + density * 4; i++) {
		out.push(circle(-90 + i * 48, 58, 1.2, filled(i % 2 === 0 ? p.secondary : p.gold, 0.35)));
	}
	return out;
}

function echo({ palette: p, variant, density }) {
	const out = [];
	const count = 5 + variant * 2;
	for (let i = count; i >= 0; i--) {
		const offset = i * 11;
		const opacity = 0.06 + (count - i) * 0.045;
		if (variant === 1) {
			out.push(rect(-48 + offset, -38 + offset, 96, 76, { fill: 'none', stroke: i % 3 === 0 ? p.gold : p.primary, sw: 1.3, opacity }));
		} else {
			out.push(circle(offset * 0.6, 0, 12 + i * 9, { fill: 'none', stroke: i % 3 === 0 ? p.gold : p.primary, sw: 1.3, opacity }));
		}
	}
	out.push(circle(0, 0, 5, { fill: p.accent, opacity: 0.3, stroke: p.gold, sw: 1 }));
	if (variant === 2) {
		out.push(path(wavePath(22, 7, 0.4), stroke(p.secondary, 1, 0.35)));
		out.push(path(wavePath(44, 5, 0.9), stroke(p.tertiary, 1, 0.25)));
	}
	for (let i = 0; i < 4 + density * 4; i++) {
		out.push(circle(42 + i * 20, -40 + (i % 2) * 80, 1.2, filled(i % 2 === 0 ? p.secondary : p.gold, 0.35)));
	}
	return out;
}

function mirror({ palette: p, variant, density }) {
	const out = [
		line(0, -76, 0, 76, { ...stroke(p.primary, 1.4, 0.65), dash: '4 5' })
	];
	if (variant === 1) {
		out.push(polygon([[-54, -44], [-8, -54], [-12, 48], [-58, 40]], { fill: p.primary, opacity: 0.06, stroke: p.primary, sw: 1 }));
		out.push(polygon([[54, -44], [8, -54], [12, 48], [58, 40]], { fill: p.secondary, opacity: 0.06, stroke: p.primary, sw: 1 }));
		out.push(circle(-30, -4, 13, { fill: p.primary, opacity: 0.15, stroke: p.primary, sw: 1.1 }));
		out.push(circle(30, -4, 13, { fill: 'none', stroke: p.secondary, sw: 1.1, opacity: 0.6 }));
	} else {
		out.push(circle(-32, 0, 24, { fill: p.primary, opacity: 0.12, stroke: p.primary, sw: 1.2 }));
		out.push(circle(32, 0, 24, { fill: 'none', stroke: p.secondary, sw: 1.2, opacity: 0.6 }));
		out.push(polygon([[-32, -24], [-14, 0], [-32, 24], [-50, 0]], { fill: p.accent, opacity: 0.12 }));
		out.push(polygon([[32, -24], [14, 0], [32, 24], [50, 0]], { fill: 'none', stroke: p.tertiary, sw: 1, opacity: 0.45 }));
	}
	if (variant === 2) {
		out.push(path('M -2 -68 L -10 -40 L 4 -22 L -6 0 L 8 22 L -2 46 L 2 68', stroke(p.primary, 1.6, 0.75)));
		out.push(path('M 2 -68 L 10 -40 L -4 -22 L 6 0 L -8 22 L 2 46 L -2 68', stroke(p.primary, 1.6, 0.75)));
	}
	for (let i = 0; i < 5 + density * 4; i++) {
		out.push(circle(-82 + i * 41, 62, 1.2, filled(i % 2 === 0 ? p.gold : p.secondary, 0.35)));
	}
	return out;
}

function cascade({ palette: p, variant, density }) {
	const out = [];
	if (variant === 1) {
		for (let i = 0; i < 7; i++) {
			const x = -96 + i * 30;
			const y = -44 + i * 14;
			out.push(ellipse(x, y, 12, 7, { fill: 'none', stroke: i % 2 === 0 ? p.primary : p.secondary, sw: 2, rot: 34 }));
		}
		out.push(polyline([[-96, -44], [-66, -30], [-36, -16], [-6, -2], [24, 12], [54, 26], [84, 40]], stroke(p.gold, 1.2, 0.4)));
	} else if (variant === 2) {
		for (let i = 0; i < 5; i++) {
			const y = -56 + i * 26;
			out.push(rect(-88 + i * 12, y, 176 - i * 24, 10, { fill: p.water, opacity: 0.08 + i * 0.025, stroke: p.primary, sw: 1 }));
			out.push(line(-84 + i * 12, y + 10, -80 + i * 12, y + 18, stroke(p.secondary, 0.9, 0.35)));
		}
	} else {
		for (let i = 0; i < 8; i++) {
			const x = -84 + i * 24;
			const y = -30 + i * 9;
			out.push(
				rect(x, y, 12, 36, {
					fill: i % 3 === 0 ? p.gold : i % 2 === 0 ? p.primary : p.secondary,
					opacity: i === 7 ? 0.35 : 0.1 + i * 0.025,
					stroke: p.primary,
					sw: 0.9,
					transform: `rotate(${n(52 + i * 1.5)} ${n(x + 6)} ${n(y + 18)})`
				})
			);
		}
	}
	for (let i = 0; i < 5 + density * 4; i++) {
		out.push(circle(-100 + i * 44, 54 - (i % 3) * 8, 1.2, filled(i % 2 === 0 ? p.secondary : p.gold, 0.35)));
	}
	return out;
}

function horizon({ palette: p, variant, density }) {
	const out = [
		rect(-160, -90, 320, 180, { fill: p.primary, opacity: 0.025 }),
		line(-160, 28, 160, 28, stroke(p.primary, 1, 0.35))
	];
	const cx = variant === 2 ? 44 : -12;
	out.push(circle(cx, 8, 26 + variant * 4, { fill: p.gold, opacity: 0.22, stroke: p.primary, sw: 1 }));
	out.push(circle(cx, 8, 16 + variant * 2, { fill: p.gold, opacity: 0.45 }));
	if (variant === 0) {
		out.push(path('M -160 54 Q -110 22 -62 42 Q -22 58 16 34 Q 62 8 104 38 Q 132 56 160 44 L 160 90 L -160 90 Z', { fill: p.stoneDark, opacity: 0.42, stroke: p.primary, sw: 1 }));
		out.push(path('M -160 68 Q -104 44 -54 60 Q 4 78 54 56 Q 108 34 160 62 L 160 90 L -160 90 Z', { fill: p.primary, opacity: 0.1 }));
	} else if (variant === 1) {
		out.push(path('M -160 40 Q -96 28 -38 46 Q 20 64 78 42 Q 118 28 160 40 L 160 90 L -160 90 Z', { fill: p.emberDark, opacity: 0.35, stroke: p.primary, sw: 1 }));
		out.push(path('M -160 58 Q -100 48 -40 60 Q 28 74 86 58 Q 124 48 160 56 L 160 90 L -160 90 Z', { fill: p.ember, opacity: 0.16 }));
	} else {
		for (let i = 0; i < 4; i++) {
			out.push(path(wavePath(40 + i * 10, 4 + i, 0.4 + i * 0.7), stroke(i === 0 ? p.gold : p.water, 1.2, 0.3 + i * 0.08)));
		}
	}
	for (let i = 0; i < 5 + density * 5; i++) {
		out.push(circle(-130 + i * 44, 34 + (i % 2) * 8, 1.2, filled(i % 2 === 0 ? p.secondary : p.gold, 0.3)));
	}
	return out;
}

function weave({ palette: p, variant, density }) {
	const out = [];
	const bands = 5;
	if (variant === 2) {
		for (let i = 0; i < 5; i++) {
			const offset = -70 + i * 34;
			out.push(path(`M ${n(offset)} -62 C ${n(offset + 30)} -20 ${n(offset - 30)} 20 ${n(offset)} 62`, stroke(i % 2 === 0 ? p.primary : p.secondary, 8 - i * 0.5, 0.2)));
			out.push(path(`M ${n(offset + 6)} -62 C ${n(offset + 36)} -20 ${n(offset - 24)} 20 ${n(offset + 6)} 62`, stroke(i % 2 === 0 ? p.gold : p.tertiary, 1.2, 0.5)));
		}
	} else {
		for (let i = 0; i < bands; i++) {
			const y = -54 + i * 26;
			out.push(rect(-110, y, 220, 16, { fill: i % 2 === 0 ? p.primary : p.secondary, opacity: 0.07, stroke: p.primary, sw: 0.8 }));
		}
		for (let i = 0; i < 6; i++) {
			const x = -96 + i * 38;
			for (let j = 0; j < bands; j++) {
				if ((i + j) % 2 === 0) continue;
				const y = -54 + j * 26;
				out.push(rect(x, y, 22, 16, { fill: j % 2 === 0 ? p.secondary : p.primary, opacity: 0.2, stroke: p.primary, sw: 0.7 }));
			}
		}
	}
	out.push(rect(-110, -54, 220, 126, { fill: 'none', stroke: p.primary, sw: 1.4 }));
	out.push(line(-110, -54, 110, 62, stroke(p.gold, 1, 0.25)));
	if (variant === 1) out.push(circle(0, 8, 5, { fill: p.gold, opacity: 0.65 }));
	return out;
}

function vortex({ palette: p, variant, density }) {
	const out = [];
	const cx = 0;
	const cy = variant === 2 ? -14 : 6;
	const arms = 4 + variant;
	if (variant === 0) {
		for (let i = 0; i < 7; i++) {
			out.push(ellipse(cx, cy, 72 - i * 8, 44 - i * 5, { fill: 'none', stroke: i % 2 === 0 ? p.primary : p.secondary, sw: 1.2, opacity: 0.2 + i * 0.05, dash: i % 3 === 0 ? '4 6' : undefined }));
		}
	} else if (variant === 1) {
		for (let i = 0; i < 5; i++) {
			out.push(arcPath(cx, cy, 20 + i * 12, -40 + i * 20, 250 + i * 12, { ...stroke(i % 2 === 0 ? p.water : p.primary, 1.6 - i * 0.15, 0.55 - i * 0.06), linecap: 'round' }));
		}
	} else {
		for (let i = 0; i < 6; i++) {
			const width = 18 + i * 13;
			out.push(path(`M ${n(cx - width)} ${n(cy + 30)} Q ${n(cx - width * 0.4)} ${n(cy - 40 - i * 3)} ${n(cx)} ${n(cy + 4)} Q ${n(cx + width * 0.4)} ${n(cy + 40)} ${n(cx + width)} ${n(cy + 30)}`, stroke(i % 2 === 0 ? p.primary : p.secondary, 1.1, 0.25)));
		}
	}
	for (let a = 0; a < arms; a++) {
		const base = (a / arms) * Math.PI * 2;
		const points = [];
		for (let i = 0; i <= 18; i++) {
			const t = i / 18;
			const angle = base + t * Math.PI * 1.8;
			const radius = 8 + t * (55 + density * 30);
			points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * 0.72]);
		}
		out.push(polyline(points, stroke(a % 2 === 0 ? p.primary : p.secondary, 1.6, 0.65)));
	}
	out.push(circle(cx, cy, 7, { fill: p.accent, opacity: 0.3, stroke: p.gold, sw: 1.1 }));
	out.push(circle(cx, cy, 2.4, filled(p.gold, 0.85)));
	for (let i = 0; i < 6 + density * 6; i++) {
		const angle = (i / 12) * Math.PI * 2;
		out.push(circle(cx + Math.cos(angle) * (72 + (i % 3) * 12), cy + Math.sin(angle) * (48 + (i % 3) * 8), 1.2, filled(i % 2 === 0 ? p.secondary : p.gold, 0.4)));
	}
	return out;
}

/** @type {{key:string,label:string,note:string,build:Function}[]} */
export const EXTRA_ABSTRACT_FAMILIES = [
	{ key: 'radial', label: 'Rozbřesk energie', note: 'energie, výbuch, náhlý zásah', build: radialBurst },
	{ key: 'spiral', label: 'Spirála', note: 'vývoj, soustředění, posedlost', build: spiral },
	{ key: 'threshold', label: 'Práh', note: 'rozhodnutí, přechod, brána', build: threshold },
	{ key: 'ascent', label: 'Vzestup', note: 'pokrok, ambice, hierarchie', build: ascent },
	{ key: 'descent', label: 'Sestup', note: 'úpadek, pád, krize', build: descent },
	{ key: 'waves', label: 'Vlny', note: 'tok, rytmus, emoce, moře', build: waveField },
	{ key: 'scatter', label: 'Rozptyl', note: 'chaos, fragmentace, částice', build: scatter },
	{ key: 'convergence', label: 'Soustředění', note: 'fokus, sjednocení, přitažlivost', build: convergence },
	{ key: 'divergence', label: 'Rozcestí', note: 'volba, větvení, důsledky', build: divergence },
	{ key: 'lattice', label: 'Mřížka', note: 'řád, pravidla, logika, kód', build: lattice },
	{ key: 'fracture', label: 'Prasklina', note: 'zlom, konflikt, trauma', build: fracture },
	{ key: 'pulse', label: 'Pulz', note: 'tep, rytmus, signál', build: pulse },
	{ key: 'meander', label: 'Meandr', note: 'cesta, tok, vývoj', build: meander },
	{ key: 'constellation', label: 'Souhvězdí', note: 'vzorec, orientace, mýtus', build: constellation },
	{ key: 'monolith', label: 'Monolit', note: 'moc, instituce, pomník', build: monolith },
	{ key: 'arch', label: 'Oblouk', note: 'architektura, most, civilizace', build: arch },
	{ key: 'mosaic', label: 'Mozaika', note: 'kultura, rozmanitost, skladba', build: mosaic },
	{ key: 'pendulum', label: 'Kyvadlo', note: 'oscilace, nejistota, rovnováha', build: pendulum },
	{ key: 'echo', label: 'Ozvěna', note: 'paměť, vliv, šíření', build: echo },
	{ key: 'mirror', label: 'Zrcadlo', note: 'dualita, symetrie, odraz', build: mirror },
	{ key: 'cascade', label: 'Kaskáda', note: 'řetězová reakce, zhroucení', build: cascade },
	{ key: 'horizon', label: 'Obzor', note: 'krajina, perspektiva, dálka', build: horizon },
	{ key: 'weave', label: 'Tkanina', note: 'propojení, tradice, složitost', build: weave },
	{ key: 'vortex', label: 'Vír', note: 'pohltivá síla, chaos, vír', build: vortex }
];
