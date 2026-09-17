/**
 * Local design assets shipped in `public/` (logo, hero art, category icons).
 * Category *data* (labels/slugs) still comes from the API — these are only
 * the artwork the design ships with, mapped by keyword.
 */
import type { ImageSourcePropType } from 'react-native';

// Brand
export const TOKAJO_LOGO = require('../../../public/tokajo-logo.webp');
export const HERO_BANNER = require('../../../public/hero-banner.png');

// Category artwork (public/categories/*)
const CATEGORY_ICONS = {
  all: require('../../../public/categories/all-icon.png'),
  more: require('../../../public/categories/more-icon.png'),
  biryani: require('../../../public/categories/biryani.png'),
  pizza: require('../../../public/categories/pizza.png'),
  burgers: require('../../../public/categories/burgers.png'),
  chinese: require('../../../public/categories/chinese.png'),
  desserts: require('../../../public/categories/desserts.png'),
} as const;

export const CATEGORY_ALL_ICON = CATEGORY_ICONS.all;
export const CATEGORY_MORE_ICON = CATEGORY_ICONS.more;

/** Keyword → local artwork. Returns null when nothing matches. */
export function localCategoryIcon(
  slugOrLabel?: string | null
): ImageSourcePropType | null {
  const key = String(slugOrLabel ?? '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  if (!key) return null;
  if (
    key.includes('biryani') ||
    key.includes('biriyani') ||
    key.includes('rice') ||
    key.includes('pulao') ||
    key.includes('dum')
  ) {
    return CATEGORY_ICONS.biryani;
  }
  if (key.includes('pizza')) return CATEGORY_ICONS.pizza;
  if (
    key.includes('burger') ||
    key.includes('sandwich') ||
    key.includes('roll') ||
    key.includes('wrap') ||
    key.includes('fries') ||
    key.includes('snack') ||
    key.includes('fastfood')
  ) {
    return CATEGORY_ICONS.burgers;
  }
  if (
    key.includes('chinese') ||
    key.includes('noodle') ||
    key.includes('momo') ||
    key.includes('hakka') ||
    key.includes('manchur') ||
    key.includes('thai') ||
    key.includes('asian')
  ) {
    return CATEGORY_ICONS.chinese;
  }
  if (
    key.includes('dessert') ||
    key.includes('sweet') ||
    key.includes('cake') ||
    key.includes('icecream') ||
    key.includes('bakery') ||
    key.includes('pastry') ||
    key.includes('waffle') ||
    key.includes('beverage') ||
    key.includes('drink') ||
    key.includes('shake') ||
    key.includes('juice')
  ) {
    return CATEGORY_ICONS.desserts;
  }
  return null;
}

/** Keyword → local artwork, falling back to the "more" icon. */
export function categoryIcon(
  slugOrLabel?: string | null
): ImageSourcePropType {
  return localCategoryIcon(slugOrLabel) ?? CATEGORY_ICONS.more;
}
