import { Pressable } from '@/components/common/Pressable';
import { View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function AuthRememberSwitch({ value, onValueChange }: Props) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={{
        width: 32,
        height: 18,
        borderRadius: 10,
        backgroundColor: value ? authTheme.brand : authTheme.inputBorder,
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: '#FFFFFF',
          transform: [{ translateX: value ? 14 : 0 }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.18,
          shadowRadius: 1.5,
          elevation: 1,
        }}
      />
    </Pressable>
  );
}
