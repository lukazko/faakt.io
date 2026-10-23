#!/usr/bin/env node
/**
 * Audit ilustračního systému nad celou databází příspěvků.
 *
 * Skript je záměrně soběstačný: načte posts.json, prožene každý příspěvek
 * stejnou cestou jako produkce (analyzePost → createGeometricIllustration),
 * a vypíše metriky, které rozhodují o kvalitě výběru:
 *
 *   - rozložení scén, motivů, kompozic a důvodů výběru,
 *   - strukturální rozmanitost scén (bez barev, pozice, měřítka a rotace),
 *   - fallbacky bez sémantického signálu,
 *   - motivy bez kreslicí funkce,
 *   - podezřelé výběry (slunce vykreslené jako měsíc, hodiny u textu o písmu…),
 *   - regresní případy ze zadání.
 *
 * Použití:
 *   node scripts/audit-illustrations.mjs
 *   node scripts/audit-illustrations.mjs --json reports/audit.json --md reports/audit.md
 *   node scripts/audit-illustrations.mjs --baseline reports/baseline.json
 *   node scripts/audit-illustrations.mjs --write-baseline reports/baseline.json
 *   node scripts/audit-illustrations.mjs --scene voyage --limit 40 --show
 *
 * Výstup do konzole je krátký souhrn; plná data jdou do JSON reportu.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import {
	analyzePost,
	createGeometricIllustration,
	explainSelection,
	normalizeText,
	HERO_KEYS,
	SUBJECTS,
	SUBJECT_BY_KEY,
	SUBJECT_ALIAS,
	GEOMETRIC_FAMILY_KEYS
} from '../src/lib/illustrations/index.js';

const args = process.argv.slice(2);
const arg = (name, fallback = null) => {
	const index = args.indexOf(`--${name}`);
	if (index === -1) return fallback;
	const next = args[index + 1];
	return next && !next.startsWith('--') ? next : true;
};
const has = (name) => args.includes(`--${name}`);

const postsPath = arg('posts', 'static/data/posts.json');
const posts = JSON.parse(readFileSync(postsPath, 'utf8'));

const topN = Number(arg('top', 12));
const limit = Number(arg('limit', 0)) || 0;
const focusScene = arg('scene');
const focusFamily = arg('family');
const show = has('show');
const jsonPath = arg('json');
const mdPath = arg('md');
const baselinePath = arg('baseline');
const writeBaselinePath = arg('write-baseline');

// --- Pomocné funkce -------------------------------------------------------

const pct = (part, whole) => (whole ? Math.round((part / whole) * 1000) / 10 : 0);
const increment = (map, key, amount = 1) => map.set(key, (map.get(key) || 0) + amount);
const sorted = (map) => [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
const topEntries = (map, n = topN) => sorted(map).slice(0, n);

const subjectByKey = SUBJECT_BY_KEY;
const subjectTags = new Map(
	SUBJECTS.map((subject) => [
		subject.key,
		subject.tags.map((tag) => {
			const star = tag.endsWith('*');
			const base = normalizeText(tag.replace(/\*+$/, '')).replace(/\s+/g, '');
			return star ? { base, star } : { base, star };
		})
	])
);

function textHasSubject(text, key) {
	const tags = subjectTags.get(key);
	if (!tags) return false;
	const words = new Set(normalizeText(text).split(' '));
	return tags.some(({ base, star }) => (star ? [...words].some((word) => word.startsWith(base)) : words.has(base)));
}

/**
 * Strukturální otisk scény: typy prvků a hrubý tvar cesty. Záměrně ignoruje
 * barvy, opacity, absolutní souřadnice, měřítko i rotaci — jinak by se
 * kosmetické variace počítaly jako nová scéna.
 */
