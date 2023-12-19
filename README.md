# Daily Diet

API rest para controle de dieta diária.

## Principais conceitos

- **Váriaveis de ambiente** - armazenamento de dados sensíveis e diferentes para ambiente de teste, desenvolvimento e produção
- **Migrations** - estruturação e gerenciamento da estrutura do banco de dados de forma versionada e segura
- **API REST** - criação e estruturação de portas de entrada da aplicação através de rotas HTTP, seguindo o padrão REST
- **Cookies** - fragmento de dados para manter contexto entre requisições. Nesta aplicação, usado para identificar o usuário
- **Testes E2E** - testes de ponta a ponta na aplicação, simulando toda interação do lado do cliente no servidor

## Principais tecnologias

- [TypeScript](https://www.typescriptlang.org/) - JavaScript com tipagem estática
- [Node.js](https://nodejs.org/) - interpretador do JavaScript em server-side
- [Fastify](https://fastify.dev/) - framework para construção do servidor
- [Knex.js](https://knexjs.org/) - SQL builder
- [Vitest](https://vitest.dev/) - framework de testes

## Requisitos funcionais

### Refeição

- Deve ser possível registrar uma refeição feita, com as seguintes informações:
  - Nome
  - Descrição
  - Data e Hora
  - Está dentro ou não da dieta
- Deve ser possível editar uma refeição
- Deve ser possível apagar uma refeição
- Deve ser possível listar todas as refeições de um usuário
- Deve ser possível visualizar uma única refeição

### Usuário

- Deve ser possível criar um usuário
- Deve ser possível recuperar as métricas de um usuário
  - Quantidade total de refeições registradas
  - Quantidade total de refeições dentro da dieta
  - Quantidade total de refeições fora da dieta
  - Melhor sequência de refeições dentro da dieta

## Regras de negócio

- Deve ser possível identificar o usuário entre as requisições
- O usuário só pode visualizar, editar e apagar as refeições o qual ele criou
