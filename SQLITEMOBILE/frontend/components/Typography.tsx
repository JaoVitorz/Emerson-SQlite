import { Text } from 'react-native';
import type { TextProps } from 'react-native';
import { s } from '../styles/styles';

export function T({ style, ...props }: TextProps) {
  return <Text {...props} style={[s.text, style]} />;
}
