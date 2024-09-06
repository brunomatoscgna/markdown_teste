const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db'); // Importa o arquivo db.js que inicializa o banco de dados

const app = express();
const JWT_SECRET = 'mySecretKey'; // Idealmente, guarde isso em variáveis de ambiente

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Acesso negado. Nenhum token fornecido.');

  jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send('Token inválido.');
    req.user = decoded; // Decodificar o usuário a partir do token
    next();
  });
};

// Rota de registro de novos usuários
app.post('/auth/register', (req, res) => {
  const { nome_usuario, email, senha } = req.body;

  if (!nome_usuario || !email || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  // Verificar se o email já está registrado
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (row) {
      return res.status(400).json({ error: 'Usuário já registrado com este email' });
    }

    const hashedPassword = bcrypt.hashSync(senha, 10); // Criptografa a senha

    // Inserir novo usuário no banco de dados
    db.run(
      'INSERT INTO users (nome_usuario, email, senha) VALUES (?, ?, ?)',
      [nome_usuario, email, hashedPassword],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao registrar usuário' });
        }

        const token = jwt.sign({ id: this.lastID, nome_usuario }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, nome_usuario });
      }
    );
  });
});

// Rota de login
app.post('/auth/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  // Buscar usuário no banco de dados pelo email
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    // Comparar a senha fornecida com a senha armazenada
    const isValid = bcrypt.compareSync(senha, user.senha);
    if (!isValid) {
      return res.status(400).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign({ id: user.id, nome_usuario: user.nome_usuario }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, nome_usuario: user.nome_usuario });
  });
});

// Rota para salvar um documento
app.post('/documents/save', authenticateToken, (req, res) => {
  const { name, content } = req.body;
  const userId = req.user.id;

  if (!name || !content) {
    return res.status(400).json({ error: 'Nome e conteúdo do documento são obrigatórios.' });
  }

  db.run(
    `INSERT INTO documents (user_id, name, content) VALUES (?, ?, ?)`,
    [userId, name, content],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao salvar o documento.' });
      }
      res.status(200).json({ message: 'Documento salvo com sucesso', documentId: this.lastID });
    }
  );
});

// Rota para listar documentos de um usuário
app.get('/documents', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(`SELECT id, name, date_saved FROM documents WHERE user_id = ? ORDER BY date_saved DESC`, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar documentos.' });
    }
    res.status(200).json(rows);
  });
});

// Rota para carregar um documento específico
app.get('/documents/:id', authenticateToken, (req, res) => {
  const documentId = req.params.id;
  const userId = req.user.id;

  db.get(`SELECT * FROM documents WHERE id = ? AND user_id = ?`, [documentId, userId], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }
    res.status(200).json(row);
  });
});

// Iniciar o servidor de autenticação
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
