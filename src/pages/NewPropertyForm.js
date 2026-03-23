import React, { useState } from 'react';
import { Button, TextField, Grid, Paper, Typography } from '@material-ui/core';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { Select, MenuItem } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { apiFetch } from '../utils/apiClient';




const NewPropertyForm = ({ token }) => {
    const [property, setProperty] = useState({
        property_name: '',
        estimated_work: '',
        land_area_acres: '',
        purchase_cost: '',
        purchase_date: '',
        location: '',
        assigned_labour_id: '',
        assigned_driver_id: '',
        cost_to_labour: '',
        cost_to_driver: '',
    });

    // const [isSuccess, setIsSuccess] = useState(false);
    const [users, setUsers] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        apiFetch('/auth/users', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(({ data }) => setUsers(data.data || []))
            .catch((error) => console.error(error));
    }, [token]);

    const handleChange = (event) => {
        let value = event.target.value;
        if (event.target.name === 'purchase_date') {
            value = format(new Date(value), 'MM-dd-yyyy');
        }
        setProperty({
            ...property,
            [event.target.name]: value,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!property.assigned_labour_id && !property.assigned_driver_id) {
            setErrorMessage('Please assign at least one user group (labour or driver).');
            return;
        }
        let propertyData = { ...property };
        if (propertyData.purchase_date) {
            propertyData.purchase_date = format(new Date(propertyData.purchase_date), 'MM-dd-yyyy');
        }
        if (propertyData.assigned_labour_id) {
            propertyData.assigned_labour_id = Number(propertyData.assigned_labour_id);
        } else {
            delete propertyData.assigned_labour_id;
        }
        if (propertyData.assigned_driver_id) {
            propertyData.assigned_driver_id = Number(propertyData.assigned_driver_id);
        } else {
            delete propertyData.assigned_driver_id;
        }
        apiFetch('/api/property', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(propertyData),
        })
            .then(({ data }) => {
                setErrorMessage('');
                setOpenSnackbar(true);
                if (data.status === 'fail') {
                    setErrorMessage(data.message || 'Failed to create property.');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setErrorMessage('Failed to create property.');
            });
    };

    const labourUsers = users.filter((user) => user.role === 'labour');
    const driverUsers = users.filter((user) => user.role === 'driver');

    return (
        <Grid container justify="center">
            <Grid item xs={12} sm={8} md={10}>
                <Paper style={{ padding: 16 }}>
                    <Typography variant="h6" align="center">New Property</Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField fullWidth margin="normal" name="property_name" label="Property Name" onChange={handleChange} />
                        <TextField fullWidth margin="normal" name="estimated_work" label="Estimated Work(Tons)" onChange={handleChange} />
                        <TextField fullWidth margin="normal" name="land_area_acres" label="Land Area (Acres)" onChange={handleChange} />
                        <TextField fullWidth margin="normal" name="purchase_cost" label="Purchase Cost (Rupees)" onChange={handleChange} />
                        <TextField
                            fullWidth
                            margin="normal"
                            name="purchase_date"
                            label="Purchase Date"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            onChange={handleChange}
                        />
                        <TextField fullWidth margin="normal" name="location" label="Location" onChange={handleChange} />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="assigned_labour_id-label">Assign Labour (Optional)</InputLabel>
                            <Select
                                labelId="assigned_labour_id-label"
                                fullWidth
                                name="assigned_labour_id"
                                onChange={handleChange}
                                value={property.assigned_labour_id}
                            >
                                {labourUsers.map((user) => (
                                    <MenuItem key={user.user_id} value={user.user_id.toString()}>
                                        {user.full_name} - {user.has_work ? 'Has Work' : 'No Work'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="assigned_driver_id-label">Assign Driver (Optional)</InputLabel>
                            <Select
                                labelId="assigned_driver_id-label"
                                fullWidth
                                name="assigned_driver_id"
                                onChange={handleChange}
                                value={property.assigned_driver_id}
                            >
                                {driverUsers.map((user) => (
                                    <MenuItem key={user.user_id} value={user.user_id.toString()}>
                                        {user.full_name} - {user.has_work ? 'Has Work' : 'No Work'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField fullWidth margin="normal" name="cost_to_labour" label="Cost to Labour" onChange={handleChange} />
                        <TextField fullWidth margin="normal" name="cost_to_driver" label="Cost to Driver" onChange={handleChange} />
                        {errorMessage && (
                            <Typography color="error" style={{ marginTop: 8 }}>
                                {errorMessage}
                            </Typography>
                        )}
                        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: 16 }}>Save</Button>
                    </form>
                    <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
  <MuiAlert elevation={6} variant="filled" severity="success" onClose={() => setOpenSnackbar(false)}>
    Success!
  </MuiAlert>
</Snackbar>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default NewPropertyForm;
