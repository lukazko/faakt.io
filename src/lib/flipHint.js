const STORAGE_KEY = 'faakt:flip-hint-seen';
let cardFlipped = false;

// Each active card can show a hint until the first actual flip.
export function shouldShowFlipHint() {
	if (cardFlipped) return false;
	try {
		if (window.sessionStorage.getItem(STORAGE_KEY)) return false;
	} catch {
		// Private browsing or blocked storage must not interrupt card interaction.
	}
	return true;
}

export function markCardFlipped() {
	cardFlipped = true;
	try {
		window.sessionStorage.setItem(STORAGE_KEY, '1');
	} catch {
		// The in-memory flag still suppresses hints when storage is blocked.
	}
}
