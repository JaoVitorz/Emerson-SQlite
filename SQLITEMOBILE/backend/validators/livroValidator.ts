// Valida campos do formulário e converte os textos em dados tipados do livro.
// Importa a lista dos gêneros permitidos para conferir a escolha do usuário.
import { GENEROS } from '../models/Livro.ts';
// Importa apenas tipos: DadosLivro tem campos numéricos; FormularioLivro tem todos os campos como texto.
import type { DadosLivro, FormularioLivro } from '../models/Livro.ts';

// Exporta a função para outros arquivos; recebe o formulário e retorna os dados validados.
export function validarLivro(form: FormularioLivro): DadosLivro {
  // Remove espaços do início e do fim do título, preservando os espaços entre palavras.
  const titulo = form.titulo.trim();
  // Remove espaços do início e do fim do nome do autor.
  const autor = form.autor.trim();
  // !titulo verifica se está vazio; || significa "ou"; length conta o tamanho do texto.
  if (!titulo || titulo.length > 150)
    // Lança um erro e interrompe a função se o título estiver vazio ou exceder o limite.
    throw new Error('Informe um título com até 150 caracteres.');
  // Rejeita um autor vazio ou com mais de 120 caracteres.
  if (!autor || autor.length > 120)
    // Sem chaves, o if controla somente a próxima instrução: este throw.
    throw new Error('Informe um autor com até 120 caracteres.');
  // includes verifica se o gênero pertence à lista; ! inverte o resultado para detectar um valor inválido.
  // (typeof GENEROS)[number] obtém o tipo dos elementos da lista.
  // O as informa esse tipo ao TypeScript; não converte nem valida o valor durante a execução.
  if (!GENEROS.includes(form.genero as (typeof GENEROS)[number]))
    // Interrompe a função caso o gênero não esteja entre as opções permitidas.
    throw new Error('Selecione o gênero do livro.');
  // A expressão regular exige de 1 a 4 dígitos: ^ é o início, \d é um dígito e $ é o fim.
  // test verifica o formato; Number converte o texto para verificar se o ano é menor que 1.
  if (!/^\d{1,4}$/.test(form.ano.trim()) || Number(form.ano) < 1)
    // Rejeita anos fora do intervalo ou textos com letras, sinais ou casas decimais.
    throw new Error('Informe um ano entre 1 e 9999.');
  // Inicia uma condição com três verificações; basta uma ser verdadeira para lançar o erro.
  if (
    // \d+ exige um ou mais dígitos; !test detecta texto vazio ou caracteres não permitidos.
    !/^\d+$/.test(form.paginas.trim()) ||
    // Rejeita uma quantidade menor que uma página.
    Number(form.paginas) < 1 ||
    // Rejeita uma quantidade maior que cem mil páginas.
    Number(form.paginas) > 100000
  // Fecha a condição do if.
  )
    // Informa o intervalo permitido e interrompe a função.
    throw new Error('Informe uma quantidade de páginas entre 1 e 100000.');
  // Remove espaços externos, troca a primeira vírgula por ponto e converte a nota para número.
  const nota = Number(form.nota.trim().replace(',', '.'));
  // Rejeita NaN, infinitos e notas fora do intervalo de 1 a 5; notas decimais são aceitas.
  if (!Number.isFinite(nota) || nota < 1 || nota > 5)
    // Informa o intervalo da nota e um exemplo com vírgula decimal.
    throw new Error('Informe uma nota entre 1 e 5. Exemplo: 4,5.');
  // Remove espaços externos das anotações; o campo pode ficar vazio.
  const anotacoes = form.anotacoes.trim();
  // Confere se as anotações ultrapassam o limite de tamanho.
  if (anotacoes.length > 2000)
    // Interrompe a função quando o texto excede 2000 caracteres.
    throw new Error('Use até 2000 caracteres nas anotações.');
  // Todas as validações passaram: retorna um objeto compatível com DadosLivro.
  return {
    // Abrevia titulo: titulo, usando o título já tratado.
    titulo,
    // Abrevia autor: autor, usando o nome já tratado.
    autor,
    // Copia o gênero que já foi validado na lista GENEROS.
    genero: form.genero,
    // Converte o ano de texto para número.
    ano: Number(form.ano),
    // Converte a quantidade de páginas de texto para número.
    paginas: Number(form.paginas),
    // Inclui a nota que já foi convertida e validada.
    nota,
    // Inclui as anotações sem espaços externos.
    anotacoes,
  // Fecha o objeto retornado e encerra a instrução return.
  };
// Encerra a função validarLivro.
}

// Exporta a função que prepara os dados de um livro para preencher o formulário de edição.
export function paraFormulario(livro: DadosLivro): FormularioLivro {
  // Retorna um novo objeto com todos os campos no formato de texto exigido pelo formulário.
  return {
    // Copia o título, que já é texto.
    titulo: livro.titulo,
    // Copia o autor, que já é texto.
    autor: livro.autor,
    // Copia o gênero, que já é texto.
    genero: livro.genero,
    // Converte o ano numérico para texto; por exemplo, 2026 vira "2026".
    ano: String(livro.ano),
    // Converte a quantidade de páginas para texto.
    paginas: String(livro.paginas),
    // Converte a nota para texto; uma nota 4.5 vira "4.5", com ponto decimal.
    nota: String(livro.nota),
    // Copia as anotações, que já são texto.
    anotacoes: livro.anotacoes,
  // Fecha o objeto retornado e encerra a instrução return.
  };
// Encerra a função paraFormulario.
}
