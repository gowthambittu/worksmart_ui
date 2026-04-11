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
        border: '1px solid #dfe5d2',
        borderRadius: 8,
        padding: '6px 10px',
        width: '100%',
        marginTop: 6,
        fontSize: 12,
    },
    th: { fontWeight: 700, fontSize: '0.95rem', color: '#5b6352', whiteSpace: 'nowrap' },
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

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Truck Records ${startDate} ${endDate}`, 50, 22);
        doc.setFontSize(11);

        const tableColumn = ['Truck Date', 'Truck Number', 'Weight In Kgs'];
        const tableRows = [];
        let totalWeight = 0;

        filteredRecords.forEach((record) => {
            const weightInKgs = Number(record.weight_in_kgs ?? ((record.weight_in_tons ?? 0) * 1000));
            totalWeight += weightInKgs;
            tableRows.push([record.truck_date.slice(0, 10), record.truck_number, weightInKgs]);
        });

        doc.text(`Total Weight (kgs): ${totalWeight}`, 14, 30);
        doc.autoTable(tableColumn, tableRows, { startY: 38 });
        doc.save(`outbound_records_${startDate}_${endDate}.pdf`);

        const imageDoc = new jsPDF();
        filteredRecords.forEach((record, index) => {
            const imageData = getImageSrc(record.receipt_proof);
            if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
                imageDoc.setFontSize(11);
                imageDoc.text('Receipt image URL:', 10, 50);
                imageDoc.textWithLink(imageData, 10, 58, { url: imageData });
            } else {
                imageDoc.addImage(imageData, 'JPEG', 10, 50, 185, 140);
            }

            if (index < filteredRecords.length - 1) {
                imageDoc.addPage();
            }
        });

        if (filteredRecords.length > 0) {
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

                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={styles.th}>
                                        <TableSortLabel active={sort === 'outbound_id'} direction={sortOrder} onClick={() => handleSort('outbound_id')}>Outbound ID</TableSortLabel>
                                        <InputBase value={filters.outbound_id} onChange={handleFilterChange('outbound_id')} placeholder="Filter" style={styles.filterInput} />
                                    </TableCell>
                                    <TableCell style={styles.th}>
                                        <TableSortLabel active={sort === 'truck_number'} direction={sortOrder} onClick={() => handleSort('truck_number')}>Truck Number</TableSortLabel>
                                        <InputBase value={filters.truck_number} onChange={handleFilterChange('truck_number')} placeholder="Filter" style={styles.filterInput} />
                                    </TableCell>
                                    <TableCell style={styles.th}>
                                        <TableSortLabel active={sort === 'truck_date'} direction={sortOrder} onClick={() => handleSort('truck_date')}>Truck Date</TableSortLabel>
                                        <InputBase value={filters.truck_date} onChange={handleFilterChange('truck_date')} placeholder="Filter" style={styles.filterInput} />
                                    </TableCell>
                                    <TableCell style={styles.th}>
                                        Weight
                                        <InputBase value={filters.weight_in_kgs} onChange={handleFilterChange('weight_in_kgs')} placeholder="Filter" style={styles.filterInput} />
                                    </TableCell>
                                    <TableCell style={styles.th}>Receipt</TableCell>
                                    <TableCell style={styles.th}>
                                        Verified
                                        <InputBase value={filters.is_verified} onChange={handleFilterChange('is_verified')} placeholder="Filter" style={styles.filterInput} />
                                    </TableCell>
                                    <TableCell style={styles.th}>
                                        Created By
                                        <InputBase value={filters.created_id} onChange={handleFilterChange('created_id')} placeholder="Filter" style={styles.filterInput} />
                                    </TableCell>
                                    <TableCell style={styles.th}>Action</TableCell>
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
                                            <Button
                                                variant="contained"
                                                size="small"
                                                disabled={record.is_verified}
                                                onClick={() => handleApprove(record.outbound_id)}
                                                style={record.is_verified ? { textTransform: 'none' } : { background: '#EAF3DE', color: '#3B6D11', textTransform: 'none' }}
                                            >
                                                {record.is_verified ? 'Approved' : 'Approve'}
                                            </Button>
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
        </Layout>
    );
};

export default Outbound;
