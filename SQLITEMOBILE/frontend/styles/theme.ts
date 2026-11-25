import { Platform } from 'react-native';

export const C = {
  bg: '#F8F5EF',
  primary: '#294C3F',
  text: '#292A25',
  muted: '#77786E',
  border: '#E2DED4',
  soft: '#E9EDE6',
  danger: '#A44236',
  dangerSoft: '#F6EAE5',
  star: '#A27B35',
};
export const SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, serif',
});
export const COVER_COLORS = [
  '#805043',
  '#3F5C50',
  '#887548',
  '#53637B',
  '#705767',
  '#435D64',
];
