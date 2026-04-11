import React, { useEffect, useMemo, useState } from 'react';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TablePagination,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
    InputBase,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Chip,
    TextField,
    Typography,
} from '@material-ui/core';
import NewOutboundRecord from './NewOutboundRecord';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { apiFetch } from '../utils/apiClient';

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
    exportRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr auto',
        gap: 10,
        marginBottom: 14,
    },
    filterInput: {
        display: 'block',
        border: '1px solid #dfe5d2',
        borderRadius: 8,
        padding: '6px 10px',
        width: '100%',
        boxSizing: 'border-box',
        minWidth: 0,
        marginTop: 6,
        fontSize: 12,
    },
    th: { fontWeight: 700, fontSize: '0.95rem', color: '#5b6352', whiteSpace: 'nowrap' },
    actionWrap: { display: 'flex', gap: 6, flexWrap: 'nowrap', whiteSpace: 'nowrap' },
    actionBtn: { textTransform: 'none', minWidth: 64, padding: '4px 10px', fontSize: 11 },
    actionApprove: { background: '#EAF3DE', color: '#3B6D11', textTransform: 'none', minWidth: 72, padding: '4px 10px', fontSize: 11 },
    actionDelete: { textTransform: 'none', minWidth: 68, padding: '4px 10px', fontSize: 11, color: '#791F1F', borderColor: '#E2A7A7' },
};

const getImageSrc = (value) => {
    if (!value || typeof value !== 'string') return '';
    const normalized = value.trim();
    if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('data:')) {
        return normalized;
    }
    return `data:image/jpeg;base64,${normalized}`;
};