function structuralSignature(elements) {
	const parts = elements.map((el) => {
		if (!el.t) return '?';
		if (el.t === 'path') {
			const commands = (el.d.match(/[A-Za-z]/g) || []).join('');
			return `p:${commands}`;
		}
		if (el.t === 'polyline') return `pl:${String(el.points).split(' ').length}`;
		if (el.t === 'circle') return 'c';
		if (el.t === 'ellipse') return 'e';
		return el.t[0];
	});
	return parts.join(',');
}

const signatureHash = (value) => {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(16).padStart(8, '0');
};

// --- Regresní případy -----------------------------------------------------

const REGRESSION = [
	{
		id: '754',
		label: 'ničivá síla inovací → stroj/mechanismus',
		expect: (spec) => ['machine', 'gear'].includes(spec.subject),
		reason: 'vynález a inovace nesmí skončit jako geologická vrstva nebo zřícenina'
	},
	{
		id: '085',
		label: 'Slunce → slunce, ne srpek měsíce',
		expect: (spec) => spec.subject === 'sun',
		reason: 'nebeská tělesa se musí rozlišit'
	},
	{
		id: '199',
		label: 'Alexandrijská knihovna → knihovna a oheň',
		expect: (spec) => ['library', 'book'].includes(spec.subject) && (spec.secondary === 'flame' || spec.scene === 'bookFire'),
		reason: 'požár knihovny není osamocená kniha'
	},
	{
		id: '417',
		label: 'člověk ztratí pojem o čase → postava a hodiny',
		expect: (spec) => spec.subject === 'figure' && (spec.secondary === 'clock' || spec.scene === 'timeFigure'),
		reason: 'osamocená postava nenese vztah k času'
	},
	{
		id: '540',
		label: 'fénické písmo a obchodníci → písmo nebo plavba, ne hodiny',
		expect: (spec) => ['script', 'scroll', 'ship', 'stele'].includes(spec.subject) && spec.subject !== 'clock',
		reason: 'hodiny jsou pro text o písmu sémanticky irelevantní'
	}
];

// --- Průchod databází -----------------------------------------------------

const rows = [];
for (const post of posts) {
	const analysis = analyzePost(post);
	const spec = createGeometricIllustration({ post });
	const scene = spec.scene || spec.composition || spec.family;
	rows.push({
		id: post.id,
		title: post.title,
		category: post.category,
		family: spec.family,
		requestedFamily: spec.requestedFamily,
		scene,
		composition: spec.composition,
		subject: spec.subject,
		secondary: spec.secondary,
		reason: analysis.reason,
		supports: analysis.supports,
		signature: structuralSignature(spec.elements),
		signatureHash: signatureHash(structuralSignature(spec.elements)),
		elementCount: spec.elements.length,
		analysisSubject: analysis.subject
	});
}

const counts = {
	families: new Map(),
	scenes: new Map(),
	compositions: new Map(),
	subjects: new Map(),
	secondaries: new Map(),
	reasons: new Map(),
	signatures: new Map()
};
const combos = new Map();

for (const row of rows) {
	increment(counts.families, row.family);
	increment(counts.scenes, row.scene);
	increment(counts.compositions, row.composition);
	increment(counts.subjects, row.subject ?? '(bez motivu)');
	if (row.secondary) increment(counts.secondaries, row.secondary);
	increment(counts.reasons, row.reason.split(':')[0]);
	increment(counts.signatures, row.signatureHash);
	const comboKey = `${row.scene}|${row.subject ?? '-'}|${row.secondary ?? '-'}`;
	const combo = combos.get(comboKey) || { scene: row.scene, subject: row.subject, secondary: row.secondary, count: 0, ids: [] };
	combo.count += 1;
	if (combo.ids.length < 5) combo.ids.push(row.id);
	combos.set(comboKey, combo);
}

// --- Kontroly -------------------------------------------------------------

const heroKeys = new Set(HERO_KEYS);
const missingHero = new Set();
for (const row of rows) {
	if (row.analysisSubject && !heroKeys.has(SUBJECT_ALIAS[row.analysisSubject] || row.analysisSubject)) {
		missingHero.add(row.analysisSubject);
	}
}

