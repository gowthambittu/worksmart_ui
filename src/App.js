import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import LoginForm from './pages/LoginForm';
import RegistrationForm from './pages/RegistrationForm';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import NewPropertyForm from './pages/NewPropertyForm';
import API_HOST from './config';
import { Navigate } from 'react-router-dom';
import Property from './pages/Property';
import Outbound from './pages/Outbound';
import UserManagement from './pages/UserManagement';
import Properties from './pages/Properties';

const App = () => {
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null); // Add this line
  const [isLogged, setIsLogged] = useState(true)
  
  const handleLogin = (authToken, role,username) => {
    localStorage.setItem('authToken', authToken);
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
  const [hasRedirected, setHasRedirected] = useState(isLogged);
 
  useEffect(() => {
    console.log('Redirector:', token, userRole, hasRedirected);
    // setHasRedirected(isLogged);
    if (!isLogged && token) {
      if (userRole === 'admin') {
        console.log('directing to adminView');
        navigate('/adminView');
      } else if (userRole === 'driver' || userRole === 'labour') {
        navigate('/userView');
      }
      if (token&& userRole) {
        setHasRedirected(true);  
    }
    }
    
  }, [token, userRole, navigate, hasRedirected]);

  return null;
};

export default App;