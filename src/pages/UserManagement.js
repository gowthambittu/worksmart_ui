import React, { useState, useEffect, useMemo } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableContainer,
    TableHead,
    Paper,
    TablePagination,
    Chip,
    Typography,
    InputBase,
} from '@material-ui/core';
import Layout from './Layout';
import NewUserForm from './NewUserForm';
import { apiFetch } from '../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import UpdateUserForm from './UpdateUserForm';

const styles = {
    page: { padding: 16 },
    card: {
        background: '#fff',
        border: '1px solid #d8decd',
        borderRadius: 14,
        padding: 16,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 14,
    },
    title: { fontWeight: 700, color: '#24321a' },
    addBtn: {
        background: '#EAF3DE',
        color: '#3B6D11',
        border: '1px solid #97C459',
        borderRadius: 10,
        textTransform: 'none',
        fontWeight: 600,
    },
    search: {
        border: '1px solid #dfe5d2',
        borderRadius: 10,
        padding: '10px 12px',
        marginBottom: 14,
        width: 320,
        maxWidth: '100%',
    },
    th: { fontWeight: 700, fontSize: '0.95rem', color: '#5b6352', whiteSpace: 'nowrap' },
};

const UserManagement = (parms) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [booleanupdate, setBooleanupdate] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [currentUser, setCurrentUser] = useState({});

    const handleClickOpen = (user) => {
        setCurrentUser(user);
        setBooleanupdate(true);
    };

    const handleClose = () => {
        setOpen(false);
        setRefreshData((prev) => !prev);
    };

    const handleUpdateClose = () => {
        setBooleanupdate(false);
        setRefreshData((prev) => !prev);
    };

    useEffect(() => {
        apiFetch('/auth/users', {
            headers: {
                Authorization: `Bearer ${parms.authToken}`,
            },
        })
            .then(({ data }) => {
                setData(data.data || []);
            })
            .catch(() => {
                navigate('/login');
            });
    }, [navigate, refreshData, parms.authToken]);

    const filteredData = useMemo(() => {
        const q = search.toLowerCase();
        return data.filter((user) => {
            return (
                String(user.full_name || '').toLowerCase().includes(q) ||
                String(user.email || '').toLowerCase().includes(q) ||
                String(user.user_id || '').includes(search)
            );
        });
    }, [data, search]);

    return (
        <Layout username={parms.username}>
            <div style={styles.page}>
                <Paper style={styles.card}>
                    <div style={styles.header}>
                        <Typography variant="h5" style={styles.title}>Users</Typography>
                        <Button style={styles.addBtn} onClick={() => setOpen(true)}>+ Add user</Button>
                    </div>

                    <InputBase
                        placeholder="Search by name, email, or ID..."
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(0);
                        }}
                        style={styles.search}
                    />

                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={styles.th}>User ID</TableCell>
                                    <TableCell style={styles.th}>Full Name</TableCell>
                                    <TableCell style={styles.th}>Email</TableCell>
                                    <TableCell style={styles.th}>Role</TableCell>
                                    <TableCell style={styles.th}>Has Work</TableCell>
                                    <TableCell style={styles.th}>Admin</TableCell>
                                    <TableCell style={styles.th}>Phone</TableCell>
                                    <TableCell style={styles.th}>Registered</TableCell>
                                    <TableCell style={styles.th}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                                    <TableRow key={user.user_id} hover>
                                        <TableCell>{user.user_id}</TableCell>
                                        <TableCell>{user.full_name || '—'}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={user.role}
                                                style={
                                                    user.role === 'admin'
                                                        ? { background: '#E6F1FB', color: '#0C447C' }
                                                        : user.role === 'driver'
                                                            ? { background: '#FAEEDA', color: '#633806' }
                                                            : { background: '#EAF3DE', color: '#3B6D11' }
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{user.has_work ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>{user.is_admin ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>{user.phone_number || '—'}</TableCell>
                                        <TableCell>{user.registration_date ? new Date(user.registration_date).toLocaleDateString() : '—'}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                style={{ textTransform: 'none' }}
                                                onClick={() => handleClickOpen(user)}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(0);
                            }}
                        />
                    </TableContainer>
                </Paper>
            </div>

            <Dialog maxWidth="sm" open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Add New User</DialogTitle>
                <DialogContent>
                    <NewUserForm token={parms.authToken} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Cancel</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={booleanupdate} onClose={handleUpdateClose} aria-labelledby="update-user-dialog-title">
                <DialogTitle id="update-user-dialog-title">Update User</DialogTitle>
                <DialogContent>
                    <UpdateUserForm token={parms.authToken} user={currentUser} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleUpdateClose} color="primary">Cancel</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default UserManagement;
