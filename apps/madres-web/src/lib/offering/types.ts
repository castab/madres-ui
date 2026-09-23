/** A pricing document is never a "quote" — it drives a preliminary, staff-confirmed estimate. */
export type PricingType = 'NONE' | 'PER_EVENT' | 'PER_GUEST';

export type IncludedSelectionStrategy = 'HIGHEST_PRICED_SELECTED';

/** How a category's options should be presented. */
export type CategoryInputType = 'SELECT' | 'CHECKBOX_LIST';

export type SelectionPricing = {
	includedSelections: number;
	includedSelectionStrategy: IncludedSelectionStrategy;
	chargeRemainingSelections: boolean;
};

export type Option<Facts = unknown> = {
	id: string;
	label: string;
	description?: string;
	priceCents: number;
	minimumEventCents?: number;
	facts?: Facts;
};

export type ServingStyleOption = Option & { minimumEventCents: number };

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

export type ServingStyleCategory = Category & { options: ServingStyleOption[] };

export type GuestCountField = {
	id: string;
	label: string;
	inputType: 'NUMBER';
	minimumGuests: number;
	maximumGuests: number;
	placeholder?: string;
};

export type IncludedContent = {
	label: string;
	excludedServingStyleIds?: string[];
};

export type IncludedItem = {
	id: string;
	label: string;
	description?: string;
	contents?: IncludedContent[];
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
	guestCountField: GuestCountField;
	categories: { servingStyle: ServingStyleCategory; [categoryKey: string]: Category };
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

export type Estimate = {
	guestCount: number;
	perEventCents: number;
	perGuestCents: number;
	perGuestTotalCents: number;
	minimumEventCents: number;
	minimumAdjustmentCents: number;
	totalCents: number;
	lineItems: EstimateLineItem[];
};

/** Selected option ids, keyed by category key (matching `Offering['categories']` keys). */
export type Selections = Record<string, string[]>;
