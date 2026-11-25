import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// O Metro usa salvarBanco.web.ts no navegador e este arquivo no Android/iOS.
export async function salvarBanco(bytes: Uint8Array) {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error(
      'O compartilhamento de arquivos não está disponível neste dispositivo.',
    );
  }
  const file = new File(Paths.cache, 'MeusLivros.db');
  file.create({ overwrite: true });
  await file.write(bytes);
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/vnd.sqlite3',
    dialogTitle: 'Salvar banco MeusLivros',
    UTI: 'public.database',
  });
  return 'Cópia do banco preparada para compartilhamento.';
}
