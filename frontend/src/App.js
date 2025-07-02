import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ATSScore from './pages/ATSScore';
import Results from './pages/Results';
import Auth from './pages/Auth';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import NextSteps from './pages/NextSteps';
import NavigationBar from './components/Navbar';
import FeedbackGenerator from './pages/FeedbackGenerator';
import AnalysisDetails from './pages/AnalysisDetails';
import './App.css';

const AuthContext = createContext();

function useAuth() {
  return useContext(AuthContext);
}

function RequireAuth({ children, admin }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  
  const handleAuth = (u) => setUser(u);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 font-sans text-gray-900">
          <NavigationBar user={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth onAuth={handleAuth} />} />
            <Route path="/ats-score" element={<RequireAuth><ATSScore /></RequireAuth>} />
            <Route path="/next-steps" element={<RequireAuth><NextSteps /></RequireAuth>} />
            <Route path="/results" element={<RequireAuth><Results /></RequireAuth>} />
            <Route path="/results?view=feedback" element={<RequireAuth><FeedbackGenerator /></RequireAuth>} />
            <Route path="/editor" element={<RequireAuth><div>Live Resume Editor (Coming Soon)</div></RequireAuth>} />
            <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth admin><AdminDashboard /></RequireAuth>} />
            <Route path="/analysis/:id" element={<RequireAuth><AnalysisDetails /></RequireAuth>} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
