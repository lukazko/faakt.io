/** Accept historical zero-padded links; keep invalid values unmatched. */
export function normalizePostId(id) {
	return typeof id === 'string' ? id.replace(/^0+(?=\d+$)/, '') : id;
}

/** Static aliases for the original three-digit URLs. */
export function postRouteEntries(posts) {
	return posts.flatMap(({ id }) => {
		const legacy = id.padStart(3, '0');
		return legacy === id ? [{ id }] : [{ id }, { id: legacy }];
	});
}
