import React, { useEffect, useState } from 'react';
import { Button, TextField, Grid, Paper, Typography } from '@material-ui/core';
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
