import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiClient';

const AdminDashboard = ({ username, authToken, handleAfterLogin }) => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentTrucks, setRecentTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof handleAfterLogin === 'function') handleAfterLogin(true);
  }, [handleAfterLogin]);

  useEffect(() => {
    const token = authToken || localStorage.getItem('authToken');
    if (!token) return;
    apiFetch('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setMetrics(res.data.metrics);
      setRecentProperties(res.data.recent_properties);
      setRecentTrucks(res.data.recent_trucks);
    }).catch(err => console.error('Dashboard fetch failed', err))
      .finally(() => setLoading(false));
  }, [authToken]);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const metricCards = metrics ? [
    { label: 'Active properties', value: metrics.active_properties, sub: `${metrics.total_acres} total acres`, style: {} },
    { label: 'Tons harvested', value: metrics.total_tons_harvested, sub: 'This season', style: {} },
    { label: 'Trucks dispatched', value: metrics.trucks_dispatched, sub: `${metrics.trucks_pending_verification} pending verification`, style: { border: '0.5px solid #97C459', background: '#EAF3DE' }, labelColor: '#3B6D11', valColor: '#27500A' },
    { label: 'Active workers', value: metrics.active_workers, sub: 'Labour & drivers assigned', style: {} },
  ] : [];

  return (
    <Layout username={username}>
      <div style={{ background: '#f5f5f3', minHeight: '100vh', padding: '24px' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>
            Good morning, {username}
          </h1>
          <p style={{ fontSize: 13, color: '#888780', marginTop: 4 }}>{today}</p>
        </div>

        {loading ? (
          <p style={{ color: '#888780', fontSize: 13 }}>Loading dashboard...</p>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12, marginBottom: 24
            }}>
              {metricCards.map((card, i) => (
                <div key={i} style={{
                  background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
                  borderRadius: 12, padding: 16, ...card.style
                }}>
                  <div style={{ fontSize: 12, color: card.labelColor || '#888780', marginBottom: 8 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 500, color: card.valColor || '#1a1a1a' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: 11, color: '#b4b2a9', marginTop: 4 }}>{card.sub}</div>
                </div>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16, marginBottom: 24
            }}>
              <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Active properties</span>
                  <span style={{ fontSize: 12, color: '#3B6D11', cursor: 'pointer' }}
                    onClick={() => navigate('/properties')}>View all →</span>
                </div>
                {recentProperties.map(p => (
                  <div key={p.property_id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.progress_pct > 50 ? '#4ade80' : '#FAC775', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.property_name}
                      </div>
                      <div style={{ fontSize: 11, color: '#888780' }}>
                        {p.land_area_acres} ac · {p.location}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, padding: '3px 8px', borderRadius: 20,
                      background: p.progress_pct > 50 ? '#EAF3DE' : '#FAEEDA',
                      color: p.progress_pct > 50 ? '#3B6D11' : '#633806'
                    }}>
                      {p.progress_pct}% done
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Recent trucks</span>
                  <span style={{ fontSize: 12, color: '#3B6D11', cursor: 'pointer' }}
                    onClick={() => navigate('/outbound')}>View all →</span>
                </div>
                {recentTrucks.map(t => (
                  <div key={t.outbound_id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)', fontSize: 13
                  }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{t.truck_number}</div>
                      <div style={{ fontSize: 11, color: '#888780' }}>{t.truck_date} · {t.weight_in_tons}t</div>
                    </div>
                    <span style={{
                      fontSize: 11, padding: '3px 8px', borderRadius: 20,
                      background: t.is_verified ? '#EAF3DE' : '#FAEEDA',
                      color: t.is_verified ? '#3B6D11' : '#633806'
                    }}>
                      {t.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#888780', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Quick actions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                {[
                  { label: 'New property', path: '/new-property', bg: '#EAF3DE', color: '#3B6D11' },
                  { label: 'New outbound', path: '/outbound', bg: '#E6F1FB', color: '#185FA5' },
                  { label: 'Add worker', path: '/usermanagement', bg: '#FAEEDA', color: '#854F0B' },
                ].map((a, i) => (
                  <div key={i} onClick={() => navigate(a.path)} style={{
                    background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
                    borderRadius: 8, padding: 14, textAlign: 'center', cursor: 'pointer'
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: a.bg, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 14, color: a.color }}>+</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#888780' }}>{a.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
