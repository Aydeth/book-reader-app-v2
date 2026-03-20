import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import CommentSection from '../Comments/CommentSection';
import { showConfirm } from '../../services/telegram';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState(null);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    fetchBookDetails();
    if (user) {
      fetchUserProgress();
    }
  }, [id, user]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/books/${id}`);
      setBook(response.data);
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await api.get(`/progress/${id}`);
      setUserProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleRead = () => {
    if (!user) {
      showConfirm('Войдите через Telegram, чтобы читать книги');
      return;
    }
    navigate(`/books/${id}/read`);
  };

  const handleMarkAsRead = async () => {
    if (!user) {
      showConfirm('Войдите через Telegram, чтобы отметить книгу');
      return;
    }

    try {
      await api.post(`/progress/${id}`, {
        status: 'completed'
      });
      fetchUserProgress();
    } catch (error) {
      console.error('Error marking book as read:', error);
    }
  };

  const handleAddToWantToRead = async () => {
    if (!user) {
      showConfirm('Войдите через Telegram, чтобы добавить книгу');
      return;
    }

    try {
      await api.post(`/progress/${id}`, {
        status: 'want_to_read'
      });
      fetchUserProgress();
    } catch (error) {
      console.error('Error adding to want to read:', error);
    }
  };

  const handleRating = async (rating) => {
    if (!user) {
      showConfirm('Войдите через Telegram, чтобы оценить книгу');
      return;
    }

    try {
      await api.post(`/books/${id}/rate`, { rating });
      setUserRating(rating);
      fetchBookDetails(); // Refresh book to get updated rating
    } catch (error) {
      console.error('Error rating book:', error);
    }
  };

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => handleRating(i) : undefined}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          {i <= (interactive ? userRating : rating) ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return <div className="loading">Загрузка книги...</div>;
  }

  if (!book) {
    return <div className="error">Книга не найдена</div>;
  }

  return (
    <div className="book-details">
      <div className="book-header">
        <img 
          src={book.coverUrl || 'https://via.placeholder.com/300x400?text=No+Cover'} 
          alt={book.title}
          className="book-cover"
        />
        <div className="book-header-info">
          <h1>{book.title}</h1>
          <p className="book-author">{book.author}</p>
          
          <div className="book-meta">
            {book.publishedYear && (
              <span>Год: {book.publishedYear}</span>
            )}
            {book.publisher && (
              <span>Издательство: {book.publisher}</span>
            )}
            {book.pages && (
              <span>Страниц: {book.pages}</span>
            )}
          </div>

          <div className="book-rating">
            <div className="stars">{renderStars(Math.round(book.rating))}</div>
            <span className="rating-count">
              {book.ratingCount} оценок
            </span>
          </div>

          {user && (
            <div className="user-rating">
              <p>Ваша оценка:</p>
              <div className="stars">{renderStars(0, true)}</div>
            </div>
          )}

          <div className="book-genres">
            {book.genres?.map((genre, index) => (
              <span key={index} className="genre-tag">{genre}</span>
            ))}
          </div>

          <p className="book-description">{book.description}</p>

          <div className="book-actions">
            <button onClick={handleRead} className="btn btn-primary">
              Читать
            </button>
            
            {userProgress?.status !== 'completed' && (
              <button onClick={handleMarkAsRead} className="btn btn-success">
                Отметить прочитанным
              </button>
            )}
            
            {!userProgress && (
              <button onClick={handleAddToWantToRead} className="btn btn-secondary">
                Хочу прочитать
              </button>
            )}

            {userProgress && (
              <span className="book-status">
                Статус: {
                  userProgress.status === 'reading' ? 'Читаю' :
                  userProgress.status === 'completed' ? 'Прочитано' :
                  userProgress.status === 'want_to_read' ? 'В планах' :
                  userProgress.status
                }
              </span>
            )}
          </div>

          {userProgress && userProgress.progress > 0 && (
            <div className="reading-progress">
              <p>Прогресс: {userProgress.progress}%</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${userProgress.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CommentSection bookId={id} />
    </div>
  );
};

export default BookDetails;