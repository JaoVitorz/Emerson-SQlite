-- Execute depois de 01_estrutura.sql em um banco novo.
-- A marca demo_v1 impede repetir a carga.
BEGIN TRANSACTION;
INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) SELECT 'Dom Casmurro', 'Machado de Assis', 'Romance', 1899, 256, 5, 'Clássico sobre ciúme e memória. Reler antes da prova de literatura.' WHERE NOT EXISTS (SELECT 1 FROM APP_CONFIG WHERE chave = 'demo_v1');
INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) SELECT 'O Hobbit', 'J.R.R. Tolkien', 'Fantasia', 1937, 310, 5, 'Uma aventura pela Terra-média.' WHERE NOT EXISTS (SELECT 1 FROM APP_CONFIG WHERE chave = 'demo_v1');
INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) SELECT '1984', 'George Orwell', 'Distopia', 1949, 328, 5, 'Reflexões sobre vigilância e liberdade.' WHERE NOT EXISTS (SELECT 1 FROM APP_CONFIG WHERE chave = 'demo_v1');
INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) SELECT 'O Pequeno Príncipe', 'Antoine de Saint-Exupéry', 'Fábula', 1943, 96, 4.5, 'Sobre amizade e o que é essencial.' WHERE NOT EXISTS (SELECT 1 FROM APP_CONFIG WHERE chave = 'demo_v1');
INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) SELECT 'Capitães da Areia', 'Jorge Amado', 'Romance', 1937, 280, 4, 'A infância nas ruas de Salvador.' WHERE NOT EXISTS (SELECT 1 FROM APP_CONFIG WHERE chave = 'demo_v1');
INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) SELECT 'A Revolução dos Bichos', 'George Orwell', 'Distopia', 1945, 152, 4.5, '' WHERE NOT EXISTS (SELECT 1 FROM APP_CONFIG WHERE chave = 'demo_v1');
INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) SELECT 'Memórias Póstumas de Brás Cubas', 'Machado de Assis', 'Romance', 1881, 240, 5, '' WHERE NOT EXISTS (SELECT 1 FROM APP_CONFIG WHERE chave = 'demo_v1');
INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) SELECT 'A Hora da Estrela', 'Clarice Lispector', 'Romance', 1977, 88, 4.5, '' WHERE NOT EXISTS (SELECT 1 FROM APP_CONFIG WHERE chave = 'demo_v1');
INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) SELECT 'Duna', 'Frank Herbert', 'Ficção científica', 1965, 680, 5, '' WHERE NOT EXISTS (SELECT 1 FROM APP_CONFIG WHERE chave = 'demo_v1');
INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) SELECT 'O Cortiço', 'Aluísio Azevedo', 'Romance', 1890, 304, 4, '' WHERE NOT EXISTS (SELECT 1 FROM APP_CONFIG WHERE chave = 'demo_v1');
INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) SELECT 'Vidas Secas', 'Graciliano Ramos', 'Romance', 1938, 176, 4.5, '' WHERE NOT EXISTS (SELECT 1 FROM APP_CONFIG WHERE chave = 'demo_v1');
INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes) SELECT 'O Alquimista', 'Paulo Coelho', 'Romance', 1988, 208, 4, '' WHERE NOT EXISTS (SELECT 1 FROM APP_CONFIG WHERE chave = 'demo_v1');
INSERT OR IGNORE INTO APP_CONFIG (chave, valor) VALUES ('demo_v1', 'concluido');
COMMIT;
