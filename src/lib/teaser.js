/**
 * Prezentační vrstva postu — hook (teaser), text CTA a takeaway.
 * Vše se odvozuje deterministicky z existujícího HTML obsahu,
 * datový model postů se nemění a nic se nedogenerovává.
 */

const NAMED_ENTITIES = {	nbsp: ' ',
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'"
};

function decodeCodePoint(code) {
	return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' ';
}

function decodeEntity(code) {
	const lower = code.toLowerCase();
	if (NAMED_ENTITIES[lower] !== undefined) return NAMED_ENTITIES[lower];
	if (lower.startsWith('#x')) return decodeCodePoint(parseInt(lower.slice(2), 16));
	if (lower.startsWith('#')) return decodeCodePoint(parseInt(lower.slice(1), 10));
	return ' ';
}

/**
 * Převede HTML obsah postu na čistý text bez značek a entit.
 * @param {string} html
 */
export function htmlToText(html) {
	if (!html) return '';
	return String(html)
		.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
		.replace(/<[^>]*>/g, ' ')
		.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, code) => decodeEntity(code))
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Vrátí krátký teaser z obsahu postu — usekne na poslední celé slovo
 * a přidá výpustku. Když je text kratší, vrátí ho celý.
 * @param {string} html
 * @param {number} maxLength
 */
export function getTeaser(html, maxLength = 150) {
	const text = htmlToText(html);
	if (text.length <= maxLength) return text;

	const cut = text.slice(0, maxLength);
	const lastSpace = cut.lastIndexOf(' ');
	const body = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;

	return body.replace(/[\s,;:.!?–—-]+$/, '') + '…';
}

// --- Hook (teaser, který vzbudí zvědavost) ---

// Dělící bod je jen tam, kde po interpunkci následuje nová věta (velké písmeno).
// Jinak by se lámalo české datum — „Dne 23. května 1618 vtrhla…“.
const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9„"])/;

// Slova, po kterých text obvykle přinese pointu
const SURPRISE_WORDS = new Set([
	'paradox', 'zdánlivě', 'nemožné', 'nesmysl', 'omyl', 'naopak', 'málokdo', 'nikdo', 'přesto'
]);
const SURPRISE_STEMS = ['nečekan', 'překvap'];

// Užší množina pro rozpoznání paradoxu v hooku
const PARADOX_WORDS = new Set(['paradox', 'zdánlivě', 'nemožné', 'nesmysl', 'omyl']);
const PARADOX_STEMS = ['nečekan', 'překvap'];

// Slova, kterými často začíná otázka nebo pozvánka do textu
const HOOK_STARTERS = new Set([
	'co', 'proč', 'jak', 'kolik', 'kdo', 'kde', 'kdy', 'představte', 'představ'
]);

function words(text) {
	return text.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
}

function matchesWords(text, exactWords, stems) {
	return words(text).some(
		word => exactWords.has(word) || stems.some(stem => word.startsWith(stem))
	);
}

function hasSurprise(text) {
	return matchesWords(text, SURPRISE_WORDS, SURPRISE_STEMS);
}

function hasParadox(text) {
	return matchesWords(text, PARADOX_WORDS, PARADOX_STEMS);
}

/**
 * Rozseká obsah na odstavce (text bez značek) — zachovává pořadí.
 * @param {string} html
 */
export function getParagraphs(html) {
	if (!html) return [];
	return String(html)
		.split(/<\/p>/i)
		.map(chunk => htmlToText(chunk))
		.filter(Boolean);
}

/**
 * Ohodnotí větu jako hook. Vyšší skóre = lepší teaser.
 * Zvýhodňuje otázky, čísla a nečekaná slova, naopak trestá příliš krátké
 * nebo příliš dlouhé věty a upřednostňuje větu z úvodu textu.
 */
function scoreHook(sentence, index) {
	let score = 0;

	if (sentence.includes('?')) score += 4;
	if (/\d/.test(sentence)) score += 3;
	if (hasSurprise(sentence)) score += 3;

	const first = words(sentence)[0];
	if (first && HOOK_STARTERS.has(first)) score += 2;

	const length = sentence.length;
	if (length >= 40 && length <= 140) score += 2;
	else if (length < 40) score -= 2;
	else if (length > 200) score -= 2;

	// Čím dřív ve textu, tím přirozenější teaser
	if (index === 0) score += 3;
	else if (index === 1) score += 1;

	return score;
}

