// SQL escrito manualmente; sem ORM. A tabela original USUARIO não é alterada.
export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS LIVRO (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL CHECK(length(trim(titulo)) BETWEEN 1 AND 150),
    autor TEXT NOT NULL CHECK(length(trim(autor)) BETWEEN 1 AND 120),
    genero TEXT NOT NULL CHECK(length(trim(genero)) > 0),
    ano INTEGER NOT NULL CHECK(typeof(ano) = 'integer' AND ano BETWEEN 1 AND 9999),
    paginas INTEGER NOT NULL CHECK(typeof(paginas) = 'integer' AND paginas BETWEEN 1 AND 100000),
    nota REAL NOT NULL CHECK(nota BETWEEN 1 AND 5),
    anotacoes TEXT NOT NULL DEFAULT '' CHECK(length(anotacoes) <= 2000)
  );
  CREATE TABLE IF NOT EXISTS APP_CONFIG (chave TEXT PRIMARY KEY NOT NULL, valor TEXT NOT NULL);
`;
// SQL escrito manualmente; sem ORM. A tabela original USUARIO não é alterada.
