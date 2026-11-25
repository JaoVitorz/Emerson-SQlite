// Inicializa o SQLite, cria o esquema e registra a carga inicial dos livros uma única vez.
import type { SQLiteDatabase } from 'expo-sqlite';
import { SCHEMA } from './schema.ts';
import { LIVROS_DEMONSTRACAO } from './seed.ts';
import { INSERT, valores } from './livroQueries.ts';

export async function inicializarBanco(db: SQLiteDatabase) {
  await db.execAsync(
    'PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;',
  );
  await db.withTransactionAsync(async () => {
    await db.execAsync(SCHEMA);
    const seed = await db.getFirstAsync(
      'SELECT valor FROM APP_CONFIG WHERE chave = ?',
      'demo_v1',
    );
    if (!seed) {
      const count = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) AS total FROM LIVRO',
      );
      if (count?.total === 0)
        for (const livro of LIVROS_DEMONSTRACAO)
          await db.runAsync(INSERT, valores(livro));
      await db.runAsync(
        'INSERT INTO APP_CONFIG (chave, valor) VALUES (?, ?)',
        'demo_v1',
        'concluido',
      );
    }
  });
}
