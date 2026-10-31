import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { memo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { getApiErrorMessage } from '@/lib/errors';
import { useSupportFaq } from '@/lib/support/support-hooks';
import type { FaqItem } from '@/lib/support/types';

import { faqStyles as s } from './faq-styles';

type Props = { faq: FaqItem; expanded: boolean; onToggle: (id: string) => void };

/** The list only carries a preview; the full answer loads when the card opens. */
export const FaqCard = memo(function FaqCard({ faq, expanded, onToggle }: Props) {
  const detail = useSupportFaq(expanded && !faq.answer ? faq.id : '');
  const answer = faq.answer || detail.data?.answer;

  return (
    <Pressable
      style={[s.card, expanded && s.cardOpen]}
      onPress={() => onToggle(faq.id)}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
    >
      <View style={s.row}>
        <Text style={s.q}>{faq.question}</Text>
        {expanded ? (
          <ChevronUp size={18} color={authTheme.brand} strokeWidth={2.2} />
        ) : (
          <ChevronDown size={18} color="#9CA3AF" strokeWidth={2.2} />
        )}
      </View>
      {expanded ? (
        answer ? (
          <Text style={s.a}>{answer}</Text>
        ) : detail.isError ? (
          <Text style={s.aError}>{getApiErrorMessage(detail.error, 'Could not load this answer.')}</Text>
        ) : detail.isLoading ? (
          <ActivityIndicator size="small" color={authTheme.brand} style={s.aLoading} />
        ) : faq.answerPreview ? (
          <Text style={s.a}>{faq.answerPreview}</Text>
        ) : null
      ) : null}
    </Pressable>
  );
});
