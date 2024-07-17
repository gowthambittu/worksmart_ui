import React, { useState } from 'react';
import API_HOST from '../config';
import {makeStyles} from '@material-ui/core/styles';
import { Button, TextField, Box,FormControl,InputLabel, Select, MenuItem } from '@material-ui/core';
import { Snackbar } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    paper: {
        margin: theme.spacing(8, 4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

const NewUserForm = (token) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [role, setRole] = useState('');
    const [hasWork, setHasWork] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const classes = useStyles();
    const [emailError, setEmailError] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setEmailError('');
        setPhoneNumberError('');
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setEmailError('Invalid email format');
            return; // Stop the form submission
        }
    
        // Phone number validation (basic example, adjust regex as needed)
        if (!/^\d{10}$/.test(phoneNumber)) {
            setPhoneNumberError('Invalid phone number format');
            return; // Stop the form submission
        }
        const userData = {
            email: email,
            password: password,
            full_name: fullName,
            phone_number: phoneNumber,
            role: role
        };

        fetch(`${API_HOST}/auth/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
        .then(response => {
            if (response.ok) {
                // Clear the state variables
                setEmail('');
                setPassword('');
                setOpenSnackbar(true); // Open the snackbar
                setFullName('');
                setPhoneNumber('');
                setRole('');
                
            }
            return response.json();
        })
        .then(data => console.log(data))
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    return (
        <div>
        <form onSubmit={handleSubmit}>
           
        <Box mb={5}>
    <TextField
        error={Boolean(emailError)}
        helperText={emailError}
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
    />
</Box>
            <Box mb={5}>
                <TextField
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
            </Box>
            <Box mb={5}>
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </Box>
            <Box mb={5}>
                <FormControl required>
                    <InputLabel>Role</InputLabel>
                    <Select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <MenuItem value={'labour'}>Labour</MenuItem>
                        <MenuItem value={'driver'}>Driver</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box mb={5}>
                <TextField
                    label="Has Work"
                    value={hasWork}
                    onChange={(e) => setHasWork(e.target.value)}
                    required
                />
            </Box>
            
            <Box mb={5}>
    <TextField
        error={Boolean(phoneNumberError)}
        helperText={phoneNumberError}
        label="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
    />
</Box>
            <Button type="submit" variant="contained" color="primary">
                Submit
            </Button>
        </form>
         <Snackbar
         open={openSnackbar}
         autoHideDuration={6000}
         onClose={handleSnackbarClose}
         message="User added successfully"
     />
     </div>
    );
};

export default NewUserForm;