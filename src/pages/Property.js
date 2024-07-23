import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import API_HOST from '../config';
import { Card, CardContent, Typography } from '@material-ui/core';
import { CircularProgress } from '@material-ui/core';
import { Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, IconButton } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import NewPropertyForm from './NewPropertyForm';
import NewWorkRecord from './NewWorkRecord';
import jsPDF from 'jspdf';
import 'jspdf-autotable';




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

const Property = ({ username, authToken }) => {
    const { propert_id } = useParams();
    const [property, setProperty] = useState([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [openRow, setOpenRow] = useState(null);
    const [open, setOpen] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    const zoomIn = (event) => {
        event.stopPropagation(); // Prevent click event from propagating to the dialog
        setZoomLevel(zoomLevel + 0.1); // Increase zoom level by 0.1
    };

    const zoomOut = (event) => {
        event.stopPropagation(); // Prevent click event from propagating to the dialog
        setZoomLevel(zoomLevel - 0.1); // Decrease zoom level by 0.1
    };

    const StyledTableCell = withStyles((theme) => ({
        head: {
            backgroundColor: theme.palette.common.white,
            color: 'green',
            fontSize: 18,
            fontWeight: 'bold',
        },
        body: {
            fontSize: 14,
        },
    }))(TableCell);

    const handleClose = () => {
        setOpen(false);
        setRefreshData(!refreshData)
    };

    const handleImageClickOpen = (image) => {
        setSelectedImage(image);
        setZoomOpen(true);
    };

    const handleImageClose = () => {
        setZoomOpen(false);
    };

    const handleApprove = async (recordId, work_done) => {
        console.log('handleApprove called', work_done);
        const response = await fetch(`${API_HOST}/api/work_record`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                record_id: recordId,
                is_verified: "1",
                work_done: work_done
            })
        });

        response.json().then(data => {
            console.log(data);
            if (response.ok) {
                setRefreshData(!refreshData);
            }
        });
    };

    const submitWorkRecord = () => {
        setOpen(true);
    };


    const handleReject = async (recordId, work_done) => {
        const response = await fetch(`${API_HOST}/api/work_record`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                record_id: recordId,
                is_verified: 0,
                work_done: -work_done
            })
        });

        const data = await response.json();
        console.log(data);
    };

    const classes = useStyles();
    const handleBack = () => {
        console.log('handleBack called');
        navigate('/properties');
    };
    useEffect(() => {
        fetch(`${API_HOST}/api/property/${propert_id}`, {
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
                setProperty(data.data);
                console.log('Property data:', data);
                setIsLoading(false); // Set loading to false after data is fetched
            })
            .catch(error => {
                navigate('/login')
                console.error('There was an error!', error);
            });
    }, [navigate, propert_id, refreshData]);

    if (isLoading) {
        return <CircularProgress />;
    }

    // Check if property data is available
    if (!property || !property[0] || !property[0].property) {
        return <div>No property data available</div>;
    }

    // Get the first property's details
    const propertyDetails = property[0].property;
    const workOrders = property[0].work_orders;

    const exportWorkOrdersToPDF = (workOrder) => {
        console.log("Exporting work orders:", workOrder); // Debugging log to inspect workOrders

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Work Order for ${propertyDetails.property_name}`, 70, 22);
        doc.setFontSize(11);
        doc.text(`Order ID: ${workOrder.work_order_id}`, 14, 30);
        doc.text(`Assigned Date: ${new Date(workOrder.assigned_date).toLocaleDateString()}`, 14, 38);
        doc.text(`Assigned To: ${workOrder.user_full_name} (${workOrder.user_role})`, 14, 46);
        doc.text(`Paid Out Tons: ${workOrder.paid_out}`, 144, 30);
        doc.text(`Total Earnings: ${workOrder.total_earnings}`, 144, 38);
        doc.text(`Total Work Done in Tons: ${workOrder.total_work_done}`, 144, 46);
        const tableColumn = ["Record ID", "Work Done (tons)", "Created At"];
        const tableRows = [];

        workOrder.work_records.forEach(record => {
            if (record.is_verified && record.work_done_tons >= 0) {
                const recordData = [
                    record.record_id,
                    record.work_done_tons,
                    new Date(record.created_at).toLocaleDateString(),
                ];
                tableRows.push(recordData);
            }

        });

        doc.autoTable(tableColumn, tableRows, { startY: 54 });

        doc.save(`work_order_${workOrder.work_order_id}.pdf`);

    };


    return (
        <Layout username={username}>
            <Card>
                {/* Top section for property overview */}
                <CardContent>
                    <Box display="flex" justifyContent="center">
                        <Chip
                            label={propertyDetails.property_name}
                            className={classes.chip}
                            sx={{ fontSize: '150%', transform: 'scale(1.3)' }} // Increase the font size by 50%
                        />
                    </Box>
                    <Box height={20} />
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <Typography color="textSecondary">
                                Acerage: {propertyDetails.land_area_acres}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography color="textSecondary">
                                Estimated Tonnage: {propertyDetails.estimated_work} tons
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography color="textSecondary">
                                Created At: {new Date(propertyDetails.created_at).toLocaleDateString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography color="textSecondary">
                                Purchase Date: {new Date(propertyDetails.purchase_date).toLocaleDateString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography color="textSecondary">
                                Completed Work: {propertyDetails.completed_work} tons
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography color="textSecondary">
                                Purchase Cost: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(propertyDetails.purchase_cost)}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography color="textSecondary">
                                Cost to Driver: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(propertyDetails.cost_to_driver)}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography color="textSecondary">
                                Cost to Labour: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(propertyDetails.cost_to_labour)}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>


                <CardContent>
                    <Table className={classes.workOrderTable}>
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <StyledTableCell>Work Order ID</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Assigned Date</StyledTableCell>
                                <StyledTableCell>Total Earnings</StyledTableCell>
                                <StyledTableCell>PAID OUT(tons)</StyledTableCell>
                                <StyledTableCell>Total Work Done</StyledTableCell>
                                <StyledTableCell>Update Date</StyledTableCell>
                                <StyledTableCell>Group Name</StyledTableCell>
                                <StyledTableCell>Group Type</StyledTableCell>
                                <StyledTableCell>Action</StyledTableCell>


                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {workOrders.flat().map((workOrder, index) => (
                                <>
                                    <TableRow key={workOrder.work_order_id}>
                                        <TableCell>
                                            <IconButton size="small" onClick={() => setOpenRow(openRow === index ? null : index)}>
                                                {openRow === index ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {workOrder.work_order_id}
                                        </TableCell>

                                        <TableCell >{workOrder.is_completed ? "Completed" : "In Progress"}</TableCell>
                                        <TableCell >{new Date(workOrder.assigned_date).toLocaleDateString()}</TableCell>
                                        <TableCell >{workOrder.total_earnings}</TableCell>
                                        <TableCell >{workOrder.paid_out}</TableCell>
                                        <TableCell >{workOrder.total_work_done}</TableCell>
                                        <TableCell >{new Date(workOrder.update_date).toLocaleDateString()}</TableCell>
                                        <TableCell >{workOrder.user_full_name}</TableCell>
                                        <TableCell >{workOrder.user_role}</TableCell>
                                        <TableCell ><button onClick={() => exportWorkOrdersToPDF(workOrder,propertyDetails)}>Export to PDF</button></TableCell>

                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                            <Collapse in={openRow === index} timeout="auto" unmountOnExit>
                                                <Box margin={1}>
                                                    <Typography variant="h6" gutterBottom component="div">
                                                        Work Records
                                                    </Typography>
                                                    <Table size="small" aria-label="work records">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell className={classes.tableHeader}>Record ID</TableCell>
                                                                <TableCell className={classes.tableHeader}>Work Done (tons)</TableCell>
                                                                <TableCell className={classes.tableHeader}>Verified</TableCell>
                                                                <TableCell className={classes.tableHeader}>Created At</TableCell>
                                                                <TableCell className={classes.tableHeader}>Proof of Work</TableCell>
                                                                <TableCell className={classes.tableHeader}>Update Date</TableCell>
                                                                <TableCell className={classes.tableHeader}>Action</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {workOrder.work_records.map((record) => (
                                                                <TableRow key={record.record_id}>
                                                                    <TableCell>{record.record_id}</TableCell>
                                                                    <TableCell>{record.work_done_tons}</TableCell>
                                                                    <TableCell>{record.is_verified ? "Yes" : "No"}</TableCell>
                                                                    <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
                                                                    <TableCell>
                                                                        <img
                                                                            src={`data:image/jpeg;base64,${record.proof_of_work_file_path}`}
                                                                            alt="Proof of Work"
                                                                            style={{ width: '100px', height: '100px' }}
                                                                            onClick={() => handleImageClickOpen(`data:image/jpeg;base64,${record.proof_of_work_file_path}`)}
                                                                        />
                                                                    </TableCell>

                                                                    <Dialog open={zoomOpen} onClose={handleImageClose} maxWidth="lg" fullWidth>
                                            <DialogContent style={{ overflowY: 'auto', overflowX: 'auto', backgroundColor: 'black' }}> {/* Allow scrolling if necessary */}
                                                <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}> {/* Center the image without forcing overflow */}
                                                    <img src={selectedImage} alt="Zoomed Proof of Work" style={{
                                                        transform: `scale(${zoomLevel})`,
                                                        transformOrigin: 'center',
                                                        maxWidth: '90vw', // Use viewport width to limit image width
                                                        maxHeight: '90vh', // Use viewport height to limit image height
                                                    }} />
                                                </div>
                                            </DialogContent>
                                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                                <button onClick={(event) => zoomIn(event)}>Zoom In</button>
                                                <button onClick={(event) => zoomOut(event)}>Zoom Out</button>
                                            </div>
                                        </Dialog>


                                                                    <TableCell>{new Date(record.update_date).toLocaleDateString()}</TableCell>
                                                                    <TableCell>
                                                                        <Box display="flex" justifyContent="space-between">
                                                                            <Button
                                                                                variant="contained"
                                                                                color="primary"
                                                                                style={{ marginRight: '10px' }}
                                                                                onClick={() => handleApprove(record.record_id, record.work_done_tons)}
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
                                                    <Button variant="outlined" color="primary" onClick={submitWorkRecord}>
                                                        Add Work Record
                                                    </Button>
                                                    <Dialog maxWidth="sm" open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                                                        <DialogTitle id="form-dialog-title">New Work Record</DialogTitle>
                                                        <DialogContent>
                                                            <NewWorkRecord token={authToken} workorderId={workOrder.work_order_id} />
                                                        </DialogContent>
                                                        <DialogActions>
                                                            <Button onClick={handleClose} color="primary">
                                                                Cancel
                                                            </Button>
                                                        </DialogActions>
                                                    </Dialog>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>

                {/* Bottom section for work orders */}
                <CardContent>
                    {/* Render your work orders here */}
                </CardContent>
            </Card>

            <Button onClick={handleBack}>Back</Button>
        </Layout>
    );
};

export default Property;