const Outbound = ({ username, authToken }) => {
    const [outbound, setOutbound] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [open, setOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [filters, setFilters] = useState({
        outbound_id: '',
        truck_number: '',
        truck_date: '',
        weight_in_kgs: '',
        created_at: '',
        is_verified: '',
        created_id: '',
        update_date: '',
    });
    const [sort, setSort] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [editPayload, setEditPayload] = useState({ truck_number: '', truck_date: '', weight_in_kgs: '' });
    const [actionError, setActionError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        apiFetch('/api/outbound_record', {
            method: 'GET',
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        })
            .then(({ data }) => {
                if (data.status === 'fail') {
                    navigate('/login');
                    return;
                }
                setOutbound(data.data || []);
            })
            .catch(() => {
                navigate('/login');
            });
    }, [refreshData, navigate]);

    const handleSort = (field) => {
        const isAsc = sort === field && sortOrder === 'asc';
        setSort(field);
        setSortOrder(isAsc ? 'desc' : 'asc');
    };

    const handleFilterChange = (field) => (event) => {
        setFilters((prev) => ({ ...prev, [field]: event.target.value }));
        setPage(0);
    };

    const filteredData = useMemo(() => {
        let rows = [...outbound];

        Object.keys(filters).forEach((key) => {
            rows = rows.filter((item) => {
                const itemValue = String(item[key] ?? '').toLowerCase();
                const filterValue = String(filters[key] ?? '').toLowerCase();
                return itemValue.includes(filterValue);
            });
        });

        if (sort) {
            rows.sort((a, b) => {
                const aValue = a[sort];
                const bValue = b[sort];
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                }
                return sortOrder === 'asc'
                    ? String(aValue ?? '').localeCompare(String(bValue ?? ''))
                    : String(bValue ?? '').localeCompare(String(aValue ?? ''));
            });
        }

        return rows;
    }, [outbound, filters, sort, sortOrder]);

    const handleApprove = async (recordId) => {
        try {
            await apiFetch('/api/outbound_record', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ outbound_id: recordId, is_verified: '1' }),
            });
            setRefreshData((prev) => !prev);
        } catch (error) {
            console.error(error);
        }
    };

    const openEditDialog = (record) => {
        const truckDate = record.truck_date ? new Date(record.truck_date) : null;
        const truckDateValue = truckDate && !Number.isNaN(truckDate.getTime())
            ? truckDate.toISOString().slice(0, 10)
            : '';
        setSelectedRecord(record);
        setEditPayload({
            truck_number: record.truck_number || '',
            truck_date: truckDateValue,
            weight_in_kgs: record.weight_in_kgs ?? ((record.weight_in_tons ?? 0) * 1000),
        });
        setActionError('');
        setEditOpen(true);
    };

    const handleEditSave = async () => {
        if (!selectedRecord) return;
        try {
            await apiFetch(`/api/outbound_record/${selectedRecord.outbound_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({
                    truck_number: editPayload.truck_number,
                    truck_date: editPayload.truck_date,
                    weight_in_kgs: Number(editPayload.weight_in_kgs),
                }),
            });
            setEditOpen(false);
            setSelectedRecord(null);
            setRefreshData((prev) => !prev);
        } catch (error) {
            setActionError(error?.data?.message || 'Failed to update outbound record.');
        }
    };

    const openDeleteDialog = (record) => {
        setSelectedRecord(record);
        setActionError('');
        setDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRecord) return;
        try {
            await apiFetch(`/api/outbound_record/${selectedRecord.outbound_id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            });
            setDeleteOpen(false);
            setSelectedRecord(null);
            setRefreshData((prev) => !prev);
        } catch (error) {
            setActionError(error?.data?.message || 'Failed to delete outbound record.');
        }
    };

    const exportToPDF = (startDate, endDate, records) => {
        const parseDate = (dateStr) => {
            const date = new Date(dateStr);
            return !Number.isNaN(date.getTime()) ? date.setHours(0, 0, 0, 0) : null;
        };

        const from = parseDate(startDate);
        const to = parseDate(endDate);
        if (!from || !to) return;

        const filteredRecords = records.filter((record) => {
            const recordDate = new Date(record.truck_date).setHours(0, 0, 0, 0);
            const weightInKgs = Number(record.weight_in_kgs ?? ((record.weight_in_tons ?? 0) * 1000));
            return record.is_verified && recordDate >= from && recordDate <= to && weightInKgs >= 0;
        });
        const sortedRecords = [...filteredRecords].sort((a, b) => {
            const aTime = new Date(a.truck_date || 0).getTime();
            const bTime = new Date(b.truck_date || 0).getTime();
            if (aTime !== bTime) return aTime - bTime;
            return (a.outbound_id || 0) - (b.outbound_id || 0);
        });

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Truck Records ${startDate} ${endDate}`, 50, 22);
        doc.setFontSize(11);

        const tableColumn = ['Truck Date', 'Truck Number', 'Weight In Kgs'];
        const tableRows = [];
        let totalWeight = 0;

        sortedRecords.forEach((record) => {
            const weightInKgs = Number(record.weight_in_kgs ?? ((record.weight_in_tons ?? 0) * 1000));
            totalWeight += weightInKgs;
            tableRows.push([record.truck_date.slice(0, 10), record.truck_number, weightInKgs]);
        });

        doc.text(`Total Weight (kgs): ${totalWeight}`, 14, 30);
        doc.autoTable(tableColumn, tableRows, { startY: 38 });
        doc.save(`outbound_records_${startDate}_${endDate}.pdf`);

        const imageDoc = new jsPDF();
        sortedRecords.forEach((record, index) => {
            const imageData = getImageSrc(record.receipt_proof);
            if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
                imageDoc.setFontSize(11);
                imageDoc.text('Receipt image URL:', 10, 50);
                imageDoc.textWithLink(imageData, 10, 58, { url: imageData });
            } else {
                imageDoc.addImage(imageData, 'JPEG', 10, 50, 185, 140);
            }

            if (index < sortedRecords.length - 1) {
                imageDoc.addPage();
            }
        });

        if (sortedRecords.length > 0) {
            imageDoc.save('receipt_image.pdf');
        }
    };

    return (
        <Layout username={username}>
            <div style={styles.page}>
                <Paper style={styles.card}>
                    <div style={styles.header}>
                        <Typography variant="h5" style={styles.title}>Outbound Records</Typography>
                        <Button style={styles.addBtn} onClick={() => setOpen(true)}>+ Add outbound record</Button>
                    </div>

                    <div style={styles.exportRow}>
                        <TextField
                            label="From Date"
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            label="To Date"
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <Button
                            variant="contained"
                            onClick={() => exportToPDF(fromDate, toDate, outbound)}
                            style={{ background: '#1a1f2e', color: '#fff', textTransform: 'none', fontWeight: 600 }}
                        >
                            Export PDF
                        </Button>
                    </div>

                    <TableContainer component={Paper} variant="outlined" style={{ overflowX: 'auto' }}>
                        <Table style={{ minWidth: 1180 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={styles.th}>
                                        <div>
                                            <TableSortLabel active={sort === 'outbound_id'} direction={sortOrder} onClick={() => handleSort('outbound_id')}>Outbound ID</TableSortLabel>
                                        </div>
                                        <InputBase value={filters.outbound_id} onChange={handleFilterChange('outbound_id')} placeholder="Filter" style={styles.filterInput} />
                                    </TableCell>
                                    <TableCell style={styles.th}>
                                        <div>
                                            <TableSortLabel active={sort === 'truck_number'} direction={sortOrder} onClick={() => handleSort('truck_number')}>Truck Number</TableSortLabel>
                                        </div>
                                        <InputBase value={filters.truck_number} onChange={handleFilterChange('truck_number')} placeholder="Filter" style={styles.filterInput} />
                                    </TableCell>
                                    <TableCell style={styles.th}>
                                        <div>
                                            <TableSortLabel active={sort === 'truck_date'} direction={sortOrder} onClick={() => handleSort('truck_date')}>Truck Date</TableSortLabel>
                                        </div>
                                        <InputBase value={filters.truck_date} onChange={handleFilterChange('truck_date')} placeholder="Filter" style={styles.filterInput} />
                                    </TableCell>
                                    <TableCell style={styles.th}>
                                        <div>Weight</div>
                                        <InputBase value={filters.weight_in_kgs} onChange={handleFilterChange('weight_in_kgs')} placeholder="Filter" style={styles.filterInput} />
                                    </TableCell>
                                    <TableCell style={styles.th}>
                                        <div>Receipt</div>
                                    </TableCell>
                                    <TableCell style={styles.th}>
                                        <div>Verified</div>
                                        <InputBase value={filters.is_verified} onChange={handleFilterChange('is_verified')} placeholder="Filter" style={styles.filterInput} />
                                    </TableCell>
                                    <TableCell style={styles.th}>
                                        <div>Created By</div>
                                        <InputBase value={filters.created_id} onChange={handleFilterChange('created_id')} placeholder="Filter" style={styles.filterInput} />
                                    </TableCell>
                                    <TableCell style={styles.th}>
                                        <div>Action</div>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record) => (
                                    <TableRow key={record.outbound_id} hover>
                                        <TableCell>{record.outbound_id}</TableCell>
                                        <TableCell>{record.truck_number}</TableCell>
                                        <TableCell>{new Date(record.truck_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{record.weight_in_kgs ?? ((record.weight_in_tons ?? 0) * 1000)}</TableCell>
                                        <TableCell>
                                            {record.receipt_proof ? (
                                                <img
                                                    src={getImageSrc(record.receipt_proof)}
                                                    alt="Receipt"
                                                    style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover', cursor: 'pointer', border: '1px solid #d8decd' }}
                                                    onClick={() => {
                                                        setSelectedImage(getImageSrc(record.receipt_proof));
                                                        setZoomLevel(1);
                                                        setZoomOpen(true);
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: 12, color: '#888780' }}>—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={record.is_verified ? 'Yes' : 'No'}
                                                size="small"
                                                style={record.is_verified ? { background: '#EAF3DE', color: '#3B6D11' } : { background: '#FAEEDA', color: '#633806' }}
                                            />
                                        </TableCell>
                                        <TableCell>{record.created_id}</TableCell>
                                        <TableCell>
                                            <div style={styles.actionWrap}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled={record.is_verified}
                                                    onClick={() => handleApprove(record.outbound_id)}
                                                    style={record.is_verified ? styles.actionBtn : styles.actionApprove}
                                                >
                                                    {record.is_verified ? 'Approved' : 'Approve'}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => openEditDialog(record)}
                                                    style={styles.actionBtn}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => openDeleteDialog(record)}
                                                    style={styles.actionDelete}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
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
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(0);
                            }}
                        />
                    </TableContainer>
                </Paper>
            </div>

            <Dialog open={zoomOpen} onClose={() => setZoomOpen(false)} maxWidth="lg" fullWidth>
                <DialogContent style={{ overflowY: 'auto', overflowX: 'auto', backgroundColor: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                        <img
                            src={selectedImage}
                            alt="Zoomed Receipt"
                            style={{
                                transform: `scale(${zoomLevel})`,
                                transformOrigin: 'center',
                                maxWidth: '90vw',
                                maxHeight: '90vh',
                            }}
                        />
                    </div>
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center' }}>
                    <Button onClick={() => setZoomLevel((prev) => Math.max(0.5, prev - 0.1))}>Zoom Out</Button>
                    <Button onClick={() => setZoomLevel((prev) => prev + 0.1)}>Zoom In</Button>
                    <Button onClick={() => setZoomOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog maxWidth="sm" open={open} onClose={() => { setOpen(false); setRefreshData((prev) => !prev); }} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">New Outbound Record</DialogTitle>
                <DialogContent>
                    <NewOutboundRecord token={authToken} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpen(false); setRefreshData((prev) => !prev); }} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog maxWidth="xs" fullWidth open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Edit Outbound Record</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Truck Number"
                        value={editPayload.truck_number}
                        onChange={(e) => setEditPayload((prev) => ({ ...prev, truck_number: e.target.value }))}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Truck Date"
                        type="date"
                        value={editPayload.truck_date}
                        onChange={(e) => setEditPayload((prev) => ({ ...prev, truck_date: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Weight (kgs)"
                        type="number"
                        value={editPayload.weight_in_kgs}
                        onChange={(e) => setEditPayload((prev) => ({ ...prev, weight_in_kgs: e.target.value }))}
                    />
                    {actionError && (
                        <div style={{ color: '#A32D2D', fontSize: 12, marginTop: 8 }}>{actionError}</div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog maxWidth="xs" fullWidth open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>Delete Outbound Record?</DialogTitle>
                <DialogContent>
                    <div style={{ fontSize: 13, color: '#5F5E5A' }}>
                        This will permanently delete outbound record #{selectedRecord?.outbound_id}. Continue?
                    </div>
                    {actionError && (
                        <div style={{ color: '#A32D2D', fontSize: 12, marginTop: 8 }}>{actionError}</div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} style={{ color: '#791F1F' }}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default Outbound;
