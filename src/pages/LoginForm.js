// LoginForm.jsx

import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
// import { useNavigate } from 'react-router-dom'; 
import API_HOST from '../config';

const useStyles = makeStyles({
  loginFormContainer: {
    textAlign: 'center',
  },
  greenHeading: {
    color: 'green',
  },
  inputContainer: {
    margin: '10px',
  },
  input: {
    border: '2px solid green',
    borderRadius: '5px',
    padding: '8px',
    marginBottom: '10px',
  },
  errorText: {
    color: 'red',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  greenButton: {
    border: '2px solid green',
    borderRadius: '5px',
    backgroundColor: 'white',
    color: 'black',
    padding: '10px 20px',
    margin: '0 10px',
    cursor: 'pointer',
  },
});

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const classes = useStyles();
  // const navigate = useNavigate();
  

  const handleLogin = async () => {
    console.log('Login clicked. Email:', email, 'Password:', password);
    if (!emailError) {
      try {
        const response = await fetch(`${API_HOST}/auth/login`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            //  'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          const authToken = data.auth_token;
          const userRole = data.user_role; 
          const username = email.split('@')[0]; // Extract the string before the '@' symbol from the email
          onLogin(authToken, userRole, username); // Pass the username to the onLogin function
        }
      } catch (error) {
        console.error('Error during login:', error.message);
      }
    }
  };

  // const handleSignup = () => {
  //   console.log('Signup clicked. Email:', email, 'Password:', password);
  //   navigate('/registration');
  // };

  const validateEmail = (inputEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(inputEmail);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(!validateEmail(newEmail));
  };

  return (
    <div className={classes.loginFormContainer}>
      <h1 className={classes.greenHeading}>WorkSmart</h1>
      <div className={classes.inputContainer}>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          className={classes.input}
        />
        {emailError && (
          <p className={classes.errorText}>Please enter a valid email address.</p>
        )}
      </div>
      <div className={classes.inputContainer}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={classes.input}
        />
      </div>
      <div className={classes.buttonContainer}>
        <button className={classes.greenButton} onClick={handleLogin}>
          Login
        </button>
        {/* <button className={classes.greenButton} onClick={handleSignup}>
          Signup
        </button> */}
      </div>
    </div>
  );
};

export default LoginForm;
