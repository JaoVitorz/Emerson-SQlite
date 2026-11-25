import { Pressable } from 'react-native';
import { T } from './Typography';
import { C } from '../styles/theme';
import { s } from '../styles/styles';

export function Button({
  title,
  onPress,
  kind = 'primary',
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'danger' | 'softDanger';
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        s[kind],
        disabled && s.dim,
        pressed && s.pressed,
      ]}
    >
      <T
        style={[
          s.buttonText,
          kind === 'secondary' && { color: C.text },
          kind === 'softDanger' && { color: C.danger },
        ]}
      >
        {title}
      </T>
    </Pressable>
  );
}
