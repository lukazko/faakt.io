import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { STYLE } from '../skills/faakt-illustrations/scripts/prompt.mjs';

const ids = Array.from({ length: 100 }, (_, index) => String(index + 1));
const posts = JSON.parse(readFileSync('static/data/posts.json', 'utf8'));
const manifestPath = 'static/illustrations-ai/manifest.json';
const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : [];

const selected = ids.map((id) => {
	const post = posts.find((item) => item.id === id);
	if (!post?.illustration) throw new Error(`Missing illustration metadata: ${id}`);
	const image = `/illustrations-ai/${id}.webp`;
	const existing = previous.find((item) => item.id === id);
	const promptHash = createHash('sha256')
		.update(`${STYLE}\nMetadata: ${JSON.stringify(post.illustration)}`)
		.digest('hex');
	return {
		...existing,
		id,
		title: post.title,
		content: post.content,
		category: post.category,
		illustration: post.illustration,
		image,
		promptHash: existing?.promptHash ?? promptHash,
		cached: existsSync(`static${image}`)
	};
});

const extra = previous.filter((item) => !ids.includes(item.id));
writeFileSync(manifestPath, `${JSON.stringify([...selected, ...extra], null, 2)}\n`);
console.log(`Prepared ${selected.length} entries; ${selected.filter((item) => item.cached).length} cached.`);
