import { z } from 'zod';
import type { Offering } from './types.js';

const pricingTypeSchema = z.enum(['NONE', 'PER_EVENT', 'PER_GUEST']);
const categoryInputTypeSchema = z.enum(['SELECT', 'CHECKBOX_LIST']);
const priceCentsSchema = z.number().int().nonnegative();
const nonNegativeIntSchema = z.number().int().nonnegative();

const selectionPricingSchema = z.object({
	includedSelections: nonNegativeIntSchema,
	includedSelectionStrategy: z.enum(['HIGHEST_PRICED_SELECTED']),
	chargeRemainingSelections: z.boolean()
});

function makeOptionSchema<FactsSchema extends z.ZodType>(factsSchema: FactsSchema) {
	return z.object({
		id: z.string().min(1),
		label: z.string().min(1),
		description: z.string().min(1).optional(),
		priceCents: priceCentsSchema,
		facts: factsSchema
	});
}

const anyFactsSchema = z.record(z.string(), z.unknown()).optional();
const optionSchema = makeOptionSchema(anyFactsSchema);

const guestFactsSchema = z
	.object({
		minimumGuests: nonNegativeIntSchema,
		maximumGuests: nonNegativeIntSchema.nullable(),
		isMinimum: z.boolean()
	})
	.refine((facts) => facts.maximumGuests === null || facts.maximumGuests >= facts.minimumGuests, {
		message: 'maximumGuests must be >= minimumGuests when set'
	});

const guestOptionSchema = makeOptionSchema(guestFactsSchema);

/** The minimal shape `makeCategorySchema`'s own validation logic (duplicate-id / included-
 * selections checks) needs to see — a structural lower bound satisfied by both
 * `optionSchema`'s and `guestOptionSchema`'s output. */
type MinimalOptionShape = { id: string; priceCents: number };

function makeCategorySchema<OptionSchema extends z.ZodType<MinimalOptionShape>>(
	optionSchema: OptionSchema
) {
	return z
		.object({
			id: z.string().min(1),
			label: z.string().min(1),
			minSelections: nonNegativeIntSchema,
			maxSelections: nonNegativeIntSchema,
			pricingType: pricingTypeSchema,
			inputType: categoryInputTypeSchema,
			selectionPricing: selectionPricingSchema.optional(),
			options: z.array(optionSchema).min(1)
		})
		.superRefine((category, ctx) => {
			if (category.maxSelections < category.minSelections) {
				ctx.addIssue({
					code: 'custom',
					message: `maxSelections (${category.maxSelections}) must be >= minSelections (${category.minSelections})`
				});
			}
			if (category.inputType === 'SELECT' && category.maxSelections !== 1) {
				ctx.addIssue({
					code: 'custom',
					message:
						'inputType "SELECT" requires maxSelections to be exactly 1 (a dropdown can only pick one option)'
				});
			}
			const seenIds = new Set<string>();
			for (const option of category.options) {
				if (seenIds.has(option.id)) {
					ctx.addIssue({ code: 'custom', message: `duplicate option id "${option.id}"` });
				}
				seenIds.add(option.id);
			}
			if (
				category.selectionPricing &&
				category.selectionPricing.includedSelections > category.maxSelections
			) {
				ctx.addIssue({
					code: 'custom',
					message: 'selectionPricing.includedSelections must not exceed maxSelections'
				});
			}
		});
}

const categorySchema = makeCategorySchema(optionSchema);
const guestCategorySchema = makeCategorySchema(guestOptionSchema);

/** `guestCount` is required and validated against `guestCategorySchema` (its options must
 * carry `GuestFacts`); every other key is an arbitrary, generically-rendered category
 * validated against the plain `categorySchema` via `.catchall`. */
const categoriesSchema = z.object({ guestCount: guestCategorySchema }).catchall(categorySchema);

const baseChargeSchema = z.object({
	id: z.string().min(1),
	label: z.string().min(1),
	pricingType: pricingTypeSchema,
	priceCents: priceCentsSchema
});

const includedItemSchema = z.object({ id: z.string().min(1), label: z.string().min(1) });
const staffQuotedExtraSchema = z.object({ id: z.string().min(1), label: z.string().min(1) });

const freeTextInputTypeSchema = z.enum(['TEXTAREA']);
const additionalNotesFieldSchema = z.object({
	id: z.string().min(1),
	label: z.string().min(1),
	inputType: freeTextInputTypeSchema,
	placeholder: z.string().min(1).optional()
});

export const offeringSchema = z.object({
	id: z.string().min(1),
	version: z.number().int().positive(),
	currency: z.string().min(1),
	pricingStatus: z.string().min(1),
	pricingTypes: z.array(pricingTypeSchema).min(1),
	baseCharges: z.array(baseChargeSchema),
	categories: categoriesSchema,
	includedItems: z.array(includedItemSchema),
	staffQuotedExtras: z.array(staffQuotedExtraSchema),
	additionalNotesField: additionalNotesFieldSchema
});

export type OfferingParseResult =
	{ ok: true; offering: Offering } | { ok: false; issues: string[] };

/** Validates an already-`JSON.parse`d offering document. Never throws — malformed or
 * out-of-range data (bad enums, negative prices, `maxSelections < minSelections`, duplicate
 * option ids, missing guest facts, `includedSelections` over the category cap, …) is reported
 * as a flat list of issues rather than partially accepted. */
export function parseOffering(raw: unknown): OfferingParseResult {
	const result = offeringSchema.safeParse(raw);
	if (!result.success) {
		return {
			ok: false,
			issues: result.error.issues.map(
				(issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`
			)
		};
	}
	return { ok: true, offering: result.data as Offering };
}