const subjectsWithoutHero = SUBJECTS
	.filter((subject) => !heroKeys.has(SUBJECT_ALIAS[subject.key] || subject.key))
	.map((subject) => subject.key);

const warnings = [];
const warning = (type, row, detail) => warnings.push({ type, id: row.id, title: row.title, detail });

for (const row of rows) {
	const post = posts.find((item) => item.id === row.id);
	const text = `${post.title} ${post.content}`;
	const normalized = normalizeText(text);

	// Nebeská tělesa: měsíc nesmí zastoupit slunce a naopak.
	const mentionsSun = /\bslunce|\bslunci|\bsluncem|\bsolarn/.test(normalized);
	const mentionsMoon = /\bmesic|\bmesice|\bmesici|\bluna|\blunar/.test(normalized);
	if (mentionsSun && !mentionsMoon && row.subject === 'moon') {
		warning('moon-for-sun', row, 'text mluví o Slunci, scéna kreslí Měsíc');
	}
	if (mentionsMoon && !mentionsSun && row.subject === 'sun') {
		warning('sun-for-moon', row, 'text mluví o Měsíci, scéna kreslí Slunce');
	}

	// Instrument nesmí zastoupit pozorovaný objekt, pokud ho titulek jmenuje.
	const celestial = ['sun', 'moon', 'comet', 'galaxy', 'blackhole', 'planet', 'star'];
	const titleCelestial = celestial.filter((key) => textHasSubject(post.title, key));
	const instrumentInTitle = /dalekohled|teleskop|astronom|mikroskop/.test(normalizeText(post.title));
	if (titleCelestial.length && !instrumentInTitle && ['telescope', 'microscope', 'flask'].includes(row.subject)) {
		warning('instrument-over-object', row, `titulek jmenuje ${titleCelestial.join(', ')}, scéna kreslí ${row.subject}`);
	}

	// Motiv, jehož vlastní slova v textu vůbec nejsou — podezření na záměnu.
	if (row.subject && row.subject !== 'figure' && !['bust', 'tree'].includes(row.subject)) {
		if (!textHasSubject(text, row.subject) && !textHasSubject(text, row.analysisSubject || '')) {
			const aliased = Object.entries(SUBJECT_ALIAS).find(([, target]) => target === row.subject)?.[0];
			if (!aliased || !textHasSubject(text, aliased)) {
				warning('subject-not-in-text', row, `motiv ${row.subject} nemá v textu žádné vlastní slovo`);
			}
		}
	}

	// Generický fallback: kategorie rozhodla, přestože text nese konkrétní motiv.
	if (row.reason.startsWith('category:') || row.reason.startsWith('fallback')) {
		warning('category-fallback', row, `výběr jen podle kategorie (${row.reason})`);
	}

	// Abstraktní zřícenina u nefyzického zániku.
	if (row.subject === 'ruin' && /zanik|upadek|firma|trh|ekonom|institu/i.test(normalized) && !/zricenin|ruin|trosk|chatar/.test(normalized)) {
		warning('ruin-for-abstract-decline', row, 'zánik firmy/instituce není zřícenina');
	}
}

const sceneTypes = [...counts.scenes.keys()];
const distinctScenes = sceneTypes.length;
const distinctSubjects = [...counts.subjects.keys()].filter((key) => key !== '(bez motivu)').length;
const distinctSignatures = counts.signatures.size;
const fallbackCount = rows.filter((row) => row.reason.startsWith('category:') || row.reason.startsWith('fallback')).length;

// Koncentrace motivů: podíl nejčastějšího motivu a normalizovaná entropie.
const subjectTotal = rows.length;
const topSubject = topEntries(counts.subjects, 1)[0] || ['-', 0];
const entropy = -[...counts.subjects.values()].reduce((sum, count) => {
	const share = count / subjectTotal;
	return sum + share * Math.log(share);
}, 0);
const normalizedEntropy = entropy / Math.log(Math.max(distinctSubjects, 2));

