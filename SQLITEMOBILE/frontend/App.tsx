import { SafeAreaProvider } from 'react-native-safe-area-context';
import MeusLivros from './screens/MeusLivros';

export default function App() {
  return (
    <SafeAreaProvider>
      <MeusLivros />
    </SafeAreaProvider>
  );
}
