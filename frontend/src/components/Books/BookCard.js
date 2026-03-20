import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/books/${book._id}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className="star">
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="book-card" onClick={handleClick}>
      <img 
        src={book.coverUrl || 'https://via.placeholder.com/300x400?text=No+Cover'} 
        alt={book.title}
        className="book-cover"
      />
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <div className="book-rating">
          <span className="stars">{renderStars(Math.round(book.rating))}</span>
          <span className="rating-count">({book.ratingCount})</span>
        </div>
        <div className="book-genres">
          {book.genres?.slice(0, 3).map((genre, index) => (
            <span key={index} className="genre-tag">{genre}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookCard;