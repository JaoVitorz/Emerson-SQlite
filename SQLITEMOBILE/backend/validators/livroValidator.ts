import { GENEROS } from '../models/Livro.ts';
import type { DadosLivro, FormularioLivro } from '../models/Livro.ts';

export function validarLivro(form: FormularioLivro): DadosLivro {
  const titulo = form.titulo.trim();
  const autor = form.autor.trim();
  if (!titulo || titulo.length > 150)
    throw new Error('Informe um título com até 150 caracteres.');
  if (!autor || autor.length > 120)
    throw new Error('Informe um autor com até 120 caracteres.');
  if (!GENEROS.includes(form.genero as (typeof GENEROS)[number]))
    throw new Error('Selecione o gênero do livro.');
  if (!/^\d{1,4}$/.test(form.ano.trim()) || Number(form.ano) < 1)
    throw new Error('Informe um ano entre 1 e 9999.');
  if (
    !/^\d+$/.test(form.paginas.trim()) ||
    Number(form.paginas) < 1 ||
    Number(form.paginas) > 100000
  )
    throw new Error('Informe uma quantidade de páginas entre 1 e 100000.');
  const nota = Number(form.nota.trim().replace(',', '.'));
  if (!Number.isFinite(nota) || nota < 1 || nota > 5)
    throw new Error('Informe uma nota entre 1 e 5. Exemplo: 4,5.');
  const anotacoes = form.anotacoes.trim();
  if (anotacoes.length > 2000)
    throw new Error('Use até 2000 caracteres nas anotações.');
  return {
    titulo,
    autor,
    genero: form.genero,
    ano: Number(form.ano),
    paginas: Number(form.paginas),
    nota,
    anotacoes,
  };
}

export function paraFormulario(livro: DadosLivro): FormularioLivro {
  return {
    titulo: livro.titulo,
    autor: livro.autor,
    genero: livro.genero,
    ano: String(livro.ano),
    paginas: String(livro.paginas),
    nota: String(livro.nota),
    anotacoes: livro.anotacoes,
  };
}
