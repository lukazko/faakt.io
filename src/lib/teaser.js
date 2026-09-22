/**
 * Teaser — krátký náhled textu postu odvozený z jeho existujícího HTML obsahu.
 * Datový model postů se nemění, teaser se počítá za běhu.
 */

const NAMED_ENTITIES = {
	nbsp: ' ',
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