export const ENTREE_TYPES = {
  ASADA: 'asada',
  ADOBADA: 'adobada',
  POLLO: 'pollo',
  CHORIZO: 'chorizo',
  LENGUA: 'lengua',
  VEGGIE: 'veggie',
}

export const DRINK_TYPES = {
  HORCHATA: 'horchata',
  INFUSED_WATER: 'infusedWater',
  BOTTLED_SODA: 'bottledSoda',
}

// Helper function to create initial state
const createInitialOptions = (types) => 
  Object.values(types).reduce((acc, type) => ({ ...acc, [type]: false }), {})

// Frozen initial states
export const initialEntreeOptions = Object.freeze(createInitialOptions(ENTREE_TYPES))
export const initialDrinkOptions = Object.freeze(createInitialOptions(DRINK_TYPES))

// Display names
export const ENTREE_LABELS = {
  [ENTREE_TYPES.ASADA]: 'Asada',
  [ENTREE_TYPES.ADOBADA]: 'Adobada', 
  [ENTREE_TYPES.POLLO]: 'Pollo',
  [ENTREE_TYPES.CHORIZO]: 'Chorizo',
  [ENTREE_TYPES.LENGUA]: 'Lengua',
  [ENTREE_TYPES.VEGGIE]: 'Veggie',
}

export const DRINK_LABELS = {
  [DRINK_TYPES.HORCHATA]: 'Horchata',
  [DRINK_TYPES.INFUSED_WATER]: 'Infused Water',
  [DRINK_TYPES.BOTTLED_SODA]: 'Bottled Soda',
}
