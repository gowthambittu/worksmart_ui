import React, { useState } from 'react';
import { apiFetch } from '../utils/apiClient';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setEmailError(val.length > 0 && !validateEmail(val));
  };

  const handleLogin = async () => {
    if (emailError || !email || !password) return;
    setLoading(true);
    setLoginError('');
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = response.data;
      const username = email.split('@')[0];
      onLogin(data.auth_token, data.user_role, username);
    } catch (error) {
      setLoginError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#f5f5f3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'inherit',
    },
    card: {
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.1)',
      borderRadius: 16,
      padding: '40px 36px',
      width: '100%',
      maxWidth: 380,
    },
    logoRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 8,
    },
    logoDot: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: '#3B6D11',
    },
    logoText: {
      fontSize: 22,
      fontWeight: 500,
      color: '#1a1a1a',
    },
    tagline: {
      textAlign: 'center',
      fontSize: 13,
      color: '#888780',
      marginBottom: 32,
    },
    fieldWrapper: {
      marginBottom: 16,
    },
    label: {
      display: 'block',
      fontSize: 12,
      fontWeight: 500,
      color: '#5F5E5A',
      marginBottom: 6,
      letterSpacing: '0.02em',
    },
    input: (hasError) => ({
      width: '100%',
      padding: '10px 12px',
      border: `0.5px solid ${hasError ? '#E24B4A' : 'rgba(0,0,0,0.15)'}`,
      borderRadius: 8,
      fontSize: 14,
      color: '#1a1a1a',
      background: '#fff',
      outline: 'none',
      boxSizing: 'border-box',
    }),
    errorMsg: {
      fontSize: 12,
      color: '#A32D2D',
      marginTop: 4,
    },
    failBanner: {
      background: '#FCEBEB',
      border: '0.5px solid #F09595',
      borderRadius: 8,
      padding: '10px 12px',
      fontSize: 13,
      color: '#791F1F',
      marginBottom: 16,
      textAlign: 'center',
    },
    button: {
      width: '100%',
      padding: 11,
      background: loading ? '#b4b2a9' : '#1a1f2e',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 500,
      cursor: loading ? 'not-allowed' : 'pointer',
      marginTop: 8,
    },
    footer: {
      textAlign: 'center',
      fontSize: 11,
      color: '#b4b2a9',
      marginTop: 28,
    },
  };

  return (
    <div style={styles.page}>
      <div>
        <div style={styles.card}>
          <div style={styles.logoRow}>
            <div style={styles.logoDot} />
            <span style={styles.logoText}>WorkSmart</span>
          </div>
          <p style={styles.tagline}>Agri operations management</p>

          {loginError && (
            <div style={styles.failBanner}>{loginError}</div>
          )}

          <div style={styles.fieldWrapper}>
            <label style={styles.label}>Email address</label>
            <input
              type="text"
              placeholder="you@example.com"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={handleKeyDown}
              style={styles.input(emailError)}
            />
            {emailError && (
              <p style={styles.errorMsg}>Please enter a valid email address.</p>
            )}
          </div>

          <div style={styles.fieldWrapper}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.input(false)}
            />
          </div>

          <button
            style={styles.button}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        <p style={styles.footer}>WorkSmart · Farm to mill operations</p>
      </div>
    </div>
  );
};

export default LoginForm;
