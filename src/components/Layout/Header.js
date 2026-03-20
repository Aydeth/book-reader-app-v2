import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">BookReader</Link>
        </div>
        <nav className="nav-links">
          <NavLink to="/" end>Главная</NavLink>
          {user && (
            <>
              <NavLink to="/profile">Профиль</NavLink>
              <div className="user-info">
                {user.photoUrl && (
                  <img 
                    src={user.photoUrl} 
                    alt={user.username} 
                    className="user-avatar"
                  />
                )}
                <span>{user.firstName || user.username}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Выйти
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;