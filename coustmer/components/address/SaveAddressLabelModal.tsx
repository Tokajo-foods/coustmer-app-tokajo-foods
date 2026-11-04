import { Pressable } from '@/components/common/Pressable';
import { useEffect, useState } from 'react';
import { ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  
  StyleSheet,
  Text,
  TextInput,
  View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authTheme } from '@/constants/auth-theme';
import {
  ADDRESS_LABEL_OPTIONS,
  formatAddressLabel,
  type AddressLabel,
} from '@/lib/address/types';

export type SaveAddressLabelChoice = AddressLabel;

type Props = {
  visible: boolean;
  addressPreview?: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: {
    label: SaveAddressLabelChoice;
    displayLabel: string;
  }) => void;
};

export function SaveAddressLabelModal({
  visible,
  addressPreview,
  saving = false,
  onClose,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets();
  const [label, setLabel] = useState<SaveAddressLabelChoice>('home');
  const [customLabel, setCustomLabel] = useState('');

  useEffect(() => {
    if (!visible) return;
    setLabel('home');
    setCustomLabel('');
  }, [visible]);

  const handleSave = () => {
    if (saving) return;
    const displayLabel =
      label === 'other' && customLabel.trim()
        ? customLabel.trim()
        : formatAddressLabel(label);
    onSave({ label, displayLabel });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
      >
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>Save this address?</Text>
          <Text style={styles.subtitle}>
            Choose a label for faster checkout next time.
          </Text>
          {addressPreview ? (
            <Text style={styles.preview} numberOfLines={2}>
              {addressPreview}
            </Text>
          ) : null}

          <View style={styles.labelRow}>
            {ADDRESS_LABEL_OPTIONS.map((item) => {
              const active = label === item.value;
              return (
                <Pressable
                  key={item.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setLabel(item.value)}
                  disabled={saving}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {label === 'other' ? (
            <TextInput
              style={styles.input}
              value={customLabel}
              onChangeText={setCustomLabel}
              placeholder="e.g. Parents, Gym"
              placeholderTextColor={authTheme.textDim}
              autoFocus
              editable={!saving}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          ) : null}

          <View style={styles.actions}>
            <Pressable
              style={styles.secondaryBtn}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.secondaryText}>Not now</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, saving && styles.primaryBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E4E9',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: authTheme.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: authTheme.textMuted,
    lineHeight: 18,
  },
  preview: {
    marginTop: 12,
    fontSize: 13,
    color: authTheme.text,
    fontWeight: '600',
    lineHeight: 18,
    backgroundColor: authTheme.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  labelRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    borderColor: authTheme.brand,
    backgroundColor: authTheme.brandSoft,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: authTheme.textMuted,
  },
  chipTextActive: {
    color: authTheme.brand,
  },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: authTheme.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 15,
    fontWeight: '600',
    color: authTheme.text,
    backgroundColor: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    backgroundColor: '#FFFFFF',
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: authTheme.textMuted,
  },
  primaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: authTheme.brand,
    minHeight: 48,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
