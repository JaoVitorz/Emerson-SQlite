// Camada de acesso aos dados: executa busca, cadastro, edição, exclusão e paginação em SQLite.
import type { SQLiteDatabase } from 'expo-sqlite';
import { TAMANHO_PAGINA } from '../models/Livro.ts';
import type { DadosLivro, Livro } from '../models/Livro.ts';
import { validarLivro, paraFormulario } from '../validators/livroValidator.ts';
import { INSERT, valores } from '../database/livroQueries.ts';

export async function inserirLivro(db: SQLiteDatabase, livro: DadosLivro) {
  const result = await db.runAsync(
    INSERT,
    valores(validarLivro(paraFormulario(livro))),
  );
  return result.lastInsertRowId;
}
export function buscarLivro(db: SQLiteDatabase, id: number) {
  return db.getFirstAsync<Livro>('SELECT * FROM LIVRO WHERE id = ?', id);
}
export async function atualizarLivro(
  db: SQLiteDatabase,
  id: number,
  livro: DadosLivro,
) {
  const result = await db.runAsync(
    'UPDATE LIVRO SET titulo = ?, autor = ?, genero = ?, ano = ?, paginas = ?, nota = ?, anotacoes = ? WHERE id = ?',
    [...valores(validarLivro(paraFormulario(livro))), id],
  );
  if (result.changes !== 1)
    throw new Error('Este livro não foi encontrado. Atualize a lista.');
}
export async function excluirLivro(db: SQLiteDatabase, id: number) {
  const result = await db.runAsync('DELETE FROM LIVRO WHERE id = ?', id);
  if (result.changes !== 1)
    throw new Error('Este livro não foi encontrado. Atualize a lista.');
}
export async function listarLivros(db: SQLiteDatabase, pagina = 1, busca = '') {
  // Escapa curingas: procurar % ou _ deve localizar o texto literal.
  const termo = `%${busca.trim().replace(/[\\%_]/g, '\\$&')}%`;
  const where = "WHERE titulo LIKE ? ESCAPE '\\' OR autor LIKE ? ESCAPE '\\'";
  const count = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM LIVRO ${where}`,
    termo,
    termo,
  );
  const total = count?.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / TAMANHO_PAGINA));
  const atual = Math.min(Math.max(1, Math.trunc(pagina) || 1), paginas);
  const livros = await db.getAllAsync<Livro>(
    `SELECT * FROM LIVRO ${where} ORDER BY id ASC LIMIT ? OFFSET ?`,
    termo,
    termo,
    TAMANHO_PAGINA,
    (atual - 1) * TAMANHO_PAGINA,
  );
  const geral = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM LIVRO',
  );
  return {
    livros,
    total,
    totalGeral: geral?.total ?? 0,
    pagina: atual,
    paginas,
  };
}
