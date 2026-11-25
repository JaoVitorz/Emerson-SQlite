// Testa o banco real com SQLite, cobrindo inicialização, CRUD, busca, validação e persistência.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inicializarBanco } from '../database/initialize.ts';
import {
  inserirLivro,
  buscarLivro,
  atualizarLivro,
  excluirLivro,
  listarLivros,
} from '../repositories/livrosRepository.ts';
import { validarLivro, paraFormulario } from '../validators/livroValidator.ts';
import { LIVROS_DEMONSTRACAO } from '../database/seed.ts';

// Executa as mesmas funções SQL do app em SQLite real, com a interface assíncrona do Expo.
function abrir(path = ':memory:') {
  const sqlite = new DatabaseSync(path);
  const params = (args) =>
    args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  return {
    execAsync: async (sql) => sqlite.exec(sql),
    runAsync: async (sql, ...args) => {
      const result = sqlite.prepare(sql).run(...params(args));
      return { ...result, lastInsertRowId: result.lastInsertRowid };
    },
    getFirstAsync: async (sql, ...args) =>
      sqlite.prepare(sql).get(...params(args)) ?? null,
    getAllAsync: async (sql, ...args) =>
      sqlite.prepare(sql).all(...params(args)),
    withTransactionAsync: async (fn) => {
      sqlite.exec('BEGIN');
      try {
        await fn();
        sqlite.exec('COMMIT');
      } catch (e) {
        sqlite.exec('ROLLBACK');
        throw e;
      }
    },
    close: () => sqlite.close(),
  };
}

test('12 registros iniciais, três páginas e nenhuma duplicação ao inicializar novamente', async () => {
  const db = abrir();
  try {
    await inicializarBanco(db);
    await inicializarBanco(db);
    const pages = await Promise.all([1, 2, 3].map((p) => listarLivros(db, p)));
    assert.deepEqual(
      pages.map((p) => p.livros.length),
      [5, 5, 2],
    );
    assert.equal(pages[0].total, 12);
    assert.equal(pages[0].paginas, 3);
    assert.equal(
      new Set(pages.flatMap((p) => p.livros.map((l) => l.id))).size,
      12,
    );
    assert.equal(pages[0].livros[0].titulo, 'Dom Casmurro');
  } finally {
    db.close();
  }
});

test('CRUD preserva apóstrofos, acentos e texto que parece SQL', async () => {
  const db = abrir();
  try {
    await inicializarBanco(db);
    const livro = {
      ...LIVROS_DEMONSTRACAO[0],
      titulo: "D'Água'); DROP TABLE LIVRO; --",
      nota: 4.5,
    };
    const id = await inserirLivro(db, livro);
    assert.equal((await buscarLivro(db, id)).titulo, livro.titulo);
    await atualizarLivro(db, id, {
      ...livro,
      titulo: 'Edição revisada',
      paginas: 500,
    });
    assert.equal((await buscarLivro(db, id)).paginas, 500);
    assert.equal((await listarLivros(db, 1, 'revisada')).total, 1);
    await excluirLivro(db, id);
    assert.equal(await buscarLivro(db, id), null);
    assert.equal((await listarLivros(db)).total, 12);
    await assert.rejects(atualizarLivro(db, id, livro), /não foi encontrado/);
    await assert.rejects(excluirLivro(db, id), /não foi encontrado/);
  } finally {
    db.close();
  }
});

test('busca por título e autor, curingas literais, páginas limitadas e filtro sem resultados', async () => {
  const db = abrir();
  try {
    await inicializarBanco(db);
    assert.equal((await listarLivros(db, 1, 'machado')).total, 2);
    assert.equal((await listarLivros(db, 1, 'Hobbit')).total, 1);
    assert.equal((await listarLivros(db, 1, '%')).total, 0);
    assert.equal((await listarLivros(db, 1, '_')).total, 0);
    const empty = await listarLivros(db, 999, 'inexistente');
    assert.equal(empty.pagina, 1);
    assert.equal(empty.total, 0);
    assert.equal((await listarLivros(db, 999)).pagina, 3);
    const last = await listarLivros(db, 3);
    for (const livro of last.livros) await excluirLivro(db, livro.id);
    assert.equal((await listarLivros(db, 3)).pagina, 2);
  } finally {
    db.close();
  }
});

test('dados persistem após fechar e reabrir o arquivo e exclusões não são recriadas', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'meuslivros-'));
  const path = join(dir, 'teste.db');
  let db = abrir(path);
  try {
    await inicializarBanco(db);
    await atualizarLivro(db, 1, {
      ...LIVROS_DEMONSTRACAO[0],
      anotacoes: 'Persistiu!',
    });
    await excluirLivro(db, 2);
    db.close();
    db = abrir(path);
    await inicializarBanco(db);
    assert.equal((await buscarLivro(db, 1)).anotacoes, 'Persistiu!');
    assert.equal(await buscarLivro(db, 2), null);
    for (const livro of await db.getAllAsync('SELECT id FROM LIVRO'))
      await excluirLivro(db, livro.id);
    db.close();
    db = abrir(path);
    await inicializarBanco(db);
    assert.equal((await listarLivros(db)).total, 0);
  } finally {
    db.close();
    rmSync(dir, { recursive: true });
  }
});

test('validação rejeita campos vazios, números inválidos e aceita nota com vírgula', () => {
  const form = paraFormulario(LIVROS_DEMONSTRACAO[0]);
  for (const change of [
    { titulo: ' ' },
    { autor: '' },
    { genero: '' },
    { ano: '0' },
    { ano: '1.5' },
    { paginas: '-1' },
    { paginas: '0' },
    { paginas: '1e2' },
    { nota: '' },
    { nota: '6' },
    { nota: 'NaN' },
    { anotacoes: 'a'.repeat(2001) },
  ])
    assert.throws(() => validarLivro({ ...form, ...change }));
  assert.equal(validarLivro({ ...form, nota: '4,5' }).nota, 4.5);
});

test('restrições do SQLite impedem registros inválidos fora da interface', async () => {
  const db = abrir();
  try {
    await inicializarBanco(db);
    await assert.rejects(
      db.runAsync('UPDATE LIVRO SET nota = 9 WHERE id = 1'),
      /CHECK/,
    );
    await assert.rejects(
      db.runAsync('UPDATE LIVRO SET paginas = 0 WHERE id = 1'),
      /CHECK/,
    );
    await assert.rejects(
      db.runAsync("UPDATE LIVRO SET titulo = '' WHERE id = 1"),
      /CHECK/,
    );
  } finally {
    db.close();
  }
});

test('scripts de configuração manual criam os mesmos 12 livros e podem ser repetidos', () => {
  const db = new DatabaseSync(':memory:');
  try {
    const schema = readFileSync(
      new URL('../database/sql/01_estrutura.sql', import.meta.url),
      'utf8',
    );
    const seed = readFileSync(
      new URL('../database/sql/02_demonstracao.sql', import.meta.url),
      'utf8',
    );
    db.exec(schema);
    db.exec(seed);
    db.exec(schema);
    db.exec(seed);
    assert.equal(
      db.prepare('SELECT COUNT(*) AS total FROM LIVRO').get().total,
      12,
    );
    assert.equal(
      db.prepare('SELECT titulo FROM LIVRO WHERE id = 1').get().titulo,
      'Dom Casmurro',
    );
  } finally {
    db.close();
  }
});
