import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const BookReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const readerRef = useRef(null);

  useEffect(() => {
    fetchBookContent();
  }, [id]);

  const fetchBookContent = async () => {
    try {
      setLoading(true);
      const bookResponse = await api.get(`/books/${id}`);
      setBook(bookResponse.data);
      
      const contentResponse = await api.get(`/books/${id}/content`);
      setContent(contentResponse.data.content);
      
      const progressResponse = await api.get(`/progress/${id}`);
      if (progressResponse.data) {
        setProgress(progressResponse.data.progress);
        setCurrentPage(progressResponse.data.currentPage || 1);
      }
    } catch (error) {
      console.error('Error fetching book content:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (page) => {
    try {
      await api.post(`/progress/${id}`, {
        currentPage: page
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateProgress(newPage);
  };

  const handleFontSizeChange = (delta) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + delta)));
  };

  const handleAddBookmark = async () => {
    try {
      await api.post(`/progress/${id}/bookmark`, {
        page: currentPage,
        note: prompt('Введите заметку (необязательно):') || ''
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка книги...</div>;
  }

  return (
    <div className="reader-container">
      <div className="reader-header">
        <h2>{book?.title}</h2>
        <div className="reader-controls">
          <button 
            onClick={() => handleFontSizeChange(-1)}
            className="btn btn-secondary"
          >
            A-
          </button>
          <span>{fontSize}px</span>
          <button 
            onClick={() => handleFontSizeChange(1)}
            className="btn btn-secondary"
          >
            A+
          </button>
          <button 
            onClick={handleAddBookmark}
            className="btn btn-primary"
          >
            Закладка
          </button>
          <button 
            onClick={() => navigate(`/books/${id}`)}
            className="btn btn-secondary"
          >
            Закрыть
          </button>
        </div>
      </div>

      <div 
        ref={readerRef}
        className="reader-content"
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className="reader-footer">
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn btn-secondary"
        >
          ← Предыдущая
        </button>
        
        <span>
          Страница {currentPage} из {book?.pages || '?'}
          {progress > 0 && ` (${progress}%)`}
        </span>
        
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= (book?.pages || Infinity)}
          className="btn btn-secondary"
        >
          Следующая →
        </button>
      </div>
    </div>
  );
};

export default BookReader;