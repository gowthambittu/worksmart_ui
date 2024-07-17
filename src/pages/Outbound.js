import React from 'react';
import Layout from './Layout';
import { useState, useEffect } from 'react';
import API_HOST from '../config';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, Paper,TableContainer, TableHead, TableRow, Collapse, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import { Box } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { Card, CardContent, Typography } from '@material-ui/core';
import { Chip } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import NewOutboundRecord from './NewOutboundRecord'

const useStyles = makeStyles({
  chip: {
      backgroundColor: 'green',
      color: 'white',
      fontSize: '120%',
      padding: '12px 20px',
  },
  tableHeader: {
      fontWeight: 'bold',
      color: '#3f51b5', // Change this to your preferred color
      fontSize: '1.2em', // Change this to your preferred font size
      whiteSpace: 'nowrap', // Prevents the text from wrapping
    },
    table: {
      '& td, & th': {
        border: '1px dotted #ddd', // Change this to your preferred color and style
      },
    },
    workOrderTable: {
      '& td, & th': {
        border: '1px dotted #999', // Change this to your preferred color and style
      },
  }
});


const Outbound = ({username,authToken}) => {

  const [outbound, setOutbound] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const navigate = useNavigate();
  const classes = useStyles();
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [open, setOpen] = useState(false);


  useEffect(() => {
    fetch(`${API_HOST}/api/outbound_record`, { 
      method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
        .then(response => response.json())
        .then(response => {

            if (response.status === 'fail') {
                navigate('/login');
            }
            return response;

        })
        .then(data => {
            setOutbound(data.data);
            console.log('Outbound data:', data);
            setIsLoading(false); // Set loading to false after data is fetched
        })
        .catch(error => {
            navigate('/login')
            console.error('There was an error!', error);
        });
    }, [refreshData]);


    const submitWorkRecord = () => {
      setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRefreshData(!refreshData)
};

    const handleImageClickOpen = (image) => {
      setSelectedImage(image);
      setZoomOpen(true);
    };

    const handleApprove = async (recordId) => {
      console.log('handleApprove called');
      const response = await fetch(`${API_HOST}/api/outbound_record`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
              outbound_id: recordId,
              is_verified: "1"
          })
      });
      response.json().then(data => {
        console.log(data);
        if (response.ok) {
            setRefreshData(!refreshData);
        }
    });
    }
    const handleImageClose = () => {
            setZoomOpen(false);
        };


  return (
    <Layout username={username}>
        <Card>
                <CardContent>
                    <Box display="flex" justifyContent="center">
                        <Chip
                            label="Outbound Records"
                            className={classes.chip}
                            sx={{ fontSize: '150%', transform: 'scale(1.3)' }} // Increase the font size by 50%
                        />
                    </Box>
        <Box height={20} /> 
        <TableContainer component={Paper}>
     <Table  size="small" aria-label="work records">
            <TableHead>
            <TableRow>
                <TableCell className={classes.tableHeader}>Outbound ID</TableCell>
                <TableCell className={classes.tableHeader}>Truck Number</TableCell>
                <TableCell className={classes.tableHeader}>Truck Date</TableCell>
                <TableCell className={classes.tableHeader}>Weight In Tons</TableCell>
                <TableCell className={classes.tableHeader}>Created At</TableCell>
                <TableCell className={classes.tableHeader}>Receipt</TableCell>
                <TableCell className={classes.tableHeader}>Is Verified</TableCell>
                <TableCell className={classes.tableHeader}>Created By</TableCell>
                <TableCell className={classes.tableHeader}>Update Date</TableCell>
                <TableCell className={classes.tableHeader}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {outbound.map((record) => (
                    <TableRow key={record.outbound_id}>
                        <TableCell>{record.outbound_id}</TableCell>
                        <TableCell>{record.truck_number}</TableCell>
                        <TableCell>{new Date(record.truck_date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.weight_in_tons}</TableCell>
                        <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <img
                                src={`data:image/jpeg;base64,${record.receipt_proof}`}
                                alt="Proof of Work"
                                style={{ width: '100px', height: '100px' }}
                                onClick={() => handleImageClickOpen(`data:image/jpeg;base64,${record.receipt_proof}`)}
                            />
                        </TableCell>
                        <TableCell>{record.is_verified ? "Yes" : "No"}</TableCell>
                        <TableCell>{record.created_id}</TableCell>
                        <Dialog open={zoomOpen} onClose={handleImageClose}>
                            <img src={selectedImage} alt="Zoomed Proof of Work" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                        </Dialog>

                        <TableCell>{new Date(record.update_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Box display="flex" justifyContent="space-between">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    style={{ marginRight: '10px' }}
                                    onClick={() => handleApprove(record.outbound_id)}
                                    disabled={record.is_verified}
                                >
                                    Approve
                                </Button>
                                
                            </Box>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        </TableContainer>           
        <Button variant="outlined" color="primary" onClick={submitWorkRecord}>
                                                        Add Outbound Record
              </Button>
              <Dialog maxWidth="sm" open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                  <DialogTitle id="form-dialog-title">New Outbound Record</DialogTitle>
                  <DialogContent>
                      <NewOutboundRecord token={authToken} />
                  </DialogContent>
                  <DialogActions>
                      <Button onClick={handleClose} color="primary">
                          Cancel
                      </Button>
                  </DialogActions>
              </Dialog>
        </CardContent>
        </Card>
    </Layout>
  );
   
};


export default Outbound;