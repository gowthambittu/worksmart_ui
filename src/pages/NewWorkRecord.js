import React, { useEffect, useState } from 'react';
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

function NewWorkRecord({token, workorderId, reopenReason = '', onSuccess}) {
    // const classes = useStyles();
    const [workDoneKgs, setWorkDoneKgs] = useState('');
    const [proofOfWork, setProofOfWork] = useState(null);
    const [workDate, setWorkDate] = useState('');
    const [reason, setReason] = useState(reopenReason || '');
    // const [isSuccess, setIsSuccess] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [snackbarMessage, setSnackbarMessage] = useState('Work record submitted successfully');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    useEffect(() => {
        setReason(reopenReason || '');
    }, [reopenReason]);


    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setErrorMessage('');
    
        try {
            const parsedWorkDate = new Date(workDate);
            if (!workDate || Number.isNaN(parsedWorkDate.getTime())) {
                throw new Error('Please provide a valid work date.');
            }

            const formData = new FormData();
            if (proofOfWork) {
                formData.append('proof_of_work', proofOfWork);
            }
            formData.append('work_order_id', workorderId);
            formData.append('work_date', format(parsedWorkDate, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''));
            formData.append('work_done_kgs', workDoneKgs);
            formData.append('is_verified', false);
            if (reason && reason.trim()) {
                formData.append('reason', reason.trim());
            }

            const { data } = await apiFetch('/api/work_record', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (data?.status === 'fail') {
                const failureMessage = data?.message || 'Failed to submit work record.';
                setErrorMessage(failureMessage);
                setSnackbarSeverity('error');
                setSnackbarMessage(failureMessage);
                setOpenSnackbar(true);
                return;
            }

            setOpenSnackbar(true);
            setSnackbarSeverity('success');
            setSnackbarMessage('Work record submitted successfully');
            setErrorMessage('');
            // Clear the state variables
            setWorkDoneKgs('');
            setProofOfWork(null);
            setWorkDate('');
            setReason('');
            if (onSuccess) onSuccess();
        } catch (error) {
            const failureMessage = error?.message === 'Please provide a valid work date.'
                ? error.message
                : getRequestErrorMessage(error, 'Failed to submit work record.');
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
        setProofOfWork(event.target.files[0]);
    };

    return (

        <div>
        <form onSubmit={handleSubmit}>
            <Box mb={5}>
                <TextField
                    label="Work done (in kgs)"
                    value={workDoneKgs}
                    onChange={(e) => setWorkDoneKgs(e.target.value)}
                    required
                />
            </Box>
            <Box mb={5}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </Box>
            <Box mb={5}>
                <TextField
                    label="Work date"
                    type="date"
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    required
                />
            </Box>
            <Box mb={5}>
                <TextField
                    label="Reason (required if adding to completed order)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                />
            </Box>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
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

export default NewWorkRecord;
