import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BookCard from './BookCard';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0
  });

  useEffect(() => {
    fetchBooks();
  }, [pagination.currentPage]);

  useEffect(() => {
    // Extract unique genres from books
    const allGenres = books.flatMap(book => book.genres || []);
    const uniqueGenres = [...new Set(allGenres)];
    setGenres(uniqueGenres);
  }, [books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/books?page=${pagination.currentPage}`);
      setBooks(response.data.books);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalBooks: response.data.totalBooks
      });
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/books/search?query=${searchQuery}&genre=${selectedGenre}`);
      setBooks(response.data);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <div className="loading">Загрузка книг...</div>;
  }

  return (
    <div className="book-list">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Поиск книг..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="search-select"
        >
          <option value="">Все жанры</option>
          {genres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
        <button onClick={handleSearch} className="btn btn-primary">
          Поиск
        </button>
      </div>

      <div className="books-grid">
        {books.map(book => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>

      {books.length === 0 && (
        <div className="no-results">
          <p>Книги не найдены</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="page-btn"
          >
            Назад
          </button>
          
          {[...Array(pagination.totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`page-btn ${pagination.currentPage === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="page-btn"
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
};

export default BookList;