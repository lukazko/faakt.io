const STORAGE_KEY = 'faakt:flip-hint-seen';
let consumed = false;

// Keep the hint once-only within this visit even when storage is unavailable.
export function consumeFlipHint() {
	if (consumed) return false;
	consumed = true;
	try {
		if (window.sessionStorage.getItem(STORAGE_KEY)) return false;
	} catch {
		// Private browsing or blocked storage must not interrupt card interaction.
	}
	return true;
}

export function markCardFlipped() {
	consumed = true;
	try {
		window.sessionStorage.setItem(STORAGE_KEY, '1');
	} catch {
		// The in-memory flag still suppresses hints when storage is blocked.
	}
}
