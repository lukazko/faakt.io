/**
 * Zpřesnění předmětu podle konkrétních slov v textu.
 *
 * Analýza umí rozlišit jen tolik předmětů, kolik jich má metadata. Některé
 * texty ale mluví o konkrétní věci, kterou obecný motiv jen naznačí: dalekohled
 * u příspěvku o kometě, hodiny u entropie, sloup u chrámu. Tabulka níže je
 * záměrně krátká a používá se **jen tehdy**, když je původní motiv obecný.
 * Konkrétní předmět z analýzy se nikdy nepřepisuje.
 */

import { normalizeText } from '../analysis/analyze.js';

const REFINEMENTS = [
	{
		subject: 'blackhole',
		from: ['telescope', 'planet', 'star', 'sun'],
		test: /cern\w* dir|horizont\w* udalost|singularit/
	},
	{
		subject: 'comet',
		from: ['telescope', 'planet', 'star', 'moon'],
		test: /komet/
	},
	{
		subject: 'galaxy',
		from: ['telescope', 'planet', 'star'],
		test: /galaxi|mlec\w* drah|vesmirn\w* vlak/
	},
	{
		subject: 'rocket',
		from: ['telescope', 'planet', 'flask'],
		test: /raket|sond|obezn\w* drah/
	},
	{
		subject: 'moon',
		from: ['telescope', 'planet', 'sun'],
		test: /mesic|zatmeni/
	},
	{
		subject: 'entropy',
		from: ['clock'],
		test: /entropi|termodynam/
	},
	{
		subject: 'throne',
		from: ['crown'],
		test: /trun/
	},
	{
		subject: 'temple',
		from: ['column', 'stele'],
		test: /chram|katedral/
	},
	{
		subject: 'stele',
		from: ['column'],
		test: /stel|rosettsk|hieroglyf/
	},
	{
		subject: 'dna',
		from: ['flask', 'microscope'],
		test: /dna|sroubovic|helix/
	},
	{
		subject: 'ruin',
		from: ['column', 'amphora'],
		test: /zricen|ruin|trosk/
	},
	{
		subject: 'wall',
		from: ['amphora', 'column', 'map'],
		test: /(^| )(zed|zdi|zedi|barier\w*|hranic\w*)( |$)/
	},
	{
		subject: 'gear',
		from: ['sword'],
		test: /stroj|pocitac|enigm/
	},
	{
		subject: 'crowd',
		from: ['amphora'],
		test: /armad|vojak|bojovnik|legi|pluk/
	},
	{
		subject: 'knot',
		from: ['infinity'],
		test: /uzel|gordick|smyck/
	}
];

/**
 * Vrátí konkrétnější motiv, pokud ho text ospravedlňuje.
 * @param {string | null} subject už přeložený klíč motivu
 * @param {{title?: string, content?: string} | null | undefined} post
 * @returns {string | null}
 */
export function refineSubject(subject, post) {
	if (!subject || !post) return subject;
	const text = normalizeText(`${post.title ?? ''} ${post.content ?? ''}`);
	for (const rule of REFINEMENTS) {
		if (rule.from.includes(subject) && rule.test.test(text)) return rule.subject;
	}
	return subject;
}

export { REFINEMENTS };
