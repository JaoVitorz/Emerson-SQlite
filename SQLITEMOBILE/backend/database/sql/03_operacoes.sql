-- Exemplos didáticos de consultas SQL CRUD e paginação para estudo manual.
-- Referência didática. No aplicativo os valores são passados por parâmetros ?.
-- SELECT não modifica os dados. Execute INSERT/UPDATE/DELETE individualmente
-- e substitua os valores e o ID pelo registro desejado.

-- CREATE
-- INSERT INTO LIVRO (titulo, autor, genero, ano, paginas, nota, anotacoes)
-- VALUES ('Livro de exemplo', 'Autor', 'Romance', 2026, 200, 4.5, 'Anotação');

-- READ: cinco registros por página; página 1 = OFFSET 0; página 2 = OFFSET 5.
SELECT * FROM LIVRO ORDER BY id ASC LIMIT 5 OFFSET 0;
SELECT COUNT(*) AS total FROM LIVRO;
SELECT * FROM LIVRO WHERE id = 1;
SELECT * FROM LIVRO WHERE titulo LIKE '%Machado%' OR autor LIKE '%Machado%';

-- UPDATE
-- UPDATE LIVRO SET titulo = 'Novo título', nota = 5 WHERE id = 1;

-- DELETE
-- DELETE FROM LIVRO WHERE id = 1;
