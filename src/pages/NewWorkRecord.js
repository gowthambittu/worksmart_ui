import React, { useEffect, useState } from 'react';
import { Button, TextField, Box } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import { Snackbar } from '@material-ui/core';
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

function NewWorkRecord({token, workorderId, reopenReason = '', onSuccess}) {
    // const classes = useStyles();
    const [workDoneKgs, setWorkDoneKgs] = useState('');
    const [proofOfWork, setProofOfWork] = useState(null);
    const [workDate, setWorkDate] = useState('');
    const [reason, setReason] = useState(reopenReason || '');
    // const [isSuccess, setIsSuccess] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    useEffect(() => {
        setReason(reopenReason || '');
    }, [reopenReason]);


    const handleSubmit = (event) => {
        event.preventDefault();
    
        const formData = new FormData();
        if (proofOfWork) {
            formData.append('proof_of_work', proofOfWork);
        }
        formData.append('work_order_id', workorderId);
        formData.append('work_date', format(new Date(workDate), 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''));
        formData.append('work_done_kgs', workDoneKgs);
        formData.append('is_verified', false);
        if (reason && reason.trim()) {
            formData.append('reason', reason.trim());
        }
    
        apiFetch('/api/work_record', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        })
        .then(({ data }) => {
            console.log(data);
            setOpenSnackbar(true); // Open the snackbar
            // Clear the state variables
            setWorkDoneKgs('');
            setProofOfWork(null);
            setWorkDate('');
            setReason('');
            if (onSuccess) onSuccess();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
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
            <Button type="submit" variant="contained" color="primary">
                Submit
            </Button>
        </form>
        <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            message="Work record submitted successfully"
        />
    </div>
        
    );
}

export default NewWorkRecord;
