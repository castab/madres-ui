import type { Offering } from './types.js';

/** Fictional data for tests and `.env.example`. Real offerings belong only in private env vars. */
export const sampleOffering: Offering = {
	id: 'sample-event-offering',
	version: 1,
	currency: 'USD',
	pricingStatus: 'EXAMPLE',
	pricingTypes: ['NONE', 'PER_EVENT', 'PER_GUEST', 'PER_ITEM'],
	guestCountField: {
		id: 'attendee_count',
		label: 'Attendees',
		inputType: 'NUMBER',
		maximumGuests: 999,
		placeholder: 'Enter an attendee count'
	},
	categories: {
		servingStyle: {
			id: 'service_style',
			label: 'Service Style',
			minSelections: 1,
			maxSelections: 1,
			pricingType: 'PER_GUEST',
			inputType: 'SELECT',
			options: [
				{
					id: 'style_a',
					label: 'Service A',
					description: 'Example service style A.',
					priceCents: 1000,
					minimumEventCents: 10000
				},
				{
					id: 'style_b',
					label: 'Service B',
					description: 'Example service style B.',
					priceCents: 1200,
					minimumEventCents: 20000
				},
				{
					id: 'style_c',
					label: 'Service C',
					description: 'Example service style C.',
					priceCents: 800,
					minimumEventCents: 8000
				}
			]
		},
		proteins: {
			id: 'fillings',
			label: 'Fillings',
			minSelections: 2,
			maxSelections: 5,
			pricingType: 'PER_GUEST',
			inputType: 'CHECKBOX_LIST',
			selectionPricing: {
				includedSelections: 2,
				includedSelectionStrategy: 'HIGHEST_PRICED_SELECTED',
				chargeRemainingSelections: true
			},
			options: [
				{ id: 'filling_a', label: 'Filling A', description: 'Example filling A.', priceCents: 200 },
				{ id: 'filling_b', label: 'Filling B', description: 'Example filling B.', priceCents: 150 },
				{ id: 'filling_c', label: 'Filling C', description: 'Example filling C.', priceCents: 100 },
				{ id: 'filling_d', label: 'Filling D', description: 'Example filling D.', priceCents: 50 },
				{ id: 'filling_e', label: 'Filling E', description: 'Example filling E.', priceCents: 25 }
			]
		},
		drinks: {
			id: 'beverages',
			label: 'Beverages',
			minSelections: 0,
			maxSelections: 2,
			pricingType: 'PER_GUEST',
			inputType: 'CHECKBOX_LIST',
			options: [
				{
					id: 'beverage_a',
					label: 'Beverage A',
					description: 'Example beverage A.',
					priceCents: 75
				},
				{
					id: 'beverage_b',
					label: 'Beverage B',
					description: 'Example beverage B.',
					priceCents: 125
				}
			]
		},
		appetizers: {
			id: 'items',
			label: 'Items',
			minSelections: 0,
			maxSelections: 4,
			pricingType: 'PER_ITEM',
			inputType: 'QUANTITY_LIST',
			minimumOrderCents: 10000,
			maximumQuantityPerOption: 1000,
			options: [
				{ id: 'item_a', label: 'Item A', description: 'Example item A.', priceCents: 200 },
				{ id: 'item_b', label: 'Item B', description: 'Example item B.', priceCents: 300 },
				{ id: 'item_c', label: 'Item C', description: 'Example item C.', priceCents: 400 },
				{ id: 'item_d', label: 'Item D', description: 'Example item D.', priceCents: 500 }
			]
		}
	},
	includedItems: [
		{
			id: 'included_setup',
			label: 'Included Setup',
			description: 'Example included setup.',
			contents: [
				{ label: 'Component A', excludedServingStyleIds: ['style_c'] },
				{ label: 'Component B', excludedServingStyleIds: ['style_c'] },
				{ label: 'Shared supplies' }
			]
		}
	],
	staffQuotedExtras: [{ id: 'custom_extra', label: 'Custom extra' }],
	additionalNotesField: {
		id: 'additional_notes',
		label: 'Other details',
		inputType: 'TEXTAREA',
		placeholder: 'Add any extra details'
	}
};
