import React, { useEffect, useState } from 'react';
import { Button, TextField, Grid, Paper, Typography } from '@material-ui/core';
import { Select, MenuItem } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { format } from 'date-fns';
import { apiFetch } from '../utils/apiClient';

const formatDateForInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
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
        crop_variety: '',
        season: '',
        harvest_count: '',
        plant_spacing_ft: '',
        soil_type: '',
        is_irrigated: false,
        irrigation_type: '',
        fertilizer_type: '',
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
            crop_variety: propertyData.crop_variety ?? '',
            season: propertyData.season ?? '',
            harvest_count: propertyData.harvest_count ?? '',
            plant_spacing_ft: propertyData.plant_spacing_ft ?? '',
            soil_type: propertyData.soil_type ?? '',
            is_irrigated: propertyData.is_irrigated ?? false,
            irrigation_type: propertyData.irrigation_type ?? '',
            fertilizer_type: propertyData.fertilizer_type ?? '',
        });
        setErrorMessage('');
    }, [propertyData]);

    const handleChange = (event) => {
        setProperty({
            ...property,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!propertyData?.property_id) return;

        const payload = { ...property };
        if (payload.purchase_date) {
            payload.purchase_date = format(new Date(payload.purchase_date), 'MM-dd-yyyy');
        }

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
            <Grid item xs={12} sm={8} md={10}>
                <Paper style={{ padding: 16 }}>
                    <Typography variant="h6" align="center">Update Property</Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField fullWidth margin="normal" name="property_name" label="Property Name" value={property.property_name} onChange={handleChange} />
                        <TextField fullWidth margin="normal" name="estimated_work" label="Estimated Work(Tons)" value={property.estimated_work} onChange={handleChange} />
                        <TextField fullWidth margin="normal" name="land_area_acres" label="Land Area (Acres)" value={property.land_area_acres} onChange={handleChange} />
                        <TextField fullWidth margin="normal" name="purchase_cost" label="Purchase Cost (Rupees)" value={property.purchase_cost} onChange={handleChange} />
                        <TextField
                            fullWidth
                            margin="normal"
                            name="purchase_date"
                            label="Purchase Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={property.purchase_date}
                            onChange={handleChange}
                        />
                        <TextField fullWidth margin="normal" name="location" label="Location" value={property.location} onChange={handleChange} />
                        <TextField fullWidth margin="normal" name="cost_to_labour" label="Cost to Labour" value={property.cost_to_labour} onChange={handleChange} />
                        <TextField fullWidth margin="normal" name="cost_to_driver" label="Cost to Driver" value={property.cost_to_driver} onChange={handleChange} />
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
                        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: 16 }}>
                            Save
                        </Button>
                    </form>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default UpdatePropertyForm;
