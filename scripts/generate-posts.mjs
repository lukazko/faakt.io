/**
 * generate-posts.mjs
 * Generates interesting posts using Claude API — strictly real facts with verified sources.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-posts.mjs --count 100
 *   ANTHROPIC_API_KEY=sk-or-... node scripts/generate-posts.mjs --count 100
 *
 * Supports both Anthropic (sk-ant-) and OpenRouter (sk-or-) API keys.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'static', 'data');
const DATA_FILE = path.join(DATA_DIR, 'posts.json');

// --- Configuration ---
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const DEFAULT_COUNT = 30;
const BATCH_SIZE = 10;

// Parse CLI args: supports --count N and --count=N
const countIndex = process.argv.indexOf('--count');
const countVal = countIndex !== -1 ? parseInt(process.argv[countIndex + 1], 10) : null;
const countEq = process.argv.find(a => a.startsWith('--count='));
const POSTS_TO_GENERATE = countVal || (countEq ? parseInt(countEq.split('=')[1], 10) : DEFAULT_COUNT);

const CATEGORIES = ['historie', 'filozofie', 'veda', 'umeni', 'literatura', 'politika', 'fyzika', 'astronomie', 'zajimavost', 'ekonomie', 'psychologie', 'filmy', 'matematika', 'pocitacove-vedy'];

const IS_OPENROUTER = API_KEY.startsWith('sk-or-');

function getPrompt(batchSize, existingPosts) {
	const existing = existingPosts.length > 0
		? `\n\nToto jsou názvy existujících příspěvků (vyhni se podobným tématům):\n${existingPosts.slice(-30).map(p => `- "${p.title}"`).join('\n')}`
		: '';

	return `Generuj ${batchSize} krátkých, zajímavých textových příspěvků v češtině na formát JSON pole.

	Toto je APLIKACE PRO REÁLNÁ FAKTA — všechno musí být 100% PRAVDIVÉ a OVĚŘITELNÉ. ŽÁDNÉ výmysly, fabulace nebo přibližné informace. Každý příspěvek musí mít uvedené KONKRÉTNÍ ZDROJE.

TÉMATA napříč všemi 14 kategoriemi:

- Starověcí myslitelé (~30 %): Řekové, Římané, Číňané, Indové — vysvětli jejich učení a proč je to dodnes relevantní. (Sokrates, Platón, Aristotelés, Hérakleitos, Démokritos, Epikúros, Pythagoras, stoici, Konfucius, Lao-c', Buddha, Archimédés ad.) Osobnost použij jen tehdy, když je pro hlavní myšlenku skutečně důležitá.
- Historie: události, osobnosti, zajímavosti z historie
- Ekonomie: ekonomické koncepty, Adam Smith, Keynes, nabídka a poptávka, inflace
- Psychologie: kognitivní zkreslení, experimenty, Jung, Freud, mentální modely
- Věda: přírodní vědy, biologie, chemie, objevy
- Umění: malířství, sochařství, architektura, hudba
- Fyzika: fyzikální principy, zákony, teorie
- Politika: politické systémy, události, osobnosti
- Astronomie: vesmír, planety, hvězdy, objevy
- Literatura: knihy, spisovatelé, literární díla
- Filmy: filmové zajímavosti, režiséři, filmová historie
- Matematika: matematické koncepty, teorémy, zajímavé problémy, matematici
- Počítačové vědy: informatika, algoritmy, programování, historie výpočetní techniky
- Zajímavosti: cokoliv překvapivého, netušeného

---

STRUKTURA (DOPORUČENÁ, ne povinná):

Příspěvky by měly být čtivé a mít spád. Inspiruj se touto kostrou, ale přizpůsob ji tématu:

1. HOOK — začni otázkou, paradoxem nebo překvapivým tvrzením
2. Ukaž problém, který čtenář zná z vlastního života
3. Přijď s hlavní myšlenkou nebo citátem myslitele
4. Vysvětli ji na konkrétních příkladech
5. Ukaž kontrast nebo dvě možnosti
6. Závěr: jedna zapamatovatelná věta. Otázku na závěr přidej JEN pokud přináší dilema, paradox nebo něco k zamyšlení. U faktických zajímavostí (historická fakta, vědecké objevy) ji nedávej.

DŮLEŽITÉ: tahle struktura je IDEÁL, ne šablona. Historická fakta, vědecké objevy a zajímavosti se píšou vlastním tempem — krátký úvod, vysvětlení, pointa. Ne každý příspěvek musí mít všechny části.

PRAVIDLA:
- 1 příspěvek = 1 myšlenka
- Nezpracovávej lidi jako životopisné medailonky. Biografické údaje (narození, studium, kariéra, rodina, úmrtí) uváděj jen tehdy, když přímo vysvětlují hlavní myšlenku; jinak se soustřeď na samotný princip, objev, dílo nebo událost.
- Titulek nemusí obsahovat jméno člověka. U osobností dávej přednost titulku postavenému na jejich myšlence, objevu, díle nebo důsledku, například „Proč se naše rozhodnutí řídí prvním číslem, které uslyšíme“ místo titulku se jménem autora.
- Piš jednoduché HTML: <p> pro odstavce, občas <strong> pro důraz, <em> pro kurzívu
- Krátké odstavce (1-3 věty), přirozená čeština
- Žádné nadpisy, žádné # hashtagy, žádné speciální CSS třídy v HTML
- Délka: 500-1200 znaků
- Důsledně dbej na správnou češtinu — gramatiku, skloňování, shodu přísudku s podmětem, interpunkci. Žádné hovorové výrazy ("dobrej", "říkáš"). Text musí být čtivý a gramaticky bezchybný.
- OVĚŘENÉ INFORMACE, 2-3 zdroje, chronologická konzistence
- Starověké myslitele datuj jako "kolem roku X př. n. l."

Formát JSON:
[
  {
    "id": "automaticke-cislo",
    "title": "Titulek (max 80 znaků)",
    "content": "HTML obsah příspěvku",
    "category": "filozofie",
    "sources": [
      { "label": "Wikipedia", "url": "https://..." }
    ]
  }
]

KATEGORIE: jen jeden z: ${CATEGORIES.join(', ')}
ZDROJE: vždy 2-3, reálná URL
STAROVĚKÉ MYSLITELE: "kolem roku X př. n. l." — NIKDY přesně, pokud není doloženo
ŽÁDNÉ smyšlené citáty${existing}`;
}

/**
 * Extract JSON array from text response, handling markdown code fences, null/edge cases,
 * and truncated JSON (incomplete last object from OpenRouter).
 */
