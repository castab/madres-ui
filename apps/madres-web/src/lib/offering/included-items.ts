import type { IncludedItem } from './types.js';

export function includedItemsForServingStyle(
	items: IncludedItem[],
	servingStyleId: string | undefined
): IncludedItem[] {
	return items.map((item) => ({
		...item,
		contents: item.contents?.filter(
			(content) => !servingStyleId || !content.excludedServingStyleIds?.includes(servingStyleId)
		)
	}));
}
