/**
 * generate-posts.mjs
 * Generates interesting posts using Claude API — strictly real facts with verified sources.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-posts.mjs
 *   node scripts/generate-posts.mjs --count 30
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'static', 'data');
const DATA_FILE = path.join(DATA_DIR, 'posts.json');

// --- Configuration ---
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = 'claude-sonnet-5';
const DEFAULT_COUNT = 30;
const BATCH_SIZE = 10; // posts per API call

// Parse CLI args
const countArg = process.argv.find(a => a.startsWith('--count='));
const POSTS_TO_GENERATE = countArg ? parseInt(countArg.split('=')[1], 10) : DEFAULT_COUNT;

const CATEGORIES = ['historie', 'filozofie', 'veda', 'umeni', 'literatura', 'politika', 'fyzika', 'astronomie', 'zajimavost'];

function getPrompt(batchSize, existingPosts) {
	const existing = existingPosts.length > 0
		? `\n\nToto jsou názvy existujících příspěvků (vyhni se podobným tématům):\n${existingPosts.slice(-20).map(p => `- "${p.title}"`).join('\n')}`
		: '';

	return `Generuj ${batchSize} krátkých, zajímavých textových příspěvků v češtině na formát JSON pole.

Toto je APLIKACE PRO REÁLNÁ FAKTA — všechno musí být 100% PRAVDIVÉ a OVĚŘITELNÉ. ŽÁDNÉ výmysly, fabulace nebo přibližné informace. Každý příspěvek musí mít uvedené KONKRÉTNÍ ZDROJE (webové stránky, odborné články, publikace), kde si čtenář může fakt ověřit.

Každý příspěvek musí:
- být historické faktum, filozofická myšlenka, vědecká zajímavost, literární dílo, umělecká kuriozita, politická idea nebo astronomický/fyzikální koncept
- obsahovat jen OVĚŘENÉ INFORMACE — pokud si nejsi 100% jistý, nenapiš to
- uvádět ZDROJE — alespoň 2 na každý příspěvek, nejlépe Wikipedia, Britannica, odborné publikace
- být krátký a čtivý (2-4 věty, max 500 znaků)
- mít atraktivní titulek

Formát JSON:
[
  {
    "id": "automaticke-cislo",
    "title": "Stručný, chytlavý titulek (max 80 znaků)",
    "content": "Samotný text příspěvku (2-4 věty, fakticky přesný)",
    "category": "historie",
    "sources": [
      { "label": "Wikipedia — název článku", "url": "https://en.wikipedia.org/wiki/..." },
      { "label": "Název publikace/studie", "url": "https://..." }
    ]
  }
]

DŮLEŽITÉ:
- TITULKY: max 80 znaků, chytlavé, otázky nebo kontrasty fungují nejlépe
- OBSAH: 2-4 věty, čtivý styl, KAŽDÉ TVRZENÍ musí být dohledatelné ve zdrojích
- KATEGORIE: jen jeden z: ${CATEGORIES.join(', ')}
- ZDROJE: vždy 2-3 položky s label (název) a url (přímý odkaz na stránku s informací) — použij reálné existující URL
- MÍCHEJ kategorie rovnoměrně
- ŽÁDNÉ smyšlené citáty, přibližné letopočty, nebo „lidé říkají“ — vše musí být konkrétní a ověřitelné
- Nepoužívej # hashtagy ani formátování
- Piš přirozenou češtinou${existing}`;
}

async function callClaude(prompt) {
	if (!ANTHROPIC_API_KEY) {
		console.warn('⚠️  ANTHROPIC_API_KEY není nastaven. Používám fallback data.');
		return null;
	}

	const response = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': ANTHROPIC_API_KEY,
			'anthropic-version': '2023-06-01'
		},
		body: JSON.stringify({
			model: MODEL,
			max_tokens: 4000,
			temperature: 0.8,
			messages: [{ role: 'user', content: prompt }]
		})
	});

	if (!response.ok) {
		const err = await response.text();
		throw new Error(`API error (${response.status}): ${err}`);
	}

	const data = await response.json();
	const text = data.content[0].text;

	// Extract JSON from response (handle markdown code blocks)
	const jsonMatch = text.match(/\[[\s\S]*\]/);
	if (!jsonMatch) throw new Error('Nepodařilo se extrahovat JSON z odpovědi');
	return JSON.parse(jsonMatch[0]);
}

async function main() {
	console.log(`🔧 faakt.io — generátor příspěvků`);
	console.log(`   Cíl: ${POSTS_TO_GENERATE} příspěvků`);
	console.log(`   Dávkování: ${BATCH_SIZE} / volání API`);
	console.log('');

	// Load existing
	let existingPosts = [];
	if (fs.existsSync(DATA_FILE)) {
		existingPosts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
		console.log(`   Načteno ${existingPosts.length} existujících příspěvků`);
	}

	let allPosts = [...existingPosts];
	const needed = POSTS_TO_GENERATE;
	const batches = Math.ceil(needed / BATCH_SIZE);

	for (let i = 0; i < batches && allPosts.length < needed; i++) {
		const remaining = needed - allPosts.length;
		const batchSize = Math.min(remaining, BATCH_SIZE);

		const nextId = String(allPosts.length + 1).padStart(3, '0');
		console.log(`   Batch ${i + 1}/${batches} (${batchSize} příspěvků, next ID: ${nextId})`);

		const prompt = getPrompt(batchSize, allPosts);
		const result = await callClaude(prompt);

		if (result) {
			// Renumber IDs
			let counter = allPosts.length + 1;
			const batch = result.slice(0, batchSize).map(p => ({
				id: String(counter++).padStart(3, '0'),
				title: p.title,
				content: p.content,
				category: p.category,
				sources: p.sources || []
			}));

			allPosts = [...allPosts, ...batch];
			console.log(`   ✓ Přidáno ${batch.length} příspěvků`);
		} else {
			// Fallback: use mock data
			break;
		}
	}

	// Save
	fs.mkdirSync(DATA_DIR, { recursive: true });
	fs.writeFileSync(DATA_FILE, JSON.stringify(allPosts, null, '\t'), 'utf-8');
	console.log(`\n✅ Hotovo! ${allPosts.length} příspěvků uloženo do ${DATA_FILE}`);
}

main().catch(err => {
	console.error('❌ Chyba:', err.message);
	process.exit(1);
});