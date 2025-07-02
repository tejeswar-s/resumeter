import React, { useState, useRef } from 'react';
import { Card, Button, Spinner, Alert, Row, Col, Form } from 'react-bootstrap';
import { FaCheckCircle, FaChartBar, FaLightbulb, FaFileUpload, FaDownload } from 'react-icons/fa';

const API_BASE = 'https://resumeter.onrender.com/api/ats';

const LiveResumeEditor = () => {
  const [resume, setResume] = useState('');
  const [jd, setJD] = useState('');
  const [score, setScore] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const resumeFileRef = useRef();
  const jdFileRef = useRef();

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setScore(null);
    setBreakdown(null);
    setFeedback([]);
    try {
      const token = localStorage.getItem('token');
      // Score
      const res = await fetch(`${API_BASE}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resumeText: resume, jdText: jd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to score resume');
      setScore(data.score);
      setBreakdown(data.breakdown);
      // Feedback
      const res2 = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resumeText: resume, jdText: jd }),
      });
      const data2 = await res2.json();
      if (!res2.ok) throw new Error(data2.error || 'Failed to get feedback');
      setFeedback(Array.isArray(data2.feedback) ? data2.feedback : [data2.feedback]);
      // Save to history if logged in
      if (token) {
        // Already saved by /score endpoint in backend
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append(type === 'resume' ? 'resume' : 'jobDescription', file);
      const endpoint = type === 'resume' ? '/upload-resume' : '/upload-jd';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to extract text');
      if (type === 'resume') setResume(data.text);
      else setJD(data.text);
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
  };

  const handleDownloadJSON = () => {
    setDownloadError('');
    try {
      const analysis = { resume, jd, score, breakdown, feedback };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', 'ats-analysis.json');
      dlAnchor.click();
    } catch (err) {
      setDownloadError('Failed to download JSON.');
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadError('');
    try {
      // For MVP, generate a simple text PDF using jsPDF
      const jsPDF = (await import('jspdf')).jsPDF;
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('ATS Resume Analysis', 10, 15);
      doc.setFontSize(12);
      doc.text('Score: ' + (score !== null ? score : 'N/A'), 10, 25);
      if (breakdown) {
        doc.text('Skill Match: ' + breakdown.skillMatch + '%', 10, 35);
        doc.text('Keyword Match: ' + breakdown.keywordMatch + '%', 10, 45);
        doc.text('Job Title: ' + breakdown.titleMatch + '%', 10, 55);
        doc.text('Experience: ' + breakdown.expMatch + '%', 10, 65);
      }
      doc.text('---', 10, 75);
      doc.text('Feedback:', 10, 85);
      if (feedback && feedback.length) {
        feedback.forEach((f, i) => {
          doc.text('- ' + f, 10, 95 + i * 10);
        });
      }
      doc.save('ats-analysis.pdf');
    } catch (err) {
      setDownloadError('Failed to download PDF.');
    }
  };

  // Enhanced classifyFeedback: also check presence in resume
  function classifyFeedback(feedbackArr, resume) {
    return feedbackArr.map(point => {
      const lower = point.toLowerCase();
      let type = 'other';
      if (lower.includes('remove') || lower.includes('delete')) type = 'remove';
      else if (lower.includes('add') || lower.includes('include')) type = 'add';
      else if (lower.includes('modify') || lower.includes('change') || lower.includes('update') || lower.includes('replace')) type = 'modify';
      // Extract phrase
      let match = point.match(/['"]([^'"]+)['"]/);
      let phrase = match ? match[1] : null;
      if (!phrase) {
        const m = point.match(/(?:remove|add|modify|change|delete|replace|update)\s+([\w\s\-.,]+)/i);
        if (m) phrase = m[1].trim().split(' ').slice(0, 5).join(' ');
      }
      let present = false;
      if (phrase && phrase.length > 2) {
        present = resume.toLowerCase().includes(phrase.toLowerCase());
      }
      // Determine actionable/done
      let actionable = true;
      if (type === 'add' && present) { actionable = false; type = 'done'; }
      if (type === 'remove' && !present) { actionable = false; type = 'done'; }
      if (type === 'modify' && !present) { actionable = false; type = 'done'; }
      return { type, text: point, phrase, actionable };
    });
  }

  // Helper: highlight phrases in resume preview
  function highlightResume(resume, feedbackArr) {
    let html = resume;
    const highlights = [];
    feedbackArr.forEach(({ type, text }) => {
      // Try to extract quoted or code phrases, else use keywords
      let match = text.match(/['"]([^'"]+)['"]/);
      let phrase = match ? match[1] : null;
      if (!phrase) {
        // Try to find a word after 'remove', 'add', 'modify', etc.
        const m = text.match(/(?:remove|add|modify|change|delete|replace|update)\s+([\w\s\-.,]+)/i);
        if (m) phrase = m[1].trim().split(' ').slice(0, 5).join(' '); // up to 5 words
      }
      if (phrase && phrase.length > 2 && resume.toLowerCase().includes(phrase.toLowerCase())) {
        highlights.push({ phrase, type });
      }
    });
    // Sort by length desc to avoid nested highlights
    highlights.sort((a, b) => b.phrase.length - a.phrase.length);
    highlights.forEach(({ phrase, type }) => {
      const color = type === 'remove' ? '#ffdddd' : type === 'add' ? '#d4f8e8' : type === 'modify' ? '#fff9d6' : '#e9ecef';
      const border = type === 'remove' ? '1.5px solid #e74c3c' : type === 'add' ? '1.5px solid #27ae60' : type === 'modify' ? '1.5px solid #f1c40f' : '1.5px solid #adb5bd';
      // Replace all case-insensitive matches
      const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '$&'), 'gi');
      html = html.replace(re, match => `<span style='background:${color};border-radius:4px;padding:1px 3px;border:${border};'>${match}</span>`);
    });
    return html;
  }

  const classifiedFeedback = classifyFeedback(feedback, resume);
  const actionableFeedback = classifiedFeedback.filter(f => f.actionable);
  const resumePreviewHtml = highlightResume(resume, actionableFeedback);

  return (
    <Card className="shadow-lg border-0 rounded-4 p-4 bg-light bg-opacity-75 mt-4">
      <Card.Body>
        <h2 className="mb-4 text-center fw-bold">Live Resume Editor</h2>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Resume Text</Form.Label>
              <div className="d-flex align-items-center gap-2 mb-2">
                <Form.Control as="textarea" rows={8} value={resume} onChange={e => setResume(e.target.value)} placeholder="Paste or type your resume here..." />
                <Button variant="outline-secondary" onClick={() => resumeFileRef.current.click()} disabled={uploading} title="Upload PDF/DOCX"><FaFileUpload /></Button>
                <input type="file" accept=".pdf,.docx" style={{ display: 'none' }} ref={resumeFileRef} onChange={e => handleFileUpload(e, 'resume')} />
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Job Description Text</Form.Label>
              <div className="d-flex align-items-center gap-2 mb-2">
                <Form.Control as="textarea" rows={8} value={jd} onChange={e => setJD(e.target.value)} placeholder="Paste or type the job description here..." />
                <Button variant="outline-secondary" onClick={() => jdFileRef.current.click()} disabled={uploading} title="Upload PDF/DOCX"><FaFileUpload /></Button>
                <input type="file" accept=".pdf,.docx" style={{ display: 'none' }} ref={jdFileRef} onChange={e => handleFileUpload(e, 'jd')} />
              </div>
            </Form.Group>
          </Col>
        </Row>
        <div className="text-center mb-3">
          <Button variant="primary" size="lg" className="px-5 py-2 fw-bold" onClick={handleAnalyze} disabled={loading || !resume || !jd}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Analyze'}
          </Button>
        </div>
        <div className="d-flex justify-content-center gap-3 mb-3">
          <Button variant="outline-success" onClick={handleDownloadJSON} disabled={!score}><FaDownload className="me-2" />Download JSON</Button>
          <Button variant="outline-info" onClick={handleDownloadPDF} disabled={!score}><FaDownload className="me-2" />Download PDF</Button>
        </div>
        {downloadError && <Alert variant="danger" className="text-center fw-semibold">{downloadError}</Alert>}
        {error && <Alert variant="danger" className="text-center fw-semibold">{error}</Alert>}
        {score !== null && (
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-2 text-success d-flex align-items-center justify-content-center gap-2"><FaChartBar /> ATS Score: <span className="ms-2">{score}/100</span></h3>
            {breakdown && (
              <ul className="list-unstyled d-flex flex-wrap justify-content-center gap-4 mb-0">
                <li><span className="fw-semibold">Skill Match:</span> <span className="text-success">{breakdown.skillMatch}%</span></li>
                <li><span className="fw-semibold">Keyword Match:</span> <span className="text-primary">{breakdown.keywordMatch}%</span></li>
                <li><span className="fw-semibold">Job Title:</span> <span className="text-info">{breakdown.titleMatch}%</span></li>
                <li><span className="fw-semibold">Experience:</span> <span className="text-warning">{breakdown.expMatch}%</span></li>
              </ul>
            )}
          </div>
        )}
        {feedback && feedback.length > 0 && (
          <div className="mb-2">
            <h4 className="fw-bold mb-2 text-primary d-flex align-items-center gap-2"><FaLightbulb /> Feedback</h4>
            <ul className="mb-2">
              {classifiedFeedback.map((f, i) => (
                <li key={i} className="d-flex align-items-center gap-2" style={{color: f.type==='remove' ? '#e74c3c' : f.type==='add' ? '#27ae60' : f.type==='modify' ? '#f1c40f' : f.type==='done' ? '#888' : undefined}}>
                  <FaCheckCircle className="me-2 text-success" />
                  <span>{f.text}</span>
                  {f.type==='remove' && <span className="ms-2 badge bg-danger bg-opacity-25 text-danger">Remove</span>}
                  {f.type==='add' && <span className="ms-2 badge bg-success bg-opacity-25 text-success">Add</span>}
                  {f.type==='modify' && <span className="ms-2 badge bg-warning bg-opacity-25 text-warning">Modify</span>}
                  {f.type==='done' && <span className="ms-2 badge bg-secondary bg-opacity-25 text-secondary">Done</span>}
                </li>
              ))}
            </ul>
            <div className="mb-2">
              <span className="badge me-2" style={{background:'#ffdddd',color:'#e74c3c',border:'1.5px solid #e74c3c'}}>Remove</span>
              <span className="badge me-2" style={{background:'#d4f8e8',color:'#27ae60',border:'1.5px solid #27ae60'}}>Add</span>
              <span className="badge me-2" style={{background:'#fff9d6',color:'#f1c40f',border:'1.5px solid #f1c40f'}}>Modify</span>
              <span className="badge me-2" style={{background:'#e9ecef',color:'#888',border:'1.5px solid #adb5bd'}}>Done</span>
            </div>
          </div>
        )}
        {resume && (
          <div className="mb-2">
            <h5 className="fw-bold mb-2">Resume Preview with Suggestions</h5>
            <div className="border rounded-3 p-3 bg-white" style={{minHeight:120,maxHeight:300,overflowY:'auto',fontSize:'0.97rem'}} dangerouslySetInnerHTML={{__html: resumePreviewHtml}} />
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default LiveResumeEditor; 