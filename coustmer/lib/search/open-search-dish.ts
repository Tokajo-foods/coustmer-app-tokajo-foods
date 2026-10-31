import type { Router } from 'expo-router';

import { openRestaurantMenu } from '@/lib/restaurant/open-restaurant';

/** Open the dish's restaurant scrolled to its menu section, with the dish highlighted. */
export function openSearchDish(
  router: Router,
  dish: { restaurantId: string; id: string; categoryId?: string; categoryName?: string }
) {
  openRestaurantMenu(router, dish.restaurantId, {
    params: {
      itemId: dish.id,
      categoryId: dish.categoryId,
      category: dish.categoryName,
      focus: 'section',
    },
  });
}
