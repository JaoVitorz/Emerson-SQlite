# MeusLivros

Aplicativo mobile de biblioteca pessoal em React Native + Expo SDK 58, adaptado da base SQLITEMOBILE do professor Emerson Rocha. Implementa as cinco telas do [Figma MeusLivros](https://www.figma.com/design/3gY0yoA0YUGlz6mLpGNbFI/App-CRUD-SQLite---MeusLivros--Design-?node-id=4-249): lista, detalhes, cadastro, edição e confirmação de exclusão.

## Executar

No terminal, entre na pasta `SQLITE/SQLITEMOBILE` e execute:

```powershell
npm install
npm start
```

Abra o projeto em um dispositivo Android/iOS com uma versão do Expo Go compatível com SDK 58 ou em um development build desse SDK. Celular e computador devem estar na mesma rede. Para um emulador Android já iniciado, use `npm run android`. A versão web de demonstração inicia com `npm run web`.

O projeto mantém o SDK da base. Versões do Expo Go que aceitam somente SDKs mais recentes exigem um cliente compatível ou a atualização conjunta do Expo e das dependências.

Se o Metro informar `Unable to resolve` para um arquivo existente após mover pastas, encerre o servidor antigo com `Ctrl+C` e execute `npm run web:clean` (navegador) ou `npm run start:clean` (mobile). Isso reconstrói o mapa de arquivos e o cache do bundler, preservando os dados do SQLite. Continue usando a mesma porta e o mesmo navegador para acessar os dados já cadastrados na versão web.

## Organização das pastas

```text
SQLITEMOBILE/
├── frontend/
│   ├── App.tsx                  # Entrada visual e SafeAreaProvider
│   ├── screens/MeusLivros.tsx    # Telas, navegação e estado da interface
│   ├── components/              # Botão, texto, ícones, capa e avaliação
│   ├── styles/                  # Tema, cores, tipografia e estilos
│   └── utils/                   # Download/compartilhamento do banco por plataforma
├── backend/
│   ├── database/                # Conexão, estrutura e inicialização SQLite
│   │   └── sql/                 # Scripts para configuração manual
│   ├── models/Livro.ts          # Tipos, gêneros e tamanho da página
│   ├── repositories/            # Consultas SQL e operações CRUD
│   ├── services/                # Operações de dados usadas pelo frontend
│   ├── validators/              # Validação e conversão de formulários
│   ├── tests/                   # Testes com SQLite real
│   └── scripts/                 # Exportação dos scripts SQL
├── assets/                      # Ícones do app e referências do Figma
├── App.js                       # Encaminha para frontend/App.tsx
├── index.js                     # Registro do aplicativo no Expo
└── package.json                 # Dependências e comandos do projeto
```

O backend é a camada local de dados, executada no próprio aplicativo com SQLite. O frontend usa os serviços de `backend/services` e não abre conexões nem executa SQL. Os arquivos de configuração do Expo, Metro e TypeScript ficam na raiz; o projeto continua sendo iniciado com um único `npm start`.

## Funcionalidades

- Cadastro de título, autor, gênero, ano, páginas, nota e anotações.
- Consulta da lista e dos detalhes ao tocar no livro.
- Busca por título ou autor, combinada com paginação de cinco registros por página.
- Edição pelo lápis ou pelo botão nos detalhes.
- Exclusão com confirmação; cancelar preserva o registro.
- 12 livros ficticiamente avaliados para demonstrar três páginas.
- Validação dos campos e mensagens de erro/sucesso.
- SQLite local, funcionando sem servidor de banco de dados.
- Exportação do banco real para consulta em SQL no DB Browser ou DBeaver.

## Configuração manual do SQLite

Não há ORM. As instruções SQL são escritas em `backend/repositories/livrosRepository.ts` e `backend/database`. O arquivo `backend/database/connection.ts` abre uma conexão com `MeusLivros.db` usando `SQLite.openDatabaseAsync`; `initialize.ts` cria as tabelas e aguarda a inicialização antes de mostrar a lista.

1. Ativa `journal_mode = WAL`, `foreign_keys = ON` e espera de bloqueio de 5 segundos.
2. Cria `LIVRO` com chave primária autoincrementável, campos obrigatórios e restrições `CHECK`.
3. Cria `APP_CONFIG` e insere os 12 livros em uma transação, apenas na primeira inicialização de um banco vazio.
4. Marca `demo_v1` para que reabrir o aplicativo não duplique os livros nem restaure os excluídos.
5. Executa `INSERT`, `SELECT`, `UPDATE` e `DELETE` com parâmetros `?` para os dados informados pelo usuário.
6. Pagina no próprio SQL com `LIMIT 5 OFFSET ?` e conta os resultados com `COUNT(*)`.

O arquivo do banco é mantido pelo Expo no armazenamento do aplicativo. Fechar e abrir o app preserva as informações. Desinstalar o app ou limpar seus dados pode remover esse armazenamento. No navegador, o armazenamento é separado por origem e perfil; a execução web precisa dos headers COOP/COEP configurados em `metro.config.js`. O projeto usa SQLite também no web, sem substituição por localStorage.

Para praticar a configuração em DBeaver ou DB Browser for SQLite, crie um banco **novo** e execute, nesta ordem:

1. `backend/database/sql/01_estrutura.sql`: estrutura e configuração.
2. `backend/database/sql/02_demonstracao.sql`: carga dos 12 livros.
3. `backend/database/sql/03_operacoes.sql`: exemplos comentados de CRUD e consultas de paginação.

Esse banco de estudo no computador é independente do banco no celular. O aplicativo cria seu próprio arquivo ao ser executado. Para regenerar os dois primeiros scripts a partir do código do aplicativo, use `npm run sql:export` com Node 24 ou superior. A tabela `USUARIO` do banco `DDM2.db` da base original não é apagada nem modificada.

## Consultar os dados reais no DB Browser for SQLite

1. No aplicativo, toque em **Exportar banco**, acima da lista de livros.
2. No navegador, o arquivo `MeusLivros.db` é baixado. No Android/iOS, escolha um destino no menu de compartilhamento e transfira o arquivo para o computador.
3. No DB Browser, clique em **Abrir banco de dados / Open Database** e selecione o arquivo exportado.
4. Abra **Executar SQL / Execute SQL**, digite `SELECT * FROM LIVRO;` e execute.

A exportação inclui todos os registros atuais, mesmo que haja uma busca ou uma página selecionada. É uma cópia: alterações feitas nessa cópia no DB Browser não são sincronizadas com o app. Exporte novamente para consultar cadastros e edições posteriores. O navegador e o emulador Android mantêm bancos independentes.

## Roteiro de apresentação

1. Abra o aplicativo pela primeira vez: ele deve mostrar 12 livros.
2. Navegue pelas páginas 1, 2 e 3: são 5, 5 e 2 registros.
3. Busque por `Machado`; abra Dom Casmurro para visualizar todos os campos.
4. Toque em **Adicionar**, preencha todos os campos (anotações são opcionais) e salve.
5. Busque o livro criado, edite a nota ou as anotações e salve.
6. Feche e abra novamente o aplicativo para verificar a persistência.
7. Toque na lixeira e em **Cancelar**; depois confirme **Excluir**.
8. Abra novamente e verifique que o livro excluído não retornou.

## Verificações

```powershell
npm test
npm run typecheck
npm run export:android
```

Os testes exigem Node 24 ou superior e usam SQLite real (`node:sqlite`) com um adaptador para a API assíncrona. Validam o SQL e as regras utilizadas pelo aplicativo: CRUD, 12 registros, paginação, busca, parâmetros, limites, arquivo reaberto e exclusões não recriadas. Não substituem a execução final em Android/iOS.

A interface atual usa fundo de papel, verde escuro, títulos com serifa e uma lista com divisórias discretas. As capas tipográficas são compostas em React Native, com cores estáveis por título. Os ícones são da biblioteca `lucide-react-native`; a fonte Inter é incluída localmente por `@expo-google-fonts/inter`, e os títulos usam a fonte serifada do sistema. As barras de rolagem ficam ocultas. Os arquivos em `assets/figma` são as exportações preservadas da referência inicial.

Referências: [base do professor](https://github.com/Emerson-Rocha/SQLITE/tree/main/SQLITEMOBILE) e [documentação Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/).
