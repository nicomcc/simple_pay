# Simple Pay

Serviço de pagamento simplificado integrado a API do pagar.me. Possui funcionalidades para pagamento à usuário cadastrado, lista de recebíveis e pagamentos realizados, e transferência interna entre contas.

Deploy para testes: [Simple Pay - Heroku](https://intense-fortress-30981.herokuapp.com/)

## Iniciando

Essas instruções fornecerão uma cópia do projeto em execução na sua máquina local para fins de desenvolvimento e teste.

### Pré-Requisitos
Ações necessárias para que a aplicação possa ser executada:

- `git clone https://github.com/nicomcc/simple_pay.git` : Clonar Repositório

- `npm i` : Instalar pacotes npm

- `mongod` : Instalar MongoDB e iniciar banco de dados local através do comando

- Arquivo .env com as variáveis para criptografia e sua API key do pagar.me

**Importante: É necessário trocar para versão de testes dentro da dashboard da API do pagar.me**
```
SECRET=Sua_chave_criptografada.
APIKEY=sua_apikey

```
### Rodando Aplicação
Basta utilizar o comando node index.js ou nodemon index.js

### Arquivos e Pastas

```sh
├── public
│   └── css
│       └── styles.css
├── src
│   ├── clientSchema.js
│   ├── paymentSchema.js
│   ├── transactionSchema.js
│   ├── userschema.js
│   ├── date.js
│   └── simpledb.js
├── views
│   ├── partials
│   │   ├── footer.ejs
│   │   ├── header.ejs
│   │   └── headerlogin.ejs
│   ├── addclient.ejs
│   ├── clientlist.ejs
│   ├── home.ejs
│   ├── login.ejs
│   ├── payment.ejs
│   ├── paymentsuccesfull.ejs
│   ├── register.ejs
│   ├── transaction.ejs
│   ├── transfer.ejs
│   └── wallet.ejs
├── .editorconfig
├── .env
├── .eslintrc.json
├── .gitignore
├── index.js
├── package-lock.json
├── package.json
└── README.md
```
## Funcionalidades

### Login
* Senha criptografada, com hash e salt
* Sessão é salva e reconhecida por cookies
* Verifica e processa pagamentos com status "waiting_funds" de acordo com data à receber
* Checa data de pagamento dos pagamentos com status "waiting_funds" e processa status para "paid" de acordo com data

### Register
* Checa se e-mail já foi utilizado ao criar nova conta

### Payment
* Simula pagamento de consumidor à usuário da plataforma - Cartão é verificado por integração a API do pagar.me
* Verifica se usuário existe. Caso exista, verifica se nome e sobrenome conferem com dados do respectivo usuário
* Disponibiliza opção de pagamento em crédito ou débito. Débito tem pagamento instantaneo, crédito somente após 30 dias
* Retorna tela de erro das respectivas checagens descritas acima
* Como esta sessão é integrada a API do pagar.me, é necessário usar um cartão válido para testar transações. É possível utilizar um gerador de número de cartões, ou utilizar o seguinte cartão, sugerido na documentação do pagar.me:
```
Número do cartão: 4111111111111111,
Nome no cartão: Morpheus Fishburne,
Data de validade: 09/22
CVV: 123
```
### Wallet
* Disponibiliza saldo da carteira
* Lista de todos os recebimentos do usuário. Caso transferência seja por cartão de débito ou transferencia interna, pagamento é processado na hora. Caso seja crédito, pagamento é processado após 30 dias.
* Diferentes taxas para cada tipo de pagamento. 3% para débito, 5% para crédito e 0% para transferência interna.
* Caso data de pagamento tenha chegado, pagamentos com status "waiting_funds" são processado automaticamente quando usuário faz login.

### Transfer
* Semelhante a sessão payments, sessão utilizada para simular pagamento a outros usuários da plataforma ou a fornecedores.
* Também possui as funcionalidades de pagamento no crédito e débito, mas também possui a opção de transferência interna, de acordo com fundo da carteira.
* Transferência interna: caso usuário tenha fundos suficientes, pagamento é debitado do usuário e adicionado ao contato instantâneamente.
* Também possui checagens se usuário existe e verifica se nome e sobrenome conferem com dados do respectivo usuário.
* Salva no banco de dados o pagamento realizado.
* Por efeitos de testes, esta sessão de pagamentos não foi integrada com a API do pagar.me. Podendo ser utilizado um cartão com dados aleatórios para pagamento.

### Transactions
* Lista de todos os pagamentos realizados pelo usuário


## Utilizando Lint
Para manter o código limpo e consistente, foi utilizado o eslint com a predefinição do styleguide do Airbnb. 2 scripts foram utilizados para eventuais correções e verificações:

- `npm run lint`: lint em todos os arquivos procurando por erros
- `npm run lintfix`: corrige automaticamente algum dos erros encontrados

Decidi por enquanto não utilizar nenhum teste prepush no git para verificação dos erros no styleguide. Apesar de seguir a styleguide, há algumas excessões de identação no código.

Este projeto usa eslint e .editorconfig está definido para ter indent_size de **2 espaços**.
Foram removidos os warnings por utilização de console.log no arquivo .eslintrc.json.
Você pode alterar isso nos respectivos arquivos.
