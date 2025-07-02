import React, { useEffect, useState } from 'react';
import { Card, Button, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaLightbulb, FaCheckCircle } from 'react-icons/fa';

const API_BASE = 'https://resumeter-backend.onrender.com/api/ats';

const FeedbackGenerator = () => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const atsResult = JSON.parse(localStorage.getItem('atsResult')) || {};
        const resumeText = atsResult.resumeText || '';
        const jdText = atsResult.jdText || '';
        if (!resumeText || !jdText) throw new Error('No resume or job description found.');
        const res = await fetch(`${API_BASE}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ resumeText, jdText }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to get feedback');
        setFeedback(data.feedback);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchFeedback();
  }, []);

  return (
    <Container className="py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <Row className="justify-content-center w-100">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0 rounded-4 p-4 text-center bg-light bg-opacity-75">
            <Card.Body>
              <h2 className="display-5 fw-bold mb-4 text-primary d-flex align-items-center justify-content-center gap-2"><FaLightbulb className="me-2" /> AI Feedback Generator</h2>
              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: 100 }}><Spinner animation="border" variant="primary" /></div>
              ) : error ? (
                <Alert variant="danger" className="mb-4 fw-semibold">{error}</Alert>
              ) : (
                <Alert variant="success" className="text-start">
                  <strong>Feedback:</strong>
                  <ul className="mb-0 mt-2">
                    {Array.isArray(feedback)
                      ? feedback.map((line, idx) => (
                          <li key={idx} className="d-flex align-items-center gap-2"><FaCheckCircle className="me-2 text-success" />{line.trim()}</li>
                        ))
                      : feedback
                        ? feedback.split(/\n|\.|\r/).filter(line => line.trim()).slice(0, 5).map((line, idx) => (
                            <li key={idx} className="d-flex align-items-center gap-2"><FaCheckCircle className="me-2 text-success" />{line.trim()}</li>
                          ))
                        : <li>No feedback available.</li>}
                  </ul>
                </Alert>
              )}
              <Button variant="primary" size="lg" className="mt-4 px-5 py-2 shadow-sm fw-bold" onClick={() => navigate('/next-steps')}>
                Back to Next Steps
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
export default FeedbackGenerator; 