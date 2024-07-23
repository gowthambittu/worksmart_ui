import React from 'react';
import Layout from './Layout';
import { useState, useEffect } from 'react';
import API_HOST from '../config';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, Paper, TableSortLabel, InputBase, TableContainer, TablePagination, TableHead, TableRow } from '@material-ui/core';
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
import { TextField } from '@material-ui/core';
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


const Outbound = ({ username, authToken }) => {

    const [outbound, setOutbound] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const navigate = useNavigate();
    const classes = useStyles();
    const [zoomOpen, setZoomOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [open, setOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [filters, setFilters] = useState({ outbound_id: '', truck_number: '', truck_date: '' });
    const [sort, setSort] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);


    const handleSort = (outbound) => {
        const isAsc = sort === outbound && sortOrder === 'asc';
        setSort(outbound);
        setSortOrder(isAsc ? 'desc' : 'asc');
    };

    const handleFilterChange = (outbound) => (event) => {
        setFilters({ ...filters, [outbound]: event.target.value });
    };
    let filteredData = outbound;

    Object.keys(filters).forEach((key) => {
        filteredData = filteredData.filter(item => {
            // Convert item[key] to string if it's not already a string, to safely call toLowerCase
            const itemValue = String(item[key]).toLowerCase();
            const filterValue = String(filters[key]).toLowerCase();
            return itemValue.includes(filterValue);
        });
    });


    if (sort) {
        filteredData = filteredData.sort((a, b) => {
            const aValue = a[sort];
            const bValue = b[sort];

            // Check if the values are numbers
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // Assume the values are strings if not numbers
            return sortOrder === 'asc' ?
                aValue.toString().localeCompare(bValue.toString()) :
                bValue.toString().localeCompare(aValue.toString());
        });
    }






    const zoomIn = (event) => {
        event.stopPropagation(); // Prevent click event from propagating to the dialog
        setZoomLevel(zoomLevel + 0.1); // Increase zoom level by 0.1
    };

    const zoomOut = (event) => {
        event.stopPropagation(); // Prevent click event from propagating to the dialog
        setZoomLevel(zoomLevel - 0.1); // Decrease zoom level by 0.1
    };


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
        setZoomLevel(1)
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

            if (response.ok) {
                setRefreshData(!refreshData);
            }
        });
    }
    const handleImageClose = () => {
        setZoomOpen(false);
    };

    const exportToPDF = (fromDate, toDate, outbound) => {

        const parseDate = (dateStr) => {
            const date = new Date(dateStr);
            return !isNaN(date.getTime()) ? date.setHours(0, 0, 0, 0) : null;
        };

        const from = parseDate(fromDate);
        const to = parseDate(toDate);



        const filteredRecords = outbound.filter(record => {
            const recordDate = new Date(record.truck_date).setHours(0, 0, 0, 0);
            return record.is_verified && recordDate >= from && recordDate <= to && record.weight_in_tons >= 0;
        });

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Truck Records ${fromDate} ${toDate}`, 50, 22);
        doc.setFontSize(11);
        const tableColumn = ["Truck Date", "Truck Number", "Weight In Tons"]; // Define your columns
        const tableRows = [];
        let total_weight = 0;
        filteredRecords.forEach(record => {

            total_weight += parseFloat(record.weight_in_tons);
            const formattedDate = record.truck_date.slice(0, 10); // Extract only the date part
            const rowData = [
                formattedDate,
                record.truck_number,
                record.weight_in_tons
            ];
            tableRows.push(rowData);


        });

        doc.text(`Total Weight: ${total_weight}`, 14, 30);
        doc.autoTable(tableColumn, tableRows, { startY: 38 });
        doc.save(`outbound_records_${fromDate}_${toDate}.pdf`);

        // Generate PDF for receipt images
        const imageDoc = new jsPDF();

        let position = 50; // Track the position to place images

        filteredRecords.forEach((record, index) => {

            const imageData = `data:image/jpeg;base64,${record.receipt_proof}`
            imageDoc.addImage(imageData, 'JPEG', 10, position, 185, 140);
            position = 50; // Adjust based on your image size


            if (index === filteredRecords.length - 1) {
                console.log('hello receipt');
                imageDoc.save('receipt_image.pdf');
            } else {
                imageDoc.addPage();
            }
        });
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
                    <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                        <TextField
                            id="from-date"
                            label="From Date"
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <Box mx={2}> {/* Adds margin between the two date inputs */}
                            <TextField
                                id="to-date"
                                label="To Date"
                                type="date"
                                value={toDate}
                                onChange={(e) => {
                                    setToDate(e.target.value)

                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Box>
                        <Button variant="contained" color="primary" onClick={() => exportToPDF(fromDate, toDate, outbound)}>
                            Export to PDF
                        </Button>
                    </Box>
                    <Box height={20} />
                    <TableContainer component={Paper}>
                        <Table >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={sort === 'outbound_id'}
                                            direction={sortOrder}
                                            onClick={() => handleSort('outbound_id')}
                                            style={{ fontWeight: 'bold', fontSize: '1.05em' }}
                                        >
                                            Outbound ID
                                        </TableSortLabel>
                                        <InputBase
                                            value={filters.outbound_id}
                                            onChange={handleFilterChange('outbound_id')}
                                            placeholder="Filter by outbound id"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={sort === 'truck_number'}
                                            direction={sortOrder}
                                            onClick={() => handleSort('truck_number')}
                                            style={{ fontWeight: 'bold', fontSize: '1.05em' }}
                                        >
                                            Truck Number
                                        </TableSortLabel>
                                        <InputBase
                                            value={filters.property_name}
                                            onChange={handleFilterChange('truck_number')}
                                            placeholder="Filter by truck number"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={sort === 'truck_date'}
                                            direction={sortOrder}
                                            onClick={() => handleSort('truck_date')}
                                            style={{ fontWeight: 'bold', fontSize: '1.05em' }}
                                        >
                                            Truck Date
                                        </TableSortLabel>
                                        <InputBase
                                            value={filters.property_name}
                                            onChange={handleFilterChange('truck_date')}
                                            placeholder="Filter by truck date"
                                        />
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 'bold', fontSize: '1.05em' }}>
                                        Weight in Tons
                                        <InputBase
                                            value={filters.weight_in_tons}
                                            onChange={handleFilterChange('weight_in_tons')}
                                            placeholder="Filter by weight in tons"
                                        />
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 'bold', fontSize: '1.05em' }}>
                                        Created At
                                        <InputBase
                                            value={filters.weight_in_tons}
                                            onChange={handleFilterChange('created_at')}
                                            placeholder="Filter by created at"
                                        />
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 'bold', fontSize: '1.05em' }}>
                                        Receipt
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 'bold', fontSize: '1.05em' }}>
                                        Is Verified
                                        <InputBase
                                            value={filters.is_verified}
                                            onChange={handleFilterChange('is_verified')}
                                            placeholder="Filter by is verified"
                                        />
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 'bold', fontSize: '1.05em' }}>
                                        Created By
                                        <InputBase
                                            value={filters.created_by}
                                            onChange={handleFilterChange('created_by')}
                                            placeholder="Filter by created by"
                                        />
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 'bold', fontSize: '1.05em' }}>
                                        Update Date
                                        <InputBase
                                            value={filters.updated_date}
                                            onChange={handleFilterChange('updated_date')}
                                            placeholder="Filter by update date"
                                        />
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 'bold', fontSize: '1.05em' }}>
                                        Action
                                    </TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record, index) => (
                                    <TableRow key={index}>
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
                        <TablePagination
                            component="div"
                            count={filteredData.length}
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, '10'));
                                setPage(0);
                            }}
                        />
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