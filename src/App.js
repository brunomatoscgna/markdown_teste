import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Editor from './components/Editor';
import Login from './components/Login';
import SignUp from './components/SignUp'; // Importando o componente de cadastro
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import Logout from './components/Logout';


function App() {
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState('');

  return (
    <Router>
      <div className="App">
        <h1>Markdown Editor</h1>
        
        {/* Menu de navegação */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to="/editor" className="nav-link">Editor</Link>
            </li>
            {!token ? (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/signup" className="nav-link">Cadastrar</Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Logout setToken={setToken} setUserName={setUserName} />
              </li>
            )}
          </ul>
        </nav>

        {/* Definindo as rotas */}
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} setUserName={setUserName} />} />
          <Route path="/signup" element={<SignUp />} /> {/* Rota para o cadastro */}
          
          <Route 
            path="/editor" 
            element={
              <ProtectedRoute token={token}>
                <Editor token={token} userName={userName} />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
