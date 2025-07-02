import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const poppinsFont = {
  fontFamily: "'Poppins', sans-serif"
};

const bgStyle = {
  backgroundColor: '#080710',
  height: '100vh',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  margin: 0,
  padding: 0,
  ...poppinsFont
};

const backgroundDiv = {
  width: 400,
  height: 480,
  position: 'absolute',
  transform: 'translate(-50%,-50%)',
  left: '50%',
  top: '50%'
};

const shapeStyle1 = {
  height: 200,
  width: 200,
  position: 'absolute',
  borderRadius: '50%',
  background: 'linear-gradient(#1845ad, #23a2f6)',
  left: -80,
  top: -80
};
const shapeStyle2 = {
  height: 200,
  width: 200,
  position: 'absolute',
  borderRadius: '50%',
  background: 'linear-gradient(to right, #ff512f, #f09819)',
  right: -30,
  bottom: -80
};

const formStyle = {
  height: 480,
  width: 380,
  backgroundColor: 'rgba(255,255,255,0.13)',
  position: 'absolute',
  transform: 'translate(-50%,-50%)',
  top: '50%',
  left: '50%',
  borderRadius: 10,
  backdropFilter: 'blur(10px)',
  border: '2px solid rgba(255,255,255,0.1)',
  boxShadow: '0 0 40px rgba(8,7,16,0.6)',
  padding: '40px 30px',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 2
};

const inputStyle = {
  display: 'block',
  height: 50,
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.07)',
  borderRadius: 3,
  padding: '0 10px',
  marginTop: 8,
  fontSize: 14,
  fontWeight: 300,
  color: '#fff',
  border: 'none',
  outline: 'none',
  marginBottom: 0
};

const labelStyle = {
  display: 'block',
  marginTop: 25,
  fontSize: 16,
  fontWeight: 500,
  color: '#fff',
  letterSpacing: '0.5px'
};

const buttonStyle = {
  marginTop: 35,
  width: '100%',
  backgroundColor: '#fff',
  color: '#080710',
  padding: '15px 0',
  fontSize: 18,
  fontWeight: 600,
  borderRadius: 5,
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  fontFamily: 'inherit'
};

const switchBtnStyle = {
  marginTop: 20,
  width: '100%',
  background: 'none',
  color: '#fff',
  fontSize: 15,
  fontWeight: 500,
  border: 'none',
  outline: 'none',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontFamily: 'inherit'
};

const errorStyle = {
  color: '#ff6b6b',
  fontSize: 14,
  marginTop: 10,
  textAlign: 'center'
};

export default function Auth({ onAuth }) {
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await fetch('https://resumeter-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update auth context
      onAuth(data.user);
      
      // Redirect to the page they were trying to access or home
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await fetch('https://resumeter-backend.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // After successful signup, automatically log them in to get the token
      const loginResponse = await fetch('https://resumeter-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error('Signup successful but login failed. Please try logging in.');
      }

      // Store token and user data
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      
      // Update auth context
      onAuth(loginData.user);
      
      // Redirect to home
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={bgStyle}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;600&display=swap" rel="stylesheet" />
      <div style={backgroundDiv}>
        <div style={shapeStyle1}></div>
        <div style={shapeStyle2}></div>
      </div>
      {!showSignup ? (
        <form style={formStyle} onSubmit={handleLogin} autoComplete="off">
          <h3 style={{fontSize: 32, fontWeight: 500, lineHeight: '42px', textAlign: 'center', color: '#fff', marginBottom: 0}}>Login Here</h3>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input 
            type="email" 
            placeholder="Email" 
            id="email" 
            name="email"
            style={inputStyle} 
            autoComplete="off" 
            required
          />
          <label htmlFor="password" style={labelStyle}>Password</label>
          <input 
            type="password" 
            placeholder="Password" 
            id="password" 
            name="password"
            style={inputStyle} 
            autoComplete="off" 
            required
          />
          {error && <div style={errorStyle}>{error}</div>}
          <button 
            type="submit" 
            style={{...buttonStyle, opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
          <button type="button" style={switchBtnStyle} onClick={() => setShowSignup(true)}>
            Do not have an account? Register here
          </button>
        </form>
      ) : (
        <form style={formStyle} onSubmit={handleSignup} autoComplete="off">
          <h3 style={{fontSize: 32, fontWeight: 500, lineHeight: '42px', textAlign: 'center', color: '#fff', marginBottom: 0}}>Register</h3>
          <label htmlFor="signup-email" style={labelStyle}>Email</label>
          <input 
            type="email" 
            placeholder="Email" 
            id="signup-email" 
            name="email"
            style={inputStyle} 
            autoComplete="off" 
            required
          />
          <label htmlFor="signup-password" style={labelStyle}>Password</label>
          <input 
            type="password" 
            placeholder="Password" 
            id="signup-password" 
            name="password"
            style={inputStyle} 
            autoComplete="off" 
            required
          />
          {error && <div style={errorStyle}>{error}</div>}
          <button 
            type="submit" 
            style={{...buttonStyle, opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          <button type="button" style={switchBtnStyle} onClick={() => setShowSignup(false)}>
            Already have an account? Login here
          </button>
        </form>
      )}
    </div>
  );
} 