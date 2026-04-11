import React, { useEffect, useState } from 'react';
import {
    Button,
    TextField,
    Grid,
    Paper,
    Typography,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Switch,
    FormControlLabel,
    Snackbar,
} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { format } from 'date-fns';
import { apiFetch } from '../utils/apiClient';

const sectionTitleStyle = {
    fontSize: 14,
    fontWeight: 700,
    color: '#4a5242',
    marginTop: 14,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: '1px solid #e4e8db',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
};

const mlTagStyle = {
    fontSize: 10,
    color: '#3B6D11',
    background: '#EAF3DE',
    border: '1px dashed #97C459',
    borderRadius: 999,
    padding: '2px 8px',
};

const toNumberOrNull = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
};

const NewPropertyForm = ({ token, onSuccess }) => {
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
        season: '',
        harvest_count: '',
        plant_spacing: '',
        soil_type: '',
        is_irrigated: false,
        irrigation_type: '',
        fertilizer_type: '',
        avg_yield_per_acre: '',
    });

    const [users, setUsers] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [snackbarMessage, setSnackbarMessage] = useState('Success!');

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
        const { name } = event.target;
        let value = event.target.value;
        if (name === 'purchase_date') {
            value = format(new Date(value), 'MM-dd-yyyy');
        }
        if (name === 'is_irrigated') {
            value = value === true || value === 'true';
        }
        setProperty((prev) => ({ ...prev, [name]: value }));
    };

    const handleToggleIrrigated = (event) => {
        setProperty((prev) => ({ ...prev, is_irrigated: event.target.checked }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const payload = { ...property };

        if (payload.purchase_date) {
            payload.purchase_date = format(new Date(payload.purchase_date), 'MM-dd-yyyy');
        }

        payload.estimated_work = toNumberOrNull(payload.estimated_work);
        payload.land_area_acres = toNumberOrNull(payload.land_area_acres);
        payload.purchase_cost = toNumberOrNull(payload.purchase_cost);
        payload.cost_to_labour = toNumberOrNull(payload.cost_to_labour);
        payload.cost_to_driver = toNumberOrNull(payload.cost_to_driver);
        payload.harvest_count = toNumberOrNull(payload.harvest_count);
        payload.plant_spacing = (payload.plant_spacing || '').trim();
        if (!payload.plant_spacing) {
            delete payload.plant_spacing;
        }
        payload.avg_yield_per_acre = toNumberOrNull(payload.avg_yield_per_acre);

        if (payload.assigned_labour_id) {
            payload.assigned_labour_id = Number(payload.assigned_labour_id);
        } else {
            delete payload.assigned_labour_id;
        }
        if (payload.assigned_driver_id) {
            payload.assigned_driver_id = Number(payload.assigned_driver_id);
        } else {
            delete payload.assigned_driver_id;
        }

        apiFetch('/api/property', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        })
            .then(({ data }) => {
                setErrorMessage('');
                if (data.status === 'fail') {
                    setSnackbarSeverity('error');
                    setSnackbarMessage(data.message || 'Failed to create property.');
                    setErrorMessage(data.message || 'Failed to create property.');
                } else {
                    setSnackbarSeverity('success');
                    setSnackbarMessage('Property created successfully.');
                    if (onSuccess) onSuccess();
                }
                setOpenSnackbar(true);
            })
            .catch((error) => {
                console.error('Error:', error);
                setErrorMessage('Failed to create property.');
                setSnackbarSeverity('error');
                setSnackbarMessage('Failed to create property.');
                setOpenSnackbar(true);
            });
    };

    const labourUsers = users.filter((user) => user.role === 'labour');
    const driverUsers = users.filter((user) => user.role === 'driver');

    return (
        <Grid container justify="center">
            <Grid item xs={12}>
                <Paper style={{ padding: 16, borderRadius: 12, border: '1px solid #d8decd' }}>
                    <Typography variant="h6" align="center" style={{ fontWeight: 700, color: '#24321a', marginBottom: 8 }}>
                        New Property
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Typography style={sectionTitleStyle}>Basic details</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}><TextField fullWidth name="property_name" label="Property name" onChange={handleChange} /></Grid>
                            <Grid item xs={12} md={6}><TextField fullWidth name="location" label="Location / village" onChange={handleChange} /></Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="land_area_acres"
                                    label="Land area (acres)"
                                    type="number"
                                    onChange={handleChange}
                                    inputProps={{ step: '0.01' }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth name="purchase_date" label="Purchase date" type="date" InputLabelProps={{ shrink: true }} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={6}><TextField fullWidth name="purchase_cost" label="Purchase cost (Rs)" type="number" onChange={handleChange} /></Grid>
                            <Grid item xs={12} md={6}><TextField fullWidth name="estimated_work" label="Estimated work (tons)" type="number" onChange={handleChange} /></Grid>
                        </Grid>

                        <Typography style={sectionTitleStyle}>
                            Crop & field details
                            <span style={mlTagStyle}>used by ML</span>
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Crop type</InputLabel>
                                    <Select name="crop_type" value={property.crop_type} onChange={handleChange}>
                                        <MenuItem value="subabul">Subabul</MenuItem>
                                        <MenuItem value="eucalyptus">Eucalyptus</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Season</InputLabel>
                                    <Select name="season" value={property.season} onChange={handleChange}>
                                        <MenuItem value="kharif">Kharif (Jun-Oct)</MenuItem>
                                        <MenuItem value="rabi">Rabi (Nov-Mar)</MenuItem>
                                        <MenuItem value="summer">Summer (Feb-May)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}><TextField fullWidth name="harvest_count" label="Harvest count (previous seasons)" type="number" value={property.harvest_count} onChange={handleChange} /></Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="plant_spacing"
                                    label="Plant spacing (inches)"
                                    placeholder="e.g. 30*40"
                                    value={property.plant_spacing}
                                    onChange={handleChange}
                                    helperText="Row x Column spacing in inches"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Soil type</InputLabel>
                                    <Select name="soil_type" value={property.soil_type} onChange={handleChange}>
                                        <MenuItem value="black_cotton">Black cotton</MenuItem>
                                        <MenuItem value="red_sandy">Red sandy</MenuItem>
                                        <MenuItem value="clay_loam">Clay loam</MenuItem>
                                        <MenuItem value="sandy_loam">Sandy loam</MenuItem>
                                        <MenuItem value="alluvial">Alluvial</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Fertilizer type</InputLabel>
                                    <Select name="fertilizer_type" value={property.fertilizer_type} onChange={handleChange}>
                                        <MenuItem value="chemical">Chemical (NPK)</MenuItem>
                                        <MenuItem value="organic">Organic</MenuItem>
                                        <MenuItem value="mixed">Mixed</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Irrigation type</InputLabel>
                                    <Select name="irrigation_type" value={property.irrigation_type} onChange={handleChange}>
                                        <MenuItem value="drip">Drip irrigation</MenuItem>
                                        <MenuItem value="flood">Flood irrigation</MenuItem>
                                        <MenuItem value="rain_fed">Rain-fed only</MenuItem>
                                        <MenuItem value="sprinkler">Sprinkler</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    name="avg_yield_per_acre"
                                    label="Avg yield / acre (tons)"
                                    value={property.avg_yield_per_acre}
                                    onChange={handleChange}
                                    InputProps={{ readOnly: true }}
                                    placeholder="Auto from history"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch checked={Boolean(property.is_irrigated)} onChange={handleToggleIrrigated} color="primary" />}
                                    label="Irrigated land (water-fed / irrigated)"
                                />
                            </Grid>
                        </Grid>

                        <Typography style={sectionTitleStyle}>Labour & cost</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="assigned_labour_id-label">Assign labour (optional)</InputLabel>
                                    <Select labelId="assigned_labour_id-label" name="assigned_labour_id" onChange={handleChange} value={property.assigned_labour_id}>
                                        {labourUsers.map((user) => (
                                            <MenuItem key={user.user_id} value={user.user_id.toString()}>
                                                {user.full_name} - {user.has_work ? 'Has Work' : 'No Work'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="assigned_driver_id-label">Assign driver (optional)</InputLabel>
                                    <Select labelId="assigned_driver_id-label" name="assigned_driver_id" onChange={handleChange} value={property.assigned_driver_id}>
                                        {driverUsers.map((user) => (
                                            <MenuItem key={user.user_id} value={user.user_id.toString()}>
                                                {user.full_name} - {user.has_work ? 'Has Work' : 'No Work'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}><TextField fullWidth name="cost_to_labour" label="Default labour rate (Rs/ton)" type="number" onChange={handleChange} /></Grid>
                            <Grid item xs={12} md={6}><TextField fullWidth name="cost_to_driver" label="Default driver rate (Rs/ton)" type="number" onChange={handleChange} /></Grid>
                        </Grid>

                        {errorMessage && (
                            <Typography color="error" style={{ marginTop: 8 }}>
                                {errorMessage}
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            style={{ marginTop: 16, background: '#1a1f2e', color: '#fff', textTransform: 'none', fontWeight: 700 }}
                        >
                            Save property
                        </Button>
                    </form>

                    <Snackbar open={openSnackbar} autoHideDuration={5000} onClose={() => setOpenSnackbar(false)}>
                        <MuiAlert elevation={6} variant="filled" severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)}>
                            {snackbarMessage}
                        </MuiAlert>
                    </Snackbar>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default NewPropertyForm;
