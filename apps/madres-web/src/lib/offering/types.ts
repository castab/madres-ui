/** A pricing document is never a "quote" — it drives a preliminary, staff-confirmed estimate. */
export type PricingType = 'NONE' | 'PER_EVENT' | 'PER_GUEST';

export type IncludedSelectionStrategy = 'HIGHEST_PRICED_SELECTED';

/** How a category's options should be presented — config-driven so the same generic renderer
 * can vary the widget per category without a source change. `SELECT` is a single native
 * dropdown (implies exactly one pick); `CHECKBOX_LIST` is a card-wrapped list of checkboxes. */
export type CategoryInputType = 'SELECT' | 'CHECKBOX_LIST';

export type SelectionPricing = {
	includedSelections: number;
	includedSelectionStrategy: IncludedSelectionStrategy;
	chargeRemainingSelections: boolean;
};

export type GuestFacts = {
	minimumGuests: number;
	/** `null` for an open-ended top band (e.g. "250+") — there's no upper bound to range
	 * against, so the estimate falls back to a single value at `minimumGuests`. */
	maximumGuests: number | null;
	isMinimum: boolean;
};

export type Option<Facts = unknown> = {
	id: string;
	label: string;
	description?: string;
	priceCents: number;
	facts?: Facts;
};

export type Category<Facts = unknown> = {
	id: string;
	label: string;
	minSelections: number;
	maxSelections: number;
	pricingType: PricingType;
	inputType: CategoryInputType;
	selectionPricing?: SelectionPricing;
	options: Option<Facts>[];
};

export type BaseCharge = {
	id: string;
	label: string;
	pricingType: PricingType;
	priceCents: number;
};

export type IncludedItem = {
	id: string;
	label: string;
};

export type StaffQuotedExtra = {
	id: string;
	label: string;
};

/** Currently the only supported kind of free-text field — a multi-line, unpriced input that
 * lives outside `categories` entirely (no options, no selection limits, invisible to the
 * estimator). */
export type FreeTextInputType = 'TEXTAREA';

export type AdditionalNotesField = {
	id: string;
	label: string;
	inputType: FreeTextInputType;
	placeholder?: string;
};

export type Offering = {
	id: string;
	version: number;
	currency: string;
	pricingStatus: string;
	pricingTypes: PricingType[];
	baseCharges: BaseCharge[];
	/** `guestCount` is a structurally required, specially-typed slot — the estimator reads
	 * guest facts from it directly rather than parsing any option label. Every other key is
	 * an ordinary, generically-rendered category. */
	categories: {
		guestCount: Category<GuestFacts>;
		[categoryKey: string]: Category;
	};
	includedItems: IncludedItem[];
	staffQuotedExtras: StaffQuotedExtra[];
	additionalNotesField: AdditionalNotesField;
};

export type EstimateLineItem = {
	id: string;
	label: string;
	kind: 'per-event' | 'per-guest';
	amountCents: number;
	/** True for a highest-priced-strategy selection that's covered by an included slot —
	 * the UI shows "Included" instead of "$0" for these. */
	included?: boolean;
};

/**
 * The guest-count category picks a *band* (e.g. "25–100"), not an exact headcount, so the
 * estimate is a range: `*Low`/`*High` bracket the total at `minimumGuests` and
 * `maximumGuests` respectively. For the open-ended top band (`maximumGuests: null`) there is
 * no real ceiling to range against, so `*High` falls back to `*Low` as the best known number
 * — `guestCountOpenEnded` is what tells callers that fallback happened, so they can render
 * "$X+" (a floor) instead of a bare number that would misleadingly read as a hard cap. When
 * no guest count is picked yet, low and high are also equal, but `guestCountOpenEnded` is
 * `false` in that case — there's nothing selected to be open-ended about.
 */
export type Estimate = {
	guestCountLow: number;
	guestCountHigh: number;
	guestCountOpenEnded: boolean;
	perEventCents: number;
	/** Guest-count-independent rate — a range wouldn't apply here, only to totals. */
	perGuestCents: number;
	perGuestTotalCentsLow: number;
	perGuestTotalCentsHigh: number;
	totalCentsLow: number;
	totalCentsHigh: number;
	lineItems: EstimateLineItem[];
};

/** Selected option ids, keyed by category key (matching `Offering['categories']` keys). */
export type Selections = Record<string, string[]>;
