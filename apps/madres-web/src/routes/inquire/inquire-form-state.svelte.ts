import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { computeEstimate } from '$lib/offering/estimator.js';
import type { Offering, Selections } from '$lib/offering/types.js';

/**
 * Runes-based reactive state for the `/inquire` form: customer info fields plus per-category
 * selections and the live client-side estimate derived from them. `SvelteMap`/`SvelteSet` are
 * required here (not plain `$state(new Map())`) so `.set()`/`.add()`/`.delete()` mutation is
 * itself reactive — see `AGENTS.md`.
 */
export class InquireFormState {
	name = $state('');
	email = $state('');
	zip = $state('');
	/** Optional free text ("Anything else?") — no validity getter: unvalidated, never affects
	 * `isValid`. */
	additionalNotes = $state('');
	touched = $state(false);

	private readonly offering: Offering;
	private readonly selectedByCategory = new SvelteMap<string, SvelteSet<string>>();

	constructor(offering: Offering) {
		this.offering = offering;
	}

	private selectionsFor(categoryKey: string): SvelteSet<string> {
		let set = this.selectedByCategory.get(categoryKey);
		if (!set) {
			set = new SvelteSet<string>();
			this.selectedByCategory.set(categoryKey, set);
		}
		return set;
	}

	isSelected(categoryKey: string, optionId: string): boolean {
		return this.selectedByCategory.get(categoryKey)?.has(optionId) ?? false;
	}

	/** For `SELECT`-rendered categories, which only ever hold at most one pick. */
	selectedOption(categoryKey: string): string | undefined {
		const set = this.selectedByCategory.get(categoryKey);
		if (!set || set.size === 0) return undefined;
		const [first] = set;
		return first;
	}

	selectionCount(categoryKey: string): number {
		return this.selectedByCategory.get(categoryKey)?.size ?? 0;
	}

	/** Radio-style: exactly one option selected at a time. */
	selectSingle(categoryKey: string, optionId: string): void {
		const set = this.selectionsFor(categoryKey);
		set.clear();
		set.add(optionId);
	}

	/** Checkbox-style: toggles, refusing to grow past `maxSelections`. */
	toggleMulti(categoryKey: string, optionId: string, maxSelections: number): void {
		const set = this.selectionsFor(categoryKey);
		if (set.has(optionId)) {
			set.delete(optionId);
		} else if (set.size < maxSelections) {
			set.add(optionId);
		}
	}

	get selections(): Selections {
		const result: Selections = {};
		for (const [categoryKey, set] of this.selectedByCategory) {
			result[categoryKey] = [...set];
		}
		return result;
	}

	/** UX-only preview — the server recomputes authoritatively from the submitted option ids. */
	get estimate() {
		return computeEstimate(this.offering, this.selections);
	}

	get nameValid(): boolean {
		return this.name.trim().length > 0;
	}

	get emailValid(): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
	}

	get zipValid(): boolean {
		return this.zip.trim().length > 0;
	}

	categoryValid(categoryKey: string): boolean {
		const category = this.offering.categories[categoryKey];
		if (!category) return true;
		const count = this.selectionCount(categoryKey);
		return count >= category.minSelections && count <= category.maxSelections;
	}

	/** Every category's min/max is satisfied — independent of `touched`, since this decides
	 * whether the live estimate means anything yet, not whether to show a submit error. */
	get selectionsComplete(): boolean {
		return Object.keys(this.offering.categories).every((key) => this.categoryValid(key));
	}

	get isValid(): boolean {
		return this.nameValid && this.emailValid && this.zipValid && this.selectionsComplete;
	}

	get nameError(): string | undefined {
		return this.touched && !this.nameValid ? 'Name is required' : undefined;
	}

	get emailError(): string | undefined {
		if (!this.touched) return undefined;
		if (!this.email.trim()) return 'Email is required';
		if (!this.emailValid) return 'Enter a valid email address';
		return undefined;
	}

	get zipError(): string | undefined {
		return this.touched && !this.zipValid ? 'ZIP code is required' : undefined;
	}

	/** A short, generic prompt for an incomplete category — never mentions the category by
	 * name (the group's own heading already does that) or any offering-specific wording. */
	categoryError(categoryKey: string): string | undefined {
		if (!this.touched) return undefined;
		const category = this.offering.categories[categoryKey];
		if (!category || this.categoryValid(categoryKey)) return undefined;
		if (category.minSelections === category.maxSelections && category.minSelections === 1) {
			return 'Choose one to continue';
		}
		return `Pick at least ${category.minSelections} to continue`;
	}
}
