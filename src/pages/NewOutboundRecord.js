import React, { useState } from 'react';
import { Button, TextField, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { format, set } from 'date-fns';
import API_HOST from '../config';
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

function NewOutboundRecord({token, workorderId}) {
    const classes = useStyles(); 
    const [truckNumber, setTruckNumber] = useState('');
    const [weightInTons, setWeightInTons] = useState('');
    const [receiptProof, setReceiptProof] = useState(null);
    const [truckDate, setTruckDate] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };


    const handleSubmit = (event) => {
        event.preventDefault();
    
        const formData = new FormData();
        formData.append('receipt_proof', receiptProof);
        formData.append('truck_date', format(new Date(truckDate), 'yyyy-MM-dd HH:mm:ss'));
        formData.append('weight_in_tons', weightInTons);
        formData.append('truck_number', truckNumber);
    
        fetch(`${API_HOST}/api/outbound_record`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        })
        .then(response => {
            if (response.ok) {
                setIsSuccess(true);
                setOpenSnackbar(true); // Open the snackbar
                // Clear the state variables
                setWeightInTons('');
                setReceiptProof(null);
                setTruckDate('');
                setTruckNumber('');
            }
            return response.json();
        })
        .then(data => console.log(data))
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    const handleFileChange = (event) => {
        setReceiptProof(event.target.files[0]);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <Box mb={5}>
                    <TextField
                        label="Truck Number"
                        value={truckNumber}
                        onChange={(e) => setTruckNumber(e.target.value)}
                        fullWidth
                    />
                    </Box>
                    <Box mb={5}>
                    <TextField
                        label="Weight in Tons"
                        type="number"
                        value={weightInTons}
                        onChange={(e) => setWeightInTons(e.target.value)}
                        fullWidth
                    />
                    </Box>
                    <Box mb={5}>
                    <input
                        type="file"
                        onChange={handleFileChange}
                    />
                   </Box>
                   <Box mb={5}>
                    <TextField
                        label="Truck Date"
                        type="date"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={truckDate}
                        onChange={(e) => setTruckDate(e.target.value)}
                        fullWidth
                    />
                    </Box>
                    <Button type="submit" color="primary" variant="contained">
                        Submit
                    </Button>
                
            </form>
            <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            message="Outbound record submitted successfully"
        />
        </div>
    );
}

export default NewOutboundRecord;