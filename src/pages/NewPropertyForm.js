import React, { useState } from 'react';
import { Button, TextField, Grid, Paper, Typography } from '@material-ui/core';
import API_HOST from '../config';
import { green } from '@material-ui/core/colors';
import { format, parseISO } from 'date-fns';
import { useEffect } from 'react';
import { Select, MenuItem } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';




const NewPropertyForm = ({ token }) => {
    const [property, setProperty] = useState({
        property_name: '',
        estimated_work: '',
        land_area_acres: '',
        purchase_cost: '',
        purchase_date: '',
        location: '',
        assigne_labour: [],
        cost_to_labour: '',
        cost_to_driver: '',
    });

    const [isSuccess, setIsSuccess] = useState(false);
    const [users, setUsers] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        fetch(`${API_HOST}/auth/users`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data) => setUsers(data.data))
            .catch((error) => console.error(error));
    }, []);

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
        let propertyData = { ...property };
        if (propertyData.purchase_date) {
            propertyData.purchase_date = format(new Date(propertyData.purchase_date), 'MM-dd-yyyy');
        }
        fetch(`${API_HOST}/api/property`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(propertyData),
        })
            .then(response => {
                if (response.ok) {
                    setIsSuccess(true);
                    setOpenSnackbar(true);
                }
                return response.json();
            })
            .then(data => console.log(data))
            .catch((error) => {
                console.error('Error:', error);
            });
    };

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
    <InputLabel id="assigne_labour-label">Assign Labour</InputLabel>
    <Select
        labelId="assigne_labour-label"
        fullWidth
        multiple
        name="assigne_labour"
        onChange={handleChange}
        value={property.assigne_labour}
    >
        {users.map((user) => (
            <MenuItem key={user.user_id} value={user.user_id.toString()}>
                {user.full_name} - {user.has_work ? 'Has Work' : 'No Work'} - {user.role}
            </MenuItem>
        ))}
    </Select>
</FormControl>
                        <TextField fullWidth margin="normal" name="cost_to_labour" label="Cost to Labour" onChange={handleChange} />
                        <TextField fullWidth margin="normal" name="cost_to_driver" label="Cost to Driver" onChange={handleChange} />
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