function extractJsonArray(text) {
	if (!text || typeof text !== 'string') {
		throw new Error('Odpověď API je prázdná nebo null');
	}
	// Strip markdown code fences (backtick triplets around json)
	let cleaned = text.replace(/```json?\s*\n?/gi, '').replace(/```/g, '').trim();
	// Find the first [ and last ]
	const start = cleaned.indexOf('[');
	const end = cleaned.lastIndexOf(']');
	if (start === -1 || end === -1 || end <= start) {
		throw new Error('JSON pole nenalezeno v odpovědi.\nObsah (prvních 500 znaků):\n' + text.slice(0, 500));
	}
	const jsonStr = cleaned.slice(start, end + 1);
	try {
		return JSON.parse(jsonStr);
	} catch (e) {
		// If truncated (Unexpected end of JSON input), try to recover the last complete object
		if (e.message.includes('Unexpected end') || e.message.includes('unexpected end')) {
			// Find the last complete object by scanning backwards
			let endIdx = cleaned.lastIndexOf('}');
			if (endIdx > start) {
				// Try closing at the last complete object
				const partialJson = cleaned.slice(start, endIdx + 1) + ']';
				try {
					const result = JSON.parse(partialJson);
					if (Array.isArray(result) && result.length > 0) {
						console.log(`   ⚠️  JSON byl useknutý, nalezeno ${result.length} platných objektů`);
						return result;
					}
				} catch (_) {}
				// Try stepping back object by object
				let searchFrom = endIdx;
				for (let attempt = 0; attempt < 20; attempt++) {
					const prevBrace = cleaned.lastIndexOf('}', searchFrom - 1);
					if (prevBrace < start) break;
					const tryJson = cleaned.slice(start, prevBrace + 1) + ']';
					try {
						const result = JSON.parse(tryJson);
						if (Array.isArray(result) && result.length > 0) {
							console.log(`   ⚠️  JSON useknutý, nalezeno ${result.length} objektů (po opravě)`);
							return result;
						}
					} catch (_) {}
					searchFrom = prevBrace;
				}
			}
		}
		throw new Error('Neplatný JSON: ' + e.message + '\nObsah (prvních 500 znaků):\n' + text.slice(0, 500));
	}
}

