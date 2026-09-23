import type { Offering } from './types.js';

/** The initial private-event offering document — the same shape published to
 * `PRIVATE_EVENT_OFFERING_JSON` (see `.env.example`). Shared by the schema/estimator test
 * suites so a config change (e.g. Horchata's price) only needs updating in one place. */
export const sampleOffering: Offering = {
	id: 'madres-private-events',
	version: 2,
	currency: 'USD',
	pricingStatus: 'DEVELOPMENT',
	pricingTypes: ['NONE', 'PER_EVENT', 'PER_GUEST'],
	baseCharges: [
		{ id: 'base_event_fee', label: 'Base event fee', pricingType: 'PER_EVENT', priceCents: 30000 },
		{
			id: 'base_food_service',
			label: 'Base food and service',
			pricingType: 'PER_GUEST',
			priceCents: 1500
		}
	],
	guestCountField: {
		id: 'guest_count',
		label: 'Guest Count',
		inputType: 'NUMBER',
		minimumGuests: 15,
		maximumGuests: 10000,
		placeholder: 'Enter your estimated guest count'
	},
	categories: {
		serviceDuration: {
			id: 'service_duration',
			label: 'Service Duration',
			minSelections: 1,
			maxSelections: 1,
			pricingType: 'PER_GUEST',
			inputType: 'SELECT',
			options: [
				{ id: 'duration_90', label: '1.5 hours', priceCents: 0, facts: { durationMinutes: 90 } },
				{ id: 'duration_120', label: '2 hours', priceCents: 100, facts: { durationMinutes: 120 } },
				{
					id: 'duration_150',
					label: '2.5 hours',
					priceCents: 200,
					facts: { durationMinutes: 150 }
				},
				{ id: 'duration_180', label: '3 hours', priceCents: 300, facts: { durationMinutes: 180 } },
				{
					id: 'duration_210',
					label: '3.5 hours',
					priceCents: 400,
					facts: { durationMinutes: 210 }
				},
				{ id: 'duration_240', label: '4 hours', priceCents: 500, facts: { durationMinutes: 240 } }
			]
		},
		servingStyle: {
			id: 'serving_style',
			label: 'Serving Style',
			minSelections: 1,
			maxSelections: 1,
			pricingType: 'PER_GUEST',
			inputType: 'SELECT',
			options: [
				{ id: 'taco_truck', label: 'Taco Truck Service', priceCents: 0 },
				{ id: 'buffet', label: 'Buffet Service', priceCents: 300 }
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
				{ id: 'asada', label: 'Asada', description: 'Beef', priceCents: 400 },
				{ id: 'adobada', label: 'Adobada', description: 'Pork', priceCents: 300 },
				{ id: 'pollo', label: 'Pollo', description: 'Chicken', priceCents: 200 },
				{ id: 'chorizo', label: 'Chorizo', description: 'Pork', priceCents: 100 },
				{ id: 'veggie', label: 'Veggie', description: 'Vegetarian taco option', priceCents: 100 }
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
				{ id: 'fruit_infused_water', label: 'Fruit-infused water', priceCents: 150 },
				{ id: 'horchata', label: 'Horchata', priceCents: 200 }
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
					description: 'Chicken in a hand-rolled tortilla that is deep fried',
					priceCents: 300
				},
				{ id: 'fruit_cup_spread', label: 'Fruit Cup Spread', priceCents: 250 },
				{
					id: 'elote_en_vaso',
					label: 'Elote en Vaso',
					description: 'Also known as Esquites',
					priceCents: 200
				},
				{ id: 'chorizo_avocado_toast', label: 'Chorizo Avocado Toast', priceCents: 350 }
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
				'Rice',
				'Beans',
				'Chips',
				'Taco toppings: chopped white onion, red salsa, green salsa, guacamole salsa, cilantro, sliced limes, sliced cucumbers, and chopped cabbage'
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
