
# API Documentation

## Endpoints

### Autenticação

#### 1. Registrar Usuário

- **URL:** `/auth/register`
- **Método:** `POST`
- **Descrição:** Registra um novo usuário no sistema.
  
**Corpo da Requisição:**

```json
{
  "nome_usuario": "Seu Nome",
  "email": "email@example.com",
  "senha": "sua_senha"
}
```

**Exemplo de Resposta:**

```json
{
  "token": "JWT_TOKEN_AQUI",
  "nome_usuario": "Seu Nome"
}
```

#### 2. Login

- **URL:** `/auth/login`
- **Método:** `POST`
- **Descrição:** Faz login no sistema.

**Corpo da Requisição:**

```json
{
  "email": "email@example.com",
  "senha": "sua_senha"
}
```

**Exemplo de Resposta:**

```json
{
  "token": "JWT_TOKEN_AQUI",
  "nome_usuario": "Seu Nome"
}
```

### Documentos

#### 1. Criar/Salvar Documento

- **URL:** `/documents/save`
- **Método:** `POST`
- **Descrição:** Salva ou cria um novo documento.

**Cabeçalhos:**

```
Authorization: Bearer <TOKEN>
```

**Corpo da Requisição:**

```json
{
  "name": "Nome do Documento",
  "content": "Conteúdo do documento"
}
```

**Exemplo de Resposta:**

```json
{
  "message": "Documento salvo com sucesso"
}
```

#### 2. Listar Documentos

- **URL:** `/documents`
- **Método:** `GET`
- **Descrição:** Retorna a lista de todos os documentos.

**Cabeçalhos:**

```
Authorization: Bearer <TOKEN>
```

**Exemplo de Resposta:**

```json
[
  {
    "id": 1,
    "name": "Documento 1",
    "date_saved": "2024-09-01T12:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Documento 2",
    "date_saved": "2024-09-02T15:30:00.000Z"
  }
]
```

#### 3. Carregar Documento Específico

- **URL:** `/documents/:id`
- **Método:** `GET`
- **Descrição:** Retorna um documento específico pelo seu ID.

**Cabeçalhos:**

```
Authorization: Bearer <TOKEN>
```

**Parâmetros de URL:**
- `:id` - O ID do documento a ser carregado.

**Exemplo de Resposta:**

```json
{
  "id": 1,
  "name": "Documento 1",
  "content": "Conteúdo do documento",
  "date_saved": "2024-09-01T12:00:00.000Z"
}
```

#### 4. Editar Documento

- **URL:** `/documents/:id`
- **Método:** `PUT`
- **Descrição:** Edita um documento existente.

**Cabeçalhos:**

```
Authorization: Bearer <TOKEN>
```

**Corpo da Requisição:**

```json
{
  "name": "Nome atualizado do Documento",
  "content": "Conteúdo atualizado do documento"
}
```

**Exemplo de Resposta:**

```json
{
  "message": "Documento atualizado com sucesso"
}
```

### WebSockets

#### 1. Edição em Tempo Real

- **URL WebSocket:** `ws://localhost:8080`
- **Descrição:** Conecta-se a um WebSocket para edição colaborativa em tempo real de documentos.

**Mensagem enviada (exemplo de edição):**

```json
{
  "token": "JWT_TOKEN_AQUI",
  "text": "Texto atualizado",
  "user": "Nome do Usuário"
}
```

**Mensagem recebida:**

```json
{
  "text": "Texto atualizado",
  "editedBy": "Nome do Usuário",
  "usersEditing": ["User 1", "User 2"]
}
```

### Erros Comuns

#### 1. Respostas de Erro

- **Erro de Autenticação:**

```json
{
  "error": "Token inválido"
}
```

- **Erro ao salvar documento:**

```json
{
  "error": "Erro ao salvar o documento"
}
```

- **Erro de credenciais inválidas (login):**

```json
{
  "error": "Email ou senha incorretos"
}
```

### Tecnologias Usadas

- **Node.js**
- **Express**
- **SQLite** (para armazenamento de dados)
- **JWT (JSON Web Token)** para autenticação
- **WebSockets** para edição colaborativa em tempo real
