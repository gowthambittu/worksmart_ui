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
        crop_type: '',
        crop_variety: '',
        season: '',
        harvest_count: '',
        plant_spacing_ft: '',
        soil_type: '',
        is_irrigated: false,
        irrigation_type: '',
        fertilizer_type: '',
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
                        <Typography variant="subtitle2" style={{ marginTop: 16, marginBottom: 4, color: '#3B6D11' }}>
                            Crop & field details (used by ML model)
                        </Typography>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Crop type</InputLabel>
                            <Select name="crop_type" value={property.crop_type} onChange={handleChange}>
                                <MenuItem value="virginia_tobacco">Virginia tobacco (FCV)</MenuItem>
                                <MenuItem value="burley_tobacco">Burley tobacco</MenuItem>
                                <MenuItem value="hdbrg_tobacco">HDBRG tobacco</MenuItem>
                                <MenuItem value="sugarcane">Sugarcane</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField fullWidth margin="normal" name="crop_variety" label="Crop variety (e.g. K-326)" value={property.crop_variety} onChange={handleChange} />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Season</InputLabel>
                            <Select name="season" value={property.season} onChange={handleChange}>
                                <MenuItem value="kharif">Kharif (Jun-Oct)</MenuItem>
                                <MenuItem value="rabi">Rabi (Nov-Mar)</MenuItem>
                                <MenuItem value="summer">Summer (Feb-May)</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField fullWidth margin="normal" name="harvest_count" label="Previous harvest count" type="number" value={property.harvest_count} onChange={handleChange} />
                        <TextField fullWidth margin="normal" name="plant_spacing_ft" label="Plant spacing (feet)" type="number" value={property.plant_spacing_ft} onChange={handleChange} />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Soil type</InputLabel>
                            <Select name="soil_type" value={property.soil_type} onChange={handleChange}>
                                <MenuItem value="black_cotton">Black cotton</MenuItem>
                                <MenuItem value="red_sandy">Red sandy</MenuItem>
                                <MenuItem value="clay_loam">Clay loam</MenuItem>
                                <MenuItem value="sandy_loam">Sandy loam</MenuItem>
                                <MenuItem value="alluvial">Alluvial</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Irrigation type</InputLabel>
                            <Select name="irrigation_type" value={property.irrigation_type} onChange={handleChange}>
                                <MenuItem value="drip">Drip irrigation</MenuItem>
                                <MenuItem value="flood">Flood irrigation</MenuItem>
                                <MenuItem value="rain_fed">Rain-fed only</MenuItem>
                                <MenuItem value="sprinkler">Sprinkler</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Fertilizer type</InputLabel>
                            <Select name="fertilizer_type" value={property.fertilizer_type} onChange={handleChange}>
                                <MenuItem value="chemical">Chemical (NPK)</MenuItem>
                                <MenuItem value="organic">Organic</MenuItem>
                                <MenuItem value="mixed">Mixed</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Is irrigated?</InputLabel>
                            <Select name="is_irrigated" value={property.is_irrigated} onChange={handleChange}>
                                <MenuItem value={true}>Yes</MenuItem>
                                <MenuItem value={false}>No</MenuItem>
                            </Select>
                        </FormControl>
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
