// Gera os scripts SQL de estrutura e demonstração a partir dos dados do projeto.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SCHEMA } from '../database/schema.ts';
import { LIVROS_DEMONSTRACAO } from '../database/seed.ts';

const folder = new URL('../database/sql/', import.meta.url);
mkdirSync(folder, { recursive: true });
writeFileSync(
  new URL('01_estrutura.sql', folder),
  '-- Execute em um banco SQLite. Não apaga tabelas existentes.\nPRAGMA journal_mode = WAL;\nPRAGMA foreign_keys = ON;\n' +
    SCHEMA,
);
const sqlText = (value) =>
  typeof value === 'number'
    ? String(value)
    : "'" + value.replaceAll("'", "''") + "'";
const inserts = LIVROS_DEMONSTRACAO.map((l) => {
  const values = [
    l.titulo,
    l.autor,
    l.genero,
    l.ano,
    l.paginas,
    l.nota,
    l.anotacoes,
  ]
    .map(sqlText)
    .join(', ');
  return `INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) SELECT ${values} WHERE NOT EXISTS (SELECT 1 FROM APP_CONFIG WHERE chave = 'demo_v1');`;
});
writeFileSync(
  new URL('02_demonstracao.sql', folder),
  '-- Execute depois de 01_estrutura.sql em um banco novo.\n-- A marca demo_v1 impede repetir a carga.\nBEGIN TRANSACTION;\n' +
    inserts.join('\n') +
    "\nINSERT OR IGNORE INTO APP_CONFIG (chave, valor) VALUES ('demo_v1', 'concluido');\nCOMMIT;\n",
);
console.log('SQL exportado para ' + fileURLToPath(folder));
