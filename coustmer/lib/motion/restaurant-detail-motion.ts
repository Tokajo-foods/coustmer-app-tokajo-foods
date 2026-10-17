import { FadeIn, FadeInDown, FadeOut, FadeOutUp } from 'react-native-reanimated';

/** Main tab panels: Menu, Offers, Reviews, Info */
export const RESTAURANT_DETAIL_TAB_ENTERING = FadeInDown.duration(360)
  .springify()
  .damping(20)
  .stiffness(320);

export const RESTAURANT_DETAIL_TAB_EXITING = FadeOutUp.duration(220);

/** Veg / non-veg / bestseller menu filter swap */
export const RESTAURANT_MENU_FILTER_ENTERING = FadeInDown.duration(300)
  .springify()
  .damping(22)
  .stiffness(340);

export const RESTAURANT_MENU_FILTER_EXITING = FadeOut.duration(160);

/** Tab bar underline + filter chip */
export const RESTAURANT_CHIP_ENTERING = FadeIn.duration(180);
