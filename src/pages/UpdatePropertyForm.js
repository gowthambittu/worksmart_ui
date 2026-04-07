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
} from '@material-ui/core';
import { format } from 'date-fns';
import { apiFetch } from '../utils/apiClient';

const formatDateForInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

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

const UpdatePropertyForm = ({ token, propertyData, onSuccess }) => {
    const [property, setProperty] = useState({
        property_name: '',
        estimated_work: '',
        land_area_acres: '',
        purchase_cost: '',
        purchase_date: '',
        location: '',
        cost_to_labour: '',
        cost_to_driver: '',
        crop_type: '',
        season: '',
        harvest_count: '',
        plant_spacing_ft: '',
        soil_type: '',
        is_irrigated: false,
        irrigation_type: '',
        fertilizer_type: '',
        avg_yield_per_acre: '',
    });
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!propertyData) return;
        setProperty({
            property_name: propertyData.property_name ?? '',
            estimated_work: propertyData.estimated_work ?? '',
            land_area_acres: propertyData.land_area_acres ?? '',
            purchase_cost: propertyData.purchase_cost ?? '',
            purchase_date: formatDateForInput(propertyData.purchase_date),
            location: propertyData.location ?? '',
            cost_to_labour: propertyData.cost_to_labour ?? '',
            cost_to_driver: propertyData.cost_to_driver ?? '',
            crop_type: propertyData.crop_type ?? '',
            season: propertyData.season ?? '',
            harvest_count: propertyData.harvest_count ?? '',
            plant_spacing_ft: propertyData.plant_spacing_ft ?? '',
            soil_type: propertyData.soil_type ?? '',
            is_irrigated: propertyData.is_irrigated ?? false,
            irrigation_type: propertyData.irrigation_type ?? '',
            fertilizer_type: propertyData.fertilizer_type ?? '',
            avg_yield_per_acre: propertyData.avg_yield_per_acre ?? '',
        });
        setErrorMessage('');
    }, [propertyData]);

    const handleChange = (event) => {
        const { name } = event.target;
        let value = event.target.value;
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
        if (!propertyData?.property_id) return;

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
        payload.plant_spacing_ft = toNumberOrNull(payload.plant_spacing_ft);
        payload.avg_yield_per_acre = toNumberOrNull(payload.avg_yield_per_acre);

        apiFetch(`/api/property/${propertyData.property_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        })
            .then(({ data }) => {
                if (data.status === 'fail') {
                    setErrorMessage(data.message || 'Failed to update property.');
                    return;
                }
                setErrorMessage('');
                if (onSuccess) onSuccess();
            })
            .catch(() => {
                setErrorMessage('Failed to update property.');
            });
    };

    return (
        <Grid container justify="center">
            <Grid item xs={12}>
                <Paper style={{ padding: 16, borderRadius: 12, border: '1px solid #d8decd' }}>
                    <Typography variant="h6" align="center" style={{ fontWeight: 700, color: '#24321a', marginBottom: 8 }}>
                        Update Property
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Typography style={sectionTitleStyle}>Basic details</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}><TextField fullWidth name="property_name" label="Property name" value={property.property_name} onChange={handleChange} /></Grid>
                            <Grid item xs={12} md={6}><TextField fullWidth name="location" label="Location / village" value={property.location} onChange={handleChange} /></Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="land_area_acres"
                                    label="Land area (acres)"
                                    type="number"
                                    value={property.land_area_acres}
                                    onChange={handleChange}
                                    inputProps={{ step: '0.01' }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}><TextField fullWidth name="purchase_date" label="Purchase date" type="date" InputLabelProps={{ shrink: true }} value={property.purchase_date} onChange={handleChange} /></Grid>
                            <Grid item xs={12} md={6}><TextField fullWidth name="purchase_cost" label="Purchase cost (Rs)" type="number" value={property.purchase_cost} onChange={handleChange} /></Grid>
                            <Grid item xs={12} md={6}><TextField fullWidth name="estimated_work" label="Estimated work (tons)" type="number" value={property.estimated_work} onChange={handleChange} /></Grid>
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
                            <Grid item xs={12} md={6}><TextField fullWidth name="plant_spacing_ft" label="Plant spacing (feet)" type="number" value={property.plant_spacing_ft} onChange={handleChange} /></Grid>
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
                            <Grid item xs={12} md={4}><TextField fullWidth name="avg_yield_per_acre" label="Avg yield / acre (tons)" value={property.avg_yield_per_acre} onChange={handleChange} /></Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch checked={Boolean(property.is_irrigated)} onChange={handleToggleIrrigated} color="primary" />}
                                    label="Irrigated land (water-fed / irrigated)"
                                />
                            </Grid>
                        </Grid>

                        <Typography style={sectionTitleStyle}>Labour & cost</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}><TextField fullWidth name="cost_to_labour" label="Default labour rate (Rs/ton)" type="number" value={property.cost_to_labour} onChange={handleChange} /></Grid>
                            <Grid item xs={12} md={6}><TextField fullWidth name="cost_to_driver" label="Default driver rate (Rs/ton)" type="number" value={property.cost_to_driver} onChange={handleChange} /></Grid>
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
                </Paper>
            </Grid>
        </Grid>
    );
};

export default UpdatePropertyForm;
