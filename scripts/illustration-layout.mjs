import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Match the perceptible alpha threshold used by fit-image.py. Keep 10 source
// pixels above and below the motif (about 5 CSS pixels at mobile card width).
export function layoutFromAlpha(data, width, height, channels) {
	let top = height, bottom = 0;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (data[(y * width + x) * channels + channels - 1] >= 16) {
				top = Math.min(top, y);
				bottom = y + 1;
				break;
			}
		}
	}
	if (!bottom) return null;
	const unit = width / 640;
	const frameHeight = bottom - top + 20 * unit;
	// Leave nearly full-height artwork alone; only remove a meaningful surplus.
	if (height - bottom <= 20 * unit || height - frameHeight < 20 * unit) return null;
	return {
		height: frameHeight / unit,
		canvasHeight: height / unit,
		center: ((top + bottom) / 2 / height) * 100
	};
}

export async function scanIllustrations(directory, cache = new Map()) {
	const layouts = {};
	const files = (await readdir(directory)).filter(name => /^[1-9]\d*\.webp$/.test(name));
	for (const name of files.sort((a, b) => parseInt(a) - parseInt(b))) {
		const file = path.join(directory, name);
		const info = await stat(file);
		const key = `${info.mtimeMs}:${info.size}`;
		let entry = cache.get(file);
		if (entry?.key !== key) {
			// Decode a buffer so libvips cannot retain a file handle and prevent
			// replacing an illustration on Windows while the dev server is running.
			const { data, info: image } = await sharp(await readFile(file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
			entry = { key, layout: layoutFromAlpha(data, image.width, image.height, image.channels) };
			cache.set(file, entry);
		}
		if (entry.layout) layouts[path.basename(name, '.webp')] = entry.layout;
	}
	return layouts;
}

export function illustrationLayoutPlugin() {
	const publicId = 'virtual:illustration-layout';
	const resolvedId = '\0' + publicId;
	const cache = new Map();
	let directory;
	return {
		name: 'illustration-layout',
		configResolved(config) { directory = path.resolve(config.root, 'static/illustrations-ai'); },
		resolveId(id) { if (id === publicId) return resolvedId; },
		async load(id) {
			if (id !== resolvedId) return;
			const layouts = await scanIllustrations(directory, cache);
			return `export const illustrationLayouts = ${JSON.stringify(layouts)};`;
		},
		configureServer(server) {
			// New and replaced illustrations update a running dev server as well.
			server.watcher.on('all', (event, file) => {
				if (!['add', 'change', 'unlink'].includes(event) || path.dirname(path.resolve(file)) !== directory || !/^[1-9]\d*\.webp$/.test(path.basename(file))) return;
				cache.delete(path.resolve(file));
				const module = server.moduleGraph.getModuleById(resolvedId);
				if (module) server.moduleGraph.invalidateModule(module);
				server.ws.send({ type: 'full-reload' });
			});
		}
	};
}
