const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'mySecretKey'; // Mesma chave secreta usada na API de autenticação

// Cria o servidor WebSocket na porta 8080
const wss = new WebSocket.Server({ port: 8080 });

// Armazena o estado do markdown para sincronização entre os clientes
let markdownText = '';
let userEdits = []; // Armazena as edições de cada usuário
let usersEditing = []; // Lista para armazenar usuários ativos

// Mapear usuários para cores únicas
const userColors = {}; // Objeto para armazenar a cor de cada usuário
const colors = ['#f8d7da', '#d1ecf1', '#c3e6cb', '#f5c6cb', '#ffeeba']; // Conjunto de cores disponíveis

// Função para obter ou definir uma cor para um usuário
const getUserColor = (userName) => {
  if (!userColors[userName]) {
    // Atribuir uma cor da lista, se o usuário ainda não tiver uma
    userColors[userName] = colors[Object.keys(userColors).length % colors.length];
  }
  return userColors[userName];
};

// Quando uma conexão é estabelecida
wss.on('connection', (ws) => {
  console.log('Novo cliente conectado!');

  // Quando um novo cliente se conecta, envia o markdown atual e os usuários que estão editando
  ws.send(JSON.stringify({ text: markdownText, edits: userEdits, usersEditing }));

  // Receber mensagens dos clientes
  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error('Erro ao parsear a mensagem:', err);
      return;
    }

    const { token, text, user, clear } = data;

    // Verificar o token JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const nome_usuario = decoded.nome_usuario; // Extrair o nome do usuário do token

      if (clear) {
        // Se a mensagem for para limpar o conteúdo, resetar o texto e edições
        markdownText = '';
        userEdits = [];
        usersEditing = []; // Limpar a lista de usuários ativos
        console.log(`O usuário ${nome_usuario} limpou o conteúdo.`);

        // Enviar atualização de conteúdo vazio para todos os clientes
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              text: '',       // Texto vazio
              edits: [],      // Edições limpas
              usersEditing: [], // Lista de usuários vazia
              editedBy: nome_usuario
            }));
          }
        });
      } else {
        // Atualizar o texto do markdown com a nova edição
        markdownText = text;

        // Atualizar o histórico de edições (somente o trecho modificado)
        userEdits.push({ user: nome_usuario, text });

        // Verificar se o usuário já está na lista de usuários editando
        if (!usersEditing.some((u) => u.nome_usuario === nome_usuario)) {
          usersEditing.push({ nome_usuario, currentEdit: text });
        } else {
          // Atualizar a parte que o usuário está editando
          usersEditing = usersEditing.map((u) =>
            u.nome_usuario === nome_usuario ? { ...u, currentEdit: text } : u
          );
        }

        // Obter a cor associada ao usuário
        const userColor = getUserColor(nome_usuario);

        // Enviar o texto atualizado, as edições e os usuários editando para todos os clientes conectados
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              text: markdownText,
              edits: userEdits, // Envia as edições para os clientes renderizarem
              usersEditing,     // Envia a lista de usuários editando
              editedBy: nome_usuario,
              color: userColor  // Enviar a cor associada ao editor
            }));
          }
        });
      }
    } catch (err) {
      console.error('Token inválido:', err);
      ws.send(JSON.stringify({ error: 'Token inválido' }));
    }
  });

  // Lidar com a desconexão
  ws.on('close', () => {
    console.log('Cliente desconectado');
    // Remover o usuário da lista de usuários editando quando ele desconectar
    usersEditing = usersEditing.filter((user) => user.nome_usuario !== ws.nome_usuario);

    // Notificar todos os clientes que um usuário desconectou
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ usersEditing }));
      }
    });
  });
});

console.log('Servidor WebSocket rodando na porta 8080');