/**
 * Vybere hook z úvodu postu. Pointu (poslední odstavec a poslední větu)
 * nikdy nepoužije, aby teaser neprozradil rozuzlení.
 * @param {string} html
 * @param {number} maxLength
 */
export function getHook(html, maxLength = 150) {
	const paragraphs = getParagraphs(html);
	if (paragraphs.length === 0) return getTeaser(html, maxLength);

	// Kandidáti jen z úvodu — poslední odstavec (pointa) zůstává skrytý
	const source = paragraphs.slice(0, Math.max(1, paragraphs.length - 1)).slice(0, 2);
	const allSentences = htmlToText(html).split(SENTENCE_SPLIT);
	const lastSentence = allSentences.length > 1 ? allSentences[allSentences.length - 1].trim() : null;

	const sentences = source
		.flatMap(paragraph => paragraph.split(SENTENCE_SPLIT))
		.map(s => s.trim())
		.filter(Boolean)
		.filter(s => s !== lastSentence);

	if (sentences.length === 0) return getTeaser(html, maxLength);

	let best = sentences[0];
	let bestScore = -Infinity;
	sentences.forEach((sentence, index) => {
		const score = scoreHook(sentence, index);
		if (score > bestScore) {
			bestScore = score;
			best = sentence;
		}
	});

	if (best.length <= maxLength) return best;

	const cut = best.slice(0, maxLength);
	const lastSpace = cut.lastIndexOf(' ');
	const body = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
	return body.replace(/[\s,;:.!?–—-]+$/, '') + '…';
}

// --- CTA ---

// Text CTA podle žánru kategorie
const CTA_BY_CATEGORY = {
	'historie': 'Co se stalo?',
	'politika': 'Co se stalo?',
	'psychologie': 'Proč se to děje?',
	'filozofie': 'Co tím myslel?',
	'veda': 'Jak to funguje?',
	'fyzika': 'Jak to funguje?',
	'astronomie': 'Jak to funguje?',
	'matematika': 'Jak to funguje?',
	'ekonomie': 'Jak to funguje?',
	'pocitacove-vedy': 'Jak to funguje?',
	'literatura': 'Zjistit, co následovalo'
};

const CTA_FALLBACK = 'Zjistit víc';

/**
 * Vybere text CTA podle charakteru postu. Deterministicky, v tomto pořadí:
 * paradox v hooku → otázka v hooku → žánr kategorie → číslo v hooku → fallback.
 * @param {{ content: string, category: string }} post
 * @param {string} hook
 */
export function getCta(post, hook) {
	if (hasParadox(hook)) return 'Jak je to možné?';
	if (hook.includes('?')) return 'Zjistit proč';

	const byCategory = CTA_BY_CATEGORY[post.category];
	if (byCategory) return byCategory;

	if (/\d/.test(hook)) return 'Podívat se na vysvětlení';

	return CTA_FALLBACK;
}

// --- Takeaway ---

/**
 * Oddělí závěrečný odstavec jako takeaway.
 * Vrací `{ body, takeaway }` — když závěr nejde spolehlivě určit,
 * vrátí celý obsah v `body` a prázdný `takeaway`.
 * @param {string} html
 */
export function splitTakeaway(html) {
	if (!html) return { body: '', takeaway: '' };

	const openings = [...String(html).matchAll(/<p[^>]*>/gi)];
	if (openings.length < 2) return { body: html, takeaway: '' };

	const last = openings[openings.length - 1];
	const body = html.slice(0, last.index).trim();
	const takeaway = html.slice(last.index).trim();

	if (!/^<p[^>]*>[\s\S]*<\/p>$/i.test(takeaway)) return { body: html, takeaway: '' };

	const length = htmlToText(takeaway).length;
	if (length < 30 || length > 260) return { body: html, takeaway: '' };

	return { body, takeaway };
}