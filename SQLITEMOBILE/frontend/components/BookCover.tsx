// Cria a capa visual colorida de um livro a partir do título e dos dados cadastrados.
import { View } from 'react-native';
import type { Livro } from '../../backend/models/Livro';
import { T } from './Typography';
import { COVER_COLORS } from '../styles/theme';
import { s } from '../styles/styles';

export function Cover({
  livro,
  large = false,
}: {
  livro: Livro;
  large?: boolean;
}) {
  const hash = Array.from(livro.titulo).reduce(
    (sum, char) => sum + char.codePointAt(0)!,
    0,
  );
  return (
    <View
      accessible={false}
      style={[
        s.cover,
        { backgroundColor: COVER_COLORS[hash % COVER_COLORS.length] },
        large && s.coverLarge,
      ]}
    >
      <View style={s.bookSpine} />
      <T
        numberOfLines={large ? 4 : 3}
        style={[s.coverTitle, large && s.coverTitleLarge]}
      >
        {livro.titulo}
      </T>
      <View style={s.coverRule} />
      <T
        numberOfLines={large ? 2 : 1}
        style={[s.coverAuthor, large && s.coverAuthorLarge]}
      >
        {large ? livro.autor : livro.ano}
      </T>
    </View>
  );
}
