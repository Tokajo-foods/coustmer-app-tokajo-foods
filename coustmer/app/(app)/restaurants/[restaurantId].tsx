import { RestaurantDetailScreen } from '@/components/restaurant/RestaurantDetailScreen';

/** Menu screen — sibling file so `/restaurants/:id` never opens the offers stack first. */
export default function RestaurantMenuPage() {
  return <RestaurantDetailScreen />;
}
