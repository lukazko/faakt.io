/**
 * Generate article drafts from an editorially reviewed semantic plan.
 * No direct production writes and no title-only duplicate check.
 *
 * ANTHROPIC_API_KEY=... node scripts/generate-posts.mjs --plan reports/plan.json
 * Optional: --output reports/drafts.json --count N --category filozofie
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CATEGORIES } from '../src/lib/categories.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KNOWLEDGE_TOOL = path.join(ROOT, 'scripts/post-knowledge.py');
const BATCH_SIZE = 5;

export function canonical(value) {
	if (Array.isArray(value)) return value.map(canonical);
	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
	}
	return value;
}

export function getPrompt(proposals, tags) {
	const instructions = fs.readFileSync(path.join(ROOT, 'docs/generovani-postu-handoff.md'), 'utf8');
	const used = new Set(proposals.flatMap(p => p.knowledge.tags));
	const definitions = tags.filter(t => used.has(t.id));
	return instructions + '\n\nSCHVÁLENÝ PLÁN PRO TUTO DÁVKU:\n'
		+ JSON.stringify(proposals.map(({ id, category, knowledge }) => ({ id, category, knowledge })))
		+ '\nPOUŽITÉ TAGY:\n' + JSON.stringify(definitions)
		+ '\nVrať přesně ' + proposals.length + ' příspěvků podle plánu, ve stejném pořadí. '
		+ 'Zachovej ID, kategorii a význam pointy. Nevymýšlej náhradní témata. '
		+ 'knowledge z plánu vlož beze změny do pracovního návrhu; obsah musí odpovídat pointě. '
		+ 'Výsledek je pracovní návrh před kontrolou zdrojů a hotových textů, nikoli souhlas se zápisem do databáze.';
}

export function extractJsonArray(text) {
	if (typeof text !== 'string') throw new Error('API returned no text');
	const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
	const parsed = JSON.parse(cleaned);
	if (!Array.isArray(parsed)) throw new Error('API must return a complete JSON array');
	return parsed;
}

export function normalizeDrafts(result, proposals) {
	if (!Array.isArray(result) || result.length !== proposals.length) {
		throw new Error('Incomplete batch; keep the output out of production');
	}
	return result.map((post, index) => {
		const plan = proposals[index];
		if (post.id !== plan.id || post.category !== plan.category) throw new Error('Draft differs from planned ID/category');
		if (JSON.stringify(canonical(post.knowledge)) !== JSON.stringify(canonical(plan.knowledge))) {
			throw new Error('Draft changed approved knowledge metadata');
		}
		if (!CATEGORIES.includes(post.category) || typeof post.title !== 'string' || post.title.length > 80
			|| typeof post.content !== 'string' || post.content.length < 500 || post.content.length > 1200
			|| !Array.isArray(post.sources) || post.sources.length < 2 || post.sources.length > 3
			|| !post.illustration || typeof post.illustration !== 'object') {
			throw new Error('Draft is missing required article fields');
		}
		return {
			id: post.id, title: post.title, content: post.content, category: post.category,
			sources: post.sources, illustration: post.illustration, knowledge: plan.knowledge
		};
	});
}

function option(name) {
	const args = process.argv.slice(2);
	const at = args.indexOf(name);
	if (at >= 0) {
		if (!args[at + 1] || args[at + 1].startsWith('--')) throw new Error('Missing value for ' + name);
		return args[at + 1];
	}
	const equals = args.find(a => a.startsWith(name + '='));
	return equals?.slice(name.length + 1);
}

function checkPlan(planPath) {
	const result = spawnSync('python', [KNOWLEDGE_TOOL, 'check-plan', '--plan', planPath], {
		cwd: ROOT, encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' }
	});
	if (result.error) throw result.error;
	if (result.status !== 0) throw new Error((result.stderr || result.stdout).trim());
}

async function callProvider(prompt, key) {
	const openrouter = key.startsWith('sk-or-');
	const response = await fetch(openrouter
		? 'https://openrouter.ai/api/v1/chat/completions'
		: 'https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: openrouter
			? { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key,
				'HTTP-Referer': 'https://github.com/lukazko/faakt.io' }
			: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
		body: JSON.stringify({
			model: openrouter ? 'anthropic/claude-sonnet-5' : 'claude-sonnet-5',
			max_tokens: 8000, temperature: 0.8,
			messages: [{ role: 'user', content: prompt }]
		})
	});
	if (!response.ok) throw new Error('Generation API returned HTTP ' + response.status);
	const data = await response.json();
	return extractJsonArray(openrouter ? data.choices?.[0]?.message?.content
		: data.content?.filter(c => c.type === 'text').map(c => c.text).join(''));
}

async function main() {
	const planOption = option('--plan');
	if (!planOption) throw new Error('Required: --plan reports/plan.json; see docs/post-knowledge.md');
	const planPath = path.resolve(planOption);
	checkPlan(planPath);
	const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
	const category = option('--category');
	if (category && (!CATEGORIES.includes(category) || plan.proposals.some(p => p.category !== category))) {
		throw new Error('Requested category does not match the reviewed plan');
	}
	const count = option('--count');
	if (count && Number(count) !== plan.proposals.length) throw new Error('Count must match the whole reviewed plan');
	const key = process.env.ANTHROPIC_API_KEY || '';
	if (!key) throw new Error('ANTHROPIC_API_KEY missing; no API call or fallback write performed');
	const output = path.resolve(option('--output') || path.join(ROOT, 'reports',
		'generated-posts-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json'));
	const relative = path.relative(path.join(ROOT, 'reports'), output);
	if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || fs.existsSync(output)) {
		throw new Error('Use a new output file inside reports/');
	}
	const tags = JSON.parse(fs.readFileSync(path.join(ROOT, 'static/data/tags.json'), 'utf8')).tags;
	const drafts = [];
	for (let i = 0; i < plan.proposals.length; i += BATCH_SIZE) {
		checkPlan(planPath);
		const proposals = plan.proposals.slice(i, i + BATCH_SIZE);
		const result = await callProvider(getPrompt(proposals, tags), key);
		drafts.push(...normalizeDrafts(result, proposals));
		fs.mkdirSync(path.dirname(output), { recursive: true });
		fs.writeFileSync(output, JSON.stringify(drafts, null, 2) + '\n', 'utf8');
		console.log('Saved ' + drafts.length + ' drafts to ' + output);
	}
	console.log('Run post-knowledge.py check-drafts, review final texts and sources, then use guarded append.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
