import { ArrowLeft, Search, X } from 'lucide-react-native';
import { forwardRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import type { SearchMorph } from '@/lib/motion/use-search-morph';

import { RotatingPlaceholder } from './RotatingPlaceholder';
import { SEARCH_PLACEHOLDER, searchColors, searchStyles as s } from './search-styles';

type Props = {
  morph: SearchMorph;
  query: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onBack: () => void;
};

/** Back arrow + search field. The field is the landing spot of the morph. */
export const SearchHeader = forwardRef<TextInput, Props>(function SearchHeader(
  { morph, query, onChange, onSubmit, onClear, onBack },
  inputRef,
) {
  return (
    <>
      <View style={s.bar}>
        <Animated.View style={morph.backStyle}>
          <SmoothPressable onPress={onBack} style={s.backBtn} pressScale={0.9} accessibilityLabel="Go back">
            <ArrowLeft color={searchColors.ink} size={22} strokeWidth={2.2} />
          </SmoothPressable>
        </Animated.View>
        <Animated.View
          ref={morph.targetRef as React.RefObject<Animated.View>}
          onLayout={morph.onTargetLayout}
          collapsable={false}
          style={[s.inputWrap, morph.barStyle]}
        >
          <Search color={searchColors.orange} size={16} strokeWidth={2.6} />
          <View style={s.inputArea}>
            {query.length === 0 ? (
              <View style={s.placeholderLayer}>
                <RotatingPlaceholder />
              </View>
            ) : null}
            <TextInput
              ref={inputRef}
              style={s.input}
              accessibilityLabel={SEARCH_PLACEHOLDER}
              value={query}
              onChangeText={onChange}
              onSubmitEditing={onSubmit}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor={searchColors.orange}
            />
          </View>
          {query.length > 0 ? (
            <Pressable onPress={onClear} hitSlop={12} style={s.clearIcon} accessibilityLabel="Clear search">
              <X color={searchColors.muted} size={13} strokeWidth={2.6} />
            </Pressable>
          ) : null}
        </Animated.View>
      </View>
      <Animated.View style={[s.hairline, morph.bodyStyle]} />
    </>
  );
});
