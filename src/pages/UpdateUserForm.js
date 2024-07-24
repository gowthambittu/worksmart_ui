import React, { useState } from 'react';
import { Box, TextField, Button ,Select, MenuItem,InputLabel} from '@material-ui/core';
import { Radio, RadioGroup, FormControl, FormControlLabel, FormLabel } from '@material-ui/core';
import API_HOST from '../config';
import { Snackbar } from '@material-ui/core';


const UpdateUserForm = (parms) => {
    const user = parms.user;
    const [email, setEmail] = useState(user.email);
    const [fullName, setFullName] = useState(user.full_name);
    const [phoneNumber, setPhoneNumber] = useState(user.phone_number);
    const [hasWork, setHasWork] = useState(user.has_work);
    const [role, setRole] = useState(user.role);
    const [emailError, setEmailError] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

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
            has_work: hasWork,
            full_name: fullName,
            phone_number: phoneNumber,
            role: role
        };

        fetch(`${API_HOST}/auth/users/${user.user_id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${parms.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
        .then(response => {
            if (response.ok) {
                // Clear the state variables
                setEmail('');
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
                     error={Boolean(phoneNumberError)}
                     helperText={phoneNumberError}
                        label="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </Box>
                <Box mb={5}>
                <InputLabel>Role</InputLabel>
                <Select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <MenuItem value={'labour'}>Labour</MenuItem>
                        <MenuItem value={'driver'}>Driver</MenuItem>
                        <MenuItem value={'admin'}>Admin</MenuItem> {/* Add this line */}
                    </Select>
                </Box>
                <Box mb={5}>
    <FormControl component="fieldset">
        <FormLabel component="legend">Has Work</FormLabel>
        <RadioGroup
            row
            aria-label="hasWork"
            name="hasWork"
            value={hasWork ? 'yes' : 'no'}
            onChange={(e) => setHasWork(e.target.value === 'yes' ? true : false)}
        >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
    </FormControl>
</Box>
                <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
                    Update User
                </Button>
            </form>
            <Snackbar
         open={openSnackbar}
         autoHideDuration={6000}
         onClose={handleSnackbarClose}
         message="User Updated successfully"
     />
        </div>
    );
};

export default UpdateUserForm;