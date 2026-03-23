import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import LoginForm from './pages/LoginForm';
import RegistrationForm from './pages/RegistrationForm';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import NewPropertyForm from './pages/NewPropertyForm';
import { Navigate } from 'react-router-dom';
import Property from './pages/Property';
import Outbound from './pages/Outbound';
import UserManagement from './pages/UserManagement';
import Properties from './pages/Properties';

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));
  const [username, setUsername] = useState(() => localStorage.getItem('username'));
  const [isLogged, setIsLogged] = useState(() => !localStorage.getItem('authToken'));
  
  const handleLogin = (authToken, role,username) => {
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userRole', role);
    localStorage.setItem('username', username);
    setToken(authToken); 
    setUserRole(role);
    setUsername(username);
    setIsLogged(false);
    console.log('handleLogin:', authToken, role, username,isLogged);
  };

  const handleAfterLogin = (isLogged) =>{
    setIsLogged(true);
  }

  return (
    <Router>
      <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
        <Route path="/adminView/property/:propert_id" element={<Property username={username} authToken={token}  />} />
        <Route path="/registration" element={<RegistrationForm />} />
        <Route path="/new-property" element={<NewPropertyForm />} />
        <Route path="/adminView" element={<AdminDashboard username={username} authToken={token}  handleAfterLogin={handleAfterLogin}/>}/>   
        <Route path="/userView" element={<UserDashboard />} />
        <Route path="/outbound" element={<Outbound authToken={token} username={username} />} />
  <Route path="/usermanagement" element={<UserManagement authToken={token} username={username} />} />
  <Route path="/properties" element={<Properties authToken={token} username={username} />} />
      </Routes>
      <Redirector token={token} userRole={userRole} isLogged={isLogged}/>
    </Router>
  );
};

const Redirector = ({ token, userRole,isLogged }) => {
  const navigate = useNavigate();
  const location = useLocation();
 
  useEffect(() => {
    const isAuthEntryRoute = location.pathname === '/' || location.pathname === '/login';
    if (!isLogged && token && isAuthEntryRoute) {
      if (userRole === 'admin') {
        navigate('/adminView', { replace: true });
      } else if (userRole === 'driver' || userRole === 'labour') {
        navigate('/userView', { replace: true });
      }      
    }
    
  }, [token, userRole, navigate, isLogged, location.pathname]);

  return null;
};

export default App;
