import React, { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChartBar, FaSignOutAlt, FaUser } from 'react-icons/fa';

const glassStyle = {
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 6px 18px rgba(80,80,180,0.1)',
  borderBottom: '1px solid rgba(120,120,200,0.12)',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  padding: '0.6rem 0'
};

const NavigationBar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    setExpanded(false);
    navigate('/');
  };

  const handleNavClick = (to) => {
    setExpanded(false);
    navigate(to);
  };

  return (
    <Navbar expand="lg" style={glassStyle} expanded={expanded} onToggle={setExpanded}>
      <Container fluid className="px-4">
        <Navbar.Brand 
          as={Link} 
          to="/" 
          className="fw-bold d-flex align-items-center gap-2" 
          style={{ fontSize: '1.15rem', padding: 0 }}
          onClick={() => handleNavClick('/')}
        >
          <FaChartBar style={{ fontSize: '1.4rem', color: '#667eea' }} />
          Resumeter
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`px-3 py-2${location.pathname === '/' ? ' fw-bold text-primary' : ''}`} 
              style={{ fontSize: '1rem' }}
              onClick={() => handleNavClick('/')}
            >
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/ats-score" 
              className={`px-3 py-2${location.pathname === '/ats-score' ? ' fw-bold text-primary' : ''}`} 
              style={{ fontSize: '1rem' }}
              onClick={() => handleNavClick('/ats-score')}
            >
              ATS Score
            </Nav.Link>

            {user && (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/history" 
                  className={`px-3 py-2${location.pathname === '/history' ? ' fw-bold text-primary' : ''}`} 
                  style={{ fontSize: '1rem' }}
                  onClick={() => handleNavClick('/history')}
                >
                  History
                </Nav.Link>
                {user.role === 'admin' && (
                  <Nav.Link 
                    as={Link} 
                    to="/admin" 
                    className={`px-3 py-2${location.pathname === '/admin' ? ' fw-bold text-primary' : ''}`} 
                    style={{ fontSize: '1rem' }}
                    onClick={() => handleNavClick('/admin')}
                  >
                    Admin
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>

          <div className="d-flex align-items-center ms-auto gap-3">
            {user ? (
              <>
                <div className="d-flex align-items-center gap-2 px-3 py-2 bg-light border rounded-pill">
                  <FaUser style={{ fontSize: '1.1rem', color: '#667eea' }} />
                  <span className="fw-medium" style={{ fontSize: '0.95rem' }}>{user.email}</span>
                </div>
                <Button 
                  variant="outline-danger" 
                  onClick={handleLogout} 
                  className="px-4 py-2 rounded-pill" 
                  style={{ fontSize: '0.95rem' }}
                >
                  <FaSignOutAlt />
                </Button>
              </>
            ) : (
              <>
                <a
                  href="/auth"
                  className="btn btn-primary fw-bold px-4 ms-2"
                  style={{ borderRadius: '20px', boxShadow: '0 2px 8px rgba(80,80,180,0.08)' }}
                  onClick={() => setExpanded(false)}
                >
                  Login
                </a>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
