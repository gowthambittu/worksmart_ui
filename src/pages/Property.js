import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './Layout';
import { apiFetch } from '../utils/apiClient';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';
import { Button } from '@material-ui/core';
import NewWorkRecord from './NewWorkRecord';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const s = {
  root: { background: '#f5f5f3', minHeight: '100vh', padding: 20 },
  backRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer', color: '#888780', fontSize: 13 },
  headerCard: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: 20, marginBottom: 16 },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 },
  propTitle: { fontSize: 20, fontWeight: 500, color: '#1a1a1a' },
  propLocation: { fontSize: 13, color: '#888780', marginTop: 3 },
  badgeRow: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888780', marginBottom: 6 },
  progressTrack: { height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 3, marginBottom: 16 },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 16 },
  metric: { background: '#f5f5f3', borderRadius: 8, padding: 12 },
  metricLabel: { fontSize: 11, color: '#888780', marginBottom: 4 },
  metricVal: { fontSize: 16, fontWeight: 500, color: '#1a1a1a' },
  mlRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, paddingTop: 12, borderTop: '0.5px solid rgba(0,0,0,0.08)' },
  mlField: { fontSize: 12 },
  mlLabel: { color: '#b4b2a9', marginBottom: 2 },
  mlVal: { color: '#5F5E5A', fontWeight: 500 },
  headerActions: { display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  btn: { padding: '7px 14px', borderRadius: 8, fontSize: 13, border: '0.5px solid rgba(0,0,0,0.15)', background: 'transparent', color: '#1a1a1a', cursor: 'pointer' },
  btnGreen: { background: '#EAF3DE', color: '#3B6D11', border: '0.5px solid #97C459' },
  sectionTitle: { fontSize: 12, fontWeight: 500, color: '#888780', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 },
  woCard: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  woHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' },
  woMetrics: { display: 'flex', gap: 16, fontSize: 12 },
  woMetricLabel: { color: '#888780' },
  woMetricVal: { fontWeight: 500, color: '#1a1a1a' },
  wrSection: { padding: '0 16px 16px' },
  wrTableHeader: { display: 'grid', gridTemplateColumns: '50px 80px 70px 80px 70px 80px 100px', gap: 8, padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.08)', fontSize: 11, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em' },
  wrRow: { display: 'grid', gridTemplateColumns: '50px 80px 70px 80px 70px 80px 100px', gap: 8, padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)', fontSize: 13, alignItems: 'center' },
};

const badge = (text, type) => {
  const styles = {
    green: { background: '#EAF3DE', color: '#3B6D11' },
    amber: { background: '#FAEEDA', color: '#633806' },
    blue: { background: '#E6F1FB', color: '#0C447C' },
    gray: { background: '#f5f5f3', color: '#5F5E5A' },
    red: { background: '#FCEBEB', color: '#791F1F' },
  };
  return (
    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 500, ...styles[type] }}>
      {text}
    </span>
  );
};

const getImageSrc = (value) => {
  if (!value || typeof value !== 'string') return '';
  const n = value.trim();
  if (n.startsWith('http://') || n.startsWith('https://') || n.startsWith('data:')) return n;
  return `data:image/jpeg;base64,${n}`;
};

const fmt = (val, type = 'currency') => {
  if (val == null) return '—';
  if (type === 'currency') return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  if (type === 'date') return new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return val;
};

