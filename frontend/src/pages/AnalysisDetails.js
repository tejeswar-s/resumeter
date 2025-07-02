import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';

const API_BASE = 'https://resumeter.onrender.com/api/ats';

const AnalysisDetails = ({ analysis: propAnalysis, adminView }) => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(propAnalysis || null);
  const [loading, setLoading] = useState(!propAnalysis);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (propAnalysis) return;
    const fetchAnalysis = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch analysis');
        const found = data.find(a => a._id === id);
        if (!found) throw new Error('Analysis not found');
        setAnalysis(found);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchAnalysis();
  }, [id, token, propAnalysis]);

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
  if (error) return <Container className="py-5 text-center"><Alert variant="danger">{error}</Alert></Container>;
  if (!analysis) return null;

  const { createdAt, result, resumeText, jdText, user } = analysis;
  const { score, breakdown, missingSkills, missingKeywords, suggestions } = result || {};

  return (
    <Container className={adminView ? '' : 'py-5'}>
      <Row className="justify-content-center">
        <Col md={adminView ? 12 : 10} lg={adminView ? 12 : 8}>
          <Card className="shadow-lg border-0 rounded-4 p-4 bg-light bg-opacity-75">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Analysis Details</h2>
                {!adminView && <Button variant="outline-primary" onClick={() => navigate(-1)}>Back</Button>}
              </div>
              {user && <div className="mb-3"><strong>User:</strong> {user.email}</div>}
              <div className="mb-3"><strong>Date:</strong> {new Date(createdAt).toLocaleString()}</div>
              <div className="mb-3"><strong>Score:</strong> <span className="fs-4 fw-bold text-primary">{score}/100</span></div>
              <div className="mb-4">
                <h5 className="fw-bold">Breakdown</h5>
                <ul className="list-unstyled mb-2">
                  <li>Skill Match: <Badge bg="success" className="ms-2">{breakdown?.skillMatch || 0}%</Badge></li>
                  <li>Keyword Match: <Badge bg="primary" className="ms-2">{breakdown?.keywordMatch || 0}%</Badge></li>
                  <li>Job Title Relevance: <Badge bg="info" className="ms-2">{breakdown?.titleMatch || 0}%</Badge></li>
                  <li>Experience Match: <Badge bg="warning" className="ms-2 text-dark">{breakdown?.expMatch || 0}%</Badge></li>
                </ul>
              </div>
              <div className="mb-4">
                <h5 className="fw-bold">Missing Skills</h5>
                <div className="d-flex flex-wrap gap-2">
                  {missingSkills && missingSkills.length ? missingSkills.map((s, i) => <Badge key={i} bg="danger" className="fs-6 px-3 py-2 rounded-pill shadow-sm">{s}</Badge>) : <Badge bg="success">None</Badge>}
                </div>
              </div>
              <div className="mb-4">
                <h5 className="fw-bold">Missing Keywords</h5>
                <div className="d-flex flex-wrap gap-2">
                  {missingKeywords && missingKeywords.length ? missingKeywords.map((k, i) => <Badge key={i} bg="warning" text="dark" className="fs-6 px-3 py-2 rounded-pill shadow-sm">{k}</Badge>) : <Badge bg="success">None</Badge>}
                </div>
              </div>
              <div className="mb-4">
                <h5 className="fw-bold">Suggestions</h5>
                <ul className="list-unstyled mb-2">
                  {suggestions && suggestions.length ? suggestions.map((s, i) => <li key={i}><Badge bg="info" className="me-2">Tip</Badge>{s}</li>) : <li><Badge bg="success" className="me-2">Great job!</Badge>No suggestions.</li>}
                </ul>
              </div>
              <div className="mb-4">
                <h5 className="fw-bold">Resume Text</h5>
                <div className="bg-white border rounded-3 p-3 mb-2" style={{ maxHeight: 200, overflowY: 'auto', fontSize: '0.95rem' }}>{resumeText}</div>
              </div>
              <div className="mb-2">
                <h5 className="fw-bold">Job Description Text</h5>
                <div className="bg-white border rounded-3 p-3" style={{ maxHeight: 200, overflowY: 'auto', fontSize: '0.95rem' }}>{jdText}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
export default AnalysisDetails; 