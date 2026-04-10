'use client';
import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://saloncrm-backend-production.up.railway.app';

interface Stats {
  totalBookings: number;
  totalCustomers: number;
  totalRevenue: number;
  totalStaff: number;
}

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  staffName: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
}

const statCards = [
  { key: 'totalCustomers', label: 'Total Clients', color: '#FFF3E8', iconColor: '#E8A86A', Icon: ClientsIcon },
  { key: 'totalBookings', label: 'Appointments', color: '#EAF0FF', iconColor: '#7B9EF0', Icon: ApptIcon },
  { key: 'totalStaff', label: 'Staff Members', color: '#EDE8FF', iconColor: '#9B7EE8', Icon: StaffIcon },
  { key: 'totalRevenue', label: 'Revenue (OMR)', color: '#E8F8EE', iconColor: '#5EC481', Icon: RevenueIcon, isRevenue: true },
];

const tabs = ['Upcoming Books', 'All Books', 'Cancelled'];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalBookings: 0, totalCustomers: 0, totalRevenue: 0, totalStaff: 0 });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchBooking, setSearchBooking] = useState('');

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    Promise.all([
      fetch(`${API_BASE}/api/dashboard/stats`, { headers }).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE}/api/bookings?limit=10`, { headers }).then(r => r.json()).catch(() => []),
    ]).then(([statsData, bookingsData]) => {
      if (statsData) setStats(statsData);
      if (Array.isArray(bookingsData)) setBookings(bookingsData);
      else if (bookingsData?.data) setBookings(bookingsData.data);
      setLoading(false);
    });
  }, []);

  const filtered = bookings.filter(b => {
    const matchSearch = searchBooking === '' ||
      b.customerName?.toLowerCase().includes(searchBooking.toLowerCase()) ||
      b.serviceName?.toLowerCase().includes(searchBooking.toLowerCase());
    if (activeTab === 0) return matchSearch && b.status === 'confirmed';
    if (activeTab === 2) return matchSearch && b.status === 'cancelled';
    return matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#AAAAAA', margin: '4px 0 0' }}>{today}</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map(({ key, label, color, iconColor, Icon, isRevenue }) => {
          const val = stats[key as keyof Stats];
          const display = isRevenue ? `${Number(val).toFixed(3)}` : val;
          return (
            <div key={key} style={{
              background: color, borderRadius: 16, padding: '20px 20px 16px',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Decorative icon */}
              <div style={{ position: 'absolute', right: 12, top: 12, opacity: 0.18 }}>
                <Icon size={56} color={iconColor} />
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '0.6px', margin: '0 0 8px', textTransform: 'uppercase' }}>
                {label}
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px', lineHeight: 1 }}>
                {loading ? '—' : display}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={12} color="#666" />
                  </div>
                  <span style={{ fontSize: 11, color: '#666', fontWeight: 500 }}>{label}</span>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: iconColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5h6M5 2l3 3-3 3" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bookings Table */}
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #EBEBEB', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {tabs.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 16px', fontSize: 13, fontWeight: activeTab === i ? 700 : 400,
                color: activeTab === i ? '#1A1A1A' : '#AAAAAA',
                borderBottom: activeTab === i ? '2px solid #1A1A1A' : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
                {tab}
              </button>
            ))}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', background: '#F5F4F0',
            borderRadius: 10, padding: '0 12px', gap: 8, height: 36,
          }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#AAAAAA" strokeWidth="1.5" />
              <path d="M11 11L14.5 14.5" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={searchBooking}
              onChange={e => setSearchBooking(e.target.value)}
              placeholder="Search..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#333', width: 160 }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
                {['Staff / Client', 'Service', 'Start Date', 'Session', 'End Date', 'Status', 'Manage'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left', fontSize: 11,
                    fontWeight: 600, color: '#AAAAAA', letterSpacing: '0.4px', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#AAAAAA', fontSize: 13 }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#AAAAAA', fontSize: 13 }}>No bookings found</td></tr>
              ) : (
                filtered.map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #F7F7F7', background: i % 2 === 0 ? '#FFF' : '#FAFAFA' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: avatarColor(b.customerName),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 600, color: '#FFF', flexShrink: 0,
                        }}>
                          {initials(b.customerName)}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: '#1A1A1A', fontSize: 13 }}>{b.customerName || '—'}</p>
                          <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA' }}>{b.customerEmail || b.staffName || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#555' }}>{b.serviceName || '—'}</td>
                    <td style={{ padding: '14px 20px', color: '#555' }}>{formatDate(b.startTime)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: 8,
                        border: '1px solid #E8E8E8', fontSize: 12, fontWeight: 600, color: '#555',
                      }}>
                        {sessionNum(b.startTime)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#555' }}>{formatDate(b.endTime)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={b.status} />
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button style={{
                        width: 30, height: 30, borderRadius: 8, background: '#1A1A1A',
                        border: 'none', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" stroke="#FFF" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          padding: '16px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 6, borderTop: '1px solid #F0F0F0',
        }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} style={{
              width: 32, height: 32, borderRadius: 8,
              background: n === 1 ? '#1A1A1A' : 'transparent',
              color: n === 1 ? '#FFF' : '#555',
              border: n === 1 ? 'none' : '1px solid #E8E8E8',
              fontSize: 13, fontWeight: n === 1 ? 600 : 400, cursor: 'pointer',
            }}>{n}</button>
          ))}
          <span style={{ color: '#AAAAAA', fontSize: 13, marginLeft: 8 }}>10 / Page</span>
        </div>
      </div>
    </div>
  );
}

// ---- Helpers ----
function initials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = ['#C8825C', '#5C8AC8', '#5CC87A', '#C85C8A', '#8A5CC8', '#C8B55C'];
function avatarColor(name?: string) {
  if (!name) return '#AAAAAA';
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch { return '—'; }
}

function sessionNum(dateStr?: string) {
  if (!dateStr) return '01';
  const d = new Date(dateStr);
  return String(d.getDate()).padStart(2, '0');
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    confirmed:  { bg: '#E8F8EE', color: '#2E8B57', label: 'Confirmed' },
    pending:    { bg: '#FFF8E0', color: '#A07800', label: 'Pending' },
    cancelled:  { bg: '#FEECEC', color: '#C84444', label: 'Cancelled' },
    completed:  { bg: '#E8F0FF', color: '#3355CC', label: 'Completed' },
  };
  const s = map[status?.toLowerCase()] || { bg: '#F0F0F0', color: '#888', label: status || 'Unknown' };
  return (
    <span style={{
      display: 'inline-block', padding: '4px 10px', borderRadius: 6,
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 600,
    }}>{s.label}</span>
  );
}

// ---- Decorative stat icons ----
function ClientsIcon({ size = 24, color = '#E8A86A' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="18" cy="18" r="8" fill={color} />
      <circle cx="32" cy="14" r="6" fill={color} opacity="0.6" />
      <path d="M4 40c0-7.732 6.268-14 14-14s14 6.268 14 14" fill={color} />
    </svg>
  );
}
function ApptIcon({ size = 24, color = '#7B9EF0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="10" width="36" height="32" rx="6" fill={color} opacity="0.3" />
      <rect x="6" y="10" width="36" height="12" rx="6" fill={color} />
      <rect x="14" y="26" width="8" height="8" rx="2" fill={color} />
      <rect x="26" y="26" width="8" height="8" rx="2" fill={color} opacity="0.6" />
    </svg>
  );
}
function StaffIcon({ size = 24, color = '#9B7EE8' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M10 10L22 4L34 10V26C34 34 22 42 22 42C22 42 10 34 10 26V10Z" fill={color} opacity="0.4" />
      <path d="M16 10L22 6L28 10V22C28 28 22 34 22 34C22 34 16 28 16 22V10Z" fill={color} />
    </svg>
  );
}
function RevenueIcon({ size = 24, color = '#5EC481' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" fill={color} opacity="0.2" />
      <circle cx="24" cy="24" r="12" fill={color} opacity="0.4" />
      <path d="M24 14v20M20 18h6a2 2 0 010 4h-4a2 2 0 000 4h6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}