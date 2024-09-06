import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ setToken, setUserName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null); // Remove o token
    setUserName(''); // Limpa o nome de usuário

    // Redireciona para a página de login após logout
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger">Logout</button>
  );
};

export default Logout;
