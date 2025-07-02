import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Spinner, Alert, Table, Modal } from 'react-bootstrap';
import { FaUsers, FaChartBar, FaCalendarAlt, FaEye, FaCrown } from 'react-icons/fa';
import AnalysisDetails from './AnalysisDetails';
import styles from './AdminDashboard.module.scss';

const API_BASE = 'https://resumeter.onrender.com/api/ats';

const AdminDashboard = () => {
  const [data, setData] = useState({ users: [], analyses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to fetch admin data');
        setData(result);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingCard}>
          <Spinner animation="border" className={styles.spinner} />
          <p className={styles.loadingText}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <Container className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <FaCrown />
            </div>
            <h1 className={styles.pageTitle}>Admin Dashboard</h1>
            <p className={styles.pageSubtitle}>
              Monitor user activity and analyze system performance across the platform
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

        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <Card className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <FaUsers />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statNumber}>{data.users.length}</span>
                  <span className={styles.statLabel}>Total Users</span>
                </div>
              </div>
            </Card>
            <Card className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <FaChartBar />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statNumber}>{data.analyses.length}</span>
                  <span className={styles.statLabel}>Total Analyses</span>
                </div>
              </div>
            </Card>
            <Card className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <FaCalendarAlt />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statNumber}>
                    {data.analyses.length > 0 ? Math.round(data.analyses.reduce((acc, item) => acc + (item.result?.score || 0), 0) / data.analyses.length) : 0}
                  </span>
                  <span className={styles.statLabel}>Average Score</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* User Details Horizontal Cards */}
        <div className={styles.userCardsSection}>
          <h2 className={styles.userCardsTitle}><FaUsers className={styles.cardIcon} /> Users</h2>
          <div className={styles.userCardsGrid}>
            {data.users.map(user => (
              <div key={user._id} className={styles.userCard}>
                <div className={styles.userCardAvatar}>
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className={styles.userCardInfo}>
                  <div className={styles.userCardEmail}>{user.email}</div>
                  <div className={styles.userCardMeta}>
                    <span className={user.role === 'admin' ? styles.adminRole : styles.userRole}>{user.role}</span>
                    <span className={styles.userCardDate}><FaCalendarAlt className={styles.dateIcon} /> {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis History Table */}
        <div className={styles.analysesSection}>
          <Card className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <FaChartBar className={styles.cardIcon} />
                Analysis History
              </h2>
              <p className={styles.cardSubtitle}>
                Review all resume analyses and their performance metrics
              </p>
            </div>
            <div className={styles.tableContainer}>
              <Table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Score</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.analyses.map(analysis => (
                    <tr key={analysis._id}>
                      <td className={styles.userCell}>
                        <div className={styles.userIcon}>
                          {analysis.user?.email?.charAt(0).toUpperCase() || 'N'}
                        </div>
                        <span>{analysis.user?.email || 'N/A'}</span>
                      </td>
                      <td className={styles.scoreCell}>
                        <div 
                          className={styles.scoreCircle}
                          style={{ background: `linear-gradient(135deg, ${getScoreColor(analysis.result?.score || 0)} 0%, ${getScoreColor(analysis.result?.score || 0)}dd 100%)` }}
                        >
                          <span className={styles.scoreNumber}>{analysis.result?.score || 0}<span className={styles.scoreOutOf}>/100</span></span>
                        </div>
                      </td>
                      <td className={styles.dateCell}>
                        <FaCalendarAlt className={styles.dateIcon} />
                        <span>{formatDate(analysis.createdAt)}</span>
                      </td>
                      <td className={styles.actionCell}>
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          className={styles.actionButton}
                          onClick={() => {
                            setSelectedAnalysis(analysis);
                            setShowDetails(true);
                          }}
                        >
                          <FaEye /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        </div>

        <Modal show={showDetails} onHide={() => setShowDetails(false)} size="xl" centered className={styles.modal}>
          <Modal.Header closeButton className={styles.modalHeader}>
            <Modal.Title>
              <FaChartBar className={styles.modalIcon} />
              Analysis Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className={styles.modalBody}>
            {selectedAnalysis && <AnalysisDetails analysis={selectedAnalysis} adminView={true} />}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminDashboard; 