import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import BookCard from '../Books/BookCard';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookshelves, setBookshelves] = useState({
    reading: [],
    completed: [],
    wantToRead: []
  });
  const [activeTab, setActiveTab] = useState('reading');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserBooks();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data);
      setBio(response.data.bio || '');
      setFavoriteGenres(response.data.favoriteGenres || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${user.id}/books`);
      
      const shelves = {
        reading: [],
        completed: [],
        wantToRead: []
      };

      response.data.forEach(item => {
        if (item.bookId) {
          switch(item.status) {
            case 'reading':
              shelves.reading.push(item);
              break;
            case 'completed':
              shelves.completed.push(item);
              break;
            case 'want_to_read':
              shelves.wantToRead.push(item);
              break;
            default:
              break;
          }
        }
      });

      setBookshelves(shelves);
    } catch (error) {
      console.error('Error fetching user books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await api.put('/users/profile', {
        bio,
        favoriteGenres: favoriteGenres.split(',').map(g => g.trim())
      });
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading || !profile) {
    return <div className="loading">Загрузка профиля...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img 
          src={profile.photoUrl || 'https://via.placeholder.com/120'} 
          alt={profile.username}
          className="profile-avatar"
        />
        <div className="profile-info">
          <h2>{profile.firstName} {profile.lastName}</h2>
          <p className="username">@{profile.username}</p>
          
          {editing ? (
            <div className="profile-edit">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="О себе"
                rows="3"
              />
              <input
                type="text"
                value={favoriteGenres}
                onChange={(e) => setFavoriteGenres(e.target.value)}
                placeholder="Любимые жанры (через запятую)"
              />
              <div className="edit-actions">
                <button onClick={handleUpdateProfile} className="btn btn-success">
                  Сохранить
                </button>
                <button onClick={() => setEditing(false)} className="btn btn-secondary">
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              {profile.bio && <p className="bio">{profile.bio}</p>}
              {profile.favoriteGenres?.length > 0 && (
                <div className="favorite-genres">
                  <strong>Любимые жанры:</strong>{' '}
                  {profile.favoriteGenres.join(', ')}
                </div>
              )}
              <button onClick={() => setEditing(true)} className="btn btn-primary">
                Редактировать профиль
              </button>
            </>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-value">{profile.readingStats?.booksRead || 0}</div>
          <div className="stat-label">Прочитано книг</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{profile.readingStats?.pagesRead || 0}</div>
          <div className="stat-label">Прочитано страниц</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Math.floor((profile.readingStats?.readingTime || 0) / 60)}ч
          </div>
          <div className="stat-label">Время чтения</div>
        </div>
      </div>

      <div className="bookshelf">
        <h3>Мои книги</h3>
        
        <div className="bookshelf-tabs">
          <button
            className={`tab ${activeTab === 'reading' ? 'active' : ''}`}
            onClick={() => setActiveTab('reading')}
          >
            Читаю ({bookshelves.reading.length})
          </button>
          <button
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Прочитано ({bookshelves.completed.length})
          </button>
          <button
            className={`tab ${activeTab === 'wantToRead' ? 'active' : ''}`}
            onClick={() => setActiveTab('wantToRead')}
          >
            В планах ({bookshelves.wantToRead.length})
          </button>
        </div>

        <div className="bookshelf-grid">
          {bookshelves[activeTab].map(item => (
            <BookCard key={item._id} book={item.bookId} />
          ))}
        </div>

        {bookshelves[activeTab].length === 0 && (
          <p className="no-books">Нет книг в этой категории</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;