import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { CARD_SURFACE_FALLBACK, STYLE } from './prompt.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');
function option(key) {
  const index = args.indexOf(key);
  if (index < 0 || !args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`Required: ${key}`);
  return args[index + 1];
}
try {
  const root = resolve(option('--root'));
  const nextMode = args.includes('--next');
  if (nextMode === args.includes('--ids')) throw new Error('Provide exactly one of --ids or --next.');
  if (nextMode && force) throw new Error('--force cannot be combined with --next.');
  const countText = nextMode ? option('--next') : null;
  if (nextMode && (!/^[1-9]\d*$/.test(countText) || !Number.isSafeInteger(Number(countText)))) throw new Error('--next must be a positive safe integer.');
  const count = nextMode ? Number(countText) : null;
  let ids = nextMode ? [] : [...new Set(option('--ids').split(',').map(id => id.trim()).filter(Boolean))];
  if (!nextMode && (!ids.length || ids.some(id => !/^[a-zA-Z0-9_-]+$/.test(id)))) throw new Error('Provide explicit safe post IDs.');
  const posts = JSON.parse(readFileSync(join(root, 'static/data/posts.json'), 'utf8'));
  const manifestPath = join(root, 'static/illustrations-ai/manifest.json');
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : [];
  const entries = Array.isArray(manifest) ? manifest : Object.values(manifest);
  function cachedPath(id) {
    const registered = entries.find(p => p.id === id)?.image;
    const paths = ['webp', 'png'].map(ext => join(root, 'static/illustrations-ai', `${id}.${ext}`));
    if (typeof registered === 'string' && registered.startsWith('/illustrations-ai/') && !registered.includes('..')) paths.push(join(root, 'static', registered.slice(1)));
    return paths.find(path => existsSync(path));
  }
  let remaining = null;
  if (nextMode) {
    const missing = [...posts].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true })).filter(post => !cachedPath(post.id));
    remaining = missing.length;
    ids = missing.slice(0, count).map(post => post.id);
  }
  const jobs = [], cached = [];
  for (const id of ids) {
    const post = posts.find(p => p.id === id);
    if (!post) throw new Error(`Unknown post: ${id}`);
    const existing = cachedPath(id);
    if (existing && !force) { cached.push({ id, path: existing }); continue; }
    const m = post.illustration;
    if (!m?.concept || !m.primary_subject) throw new Error(`Missing illustration metadata: ${id}`);
    const metadata = {};
    for (const key of ['concept', 'primary_subject', 'secondary_subjects', 'visual_keywords', 'composition_hints', 'scene_type', 'mood', 'palette']) {
      if (m[key] != null) metadata[key] = Array.isArray(m[key]) ? [...new Set(m[key])] : m[key];
    }
    const subjects = [m.primary_subject, ...(m.secondary_subjects || [])];
    if (metadata.visual_keywords) metadata.visual_keywords = metadata.visual_keywords.filter(k => !subjects.includes(k) && !['material_texture', 'architectural_detail'].includes(k));
    const prompt = `${STYLE}\nMetadata: ${JSON.stringify(metadata)}`;
    jobs.push({
      id,
      ...(nextMode ? { title: post.title, content: post.content } : {}),
      image: `/illustrations-ai/${id}.webp`,
      replaces: existing ?? null,
      prompt,
      background: {
        preferred: 'transparent',
        opaqueFallback: CARD_SURFACE_FALLBACK,
        forbidden: ['black-gradient', 'dark-gradient', 'approximate-black']
      },
      promptHash: createHash('sha256').update(prompt).digest('hex'),
      metadataHash: createHash('sha256').update(JSON.stringify(m)).digest('hex')
    });
  }
  console.log(JSON.stringify({ ...(nextMode ? { requested: count, available: remaining, selected: ids, remaining: remaining - ids.length } : {}), cached, jobs }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
