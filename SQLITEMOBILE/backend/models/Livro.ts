export const GENEROS = [
  'Romance',
  'Fantasia',
  'Distopia',
  'Fábula',
  'Ficção científica',
  'Mistério',
  'Biografia',
  'Poesia',
  'Não ficção',
  'Outro',
] as const;
export const TAMANHO_PAGINA = 5;
export type DadosLivro = {
  titulo: string;
  autor: string;
  genero: string;
  ano: number;
  paginas: number;
  nota: number;
  anotacoes: string;
};
export type Livro = DadosLivro & { id: number };
export type FormularioLivro = { [K in keyof DadosLivro]: string };
