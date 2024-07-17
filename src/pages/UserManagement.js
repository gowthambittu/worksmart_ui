import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, TableBody, TableCell, TableRow } from '@material-ui/core';
import Layout from './Layout';
import NewUserForm from './NewUserForm';
import {A} from 'react'; // Add the missing import statement for 'react'
import API_HOST from '../config';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';
import UpdateUserForm from './UpdateUserForm';

import { Table, TableContainer, TableHead, Paper, TablePagination } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
  navbar: {
    backgroundColor: '#131921',
    height: '50px',
  },
  toolbar: {
      display: 'flex',
      justifyContent: 'flex-start',
    },
    button: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: '1.2em',
      margin: theme.spacing(1),
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
}));

const UserManagement = (parms) => {
  const [filters, setFilters] = useState({ property_name: '', location: '', created_at: '' });
  const [sort, setSort] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();
  const [redirectToNewProperty, setRedirectToNewProperty] = useState(false);
  const [open, setOpen] = useState(false);
  const [booleanupdate, setBooleanupdate] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState({});

  const handleClickOpen = (user) => {
    setCurrentUser(user);
    setBooleanupdate(true);
  };

 

  const handleSubmit = () => {
    // Implement your update logic here
    console.log('Submitting', currentUser);
    setOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
};
  
const handleSearch = (event) => {
  setSearch(event.target.value);
};
const handleChangeRowsPerPage = (event) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};
  const handleClose = () => {
    setOpen(false);
    setRefreshData(!refreshData)
};

const handleUpdateClose = () => {
  setBooleanupdate(false);
  setRefreshData(!refreshData)
}


  const handleAddUser = () => {
    setOpen(true);
  };

  useEffect(() => {
    fetch(`${API_HOST}/auth/users`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${parms.authToken}`
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
}, [navigate,refreshData]);

const filteredData = data.filter((user) => 
  (user.full_name ? user.full_name.toLowerCase().includes(search.toLowerCase()) : false) ||
  (user.email ? user.email.toLowerCase().includes(search.toLowerCase()) : false) ||
  (user.user_id ? user.user_id.toString().includes(search) : false)
);
  

return (
  <Layout username={parms.username}>
  <div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '7vh' }}>
          <h1 style={{ color: 'green', fontSize: '1.5em' }}>Users</h1>
      </div>
      <div>
          <TextField label="Search" value={search} onChange={handleSearch} />
          <Dialog maxWidth="sm" open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Add New User</DialogTitle>
              <DialogContent>
                  <NewUserForm  token={parms.authToken}/>
              </DialogContent>
              <DialogActions>
                  <Button onClick={handleClose} color="primary">
                      Cancel
                  </Button>
              </DialogActions>
          </Dialog>
          <TableContainer component={Paper}>
              <Table>
                  <TableHead>
                  <TableRow>
                <TableCell style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '18px' }}>User ID</TableCell>
                <TableCell style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '18px' }}>Email</TableCell>
                <TableCell style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '18px' }}>Full Name</TableCell>
                <TableCell style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '18px' }}>Role</TableCell>
                <TableCell style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '18px' }}>Has Work</TableCell>
                <TableCell style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '18px' }}>Is Admin</TableCell>
                <TableCell style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '18px' }}>Phone Number</TableCell>
                <TableCell style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '18px' }}>Registration Date</TableCell>
                <TableCell style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '18px' }}>Actions</TableCell>
            </TableRow>
                  </TableHead>
                  <TableBody>
                      {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                          <TableRow key={user.user_id}>
                              <TableCell>{user.user_id}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.full_name}</TableCell>
                              <TableCell>{user.role}</TableCell>
                              <TableCell>{user.has_work ? 'Yes' : 'No'}</TableCell>
                              <TableCell>{user.is_admin ? 'Yes' : 'No'}</TableCell>
                              <TableCell>{user.phone_number}</TableCell>
                              <TableCell>{new Date(user.registration_date).toLocaleDateString()}</TableCell>
                              <TableCell>
                              <Button
                                variant="contained"
                                style={{ backgroundColor: 'green', color: 'white' }}
                                onClick={() => handleClickOpen(user)}
                            >
                                Update
                            </Button>
                            </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
                 
                  <Dialog open={booleanupdate} onClose={handleUpdateClose} aria-labelledby="form-dialog-title">
                  <DialogTitle id="form-dialog-title">Update User</DialogTitle>
              <DialogContent>
                  <UpdateUserForm  token={parms.authToken} user={currentUser}/>
              </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateClose} color="primary">
            Cancel
          </Button>
       
        </DialogActions>
      </Dialog>
              </Table>
              <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
              />
          </TableContainer>
      </div>
  </div>
  <Button variant="outlined" color="primary" onClick={handleAddUser}>
              Add User
          </Button>
</Layout>
);
};

export default UserManagement;