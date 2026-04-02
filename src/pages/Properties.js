import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from './Layout';
import { apiFetch } from '../utils/apiClient';
import {
    Paper,
    Typography,
    Button,
    InputBase,
    Select,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LinearProgress,
} from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import NewPropertyForm from './NewPropertyForm';
import UpdatePropertyForm from './UpdatePropertyForm';

const styles = {
    page: { padding: 16 },
    card: {
        borderRadius: 14,
        border: '1px solid #d8decd',
        background: '#ffffff',
        padding: 16,
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    title: { fontWeight: 700, color: '#24321a' },
    addBtn: {
        background: '#EAF3DE',
        color: '#3B6D11',
        border: '1px solid #97C459',
        borderRadius: 10,
        textTransform: 'none',
        fontWeight: 600,
    },
    searchRow: { display: 'grid', gridTemplateColumns: '1fr 180px 180px', gap: 10, marginBottom: 14 },
    rowHeader: {
        display: 'grid',
        gridTemplateColumns: '2fr 1.4fr 0.8fr 1.2fr 0.9fr 120px',
        gap: 8,
        borderBottom: '1px solid #e7eadf',
        paddingBottom: 8,
        color: '#6f7667',
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '2fr 1.4fr 0.8fr 1.2fr 0.9fr 120px',
        gap: 8,
        alignItems: 'center',
        borderBottom: '1px solid #eef1e8',
        padding: '12px 0',
    },
    propertyName: { fontWeight: 700, color: '#22301a', fontSize: 16 },
    meta: { fontSize: 12, color: '#6f7667', marginTop: 2 },
    actions: { display: 'flex', gap: 8 },
    badge: {
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
    },
};

const humanizeValue = (value) => {
    if (!value) return '—';
    return String(value)
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const getStatus = (item) => {
    const estimated = Number(item.estimated_work || 0);
    const completed = Number(item.completed_work || 0);
    if (estimated > 0 && completed >= estimated) {
        return { label: 'Completed', color: '#0C447C', bg: '#E6F1FB' };
    }
    if (completed > 0) {
        return { label: 'In progress', color: '#633806', bg: '#FAEEDA' };
    }
    return { label: 'Active', color: '#3B6D11', bg: '#EAF3DE' };
};

const Properties = ({ username, authToken }) => {
    const [data, setData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [seasonFilter, setSeasonFilter] = useState('all');
    const [cropFilter, setCropFilter] = useState('all');
    const [open, setOpen] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [refreshData, setRefreshData] = useState(false);
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:900px)');

    useEffect(() => {
        apiFetch('/api/property', {
            headers: { Authorization: `Bearer ${authToken}` },
        })
            .then(({ data }) => {
                setData(data.data || []);
            })
            .catch(() => {
                navigate('/login');
            });
    }, [navigate, refreshData, authToken]);

    const seasons = useMemo(() => {
        const set = new Set((data || []).map((item) => item.season).filter(Boolean));
        return Array.from(set);
    }, [data]);

    const crops = useMemo(() => {
        const set = new Set((data || []).map((item) => item.crop_type).filter(Boolean));
        return Array.from(set);
    }, [data]);

    const filteredData = useMemo(() => {
        return (data || []).filter((item) => {
            const name = String(item.property_name || '').toLowerCase();
            const location = String(item.location || '').toLowerCase();
            const q = searchText.toLowerCase();
            const matchesSearch = !q || name.includes(q) || location.includes(q);
            const matchesSeason = seasonFilter === 'all' || item.season === seasonFilter;
            const matchesCrop = cropFilter === 'all' || item.crop_type === cropFilter;
            return matchesSearch && matchesSeason && matchesCrop;
        });
    }, [data, searchText, seasonFilter, cropFilter]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleCreateSuccess = () => {
        setOpen(false);
        setRefreshData((prev) => !prev);
    };

    const handleAddProperty = () => {
        setOpen(true);
    };

    const handleOpenUpdate = (property) => {
        setSelectedProperty(property);
        setOpenUpdate(true);
    };

    const handleCloseUpdate = () => {
        setOpenUpdate(false);
        setSelectedProperty(null);
    };

    const handleUpdateSuccess = () => {
        setOpenUpdate(false);
        setSelectedProperty(null);
        setRefreshData((prev) => !prev);
    };

    return (
        <Layout username={username}>
            <div style={styles.page}>
                <Paper style={styles.card}>
                    <div style={styles.header}>
                        <Typography variant="h5" style={styles.title}>Properties</Typography>
                        <Button style={styles.addBtn} onClick={handleAddProperty}>+ Add property</Button>
                    </div>

                    <div
                        style={{
                            ...styles.searchRow,
                            gridTemplateColumns: isMobile ? '1fr' : styles.searchRow.gridTemplateColumns,
                        }}
                    >
                        <InputBase
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            placeholder="Search by name or location..."
                            style={{ border: '1px solid #dfe5d2', borderRadius: 10, padding: '10px 12px' }}
                        />
                        <Select
                            value={seasonFilter}
                            onChange={(event) => setSeasonFilter(event.target.value)}
                            style={{ border: '1px solid #dfe5d2', borderRadius: 10, paddingLeft: 8 }}
                            displayEmpty
                        >
                            <MenuItem value="all">All seasons</MenuItem>
                            {seasons.map((season) => (
                                <MenuItem key={season} value={season}>{humanizeValue(season)}</MenuItem>
                            ))}
                        </Select>
                        <Select
                            value={cropFilter}
                            onChange={(event) => setCropFilter(event.target.value)}
                            style={{ border: '1px solid #dfe5d2', borderRadius: 10, paddingLeft: 8 }}
                            displayEmpty
                        >
                            <MenuItem value="all">All crops</MenuItem>
                            {crops.map((crop) => (
                                <MenuItem key={crop} value={crop}>{humanizeValue(crop)}</MenuItem>
                            ))}
                        </Select>
                    </div>

                    {!isMobile && (
                        <div style={styles.rowHeader}>
                            <div>Property</div>
                            <div>Crop</div>
                            <div>Area</div>
                            <div>Progress</div>
                            <div>Status</div>
                            <div>Actions</div>
                        </div>
                    )}

                    {filteredData.map((item) => {
                        const estimated = Number(item.estimated_work || 0);
                        const completed = Number(item.completed_work || 0);
                        const progress = estimated > 0 ? Math.min(100, Math.round((completed / estimated) * 100)) : 0;
                        const status = getStatus(item);

                        if (isMobile) {
                            return (
                                <Paper key={item.property_id} style={{ padding: 12, marginTop: 10, border: '1px solid #ecf0e5' }}>
                                    <div style={styles.propertyName}>{item.property_name}</div>
                                    <div style={styles.meta}>
                                        {item.location || 'Unknown location'} · {humanizeValue(item.soil_type)} · {item.is_irrigated ? 'Irrigated' : 'Rain-fed'}
                                    </div>
                                    <div style={{ ...styles.meta, marginTop: 8 }}>
                                        {humanizeValue(item.crop_type)} · {humanizeValue(item.season)}
                                    </div>
                                    <div style={{ ...styles.meta, marginTop: 8 }}>
                                        Area: {item.land_area_acres ? `${item.land_area_acres} ac` : '—'}
                                    </div>
                                    <div style={{ ...styles.meta, marginTop: 6 }}>{progress}% · {completed || 0}/{estimated || 0}t</div>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        style={{ height: 6, borderRadius: 6, background: '#ecefe6', marginTop: 4 }}
                                    />
                                    <div style={{ marginTop: 10 }}>
                                        <span style={{ ...styles.badge, color: status.color, background: status.bg }}>{status.label}</span>
                                    </div>
                                    <div style={{ ...styles.actions, marginTop: 10 }}>
                                        <Button
                                            component={Link}
                                            to={`/adminView/property/${item.property_id}`}
                                            variant="contained"
                                            size="small"
                                            style={{ backgroundColor: '#E6F1FB', color: '#0C447C', minWidth: 52, textTransform: 'none' }}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            onClick={() => handleOpenUpdate(item)}
                                            variant="outlined"
                                            size="small"
                                            style={{ minWidth: 52, textTransform: 'none' }}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </Paper>
                            );
                        }

                        return (
                            <div key={item.property_id} style={styles.row}>
                                <div>
                                    <div style={styles.propertyName}>{item.property_name}</div>
                                    <div style={styles.meta}>
                                        {item.location || 'Unknown location'} · {humanizeValue(item.soil_type)} · {item.is_irrigated ? 'Irrigated' : 'Rain-fed'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 14, color: '#1f2a17' }}>{humanizeValue(item.crop_type)}</div>
                                    <div style={styles.meta}>{humanizeValue(item.season)}</div>
                                </div>

                                <div style={{ fontSize: 15, fontWeight: 600, color: '#1f2a17' }}>
                                    {item.land_area_acres ? `${item.land_area_acres} ac` : '—'}
                                </div>

                                <div>
                                    <div style={styles.meta}>{progress}% · {completed || 0}/{estimated || 0}t</div>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        style={{ height: 6, borderRadius: 6, background: '#ecefe6', marginTop: 4 }}
                                    />
                                </div>

                                <div>
                                    <span style={{ ...styles.badge, color: status.color, background: status.bg }}>{status.label}</span>
                                </div>

                                <div style={styles.actions}>
                                    <Button
                                        component={Link}
                                        to={`/adminView/property/${item.property_id}`}
                                        variant="contained"
                                        size="small"
                                        style={{ backgroundColor: '#E6F1FB', color: '#0C447C', minWidth: 52, textTransform: 'none' }}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        onClick={() => handleOpenUpdate(item)}
                                        variant="outlined"
                                        size="small"
                                        style={{ minWidth: 52, textTransform: 'none' }}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    {filteredData.length === 0 && (
                        <Typography style={{ color: '#6f7667', marginTop: 16 }}>
                            No properties match the current filters.
                        </Typography>
                    )}
                </Paper>

                <Dialog maxWidth="md" fullWidth open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Add New Property</DialogTitle>
                    <DialogContent>
                        <NewPropertyForm token={authToken} onSuccess={handleCreateSuccess} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">Cancel</Button>
                    </DialogActions>
                </Dialog>

                <Dialog maxWidth="md" fullWidth open={openUpdate} onClose={handleCloseUpdate} aria-labelledby="update-form-dialog-title">
                    <DialogTitle id="update-form-dialog-title">Update Property</DialogTitle>
                    <DialogContent>
                        <UpdatePropertyForm token={authToken} propertyData={selectedProperty} onSuccess={handleUpdateSuccess} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseUpdate} color="primary">Cancel</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </Layout>
    );
};

export default Properties;
