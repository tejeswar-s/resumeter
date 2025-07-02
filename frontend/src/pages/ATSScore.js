import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import styles from './ATSScore.module.scss';

const API_BASE = 'https://resumeter.onrender.com/api/ats';

const DropzoneBox = ({ onDrop, accept, label, file }) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({ onDrop, accept, multiple: false });
  
  return (
    <div 
      {...getRootProps()} 
      className={`${styles.dropzoneBox}${isDragActive ? ' ' + styles.dragActive : ''}`}
    >
      <input {...getInputProps()} />
      <div className={styles.dropzoneContent}>
        {file ? (
          <div className={styles.fileSelected}>
            <strong>Selected:</strong> {file.name}
          </div>
        ) : (
          <div className={styles.dropzoneText}>
            <div className={styles.dropzoneIcon}>📄</div>
            <div className={styles.dropzoneLabel}>{label}</div>
            <small className={styles.dropzoneHint}>(PDF or DOCX)</small>
          </div>
        )}
        {isDragActive && <div className={styles.dragText}>Drop file here...</div>}
      </div>
    </div>
  );
};

const ATSScore = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jdFile, setJDFile] = useState(null);
  const [jdText, setJDText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onResumeDrop = useCallback((acceptedFiles) => {
    setResumeFile(acceptedFiles[0]);
  }, []);
  
  const onJDDrop = useCallback((acceptedFiles) => {
    setJDFile(acceptedFiles[0]);
  }, []);
  
  const handleResumeTextChange = (e) => {
    setResumeText(e.target.value);
  };
  
  const handleJDTextChange = (e) => {
    setJDText(e.target.value);
  };

  const extractText = async (file, endpoint) => {
    const formData = new FormData();
    formData.append(endpoint === 'upload-resume' ? 'resume' : 'jobDescription', file);
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.text;
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      let resumeFinalText = resumeText;
      let jdFinalText = jdText;
      if (resumeFile) {
        resumeFinalText = await extractText(resumeFile, 'upload-resume');
      }
      if (jdFile) {
        jdFinalText = await extractText(jdFile, 'upload-jd');
      }
      if ((!resumeFile && !resumeFinalText.trim()) || (!jdFile && !jdFinalText.trim())) {
        setError('Please provide both resume and job description (either file or text).');
        setLoading(false);
        return;
      }
      // Call scoring API
      const res = await fetch(`${API_BASE}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ resumeText: resumeFinalText, jdText: jdFinalText }),
      });
      const result = await res.json();
      // Attach resumeText and jdText to atsResult for downstream use
      result.resumeText = resumeFinalText;
      result.jdText = jdFinalText;
      localStorage.setItem('atsResult', JSON.stringify(result));
      setLoading(false);
      navigate('/next-steps');
    } catch (err) {
      setError('Error analyzing resume.');
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResumeFile(null);
    setResumeText('');
    setJDFile(null);
    setJDText('');
    setError('');
  };

  return (
    <div className={styles.atsScorePage}>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <div className={styles.header}>
              <h1 className={styles.title}>ATS Resume Analysis</h1>
              <p className={styles.subtitle}>
                Upload your resume and job description to get instant ATS scoring and feedback
              </p>
            </div>
            <Card className={styles.card}>
              <Card.Header className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>📄 Resume</h2>
              </Card.Header>
              <Card.Body className={styles.cardBody}>
                <div className={styles.textAreaContainer}>
                  <label className={styles.label}>Paste Resume Text</label>
                  <textarea 
                    className={`form-control ${styles.textarea}`} 
                    rows={6} 
                    placeholder="Paste your resume text here..." 
                    value={resumeText} 
                    onChange={handleResumeTextChange} 
                  />
                </div>
                <div className={styles.divider}>
                  <span className={styles.dividerText}>or</span>
                </div>
                <DropzoneBox 
                  onDrop={onResumeDrop} 
                  accept={{'application/pdf': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': []}} 
                  label="Drag & drop or click to upload resume" 
                  file={resumeFile} 
                />
              </Card.Body>
            </Card>
            <Card className={styles.card}>
              <Card.Header className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>💼 Job Description</h2>
              </Card.Header>
              <Card.Body className={styles.cardBody}>
                <div className={styles.textAreaContainer}>
                  <label className={styles.label}>Paste Job Description</label>
                  <textarea 
                    className={`form-control ${styles.textarea}`} 
                    rows={6} 
                    placeholder="Paste the job description here..." 
                    value={jdText} 
                    onChange={handleJDTextChange} 
                  />
                </div>
                <div className={styles.divider}>
                  <span className={styles.dividerText}>or</span>
                </div>
                <DropzoneBox 
                  onDrop={onJDDrop} 
                  accept={{'application/pdf': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': []}} 
                  label="Drag & drop or click to upload job description" 
                  file={jdFile} 
                />
              </Card.Body>
            </Card>
            {error && (
              <Alert variant="danger" className={styles.alert}>
                {error}
              </Alert>
            )}
            <div className={`${styles.buttonContainer} d-flex flex-wrap justify-content-center gap-3`}>
              <Button 
                size="lg" 
                variant="success" 
                onClick={handleSubmit} 
                disabled={loading} 
                className={styles.submitBtn}
              >
                {loading ? <Spinner animation="border" size="sm" className={styles.spinner} /> : 'Analyze'}
              </Button>
              <Button 
                size="lg" 
                variant="outline-secondary" 
                onClick={handleClear} 
                disabled={loading} 
                className={styles.clearBtn}
              >
                Clear
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ATSScore; 