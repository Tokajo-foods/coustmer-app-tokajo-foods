import { useQueryClient } from '@tanstack/react-query';

import { cartKeys } from '@/lib/cart/hooks';
import { moneyConfigKeys } from '@/lib/pricing/money-config';
import { restaurantKeys } from '@/lib/restaurant/hooks';
import { useSocketEvent } from '@/lib/socket/hooks';

/**
 * Gateway `pricing:config_updated`: admin changed platform fee, packaging, tax, or
 * delivery fee. Cart totals, bill, and item quotes are server-computed — refetch them.
 */
export function usePricingSync() {
  const queryClient = useQueryClient();

  useSocketEvent('pricing:config_updated', () => {
    void queryClient.invalidateQueries({ queryKey: cartKeys.all, refetchType: 'active' });
    void queryClient.invalidateQueries({ queryKey: restaurantKeys.all, refetchType: 'active' });
    void queryClient.invalidateQueries({ queryKey: moneyConfigKeys.all });
  });
}
