import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import { FaDownload, FaEdit, FaArrowLeft, FaChartBar, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaArrowRight } from 'react-icons/fa';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const view = new URLSearchParams(location.search).get('view');
  const [atsResult, setAtsResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const result = localStorage.getItem('atsResult');
    if (result) {
      try {
        setAtsResult(JSON.parse(result));
      } catch (err) {
        setError('Invalid result data');
      }
    } else {
      setError('No analysis result found');
    }
    setLoading(false);
  }, []);

  const radarData = {
    labels: ['Skill Match', 'Keyword Match', 'Job Title', 'Experience'],
    datasets: [
      {
        label: 'ATS Breakdown',
        data: [
          atsResult?.breakdown.skillMatch || 0,
          atsResult?.breakdown.keywordMatch || 0,
          atsResult?.breakdown.titleMatch || 0,
          atsResult?.breakdown.expMatch || 0,
        ],
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(102, 126, 234, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(102, 126, 234, 1)',
      },
    ],
  };

  const handleDownload = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(atsResult, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'ats-analysis.json');
    dlAnchor.click();
  };

  if (loading) {
    return (
      <div className="loadingContainer">
        <div className="loadingCard">
          <div className="spinner"></div>
          <p className="loadingText">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !atsResult) {
    return (
      <div className="errorContainer">
        <div className="errorCard">
          <div className="errorIcon">
            <FaExclamationTriangle />
          </div>
          <h3 className="errorTitle">No Results Found</h3>
          <p className="errorText">
            {error || 'Please complete an ATS analysis first to view results.'}
          </p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/ats-score')}
            className="errorButton"
          >
            <FaArrowRight /> Start Analysis
          </Button>
        </div>
      </div>
    );
  }

  if (view === 'missing') {
    return (
      <div className="resultsPage">
        <Container className="container">
          <Row className="justify-content-center">
            <Col lg={8} md={10}>
              <div className="header">
                <Button 
                  variant="outline-primary" 
                  className="backButton"
                  onClick={() => navigate('/next-steps')}
                >
                  <FaArrowLeft /> Back to Next Steps
                </Button>
                <h1 className="pageTitle">Missing Keywords & Skills</h1>
                <p className="pageSubtitle">
                  Here are the key areas you need to improve to boost your ATS score
                </p>
              </div>

              <div className="missingSection">
                <Card className="missingCard">
                  <Card.Body>
                    <div className="missingHeader">
                      <FaExclamationTriangle className="missingIcon" />
                      <h2 className="missingTitle">Missing Skills</h2>
                    </div>
                    <div className="missingContent">
                      {atsResult?.missingSkills.length ? (
                        <div className="missingItems">
                          {atsResult.missingSkills.map((skill, i) => (
                            <span key={i} className="missingItem">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="noMissing">
                          <FaCheckCircle className="checkIcon" />
                          <span>No missing skills found!</span>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>

                <Card className="missingCard">
                  <Card.Body>
                    <div className="missingHeader">
                      <FaExclamationTriangle className="missingIcon" />
                      <h2 className="missingTitle">Missing Keywords</h2>
                    </div>
                    <div className="missingContent">
                      {atsResult?.missingKeywords.length ? (
                        <div className="missingItems">
                          {atsResult.missingKeywords.map((keyword, i) => (
                            <span key={i} className="missingItem">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="noMissing">
                          <FaCheckCircle className="checkIcon" />
                          <span>No missing keywords found!</span>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="resultsPage">
      <Container className="container">
        <Row className="justify-content-center">
          <Col lg={10} md={12}>
            {!atsResult ? (
              <div className="noResult">
                <Card className="noResultCard">
                  <Card.Body>
                    <div className="noResultIcon">
                      <FaChartBar />
                    </div>
                    <h2 className="noResultTitle">No Analysis Found</h2>
                    <p className="noResultText">
                      Please submit your resume and job description for analysis to see your results.
                    </p>
                    <Button 
                      variant="primary" 
                      className="noResultButton"
                      onClick={() => navigate('/ats-score')}
                    >
                      Start Analysis
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            ) : (
              <>
                <div className="header">
                  <Button 
                    variant="outline-primary" 
                    className="backButton"
                    onClick={() => navigate('/ats-score')}
                  >
                    <FaArrowLeft /> New Analysis
                  </Button>
                  <h1 className="pageTitle">Your ATS Analysis Results</h1>
                  <p className="pageSubtitle">
                    Here's how your resume performed against the job description
                  </p>
                </div>

                <div className="scoreSection">
                  <Card className="scoreCard">
                    <Card.Body>
                      <div className="scoreDisplay">
                        <div className="scoreCircle">
                          <span className="scoreNumber">{atsResult.score}</span>
                          <span className="scoreLabel">ATS Score</span>
                        </div>
                        <div className="scoreDescription">
                          <h3 className="scoreTitle">
                            {atsResult.score >= 80 ? 'Excellent Match!' : 
                             atsResult.score >= 60 ? 'Good Match' : 
                             atsResult.score >= 40 ? 'Fair Match' : 'Needs Improvement'}
                          </h3>
                          <p className="scoreText">
                            {atsResult.score >= 80 ? 'Your resume is well-optimized for this position.' :
                             atsResult.score >= 60 ? 'Your resume has good alignment with the job requirements.' :
                             atsResult.score >= 40 ? 'Your resume needs some improvements to better match the position.' :
                             'Your resume requires significant optimization to match this position.'}
                          </p>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>

                <div className="chartSection">
                  <Card className="chartCard">
                    <Card.Header className="chartHeader">
                      <h3 className="chartTitle">Score Breakdown</h3>
                    </Card.Header>
                    <Card.Body>
                      <div className="chartContainer">
                        <Radar 
                          data={radarData} 
                          options={{ 
                            scales: { 
                              r: { 
                                min: 0, 
                                max: 100,
                                beginAtZero: true,
                                grid: {
                                  color: 'rgba(0, 0, 0, 0.1)'
                                },
                                ticks: {
                                  stepSize: 20,
                                  color: '#6b7280'
                                }
                              } 
                            },
                            plugins: {
                              legend: {
                                display: false
                              }
                            },
                            elements: {
                              point: {
                                radius: 4
                              }
                            }
                          }} 
                        />
                      </div>
                      <div className="breakdownGrid">
                        <div className="breakdownItem">
                          <span className="breakdownLabel">Skill Match</span>
                          <span className="breakdownValue">{atsResult.breakdown.skillMatch || 0}%</span>
                        </div>
                        <div className="breakdownItem">
                          <span className="breakdownLabel">Keyword Match</span>
                          <span className="breakdownValue">{atsResult.breakdown.keywordMatch || 0}%</span>
                        </div>
                        <div className="breakdownItem">
                          <span className="breakdownLabel">Job Title Relevance</span>
                          <span className="breakdownValue">{atsResult.breakdown.titleMatch || 0}%</span>
                        </div>
                        <div className="breakdownItem">
                          <span className="breakdownLabel">Experience Match</span>
                          <span className="breakdownValue">{atsResult.breakdown.expMatch || 0}%</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>

                <div className="detailsSection">
                  <Row>
                    <Col lg={6} md={12}>
                      <Card className="detailCard">
                        <Card.Header className="detailHeader">
                          <FaExclamationTriangle className="detailIcon" />
                          <h3 className="detailTitle">Missing Skills</h3>
                        </Card.Header>
                        <Card.Body>
                          {atsResult.missingSkills.length ? (
                            <div className="detailItems">
                              {atsResult.missingSkills.map((skill, i) => (
                                <span key={i} className="detailItem">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="noMissing">
                              <FaCheckCircle className="checkIcon" />
                              <span>No missing skills found!</span>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col lg={6} md={12}>
                      <Card className="detailCard">
                        <Card.Header className="detailHeader">
                          <FaExclamationTriangle className="detailIcon" />
                          <h3 className="detailTitle">Missing Keywords</h3>
                        </Card.Header>
                        <Card.Body>
                          {atsResult.missingKeywords.length ? (
                            <div className="detailItems">
                              {atsResult.missingKeywords.map((keyword, i) => (
                                <span key={i} className="detailItem">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="noMissing">
                              <FaCheckCircle className="checkIcon" />
                              <span>No missing keywords found!</span>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>

                <div className="suggestionsSection">
                  <Card className="suggestionsCard">
                    <Card.Header className="suggestionsHeader">
                      <FaLightbulb className="suggestionsIcon" />
                      <h3 className="suggestionsTitle">Improvement Suggestions</h3>
                    </Card.Header>
                    <Card.Body>
                      {atsResult.suggestions.length ? (
                        <div className="suggestionsList">
                          {atsResult.suggestions.map((suggestion, i) => (
                            <div key={i} className="suggestionItem">
                              <span className="suggestionNumber">{i + 1}</span>
                              <span className="suggestionText">{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="noSuggestions">
                          <FaCheckCircle className="checkIcon" />
                          <span>Great job! No suggestions needed.</span>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>

                <div className="actionsSection">
                  <div className="actionButtons">
                    <Button 
                      variant="primary" 
                      className="actionButton"
                      onClick={() => navigate('/ats-score')}
                    >
                      Try Another Analysis
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      className="actionButton"
                      onClick={handleDownload}
                    >
                      <FaDownload /> Download Report
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      className="actionButton"
                      disabled
                    >
                      <FaEdit /> Edit Resume
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Results; 