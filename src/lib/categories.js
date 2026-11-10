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
	'fyzika':      { label: 'Fyzika', color: 'var(--cat-fyzika)' },
	'chemie':      { label: 'Chemie', color: 'var(--cat-chemie)' },
	'vesmir':      { label: 'Vesmír', color: 'var(--cat-vesmir)' },
	'ekonomie':    { label: 'Ekonomie',    color: 'var(--cat-ekonomie)' },
	'psychologie': { label: 'Psychologie', color: 'var(--cat-psychologie)' },
	'kinematografie':       { label: 'Kinematografie',       color: 'var(--cat-kinematografie)' },
	'matematika':  { label: 'Matematika',  color: 'var(--cat-matematika)' },
	'technologie': { label: 'Technologie', color: 'var(--cat-technologie)' },
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
