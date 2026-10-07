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
        width: 40,
        height: 22,
        borderRadius: 12,
        backgroundColor: value ? authTheme.brand : authTheme.inputBorder,
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: '#FFFFFF',
          transform: [{ translateX: value ? 18 : 0 }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        }}
      />
    </Pressable>
  );
}