const Property = ({ username, authToken }) => {
  const { propert_id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openRow, setOpenRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [activeWorkOrderId, setActiveWorkOrderId] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [openAssignment, setOpenAssignment] = useState(false);
  const [users, setUsers] = useState([]);
  const [assignment, setAssignment] = useState({ assigned_labour_id: '', assigned_driver_id: '' });
  const [assignmentError, setAssignmentError] = useState('');

  useEffect(() => {
    apiFetch(`/api/property/${propert_id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    }).then(({ data }) => {
      if (data.status === 'fail') { navigate('/login'); return; }
      setProperty(data.data);
      setIsLoading(false);
    }).catch(() => navigate('/login'));
  }, [navigate, propert_id, refreshData]);

  useEffect(() => {
    apiFetch('/auth/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}`, 'Content-Type': 'application/json' }
    }).then(({ data }) => setUsers(data.data || [])).catch(console.error);
  }, []);

  const handleApprove = async (recordId, work_done) => {
    try {
      await apiFetch('/api/work_record', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify({ record_id: recordId, is_verified: '1', work_done })
      });
      setRefreshData(r => !r);
    } catch (error) { console.error(error); }
  };

  const handleCreateWorkOrderGroup = async () => {
    if (!assignment.assigned_labour_id && !assignment.assigned_driver_id) {
      setAssignmentError('Please select at least one group.'); return;
    }
    setAssignmentError('');
    const payload = {};
    if (assignment.assigned_labour_id) payload.assigned_labour_id = Number(assignment.assigned_labour_id);
    if (assignment.assigned_driver_id) payload.assigned_driver_id = Number(assignment.assigned_driver_id);
    try {
      const res = await apiFetch(`/api/property/${propert_id}/work_order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify(payload)
      });
      if (res.data.status === 'fail') { setAssignmentError(res.data.message); return; }
      setOpenAssignment(false);
      setAssignment({ assigned_labour_id: '', assigned_driver_id: '' });
      setRefreshData(r => !r);
    } catch (error) { setAssignmentError(error?.data?.message || 'Failed.'); }
  };

  const exportWorkOrdersToPDF = (workOrder, propertyDetails) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Work Order — ${propertyDetails.property_name}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Order ID: ${workOrder.work_order_id}`, 14, 32);
    doc.text(`Assigned: ${fmt(workOrder.assigned_date, 'date')}`, 14, 40);
    doc.text(`Worker: ${workOrder.user_full_name} (${workOrder.user_role})`, 14, 48);
    doc.text(`Total Earnings: ₹${workOrder.total_earnings}`, 120, 32);
    doc.text(`Work Done: ${workOrder.total_work_done} tons`, 120, 40);
    doc.text(`Paid Out: ${workOrder.paid_out || '—'} tons`, 120, 48);
    const rows = (workOrder.work_records || [])
      .filter(r => r.is_verified && r.work_done_tons >= 0)
      .map(r => [r.record_id, r.work_done_tons, fmt(r.created_at, 'date')]);
    doc.autoTable(['Record ID', 'Work Done (tons)', 'Date'], rows, { startY: 56 });
    doc.save(`work_order_${workOrder.work_order_id}.pdf`);
  };

  if (isLoading) return (
    <Layout username={username}>
      <div style={{ padding: 40, color: '#888780', fontSize: 14 }}>Loading property...</div>
    </Layout>
  );

  if (!property || !property[0] || !property[0].property) return (
    <Layout username={username}>
      <div style={{ padding: 40, color: '#888780', fontSize: 14 }}>No property data found.</div>
    </Layout>
  );

  const pd = property[0].property;
  const workOrders = property[0].work_orders.flat();
  const progressPct = pd.estimated_work > 0 ? Math.min(100, Math.round((pd.completed_work / pd.estimated_work) * 100)) : 0;
  const labourUsers = users.filter(u => u.role === 'labour');
  const driverUsers = users.filter(u => u.role === 'driver');

  return (
    <Layout username={username}>
      <div style={s.root}>

        {/* Back */}
        <div style={s.backRow} onClick={() => navigate('/properties')}>
          ← Back to properties
        </div>

        {/* Header card */}
        <div style={s.headerCard}>
          <div style={s.headerTop}>
            <div>
              <div style={s.propTitle}>{pd.property_name}</div>
              <div style={s.propLocation}>{pd.location} · Created {fmt(pd.created_at, 'date')}</div>
            </div>
            <div style={s.badgeRow}>
              {badge(progressPct >= 100 ? 'Completed' : 'Active', progressPct >= 100 ? 'gray' : 'green')}
              {pd.crop_type && badge(pd.crop_type.replace(/_/g, ' '), 'blue')}
              {pd.season && badge(pd.season.charAt(0).toUpperCase() + pd.season.slice(1), 'gray')}
            </div>
          </div>

          {/* Progress */}
          <div>
            <div style={s.progressLabel}>
              <span>Harvest progress</span>
              <span style={{ fontWeight: 500 }}>{pd.completed_work} / {pd.estimated_work} tons ({progressPct}%)</span>
            </div>
            <div style={s.progressTrack}>
              <div style={{ height: 6, borderRadius: 3, background: progressPct >= 100 ? '#4ade80' : progressPct >= 50 ? '#4ade80' : '#FAC775', width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Metrics */}
          <div style={s.metricsGrid}>
            {[
              { label: 'Land area', val: `${pd.land_area_acres} ac` },
              { label: 'Purchase cost', val: fmt(pd.purchase_cost) },
              { label: 'Purchase date', val: fmt(pd.purchase_date, 'date') },
              { label: 'Cost / labour ton', val: fmt(pd.cost_to_labour) },
              { label: 'Cost / driver ton', val: fmt(pd.cost_to_driver) },
              { label: 'Completed work', val: `${pd.completed_work} t`, warn: true },
            ].map((m, i) => (
              <div key={i} style={{ ...s.metric, ...(m.warn ? { background: '#FAEEDA' } : {}) }}>
                <div style={{ ...s.metricLabel, ...(m.warn ? { color: '#633806' } : {}) }}>{m.label}</div>
                <div style={{ ...s.metricVal, ...(m.warn ? { color: '#412402' } : {}) }}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* ML attributes */}
          {(pd.soil_type || pd.irrigation_type || pd.plant_spacing_ft || pd.harvest_count || pd.fertilizer_type || pd.avg_yield_per_acre) && (
            <div style={s.mlRow}>
              {pd.soil_type && <div style={s.mlField}><div style={s.mlLabel}>Soil type <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 20, background: '#EAF3DE', color: '#3B6D11', border: '1px dashed #97C459' }}>ML</span></div><div style={s.mlVal}>{pd.soil_type.replace(/_/g, ' ')}</div></div>}
              {pd.irrigation_type && <div style={s.mlField}><div style={s.mlLabel}>Irrigation</div><div style={s.mlVal}>{pd.irrigation_type.replace(/_/g, ' ')} · {pd.is_irrigated ? 'Irrigated' : 'Not irrigated'}</div></div>}
              {pd.plant_spacing_ft && <div style={s.mlField}><div style={s.mlLabel}>Plant spacing</div><div style={s.mlVal}>{pd.plant_spacing_ft} ft</div></div>}
              {pd.harvest_count != null && <div style={s.mlField}><div style={s.mlLabel}>Harvest count</div><div style={s.mlVal}>{pd.harvest_count} seasons</div></div>}
              {pd.fertilizer_type && <div style={s.mlField}><div style={s.mlLabel}>Fertilizer</div><div style={s.mlVal}>{pd.fertilizer_type.charAt(0).toUpperCase() + pd.fertilizer_type.slice(1)}</div></div>}
              {pd.avg_yield_per_acre && <div style={s.mlField}><div style={s.mlLabel}>Avg yield / acre</div><div style={s.mlVal}>{pd.avg_yield_per_acre} tons</div></div>}
            </div>
          )}

          {/* Actions */}
          <div style={s.headerActions}>
            <button style={{ ...s.btn, ...s.btnGreen }} onClick={() => setOpenAssignment(true)}>+ Assign new group</button>
            <button style={s.btn} onClick={() => navigate('/properties')}>Edit property</button>
          </div>
        </div>

        {/* Work orders */}
        <div style={s.sectionTitle}>Work orders ({workOrders.length})</div>

        {workOrders.map((wo, index) => (
          <div key={wo.work_order_id} style={s.woCard}>

            {/* Work order header */}
            <div style={s.woHeader} onClick={() => setOpenRow(openRow === index ? null : index)}>
              <span style={{ fontSize: 12, color: '#888780', transition: 'transform 0.2s', transform: openRow === index ? 'rotate(180deg)' : 'none' }}>▼</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#888780' }}>#{wo.work_order_id}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>{wo.user_full_name}</span>
                  {badge(wo.user_role, wo.user_role === 'labour' ? 'blue' : 'amber')}
                  {badge(wo.is_completed ? 'Completed' : 'In progress', wo.is_completed ? 'gray' : 'green')}
                </div>
                <div style={{ fontSize: 11, color: '#b4b2a9', marginTop: 2 }}>Assigned {fmt(wo.assigned_date, 'date')}</div>
              </div>
              <div style={s.woMetrics}>
                <div><div style={s.woMetricLabel}>Work done</div><div style={s.woMetricVal}>{wo.total_work_done} t</div></div>
                <div><div style={s.woMetricLabel}>Earnings</div><div style={s.woMetricVal}>₹{wo.total_earnings}</div></div>
                <div><div style={s.woMetricLabel}>Paid out</div><div style={s.woMetricVal}>{wo.paid_out || '—'}</div></div>
              </div>
              <button
                style={{ ...s.btn, fontSize: 11, marginLeft: 8 }}
                onClick={e => { e.stopPropagation(); exportWorkOrdersToPDF(wo, pd); }}
              >
                Export PDF
              </button>
            </div>

            {/* Work records — expanded */}
            {openRow === index && (
              <div style={s.wrSection}>
                <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.08)', marginBottom: 14 }} />
                <div style={{ fontSize: 12, fontWeight: 500, color: '#5F5E5A', marginBottom: 10 }}>Work records</div>

                <div style={s.wrTableHeader}>
                  <div>ID</div><div>Tons</div><div>Verified</div><div>Date</div><div>Proof</div><div>Updated</div><div>Action</div>
                </div>

                {(wo.work_records || []).map(record => (
                  <div key={record.record_id} style={s.wrRow}>
                    <div style={{ color: '#888780' }}>#{record.record_id}</div>
                    <div style={{ fontWeight: 500 }}>{record.work_done_tons}</div>
                    <div>{badge(record.is_verified ? 'Yes' : 'No', record.is_verified ? 'green' : 'amber')}</div>
                    <div style={{ color: '#888780' }}>{fmt(record.created_at, 'date')}</div>
                    <div>
                      {record.proof_of_work_file_path ? (
                        <img
                          src={getImageSrc(record.proof_of_work_file_path)}
                          alt="Proof"
                          style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', border: '0.5px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}
                          onClick={() => { setSelectedImage(getImageSrc(record.proof_of_work_file_path)); setZoomOpen(true); }}
                        />
                      ) : <span style={{ fontSize: 12, color: '#b4b2a9' }}>None</span>}
                    </div>
                    <div style={{ color: '#888780' }}>{fmt(record.update_date, 'date')}</div>
                    <div>
                      <button
                        disabled={record.is_verified}
                        onClick={() => handleApprove(record.record_id, record.work_done_tons)}
                        style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: record.is_verified ? 'default' : 'pointer',
                          border: '0.5px solid', ...(record.is_verified
                            ? { background: '#f5f5f3', color: '#888780', borderColor: 'rgba(0,0,0,0.1)' }
                            : { background: '#EAF3DE', color: '#3B6D11', borderColor: '#97C459' })
                        }}
                      >
                        {record.is_verified ? 'Approved' : 'Approve'}
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    style={{ ...s.btn, ...s.btnGreen, fontSize: 12 }}
                    onClick={() => { setActiveWorkOrderId(wo.work_order_id); setOpen(true); }}
                  >
                    + Add work record
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Image zoom dialog */}
        <Dialog open={zoomOpen} onClose={() => setZoomOpen(false)} maxWidth="lg" fullWidth>
          <DialogContent style={{ background: '#000', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={selectedImage}
                alt="Proof of work"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center', maxWidth: '90vw', maxHeight: '80vh' }}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <button style={s.btn} onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))}>Zoom out</button>
            <button style={s.btn} onClick={() => setZoomLevel(z => z + 0.1)}>Zoom in</button>
            <button style={s.btn} onClick={() => setZoomOpen(false)}>Close</button>
          </DialogActions>
        </Dialog>

        {/* Add work record dialog */}
        <Dialog maxWidth="sm" open={open} onClose={() => { setOpen(false); setRefreshData(r => !r); }}>
          <DialogTitle>New work record</DialogTitle>
          <DialogContent>
            <NewWorkRecord token={authToken} workorderId={activeWorkOrderId} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpen(false); setRefreshData(r => !r); }} color="primary">Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Assign new group dialog */}
        <Dialog maxWidth="sm" open={openAssignment} onClose={() => setOpenAssignment(false)}>
          <DialogTitle>Assign new work order group</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Assign Labour (Optional)</InputLabel>
              <Select name="assigned_labour_id" value={assignment.assigned_labour_id}
                onChange={e => setAssignment(a => ({ ...a, assigned_labour_id: e.target.value }))}>
                {labourUsers.map(u => (
                  <MenuItem key={u.user_id} value={u.user_id.toString()}>
                    {u.full_name} — {u.has_work ? 'Has work' : 'Available'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Assign Driver (Optional)</InputLabel>
              <Select name="assigned_driver_id" value={assignment.assigned_driver_id}
                onChange={e => setAssignment(a => ({ ...a, assigned_driver_id: e.target.value }))}>
                {driverUsers.map(u => (
                  <MenuItem key={u.user_id} value={u.user_id.toString()}>
                    {u.full_name} — {u.has_work ? 'Has work' : 'Available'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {assignmentError && (
              <div style={{ fontSize: 13, color: '#A32D2D', marginTop: 8 }}>{assignmentError}</div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAssignment(false)}>Cancel</Button>
            <Button onClick={handleCreateWorkOrderGroup} variant="contained" color="primary">Create group</Button>
          </DialogActions>
        </Dialog>

      </div>
    </Layout>
  );
};

export default Property;
