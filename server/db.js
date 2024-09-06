const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define o caminho do banco de dados SQLite (arquivo físico)
const dbPath = path.resolve(__dirname, 'database.sqlite');

// Conectando ao banco de dados SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados SQLite:', err);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Criar a tabela de usuários, se ela não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_usuario TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela de usuários:', err);
    } else {
      console.log('Tabela de usuários criada com sucesso ou já existe.');
    }
  });

  // Criar a tabela de documentos, se ela não existir
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      date_saved DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela de documentos:', err);
    } else {
      console.log('Tabela de documentos criada com sucesso ou já existe.');
    }
  });
});

module.exports = db;
