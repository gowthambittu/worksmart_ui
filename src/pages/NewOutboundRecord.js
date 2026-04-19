import React, { useState } from 'react';
import { Button, TextField, Box } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { apiFetch } from '../utils/apiClient';

// const useStyles = makeStyles((theme) => ({
//     paper: {
//         margin: theme.spacing(8, 4),
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//     },
//     form: {
//         width: '100%',
//         marginTop: theme.spacing(1),
//     },
//     submit: {
//         margin: theme.spacing(3, 0, 2),
//     },
// }));

const getRequestErrorMessage = (error, fallbackMessage) => {
    const backendMessage = typeof error?.data?.message === 'string' ? error.data.message.trim() : '';
    if (backendMessage) return backendMessage;
    const rawResponse = typeof error?.data === 'string' ? error.data.trim() : '';
    if (rawResponse) return rawResponse;
    if (error?.status) return `${fallbackMessage} (HTTP ${error.status})`;
    return fallbackMessage;
};

function NewOutboundRecord({token, workorderId, onSuccess}) {
    // const classes = useStyles(); 
    const [truckNumber, setTruckNumber] = useState('');
    const [weightInKgs, setWeightInKgs] = useState('');
    const [receiptProof, setReceiptProof] = useState(null);
    const [truckDate, setTruckDate] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [snackbarMessage, setSnackbarMessage] = useState('Outbound record submitted successfully');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const [isSuccess, setIsSuccess] = useState(false);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setErrorMessage('');
    
        try {
            const parsedTruckDate = new Date(truckDate);
            if (!truckDate || Number.isNaN(parsedTruckDate.getTime())) {
                throw new Error('Please provide a valid truck date.');
            }

            const formData = new FormData();
            if (receiptProof) {
                formData.append('receipt_proof', receiptProof);
            }
            formData.append('truck_date', format(parsedTruckDate, 'yyyy-MM-dd HH:mm:ss'));
            formData.append('weight_in_kgs', weightInKgs);
            formData.append('truck_number', truckNumber);
        
            const { data } = await apiFetch('/api/outbound_record', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (data?.status === 'fail') {
                const failureMessage = data?.message || 'Failed to submit outbound record.';
                setErrorMessage(failureMessage);
                setSnackbarSeverity('error');
                setSnackbarMessage(failureMessage);
                setOpenSnackbar(true);
                return;
            }

            setSnackbarSeverity('success');
            setSnackbarMessage('Outbound record submitted successfully');
            setOpenSnackbar(true);
            setErrorMessage('');
            // Clear the state variables
            setWeightInKgs('');
            setReceiptProof(null);
            setTruckDate('');
            setTruckNumber('');
            if (onSuccess) onSuccess();
        } catch (error) {
            const failureMessage = error?.message === 'Please provide a valid truck date.'
                ? error.message
                : getRequestErrorMessage(error, 'Failed to submit outbound record.');
            setErrorMessage(failureMessage);
            setSnackbarSeverity('error');
            setSnackbarMessage(failureMessage);
            setOpenSnackbar(true);
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false);
        }
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
                        label="Weight in Kgs"
                        type="number"
                        value={weightInKgs}
                        onChange={(e) => setWeightInKgs(e.target.value)}
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
                    <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                    {errorMessage && (
                        <Box mt={2} style={{ color: '#A32D2D', fontSize: 13 }}>
                            {errorMessage}
                        </Box>
                    )}
                
            </form>
            <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
        >
            <MuiAlert elevation={6} variant="filled" severity={snackbarSeverity} onClose={handleSnackbarClose}>
                {snackbarMessage}
            </MuiAlert>
        </Snackbar>
        </div>
    );
}

export default NewOutboundRecord;
