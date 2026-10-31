import { ArrowLeft, Search, X } from 'lucide-react-native';
import { forwardRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import type { SearchMorph } from '@/lib/motion/use-search-morph';

import { RotatingPlaceholder } from './RotatingPlaceholder';
import { SEARCH_PLACEHOLDER, searchColors, searchStyles as s } from './search-styles';
import { VoiceMicButton } from './VoiceMicButton';

export type VoiceControl = {
  available: boolean;
  listening: boolean;
  error: string | null;
  toggle: () => void;
};

type Props = {
  morph: SearchMorph;
  query: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onBack: () => void;
  voice: VoiceControl;
};

/** Back arrow + search field. The field is the landing spot of the morph. */
export const SearchHeader = forwardRef<TextInput, Props>(function SearchHeader(
  { morph, query, onChange, onSubmit, onClear, onBack, voice },
  inputRef,
) {
  const voiceHint = voice.listening ? 'Listening… say a dish or restaurant' : voice.error;
  return (
    <>
      <View style={s.bar}>
        <Animated.View style={morph.backStyle}>
          <SmoothPressable onPress={onBack} style={s.backBtn} pressScale={0.9} accessibilityLabel="Go back">
            <ArrowLeft color={searchColors.ink} size={22} strokeWidth={2} />
          </SmoothPressable>
        </Animated.View>
        <Animated.View
          ref={morph.targetRef as React.RefObject<Animated.View>}
          onLayout={morph.onTargetLayout}
          collapsable={false}
          style={[s.inputWrap, morph.barStyle]}
        >
          <Search color={searchColors.fieldIcon} size={18} strokeWidth={2.2} />
          <View style={s.inputArea}>
            {query.length === 0 ? (
              <View style={s.placeholderLayer}>
                {voiceHint ? (
                  <Text
                    numberOfLines={1}
                    style={[s.voiceHint, voice.error && !voice.listening && s.voiceHintError]}
                    accessibilityLiveRegion="polite"
                  >
                    {voiceHint}
                  </Text>
                ) : (
                  <RotatingPlaceholder />
                )}
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
              <X color="#FFFFFF" size={11} strokeWidth={3} />
            </Pressable>
          ) : null}
          {voice.available ? <VoiceMicButton listening={voice.listening} onPress={voice.toggle} /> : null}
        </Animated.View>
      </View>
      <Animated.View style={[s.hairline, morph.bodyStyle]} />
    </>
  );
});