// Duplicitní strukturální scény: stejný tvar nese mnoho různých příspěvků.
const duplicateScenes = sorted(counts.signatures)
	.filter(([, count]) => count >= 8)
	.slice(0, 10)
	.map(([signature, count]) => ({
		signature,
		count,
		ids: rows.filter((row) => row.signatureHash === signature).slice(0, 8).map((row) => row.id)
	}));

const regression = REGRESSION.map((testCase) => {
	const post = posts.find((item) => item.id === testCase.id);
	if (!post) return { ...testCase, ok: false, missing: true, got: null };
	const spec = createGeometricIllustration({ post });
	const explanation = explainSelection(post);
	return {
		label: testCase.label,
		id: testCase.id,
		ok: Boolean(testCase.expect(spec)),
		reason: testCase.reason,
		got: {
			scene: spec.scene || null,
			family: spec.family,
			subject: spec.subject,
			secondary: spec.secondary,
			composition: spec.composition,
			analysis: explanation.reason
		}
	};
});

const report = {
	generatedAt: new Date().toISOString(),
	posts: posts.length,
	distinct: {
		scenes: distinctScenes,
		subjects: distinctSubjects,
		structuralScenes: distinctSignatures,
		combos: combos.size
	},
	concentration: {
		topSubject: topSubject[0],
		topSubjectCount: topSubject[1],
		topSubjectShare: pct(topSubject[1], subjectTotal),
		normalizedEntropy: Math.round(normalizedEntropy * 1000) / 1000
	},
	families: Object.fromEntries(sorted(counts.families)),
	scenes: Object.fromEntries(sorted(counts.scenes)),
	compositions: Object.fromEntries(sorted(counts.compositions)),
	reasons: Object.fromEntries(sorted(counts.reasons)),
	subjects: Object.fromEntries(sorted(counts.subjects)),
	secondaries: Object.fromEntries(sorted(counts.secondaries)),
	topCombos: [...combos.values()].sort((a, b) => b.count - a.count).slice(0, 20),
	duplicateScenes,
	fallbacks: {
		count: fallbackCount,
		share: pct(fallbackCount, rows.length),
		posts: rows.filter((row) => row.reason.startsWith('category:') || row.reason.startsWith('fallback')).slice(0, 30)
	},
	missingHeroes: [...missingHero].sort(),
	subjectsWithoutHero,
	regression,
	warnings: Object.fromEntries(
		[...new Set(warnings.map((item) => item.type))].map((type) => {
			const list = warnings.filter((item) => item.type === type);
			return [type, { count: list.length, examples: list.slice(0, 10) }];
		})
	),
	warningCount: warnings.length,
	rows: has('rows') ? rows : undefined
};

// --- Porovnání s baseline -------------------------------------------------

let comparison = null;
if (baselinePath && baselinePath !== true) {
	const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
	comparison = {
		scenes: { before: baseline.distinct?.scenes ?? null, after: distinctScenes },
		subjects: { before: baseline.distinct?.subjects ?? null, after: distinctSubjects },
		structuralScenes: { before: baseline.distinct?.structuralScenes ?? null, after: distinctSignatures },
		fallbacks: { before: baseline.fallbacks?.count ?? null, after: fallbackCount },
		warnings: { before: baseline.warningCount ?? null, after: warnings.length },
		topSubjectShare: {
			before: baseline.concentration?.topSubjectShare ?? null,
			after: report.concentration.topSubjectShare
		},
		regressionPassed: {
			before: baseline.regression?.filter((item) => item.ok).length ?? null,
			after: regression.filter((item) => item.ok).length,
			total: regression.length
		}
	};
}

// --- Výstup ---------------------------------------------------------------

