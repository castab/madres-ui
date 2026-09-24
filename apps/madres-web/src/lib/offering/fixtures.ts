import type { Offering } from './types.js';

/** The initial private-event offering document — the same shape published to
 * `PRIVATE_EVENT_OFFERING_JSON` (see `.env.example`). Shared by the schema/estimator test
 * suites so a config change (e.g. Horchata's price) only needs updating in one place. */
export const sampleOffering: Offering = {
	id: 'madres-private-events',
	version: 5,
	currency: 'USD',
	pricingStatus: 'DEVELOPMENT',
	pricingTypes: ['NONE', 'PER_EVENT', 'PER_GUEST'],
	guestCountField: {
		id: 'guest_count',
		label: 'Guest Count',
		inputType: 'NUMBER',
		minimumGuests: 15,
		maximumGuests: 10000,
		placeholder: 'Enter your estimated guest count'
	},
	categories: {
		servingStyle: {
			id: 'serving_style',
			label: 'Serving Style',
			minSelections: 1,
			maxSelections: 1,
			pricingType: 'PER_GUEST',
			inputType: 'SELECT',
			options: [
				{
					id: 'taco_truck',
					label: 'Traditional Taco Truck Style',
					description: 'The classic from-the-window taco service you know and love.',
					priceCents: 2300,
					minimumEventCents: 75000
				},
				{
					id: 'buffet',
					label: 'Gourmet Taco Buffet',
					description: 'A self-serve spread of tacos and toppings for your guests.',
					priceCents: 2700,
					minimumEventCents: 100000
				},
				{
					id: 'just_tacos',
					label: 'Just the Tacos!',
					description: 'All about the tacos, without rice or beans.',
					priceCents: 2000,
					minimumEventCents: 50000
				}
			]
		},
		proteins: {
			id: 'proteins',
			label: 'Proteins',
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
				{ id: 'asada', label: 'Asada', description: 'Savory grilled beef.', priceCents: 400 },
				{
					id: 'adobada',
					label: 'Adobada',
					description: 'Marinated pork with a little spice.',
					priceCents: 300
				},
				{
					id: 'pollo',
					label: 'Pollo',
					description: 'Seasoned chicken for a crowd-pleasing taco.',
					priceCents: 200
				},
				{
					id: 'chorizo',
					label: 'Chorizo',
					description: 'Bold, spiced pork chorizo.',
					priceCents: 100
				},
				{
					id: 'veggie',
					label: 'Veggie',
					description: 'A flavorful meat-free taco option.',
					priceCents: 100
				}
			]
		},
		drinks: {
			id: 'drinks',
			label: 'Drinks',
			minSelections: 0,
			maxSelections: 2,
			pricingType: 'PER_GUEST',
			inputType: 'CHECKBOX_LIST',
			options: [
				{
					id: 'fruit_infused_water',
					label: 'Fruit-infused water',
					description: 'Refreshing water with a hint of fruit.',
					priceCents: 150
				},
				{
					id: 'horchata',
					label: 'Horchata',
					description: 'Sweet, creamy cinnamon rice drink.',
					priceCents: 200
				}
			]
		},
		appetizers: {
			id: 'appetizers',
			label: 'Appetizers',
			minSelections: 0,
			maxSelections: 4,
			pricingType: 'PER_GUEST',
			inputType: 'CHECKBOX_LIST',
			options: [
				{
					id: 'flautas',
					label: 'Flautas',
					description: 'Crispy hand-rolled tortillas filled with chicken.',
					priceCents: 300
				},
				{
					id: 'fruit_cup_spread',
					label: 'Fruit Cup Spread',
					description: 'Fresh fruit served in individual cups.',
					priceCents: 250
				},
				{
					id: 'elote_en_vaso',
					label: 'Elote en Vaso',
					description: 'Esquites: Mexican street corn served in a cup.',
					priceCents: 200
				},
				{
					id: 'chorizo_avocado_toast',
					label: 'Chorizo Avocado Toast',
					description: 'Avocado toast topped with savory chorizo.',
					priceCents: 350
				}
			]
		}
	},
	includedItems: [
		{
			id: 'styled_tablescape',
			label: 'Styled Tablescape',
			description:
				'A decorated table themed to match your event, with everything freshly made for the occasion.',
			contents: [
				{ label: 'Rice', excludedServingStyleIds: ['just_tacos'] },
				{ label: 'Beans', excludedServingStyleIds: ['just_tacos'] },
				{ label: 'Chips' },
				{ label: 'Cutlery' },
				{ label: 'Napkins' },
				{ label: 'Plates' },
				{
					label:
						'Taco toppings: chopped white onion, red salsa, green salsa, guacamole salsa, cilantro, sliced limes, sliced cucumbers, and chopped cabbage'
				}
			]
		}
	],
	staffQuotedExtras: [
		{ id: 'travel_surcharge', label: 'Travel surcharge' },
		{ id: 'special_protein', label: 'Special-request protein' },
		{ id: 'special_request', label: 'Other special request' }
	],
	additionalNotesField: {
		id: 'additional_notes',
		label: 'Anything else?',
		inputType: 'TEXTAREA',
		placeholder: 'Allergies, theme, timing constraints, anything else we should know…'
	}
};
