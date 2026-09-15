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

const CATEGORIES = ['historie', 'filozofie', 'veda', 'umeni', 'literatura', 'politika', 'fyzika', 'astronomie', 'zajimavost'];

const IS_OPENROUTER = API_KEY.startsWith('sk-or-');

function getPrompt(batchSize, existingPosts) {
	const existing = existingPosts.length > 0
		? `\n\nToto jsou názvy existujících příspěvků (vyhni se podobným tématům):\n${existingPosts.slice(-30).map(p => `- "${p.title}"`).join('\n')}`
		: '';

	return `Generuj ${batchSize} krátkých, zajímavých textových příspěvků v češtině na formát JSON pole.

Toto je APLIKACE PRO REÁLNÁ FAKTA — všechno musí být 100% PRAVDIVÉ a OVĚŘITELNÉ. ŽÁDNÉ výmysly, fabulace nebo přibližné informace. Každý příspěvek musí mít uvedené KONKRÉTNÍ ZDROJE (webové stránky, odborné články, publikace), kde si čtenář může fakt ověřit.

TÉMA TEDY BUDE: Myšlenky starověkých myslitelů a vysvětlení zajímavých konceptů.

ASPOŇ 70 % příspěvků v této dávce musí být věnováno starověkým myslitelům — ŘECKÝM, ŘÍMSKÝM, ČÍNSKÝM a INDICKÝM myslitelům:
- Sokrates, Platón, Aristotelés, Hérakleitos, Démokritos, Epikúros, Pythagoras
- Stoici: Zenón z Kitia, Chrysippos, Seneca, Epiktétos, Marcus Aurelius, Cicero
- Čína: Konfucius, Lao-c', Čuang-c', Sun-c'
- Indie: Buddha, různé sútry, Bhagavadgíta
- Dále starověcí vědci: Archimédés, Eukleidés, Eratosthenés, Hippokratés, Galénos

OBSAH STAROVĚKÝCH PŘÍSPĚVKŮ: nejen životopisné údaje, ale hlavně VYSVĚTLENÍ JEJICH MYŠLENEK — co přesně učili/dělali a proč je to dodnes relevantní.

ZBYTEK DÁVKY (max 30 %): vysvětlení zajímavých konceptů ve stylu aplikace Deepstash:
- konkrétní filozofický koncept nebo argument (např. teze o těle a duši, paradox hromady, lod' Thesea)
- kognitivní zkreslení a mentální modely (např. ikigai, FoMO, survivor bias)
- vědecký princip vysvětlený jednoduše (např. entropie, Dopplerův jev, fotosyntéza)
- šlo by to vysvětlit v jedné obrazovce tak, že si z toho čtenář odnese „aha moment“

Každý příspěvek musí:
- obsahovat jen OVĚŘENÉ INFORMACE — pokud si nejsi 100% jistý, nenapiš to
- uvádět ZDROJE — alespoň 2 na každý příspěvek, nejlépe Wikipedia, Britannica, Stanford Encyclopedia of Philosophy, odborné publikace
- být krátký a čtivý (2-4 věty, max 500 znaků)
- mít atraktivní titulek
- být chronologicky KONZISTENTNÍ — NIKDY neříkej, že něco bylo objeveno v jednom období a pak tvrd, že to objevil někdo z jiného období. PŘEZKOUMEJ: pokud píšeš o starověkém objevu, neříkej, že pochází ze středověku, a naopak.

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
- STAROVĚKÉ MYSLITELE: nejasné datace uváděj jako „kolem roku X př. n. l.“ — NIKDY přesně, pokud to není doložené
- ŽÁDNÉ smyšlené citáty, přibližné letopočty, nebo „lidé říkají“ — vše musí být konkrétní a ověřitelné
- CHRONOLOGIE: zkontroluj, že fakta z různých období nejsou smíchána. Např. Řek Řekům v „období starověku“ NIKDY nepoužíval středověké technologie a naopak.
- Nepoužívej # hashtagy ani formátování
- Piš přirozenou češtinou${existing}`;
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
	const text = data.content[0].text;

	// Extract JSON from response (handle markdown code blocks)
	const jsonMatch = text.match(/\[[\s\S]*\]/);
	if (!jsonMatch) throw new Error(`Nepodařilo se extrahovat JSON z odpovědi.\nOdpověď začíná: ${text.slice(0, 200)}`);
	return JSON.parse(jsonMatch[0]);
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
	const text = data.choices[0].message.content;

	// Extract JSON from response (handle markdown code blocks)
	const jsonMatch = text.match(/\[[\s\S]*\]/);
	if (!jsonMatch) {
		// Log response for debugging
		console.error(`   ❌ Chyba: JSON nenalezen. Obsah odpovědi (prvních 500 znaků):\n${text.slice(0, 500)}`);
		throw new Error('Nepodařilo se extrahovat JSON z odpovědi');
	}
	return JSON.parse(jsonMatch[0]);
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

	for (let i = 0; i < batches && allPosts.length < needed; i++) {
		const remaining = needed - allPosts.length;
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