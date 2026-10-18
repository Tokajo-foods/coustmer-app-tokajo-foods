import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { StarRatingInput } from '@/components/review/StarRatingInput';

import { rateFormStyles as s } from './rate-form-styles';

const LABELS = ['Tap a star to rate', 'Terrible', 'Bad', 'Okay', 'Good', 'Loved it!'];
const MAX_COMMENT = 500;

export function RateOrderForm({
  restaurantName,
  initialRating = 0,
  initialComment = '',
  submitLabel = 'Submit rating',
  submitting,
  error,
  onSubmit,
}: {
  restaurantName: string;
  initialRating?: number;
  initialComment?: string;
  submitLabel?: string;
  submitting: boolean;
  error?: string | null;
  onSubmit: (rating: number, comment: string) => void;
}) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const rated = rating >= 1;

  return (
    <View style={s.wrap}>
      <Text style={s.question}>How was your food from</Text>
      <Text style={s.restaurant} numberOfLines={2}>{restaurantName}?</Text>

      <View style={s.stars}>
        <StarRatingInput value={rating} onChange={setRating} size={40} />
      </View>
      <Text style={[s.ratingLabel, rated && s.ratingLabelOn]}>{LABELS[rating] ?? LABELS[0]}</Text>

      {rated ? (
        <View style={s.commentBlock}>
          <Text style={s.commentTitle}>
            Write a review <Text style={s.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={s.input}
            value={comment}
            onChangeText={setComment}
            placeholder="Tell others about the taste, portion and packaging"
            placeholderTextColor="#A1A1AA"
            multiline
            maxLength={MAX_COMMENT}
            textAlignVertical="top"
          />
          <Text style={s.counter}>{comment.length}/{MAX_COMMENT}</Text>
        </View>
      ) : null}

      {error ? <Text style={s.error}>{error}</Text> : null}

      <Pressable
        style={[s.submit, (!rated || submitting) && s.submitOff]}
        disabled={!rated || submitting}
        onPress={() => onSubmit(rating, comment.trim())}
        accessibilityRole="button"
      >
        {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.submitText}>{submitLabel}</Text>}
      </Pressable>
    </View>
  );
}
