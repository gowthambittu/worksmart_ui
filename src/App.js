import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './pages/LoginForm';
import RegistrationForm from './pages/RegistrationForm';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import NewPropertyForm from './pages/NewPropertyForm';
import Property from './pages/Property';
import Outbound from './pages/Outbound';
import UserManagement from './pages/UserManagement';
import Properties from './pages/Properties';
import { apiFetch } from './utils/apiClient';

const RequireAuth = ({ token, authReady, children }) => {
  if (!authReady) {
    return <div>Loading...</div>;
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RequireRole = ({ userRole, allowedRoles, children }) => {
  if (!userRole) {
    return <div>Loading...</div>;
  }
  if (!allowedRoles.includes(userRole)) {
    const fallback = userRole === 'admin' ? '/adminView' : '/userView';
    return <Navigate to={fallback} replace />;
  }
  return children;
};

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));
  const [username, setUsername] = useState(() => localStorage.getItem('username'));
  const [authReady, setAuthReady] = useState(false);

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setToken(null);
    setUserRole(null);
    setUsername(null);
  };

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setAuthReady(true);
        return;
      }
      try {
        await apiFetch('/api/property', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        clearAuth();
      } finally {
        setAuthReady(true);
      }
    };
    validateToken();
  }, [token]);

  useEffect(() => {
    const onForcedLogout = () => {
      setToken(null);
      setUserRole(null);
      setUsername(null);
      setAuthReady(true);
    };
    window.addEventListener('auth:logout', onForcedLogout);
    return () => window.removeEventListener('auth:logout', onForcedLogout);
  }, []);
  
  const handleLogin = (authToken, role, username) => {
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userRole', role);
    localStorage.setItem('username', username);
    setToken(authToken);
    setUserRole(role);
    setUsername(username);
    setAuthReady(true);
  };

  const loginRedirectPath = userRole
    ? (userRole === 'admin' ? '/adminView' : '/userView')
    : null;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            authReady && token ? (
              loginRedirectPath ? <Navigate to={loginRedirectPath} replace /> : <div>Loading...</div>
            ) : (
              <LoginForm onLogin={handleLogin} />
            )
          }
        />
        <Route path="/registration" element={<RegistrationForm />} />
        <Route
          path="/adminView/property/:propert_id"
          element={
            <RequireAuth token={token} authReady={authReady}>
              <RequireRole userRole={userRole} allowedRoles={['admin']}>
                <Property username={username} authToken={token} />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/new-property"
          element={
            <RequireAuth token={token} authReady={authReady}>
              <RequireRole userRole={userRole} allowedRoles={['admin']}>
                <NewPropertyForm token={token} />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/adminView"
          element={
            <RequireAuth token={token} authReady={authReady}>
              <RequireRole userRole={userRole} allowedRoles={['admin']}>
                <AdminDashboard username={username} authToken={token} />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/userView"
          element={
            <RequireAuth token={token} authReady={authReady}>
              <RequireRole userRole={userRole} allowedRoles={['driver', 'labour']}>
                <UserDashboard />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/outbound"
          element={
            <RequireAuth token={token} authReady={authReady}>
              <RequireRole userRole={userRole} allowedRoles={['admin']}>
                <Outbound authToken={token} username={username} />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/usermanagement"
          element={
            <RequireAuth token={token} authReady={authReady}>
              <RequireRole userRole={userRole} allowedRoles={['admin']}>
                <UserManagement authToken={token} username={username} />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/properties"
          element={
            <RequireAuth token={token} authReady={authReady}>
              <RequireRole userRole={userRole} allowedRoles={['admin']}>
                <Properties authToken={token} username={username} />
              </RequireRole>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
