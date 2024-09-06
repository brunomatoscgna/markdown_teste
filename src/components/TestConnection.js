import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Conectando ao servidor WebSocket...');
  const [inputMessage, setInputMessage] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Conectar ao WebSocket quando o componente for montado
    const socket = new WebSocket('ws://localhost:8080');
    setWs(socket);

    // Manipulador para mensagens recebidas
    socket.onmessage = (event) => {
      setMessage(event.data);
    };

    // Manipulador de erros
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setMessage('Erro ao conectar ao WebSocket.');
    };

    // Manipulador de fechamento da conexão
    socket.onclose = () => {
      setMessage('Conexão fechada pelo servidor.');
    };

    // Cleanup quando o componente for desmontado
    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && inputMessage) {
      ws.send(inputMessage); // Envia a mensagem para o servidor
      setInputMessage('');
    }
  };

  return (
    <div>
      <h1>Teste de WebSocket com React</h1>
      <p>Mensagem do servidor: {message}</p>

      <div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Digite uma mensagem"
        />
        <button onClick={sendMessage}>Enviar Mensagem</button>
      </div>
    </div>
  );
}

export default App;
