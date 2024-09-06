import React, { useState, useEffect } from 'react';
import MarkdownIt from 'markdown-it/dist/markdown-it.js';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importar o Bootstrap

// Inicializa o parser Markdown
const mdParser = new MarkdownIt();

const MarkdownEditor = ({ token, userName }) => {
  const [markdownText, setMarkdownText] = useState(''); // Estado do texto Markdown
  const [documentName, setDocumentName] = useState(''); // Nome do documento
  const [documents, setDocuments] = useState([]); // Lista de documentos carregados
  const [selectedDocument, setSelectedDocument] = useState(null); // Documento selecionado
  const [lastEditedBy, setLastEditedBy] = useState(''); // Nome do último editor
  const [socket, setSocket] = useState(null); // WebSocket

  useEffect(() => {
    // Conecta ao WebSocket na porta 8080
    const newSocket = new WebSocket('ws://localhost:8080');
    newSocket.onopen = () => {
      console.log('Conectado ao WebSocket na porta 8080');
    };
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMarkdownText(data.text || '');
      setLastEditedBy(data.editedBy || '');
    };
    newSocket.onerror = (error) => console.error('Erro no WebSocket:', error);
    newSocket.onclose = () => console.log('Conexão com WebSocket foi fechada');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Função para lidar com mudanças no editor
  const handleEditorChange = ({ text }) => {
    setMarkdownText(text);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ token, text, user: userName }));
    }
  };

  // Função para salvar o documento
  const saveDocument = async () => {
    if (!documentName) {
      alert('Por favor, insira o nome do documento.');
      return;
    }
    try {
      await axios.post(
        'http://localhost:3002/documents/save',  // Endereço correto
        {
          name: documentName,
          content: markdownText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Incluindo o token JWT no cabeçalho
          },
        }
      );
      alert('Documento salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar o documento:', error);
      alert('Erro ao salvar o documento.');
    }
  };

  // Função para carregar a lista de documentos
  const loadDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:3002/documents', {
        headers: {
          Authorization: `Bearer ${token}`,  // Incluindo o token JWT no cabeçalho
        },
      });
      setDocuments(response.data);
    } catch (error) {
      console.error('Erro ao carregar os documentos:', error);
    }
  };

  // Função para carregar um documento específico
  const loadDocument = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3002/documents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,  // Incluindo o token JWT no cabeçalho
        },
      });
      setMarkdownText(response.data.content);
      setDocumentName(response.data.name);
      setSelectedDocument(response.data);
    } catch (error) {
      console.error('Erro ao carregar o documento:', error);
    }
  };

  // Função para criar um novo documento
  const newDocument = () => {
    setMarkdownText('');
    setDocumentName('');
    setSelectedDocument(null);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Markdown Editor</h2>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Nome do documento"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
          />
        </div>
        <div className="col-md-6 d-flex justify-content-end">
          <button onClick={saveDocument} className="btn btn-primary mr-2">Salvar Documento</button>
          <button onClick={newDocument} className="btn btn-secondary mr-2">Novo Documento</button>
          <button onClick={loadDocuments} className="btn btn-info">Carregar Documentos</button>
        </div>
      </div>

      <MdEditor
        value={markdownText}
        style={{ height: '500px' }}
        renderHTML={(text) => mdParser.render(text)}
        onChange={handleEditorChange}
      />

      <div className="mt-4">
        <h3>Documentos Salvos</h3>
        {documents.length > 0 ? (
          <ul className="list-group">
            {documents.map((doc) => (
              <li key={doc.id} className="list-group-item">
                <a href="#" onClick={() => loadDocument(doc.id)} className="text-primary">
                  {doc.name} - {new Date(doc.date_saved).toLocaleString()}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum documento salvo.</p>
        )}
      </div>

      {lastEditedBy && <p className="mt-3 text-muted">Última edição por: {lastEditedBy}</p>}
    </div>
  );
};

export default MarkdownEditor;
