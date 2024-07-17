// RegistrationForm.js

import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const RegistrationForm = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    role: 'labour', // Default role, you can change it if needed
  });

  // State for success message
  const [successMessage, setSuccessMessage] = useState('');

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // TODO: Add form validation logic

    // Make a POST request with form data
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // Check if registration was successful
      if (response.ok) {
        setSuccessMessage('Registration successful!');
        // Additional logic (redirect, etc.) can be added here
      } else {
        // Handle registration error
        console.error(data);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <TextField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <br />

        <TextField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <br />

        <TextField
          label="Full Name"
          name="full_name"
          value={formData.full_name}
          onChange={handleInputChange}
        />
        <br />

        <TextField
          label="Phone Number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleInputChange}
        />
        <br />

        <FormControl>
          <InputLabel id="role-label">Role</InputLabel>
          <Select
            labelId="role-label"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="driver">Driver</MenuItem>
            <MenuItem value="labour">Labour</MenuItem>
          </Select>
        </FormControl>
        <br />

        {/* Submit button */}
        <Button type="submit" variant="contained" color="primary">
          Register
        </Button>
      </form>

      {/* Display success message */}
      {successMessage && <div>{successMessage}</div>}
    </div>
  );
};

export default RegistrationForm;
