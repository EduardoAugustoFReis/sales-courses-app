# 🎓 Sales-Courses-App

Aplicação backend desenvolvida com **NestJS + Prisma** para venda de cursos online.  
Aqui você encontra funcionalidades como gestão de cursos, módulos e compras, sistema de autenticação, pagamentos simulados e regras de acesso baseadas no tipo de usuário.

---

## ✅ Funcionalidades principais

- Autenticação e autorização via JWT (aluno, teacher e admin)  
- CRUD de cursos, módulos e aulas  
- Cursos iniciam como **DRAFT** e só podem ser comprados após serem **PUBLISHED**  
- Simulação de pagamento com geração de transactionId  
- Sistema completo de compras:
  - Compra de cursos  
  - Prevenção de compras duplicadas  
  - Listagem de compras do aluno  
  - Listagem global (admin)  
  - Reembolso de compra  
- Acesso aos módulos e conteúdo somente se:
  - O aluno comprou o curso **e**
  - O curso está **PUBLISHED**
- Organização modular por contexto (auth, users, courses, purchases, modules)

---

## 🛠 Tecnologias utilizadas

- **Node.js**
- **NestJS**
- **Prisma ORM**
- **PostgreSQL** 
- **TypeScript**
- **JWT + Guards + Roles**
- **Class-validator**
- **Dotenv**
---

## 🚀 Como rodar localmente

### 1. Clone o repositório:

```bash
git clone https://github.com/EduardoAugustoFReis/sales-courses-app.git
cd sales-courses-app
````
### 2. Instale as dependências:
```bash
npm install
````
### 3. Configuração do arquivo `.env`

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`.

Neste arquivo você deve definir:

#### **String de conexão com o banco de dados (PostgreSQL)**

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
```
#### **Chave secreta para geração e validação de JWT**
```
JWT_SECRET="sua_chave_secreta_aqui"
```
### 4. Execute as migrations (criação do banco):
```bash
npx prisma migrate dev
````
### 5. Inicie o servidor: 
```bash
npm run start:dev
````
A API estará disponível em:
➡️ http://localhost:3000

📁 Estrutura do Projeto
```
sales-courses-app/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── auth/
│   ├── courses/
│   ├── modules/
│   ├── purchases/
│   ├── users/
│   └── common/
├── .env.example
├── package.json
└── README.md

```

📘 Documentação da API (Swagger)

A aplicação possui documentação automática gerada com Swagger, facilitando a inspeção e teste dos endpoints diretamente pelo navegador.

🔗 Acesse o Swagger:

Depois de rodar o servidor:

➡️ http://localhost:3000/api

✨ O Swagger inclui:

Descrição detalhada de cada rota

Schemas dos DTOs

Validações

Exemplo completo de requisições

Responses de sucesso e erro

Autenticação com Bearer Token (JWT)

🔧 Principais Endpoints da API

👤 Users (Usuários)
| Método | Rota         | Descrição                |
| ------ | ------------ | ------------------------ |
| POST   | `/users`     | Criar usuário            |
| GET    | `/users`     | Listar todos os usuários |
| GET    | `/users/:id` | Buscar usuário por ID    |
| DELETE | `/users/:id` | Deletar usuário          |
| PATCH  | `/users/:id` | Atualizar usuário        |

🔐 Auth (Autenticação)
| Método | Rota             | Descrição               |
| ------ | ---------------- | ----------------------- |
| POST   | `/auth/register` | Registrar usuário       |
| POST   | `/auth/login`    | Fazer login e gerar JWT |

🎓 Courses (Cursos)
| Método | Rota                   | Descrição                |
| ------ | ---------------------- | ------------------------ |
| POST   | `/courses`             | Criar curso (teacher)    |
| GET    | `/courses`             | Listar cursos publicados |
| GET    | `/courses/:id`         | Ver curso                |
| PATCH  | `/courses/:id`         | Atualizar curso          |
| DELETE  | `/courses/:id`        | Deletar curso            |
| PATCH  | `/courses/:id/publish` | Publicar curso           |

📦 Modules (Módulos)
| Método | Rota                                   | Descrição                                    |
| ------ | -------------------------------------- | -------------------------------------------- |
| POST   | `/courses/:courseId/modules`           | Criar módulo                                 |
| GET    | `/courses/:courseId/modules`           | Listar todos os módulos do curso (protegido) |
| GET    | `/courses/:courseId/modules/:moduleId` | Listar um módulo específico (protegido)      |
| DELETE | `/courses/:courseId/modules/:moduleId` | Deletar módulo                               |
| PATCH  | `/courses/:courseId/modules/:moduleId` | Atualizar módulo                             |

🎥 Lessons (Lições)
| Método | Rota                                   | Descrição                       |
| ------ | -------------------------------------- | ------------------------------- |
| POST   | `/modules/:moduleId/lessons`           | Criar aula dentro do módulo     |
| GET    | `/modules/:moduleId/lessons`           | Listar todas as aulas do módulo |
| GET    | `/modules/:moduleId/lessons/:lessonId` | Listar uma aula específica      |
| DELETE | `/modules/:moduleId/lessons/:lessonId` | Deletar aula                    |
| PATCH  | `/modules/:moduleId/lessons/:lessonId` | Atualizar aula                  |

🛒 Purchases (compras)
| Método | Rota                          | Descrição               |
| ------ | ----------------------------- | ----------------------- |
| POST   | `/courses/:courseId/purchase` | Comprar curso           |
| GET    | `/purchases/me`               | Listar compras do aluno |
| GET    | `/purchases`                  | Listar compras (admin)  |
| POST   | `/purchases/:id/refund`       | Reembolsar compra       |

🚨 Regras de negócio importantes
✔ Cursos

Criados como DRAFT

Só podem ser comprados após PUBLISHED

✔ Compras

Um aluno não pode comprar o mesmo curso duas vezes

Validação via chave composta (studentId + courseId)

Pagamento é simulado

transactionId gerado automaticamente

✔ Acesso ao conteúdo

Para acessar módulos/aulas:

O curso deve estar PUBLISHED

O aluno deve ter comprado o curso

✔ Reembolso

Status da compra vira CANCELED

Pode ser solicitado por:

admin

teacher dono do curso

✨ Melhorias futuras

Upload real de imagens (S3 ou Cloudinary)

Dashboard administrativo

Player de vídeo com progresso do aluno

Pagamentos reais (Stripe/Pix)

Testes unitários e end-to-end

Deploy em Docker
