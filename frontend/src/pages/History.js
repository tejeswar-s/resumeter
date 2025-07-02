import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaTrash, FaChartBar, FaCalendarAlt, FaUser, FaDownload } from 'react-icons/fa';
import styles from './History.module.scss';

const API_BASE = 'http://localhost:5000/api/ats';

const History = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
        setAnalyses(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [token]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleString(),
      relative: getRelativeTime(date),
      day: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
      setDeletingId(id);
      try {
        const res = await fetch(`${API_BASE}/history/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          setAnalyses(analyses.filter(item => item._id !== id));
          // Show success message
          setError('');
          setSuccess('Analysis deleted successfully');
        } else {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to delete analysis');
        }
      } catch (err) {
        console.error('Error deleting analysis:', err);
        setError(err.message || 'Failed to delete analysis. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDownload = (item) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(item, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `analysis-${item._id}.json`);
    dlAnchor.click();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingCard}>
          <Spinner animation="border" className={styles.spinner} />
          <p className={styles.loadingText}>Loading your analysis history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.historyPage}>
      <Container className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <FaUser />
            </div>
            <h1 className={styles.pageTitle}>Analysis History</h1>
            <p className={styles.pageSubtitle}>
              Track your resume analysis progress and review past results
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className={styles.errorAlert}>
            <div className={styles.alertContent}>
              <span className={styles.alertIcon}>⚠️</span>
              {error}
            </div>
          </Alert>
        )}

        {success && (
          <Alert variant="success" className={styles.successAlert}>
            <div className={styles.alertContent}>
              <span className={styles.alertIcon}>✅</span>
              {success}
            </div>
          </Alert>
        )}

        {analyses.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyCard}>
              <div className={styles.emptyIcon}>
                <FaChartBar />
              </div>
              <h3 className={styles.emptyTitle}>No Analysis History</h3>
              <p className={styles.emptyText}>
                You haven't performed any resume analyses yet. Start your first analysis to see your history here.
              </p>
              <Button 
                variant="primary" 
                className={styles.emptyButton}
                onClick={() => navigate('/ats-score')}
              >
                Start Your First Analysis
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.historyGrid}>
            {analyses.map((item, idx) => {
              const dateInfo = formatDate(item.createdAt);
              const score = item.result?.score || 0;
              const scoreColor = getScoreColor(score);
              const scoreLabel = getScoreLabel(score);
              
              return (
                <Card key={item._id || idx} className={styles.historyCard}>
                  <Card.Body className={styles.cardBody}>
                    <div className={styles.cardHeader}>
                      <div className={styles.scoreSection}>
                        <div 
                          className={styles.scoreCircle}
                          style={{ background: `linear-gradient(135deg, ${scoreColor} 0%, ${scoreColor}dd 100%)` }}
                        >
                          <span className={styles.scoreNumber}>{score}</span>
                          <span className={styles.scoreLabel}>/100</span>
                        </div>
                        <span className={styles.scoreLabel} style={{ color: scoreColor }}>{scoreLabel}</span>
                      </div>
                      <div className={styles.cardInfo}>
                        <div style={{ fontWeight: 600, color: '#312e81', fontSize: '1.08rem' }}>{item.resumeName || 'Resume'}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.98rem' }}>
                          <FaCalendarAlt style={{ marginRight: 6, opacity: 0.7 }} />
                          {dateInfo.day} <span style={{ color: '#a5b4fc', marginLeft: 8 }}>{dateInfo.time}</span>
                          <span style={{ color: '#818cf8', marginLeft: 12, fontSize: '0.95em' }}>({dateInfo.relative})</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <Button
                        variant="outline-primary"
                        className={styles.actionBtn}
                        onClick={() => navigate(`/analysis/${item._id}`)}
                        size="sm"
                      >
                        <FaEye /> View
                      </Button>
                      <Button
                        variant="outline-secondary"
                        className={styles.actionBtn}
                        onClick={() => handleDownload(item)}
                        size="sm"
                      >
                        <FaDownload /> Download
                      </Button>
                      <Button
                        variant="outline-danger"
                        className={styles.actionBtn}
                        onClick={() => handleDelete(item._id)}
                        size="sm"
                        disabled={deletingId === item._id}
                      >
                        {deletingId === item._id ? <Spinner animation="border" size="sm" /> : <FaTrash />}
                        Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
};

export default History; 