if (jsonPath && jsonPath !== true) {
	mkdirSync(dirname(jsonPath), { recursive: true });
	writeFileSync(jsonPath, `${JSON.stringify({ ...report, comparison }, null, 2)}\n`);
}
if (writeBaselinePath && writeBaselinePath !== true) {
	mkdirSync(dirname(writeBaselinePath), { recursive: true });
	writeFileSync(writeBaselinePath, `${JSON.stringify({ ...report, comparison: null }, null, 2)}\n`);
}

const lines = [];
lines.push(`Příspěvků: ${report.posts}`);
lines.push(
	`Scény: ${distinctScenes} · motivy: ${distinctSubjects} · strukturální scény: ${distinctSignatures} · kombinace: ${combos.size}`
);
lines.push(
	`Nejčastější motiv: ${topSubject[0]} (${topSubject[1]}×, ${report.concentration.topSubjectShare} %) · entropie ${report.concentration.normalizedEntropy}`
);
lines.push(`Fallbacky podle kategorie: ${fallbackCount} (${report.fallbacks.share} %)`);
lines.push(`Varování: ${warnings.length} (${Object.keys(report.warnings).join(', ') || 'žádná'})`);
lines.push(`Regresní případy: ${regression.filter((item) => item.ok).length}/${regression.length}`);
for (const item of regression) {
	lines.push(`  ${item.ok ? 'OK ' : 'FAIL'} ${item.id} ${item.label} → ${item.got?.scene ?? item.got?.family}/${item.got?.subject ?? '-'}`);
}
if (report.missingHeroes.length) lines.push(`Vybrané motivy bez kreslení: ${report.missingHeroes.join(', ')}`);
if (subjectsWithoutHero.length) lines.push(`Katalog bez kreslení: ${subjectsWithoutHero.join(', ')}`);
lines.push('');
lines.push('Scény:');
for (const [key, count] of topEntries(counts.scenes, topN)) lines.push(`  ${key}: ${count}`);
lines.push('Motivy:');
for (const [key, count] of topEntries(counts.subjects, topN)) lines.push(`  ${key}: ${count}`);
if (comparison) {
	lines.push('');
	lines.push('Proti baseline:');
	for (const [key, value] of Object.entries(comparison)) {
		lines.push(`  ${key}: ${JSON.stringify(value.before)} → ${JSON.stringify(value.after)}`);
	}
}

let filtered = rows;
if (focusScene) filtered = filtered.filter((row) => row.scene === focusScene);
if (focusFamily) filtered = filtered.filter((row) => row.family === focusFamily);
if (limit) filtered = filtered.slice(0, limit);
if (show && filtered.length) {
	lines.push('');
	lines.push(`Vybrané příspěvky (${filtered.length}):`);
	for (const row of filtered) {
		lines.push(`  ${row.id} [${row.scene}/${row.subject ?? '-'}${row.secondary ? '+' + row.secondary : ''}] ${row.title}`);
	}
}

const summary = lines.join('\n');
console.log(summary);

if (mdPath && mdPath !== true) {
	mkdirSync(dirname(mdPath), { recursive: true });
	const md = [
		'# Audit ilustrací',
		'',
		`Vygenerováno: ${report.generatedAt}`,
		'',
		'```',
		summary,
		'```',
		'',
		'## Varování podle typu',
		'',
		...Object.entries(report.warnings).flatMap(([type, data]) => [
			`### ${type} (${data.count})`,
			'',
			...data.examples.map((item) => `- ${item.id} — ${item.title}: ${item.detail}`),
			''
		]),
		'## Nejčastější kombinace scény a motivu',
		'',
		'| scéna | motiv | doplněk | počet | příklady |',
		'|---|---|---|---|---|',
		...report.topCombos.map(
			(combo) =>
				`| ${combo.scene} | ${combo.subject ?? '-'} | ${combo.secondary ?? '-'} | ${combo.count} | ${combo.ids.join(', ')} |`
		),
		''
	].join('\n');
	writeFileSync(mdPath, `${md}\n`);
}

process.exitCode = regression.every((item) => item.ok) ? 0 : 1;
