// Centraliza o comando SQL de inserção e a conversão dos dados em parâmetros.
import type { DadosLivro } from '../models/Livro.ts';

export const INSERT =
  'INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) VALUES (?, ?, ?, ?, ?, ?, ?)';
export const valores = (l: DadosLivro) => [
  l.titulo,
  l.autor,
  l.genero,
  l.ano,
  l.paginas,
  l.nota,
  l.anotacoes,
];
