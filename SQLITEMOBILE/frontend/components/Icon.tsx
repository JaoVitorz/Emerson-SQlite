// Centraliza os nomes dos ícones lucide usados pelas telas e componentes.
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react-native';
import { C } from '../styles/theme';

const ICONS = {
  plus: Plus,
  search: Search,
  pencil: Pencil,
  trash: Trash2,
  left: ChevronLeft,
  right: ChevronRight,
  down: ChevronDown,
  'trash-large': Trash2,
};
type IconName = keyof typeof ICONS;
export function Icon({ name }: { name: IconName }) {
  const Component = ICONS[name];
  const size = name === 'plus' ? 16 : name === 'trash-large' ? 26 : 20;
  const color =
    name === 'plus'
      ? '#FFFDFA'
      : name === 'trash-large'
        ? C.danger
        : name === 'pencil'
          ? C.primary
          : C.muted;
  return <Component size={size} color={color} strokeWidth={1.7} />;
}
