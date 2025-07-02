import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaChartLine, FaLightbulb, FaShieldAlt, FaUsers, FaClock, FaPlay, FaUserPlus } from 'react-icons/fa';
// Make sure Animate.css is included in your project

const heroBg = {
  background: 'linear-gradient(120deg, #667eea 0%, #764ba2 100%)',
  minHeight: '60vh',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  padding: '60px 0 40px 0',
  borderRadius: '0 0 2rem 2rem',
  boxShadow: '0 8px 32px rgba(80,80,180,0.10)'
};

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaRocket />,
      title: "Instant Analysis",
      description: "Get your ATS score in seconds with our advanced AI-powered analysis engine."
    },
    {
      icon: <FaChartLine />,
      title: "Detailed Insights",
      description: "Comprehensive breakdown of skill matches, keyword analysis, and improvement suggestions."
    },
    {
      icon: <FaLightbulb />,
      title: "Smart Recommendations",
      description: "AI-generated feedback to optimize your resume for maximum ATS compatibility."
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure & Private",
      description: "Your data is encrypted and never shared. Complete privacy guaranteed."
    },
    {
      icon: <FaUsers />,
      title: "Industry Expertise",
      description: "Built with insights from HR professionals and recruitment experts."
    },
    {
      icon: <FaClock />,
      title: "24/7 Availability",
      description: "Analyze your resume anytime, anywhere. No waiting, no appointments."
    }
  ];

  const stats = [
    { number: "95%", label: "Accuracy Rate" },
    { number: "10K+", label: "Resumes Analyzed" },
    { number: "500+", label: "Companies Trust Us" },
    { number: "4.9★", label: "User Rating" }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={heroBg}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0 animate__animated animate__fadeInLeft animate__fast">
              <h1 className="display-4 fw-bold mb-3" style={{lineHeight: 1.1, textShadow: '0 4px 24px rgba(102,126,234,0.18), 0 1px 0 #fff'}}>
                Master Your<br/>
                <span style={{
                  color: '#ffe066',
                  fontWeight: 900,
                  fontSize: '4.5rem',
                  letterSpacing: '0.04em',
                  marginTop: '0.18em',
                  lineHeight: 1.05,
                  verticalAlign: 'middle',
                  padding: 0,
                  background: 'none',
                  boxShadow: 'none',
                  textShadow: '0 6px 32px rgba(255,224,102,0.35), 0 2px 8px rgba(102,126,234,0.10), 0 1px 0 #fff',
                  borderRadius: 0
                }}>ATS Score</span>
              </h1>
              <p className="lead mb-4" style={{color: '#fff', fontWeight: 600}}>
                Transform your resume with AI-powered ATS analysis. Get instant feedback, 
                keyword optimization, and actionable insights to land your dream job.
              </p>
              <div className="d-flex gap-3">
                <Button 
                  size="lg" 
                  variant="primary" 
                  className="rounded-pill px-4 fw-bold shadow"
                  style={{background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', border: 'none'}}
                  onClick={() => navigate('/ats-score')}
                >
                  <FaPlay style={{marginRight: '0.5em'}} />
                  Start Free Analysis
                </Button>
                <Button 
                  size="lg" 
                  variant="outline-light" 
                  className="rounded-pill px-4 fw-bold border-2 text-white create-account-btn"
                  onClick={() => {
                    if (localStorage.getItem('token')) {
                      navigate('/');
                    } else {
                      navigate('/auth');
                    }
                  }}
                >
                  <FaUserPlus style={{marginRight: '0.5em'}} />
                  Create Free Account
                </Button>
              </div>
            </Col>
            <Col lg={6} className="d-flex justify-content-center animate__animated animate__fadeInRight animate__fast">
              <Card className="shadow-lg border-0" style={{borderRadius: '2rem', minWidth: 360, background: 'rgba(255,255,255,0.97)', padding: '2.5rem 0', marginTop: 40}}>
                <Card.Body className="p-4 text-center d-flex flex-column align-items-center justify-content-center">
                  <div style={{marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}>
                    <div style={{width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #7b6eea 0%, #764ba2 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 24px rgba(102,126,234,0.10)'}}>
                      <span style={{fontSize: 40, fontWeight: 800, letterSpacing: '-2px'}}>92</span>
                    </div>
                    <span style={{fontSize: 32, fontWeight: 700, color: '#764ba2'}}>ATS Score</span>
                  </div>
                  <Row className="g-3 w-100">
                    <Col xs={6}>
                      <div style={{background: 'linear-gradient(120deg, #f4f8ff 0%, #e9e6f7 100%)'}} className="rounded-3 py-3">
                        <span className="fw-bold text-primary" style={{fontSize: 22}}>95%</span>
                        <div className="small text-muted fw-semibold" style={{fontSize: 15}}>Keyword Match</div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div style={{background: 'linear-gradient(120deg, #f4f8ff 0%, #e9e6f7 100%)'}} className="rounded-3 py-3">
                        <span className="fw-bold text-primary" style={{fontSize: 22}}>88%</span>
                        <div className="small text-muted fw-semibold" style={{fontSize: 15}}>Skill Match</div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div style={{background: 'linear-gradient(120deg, #f4f8ff 0%, #e9e6f7 100%)'}} className="rounded-3 py-3">
                        <span className="fw-bold text-primary" style={{fontSize: 22}}>12</span>
                        <div className="small text-muted fw-semibold" style={{fontSize: 15}}>Missing Keywords</div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div style={{background: 'linear-gradient(120deg, #f4f8ff 0%, #e9e6f7 100%)'}} className="rounded-3 py-3">
                        <span className="fw-bold text-primary" style={{fontSize: 22}}>8</span>
                        <div className="small text-muted fw-semibold" style={{fontSize: 15}}>Suggestions</div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="text-center">
            {stats.map((stat, index) => (
              <Col md={3} sm={6} xs={6} key={index} className={index % 2 === 0 ? "animate__animated animate__fadeInLeft animate__fast mb-4" : "animate__animated animate__fadeInRight animate__fast mb-4"}>
                <div className="p-4 rounded-4 shadow-sm bg-light h-100">
                  <div className="display-6 fw-bold text-primary mb-1">{stat.number}</div>
                  <div className="small text-muted fw-semibold">{stat.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5" style={{background: 'linear-gradient(120deg, #f8fafc 0%, #e9e6f7 100%)'}}>
        <Container>
          <div className="text-center mb-5 animate__animated animate__fadeInDown animate__fast">
            <h2 className="fw-bold mb-2">Why Choose Resumeter?</h2>
            <p className="text-muted mb-0">
              Advanced AI technology meets industry expertise to give you the edge in your job search
            </p>
          </div>
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col lg={4} md={6} key={index} className={index % 2 === 0 ? "animate__animated animate__fadeInLeft animate__fast" : "animate__animated animate__fadeInRight animate__fast"}>
                <Card className="h-100 border-0 shadow rounded-4 text-center p-3">
                  <Card.Body>
                    <div className="mb-3" style={{fontSize: 36, color: '#764ba2'}}>
                      {feature.icon}
                    </div>
                    <h5 className="fw-bold mb-2">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'}}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center animate__animated animate__fadeInUp animate__fast">
              <div className="mb-4">
                <h2 className="fw-bold text-white mb-2">Ready to Boost Your Career?</h2>
                <p className="lead text-white-50 mb-0">
                  Join thousands of professionals who have improved their job prospects with Resumeter
                </p>
              </div>
              <div className="d-flex justify-content-center gap-3">
                <Button 
                  size="lg" 
                  variant="light" 
                  className="rounded-pill px-4 fw-bold"
                  style={{color: '#764ba2'}}
                  onClick={() => navigate('/ats-score')}
                >
                  <FaPlay style={{marginRight: '0.5em'}} />
                  Analyze Your Resume Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline-light" 
                  className="rounded-pill px-4 fw-bold border-2 text-white create-account-btn"
                  onClick={() => {
                    if (localStorage.getItem('token')) {
                      navigate('/');
                    } else {
                      navigate('/auth');
                    }
                  }}
                >
                  <FaUserPlus style={{marginRight: '0.5em'}} />
                  Create Free Account
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home; 