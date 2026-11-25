// Exibe em cada cartão o gênero e a avaliação de um livro.
import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import type { Livro } from '../../backend/models/Livro';
import { T } from './Typography';
import { C } from '../styles/theme';
import { s } from '../styles/styles';

export function Badge({ livro }: { livro: Livro }) {
  return (
    <View style={s.badges}>
      <T style={s.badge}>{livro.genero}</T>
      <View style={s.ratingGroup}>
        <Star size={12} strokeWidth={1.6} color={C.star} fill={C.star} />
        <T style={s.rating}>{livro.nota.toFixed(1)}</T>
      </View>
    </View>
  );
}
