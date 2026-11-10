/**
 * Prezentační vrstva postu — hook a takeaway.
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
		// Česká typografie — mezera před interpunkcí se v textech občas vyskytne
		.replace(/\s+([,.;:!?])/g, '$1')
		.trim();
}

/** Return the complete first paragraph, or unwrapped text. */
export function getHook(html) {
	if (!html) return '';
	const paragraphs = String(html).split(/<\/p>/i).map(htmlToText).filter(Boolean);
	return paragraphs[0] ?? htmlToText(html);
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
