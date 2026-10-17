import { formatInr } from '@/lib/format/money';
import type { SubscriptionPlan } from '@/lib/customer/types';

const BENEFIT_LABELS: Record<string, string> = {
  free_delivery: 'Free delivery on eligible orders',
  extra_discounts: 'Extra discounts at partner restaurants',
  priority_support: 'Priority customer support',
  no_surge: 'No surge fee during peak hours',
  priority_delivery: 'Priority delivery',
};

function titleCase(key: string): string {
  const text = key.replace(/[_-]+/g, ' ').trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : key;
}

/** Human labels for catalog benefit keys; free-delivery copy uses the server min order. */
export function planBenefitLabels(plan: SubscriptionPlan): string[] {
  return plan.benefits.map((key) => {
    if (key === 'free_delivery' && plan.freeDeliveryMinOrder > 0) {
      return `Free delivery on orders above ${formatInr(plan.freeDeliveryMinOrder)}`;
    }
    return BENEFIT_LABELS[key] ?? titleCase(key);
  });
}

export function planPeriodLabel(period: SubscriptionPlan['period']): string {
  return period === 'year' ? 'year' : 'month';
}

export function formatPlanDate(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
