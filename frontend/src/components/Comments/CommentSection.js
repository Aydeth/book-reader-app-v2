import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const CommentSection = ({ bookId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [bookId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/comments/book/${bookId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Войдите через Telegram, чтобы оставить комментарий');
      return;
    }

    try {
      const response = await api.post('/comments', {
        bookId,
        text: newComment,
        rating: rating || undefined
      });
      
      setComments([response.data, ...comments]);
      setNewComment('');
      setRating(0);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) return;

    try {
      const response = await api.post(`/comments/${commentId}/like`);
      setComments(comments.map(c => 
        c._id === commentId ? response.data : c
      ));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;

    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => setRating(i) : undefined}
        >
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="comments-section">
      <h3>Комментарии ({comments.length})</h3>

      {user && (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Оставьте комментарий..."
            required
          />
          <div className="comment-form-footer">
            <div className="rating-select">
              <span>Оценка: </span>
              {renderStars(rating, true)}
            </div>
            <button type="submit" className="btn btn-primary">
              Отправить
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Загрузка комментариев...</div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment._id} className="comment">
              <img 
                src={comment.userId?.photoUrl || 'https://via.placeholder.com/40'}
                alt={comment.userId?.username}
                className="comment-avatar"
              />
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">
                    {comment.userId?.firstName || comment.userId?.username}
                  </span>
                  <span className="comment-date">
                    {formatDistanceToNow(new Date(comment.createdAt), { 
                      addSuffix: true,
                      locale: ru 
                    })}
                  </span>
                </div>
                
                {comment.rating && (
                  <div className="comment-rating">
                    {renderStars(comment.rating)}
                  </div>
                )}
                
                <p className="comment-text">{comment.text}</p>
                
                <div className="comment-actions">
                  <button 
                    className={`like-btn ${comment.likes?.includes(user?.id) ? 'liked' : ''}`}
                    onClick={() => handleLikeComment(comment._id)}
                  >
                    ♥ {comment.likes?.length || 0}
                  </button>
                  
                  {user && comment.userId?._id === user.id && (
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="no-comments">Пока нет комментариев. Будьте первым!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;