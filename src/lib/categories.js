/**
 * Centrální metadata kategorií — používá PostCard i FeedView.
 */
export const categoryMeta = {
	'historie':    { label: 'Historie',    color: 'var(--cat-historie)' },
	'filozofie':   { label: 'Filozofie',   color: 'var(--cat-filozofie)' },
	'biologie':    { label: 'Biologie',    color: 'var(--cat-biologie)' },
	'umeni':       { label: 'Umění',       color: 'var(--cat-umeni)' },
	'literatura':  { label: 'Literatura',  color: 'var(--cat-literatura)' },
	'spolecnost':  { label: 'Společnost', color: 'var(--cat-spolecnost)' },
	'fyzika':      { label: 'Fyzika a chemie', color: 'var(--cat-fyzika)' },
	'astronomie':  { label: 'Astronomie',  color: 'var(--cat-astronomie)' },
	'ekonomie':    { label: 'Ekonomie',    color: 'var(--cat-ekonomie)' },
	'psychologie': { label: 'Psychologie', color: 'var(--cat-psychologie)' },
	'filmy':       { label: 'Kinematografie',       color: 'var(--cat-filmy)' },
	'matematika':  { label: 'Matematika',  color: 'var(--cat-matematika)' },
	'pocitacove-vedy': { label: 'Technologie', color: 'var(--cat-pocitacove-vedy)' },
	'sport': { label: 'Sport', color: 'var(--cat-sport)' }
};

/** Seznam platných slugů kategorií. */
export const CATEGORIES = Object.keys(categoryMeta);

/**
 * Vrátí metadata kategorie; u neznámého slugu fallback na neutrální barvu.
 * @param {string} slug
 */
export function getCategoryMeta(slug) {
	return categoryMeta[slug] || { label: slug, color: 'var(--text-muted)' };
}

/**
 * Normalizuje slug z URL — vrací null, pokud kategorie neexistuje.
 * @param {string | null | undefined} slug
 */
export function normalizeCategory(slug) {
	if (!slug) return null;
	const clean = String(slug).trim().toLowerCase();
	return categoryMeta[clean] ? clean : null;
}
