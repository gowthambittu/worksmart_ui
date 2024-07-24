import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import API_HOST from '../config';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, InputBase, TablePagination } from '@material-ui/core';

import { Button } from '@material-ui/core';

import NewPropertyForm from './NewPropertyForm';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Link } from 'react-router-dom';
// import { makeStyles } from '@material-ui/core/styles';

// const useStyles = makeStyles((theme) => ({
//     navbar: {
//       backgroundColor: '#131921',
//       height: '50px',
//     },
//     toolbar: {
//         display: 'flex',
//         justifyContent: 'flex-start',
//       },
//       button: {
//         color: '#FFFFFF',
//         fontWeight: 'bold',
//         fontSize: '1.2em',
//         margin: theme.spacing(1),
//         '&:hover': {
//           backgroundColor: 'rgba(255, 255, 255, 0.1)',
//         },
//       },
//   }));

const Properties = ({ username,authToken }) => {
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({ property_id:'',property_name: '', location: '', created_at: '' });
    const [sort, setSort] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const navigate = useNavigate();
    // const [redirectToNewProperty, setRedirectToNewProperty] = useState(false);
    const [open, setOpen] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    // const classes = useStyles();


    const handleClose = () => {
        setOpen(false);
        setRefreshData(!refreshData)
    };

    const handleAddProperty = () => {
        setOpen(true);
    };

    const handleSort = (property) => {
        const isAsc = sort === property && sortOrder === 'asc';
        setSort(property);
        setSortOrder(isAsc ? 'desc' : 'asc');
    };

    const handleFilterChange = (property) => (event) => {
        setFilters({ ...filters, [property]: event.target.value });
    };

    useEffect(() => {
        fetch(`${API_HOST}/api/property`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(response => {
                if (response.status === 403) {
                    throw new Error('Invalid token. Please log in again.');
                }
                return response.json();
            })
            .then(data => {
                setData(data.data);
            })
            .catch(error => {
                // alert(error.message);
                navigate('/login');
            });
    }, [navigate,refreshData,authToken]);

    let filteredData = data;
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


    return (
        <Layout username={username}>
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '7vh' }}>
                <h1 style={{ color: 'green', fontSize: '1.5em' }}>Properties</h1>
            </div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sort === 'property_id'}
                                    direction={sortOrder}
                                    onClick={() => handleSort('property_id')}
                                    style={{ fontWeight: 'bold', fontSize: '1.2em' }}
                                >
                                    Property ID
                                </TableSortLabel>
                                <InputBase
                                    value={filters.property_id}
                                    onChange={handleFilterChange('property_id')}
                                    placeholder="Filter by property id"
                                />
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sort === 'property_name'}
                                    direction={sortOrder}
                                    onClick={() => handleSort('property_name')}
                                    style={{ fontWeight: 'bold', fontSize: '1.2em' }}
                                >
                                    Property Name
                                </TableSortLabel>
                                <InputBase
                                    value={filters.property_name}
                                    onChange={handleFilterChange('property_name')}
                                    placeholder="Filter by property name"
                                />
                            </TableCell>
                            <TableCell style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                                Location
                                <InputBase
                                    value={filters.location}
                                    onChange={handleFilterChange('location')}
                                    placeholder="Filter by location"
                                />
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sort === 'created_at'}
                                    direction={sortOrder}
                                    onClick={() => handleSort('created_at')}
                                    style={{ fontWeight: 'bold', fontSize: '1.2em' }}
                                >
                                    Creation Date
                                </TableSortLabel>
                                <InputBase
                                    value={filters.created_at}
                                    onChange={handleFilterChange('created_at')}
                                    placeholder="Filter by creation date"
                                />
                            </TableCell>
                            <TableCell style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                                Estimated Work
                                <InputBase
                                    value={filters.estimated_work}
                                    onChange={handleFilterChange('estimated_work')}
                                    placeholder="Filter by estimated work"
                                />
                            </TableCell>
                            <TableCell style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                                Completed Work
                                <InputBase
                                    value={filters.completed_work}
                                    onChange={handleFilterChange('completed_work')}
                                    placeholder="Filter by completed work"
                                />
                            </TableCell>
                            <TableCell style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                                Area of Acres
                                <InputBase
                                    value={filters.area_of_acres}
                                    onChange={handleFilterChange('area_of_acres')}
                                    placeholder="Filter by area of acres"
                                />
                            </TableCell>
                            <TableCell style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.property_id}</TableCell>
                                <TableCell>{item.property_name}</TableCell>
                                <TableCell>{item.location}</TableCell>
                                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{item.estimated_work}</TableCell>
                                <TableCell>{item.completed_work}</TableCell>
                                <TableCell>{item.land_area_acres}</TableCell>
                                <TableCell><Button component={Link} to={`/adminView/property/${item.property_id}`}>View</Button></TableCell>
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
            <div>
                <Button variant="outlined" color="primary" onClick={handleAddProperty}>
                    Add Property
                </Button>
                <Dialog maxWidth="sm" open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Add New Property</DialogTitle>
                    <DialogContent>
                        <NewPropertyForm token={authToken} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
        </Layout>
    );
};

export default Properties;