async function callClaude(prompt) {
	if (!API_KEY) {
		console.warn('⚠️  ANTHROPIC_API_KEY není nastaven. Používám fallback data.');
		return null;
	}

	if (IS_OPENROUTER) {
		return await callOpenRouter(prompt);
	} else {
		return await callAnthropic(prompt);
	}
}

/**
 * Call Anthropic API directly.
 */
async function callAnthropic(prompt) {
	const response = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': API_KEY,
			'anthropic-version': '2023-06-01'
		},
		body: JSON.stringify({
			model: 'claude-sonnet-5',
			max_tokens: 8000,
			temperature: 0.8,
			messages: [{ role: 'user', content: prompt }]
		})
	});

	if (!response.ok) {
		const err = await response.text();
		throw new Error(`Anthropic API error (${response.status}): ${err}`);
	}

	const data = await response.json();
	const text = data.content?.[0]?.text;
	return extractJsonArray(text);
}

/**
 * Call Claude via OpenRouter API.
 */
async function callOpenRouter(prompt) {
	const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${API_KEY}`,
			'HTTP-Referer': 'https://github.com/lukazko/faakt.io'
		},
		body: JSON.stringify({
			model: 'anthropic/claude-sonnet-5',
			max_tokens: 8000,
			temperature: 0.8,
			messages: [{ role: 'user', content: prompt }]
		})
	});

	if (!response.ok) {
		const err = await response.text();
		throw new Error(`OpenRouter API error (${response.status}): ${err}`);
	}

	const data = await response.json();
	const text = data.choices?.[0]?.message?.content;
	return extractJsonArray(text);
}

async function main() {
	console.log(`🔧 faakt.io — generátor příspěvků`);
	console.log(`   Cíl: ${POSTS_TO_GENERATE} příspěvků`);
	console.log(`   Dávkování: ${BATCH_SIZE} / volání API`);
	console.log(`   API: ${IS_OPENROUTER ? 'OpenRouter' : 'Anthropic'} (${API_KEY.slice(0, 12)}...)`);
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
		let generated = 0;

	for (let i = 0; i < batches && generated < needed; i++) {
		const remaining = needed - generated;
		const batchSize = Math.min(remaining, BATCH_SIZE);

		const nextId = String(allPosts.length + 1).padStart(3, '0');
		console.log(`   Batch ${i + 1}/${batches} (${batchSize} příspěvků, next ID: ${nextId})`);

		const prompt = getPrompt(batchSize, allPosts);
		let result = null;
		try {
			result = await callClaude(prompt);
		} catch (err) {
			console.log(`   ⚠️  Chyba batch: ${err.message}`);
			console.log(`      Zkouším batch znovu...`);
			// one retry
			try {
				await new Promise(r => setTimeout(r, 3000));
				result = await callClaude(prompt);
			} catch (err2) {
				console.log(`      ❌ Batch se nezdařil ani na 2. pokus, přeskočeno.`);
				continue;
			}
		}

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
				generated += batch.length;
			console.log(`   ✓ Přidáno ${batch.length} příspěvků`);

			// Save after each batch so partial progress isn't lost
			fs.writeFileSync(DATA_FILE, JSON.stringify(allPosts, null, '\t'), 'utf-8');
			console.log(`   💾 Uloženo (${allPosts.length} celkem)`);
		} else {
			break;
		}
	}

	console.log(`\n✅ Hotovo! ${allPosts.length} příspěvků v ${DATA_FILE}`);
}

main().catch(err => {
	console.error('❌ Chyba:', err.message);
	process.exit(1);
});