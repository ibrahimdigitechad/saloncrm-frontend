'use client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Spinner } from '@/components/ui';

const STAT_CARDS = [
  { key: 'total_customers', label: 'Total Clients',   bg: '#FFF3E8', accent: '#E8A86A', DecorIcon: DecoClients },
  { key: 'bookings_today',  label: 'Appointments',    bg: '#EAF0FF', accent: '#7B9EF0', DecorIcon: DecoAppt },
  { key: 'total_staff',     label: 'Staff Members',   bg: '#EDE8FF', accent: '#9B7EE8', DecorIcon: DecoStaff },
  { key: 'revenue_month',   label: 'Revenue (OMR)',   bg: '#E8F8EE', accent: '#5EC481', DecorIcon: DecoRevenue, isRevenue: true },
];

const TABS = ['Upcoming', 'All Bookings', 'Cancelled'];
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: '#E8F8EE', color: '#2E8B57' },
  pending:   { bg: '#FFF8E0', color: '#A07800' },
  cancelled: { bg: '#FEECEC', color: '#C84444' },
  completed: { bg: '#E8F0FF', color: '#3355CC' },
  'no-show': { bg: '#FFF0E8', color: '#C86400' },
};
const AVATAR_COLORS = ['#C8825C','#5C8AC8','#5CC87A','#C85C8A','#8A5CC8','#C8B55C'];

function initials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
function avatarBg(name?: string) {
  if (!name) return '#AAAAAA';
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  const today = format(new Date(), 'EEEE, d MMMM yyyy');

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview').catch(() => ({ data: { data: {} } })),
      api.get('/bookings?limit=20').catch(() => ({ data: { data: [] } })),
    ]).then(([overview, booksRes]) => {
      setData(overview?.data?.data || {});
      const list = booksRes?.data?.data || booksRes?.data || [];
      setBookings(Array.isArray(list) ? list : []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.customer_name?.toLowerCase().includes(q) || b.service_name?.toLowerCase().includes(q);
    if (tab === 0) return matchSearch && b.status !== 'cancelled';
    if (tab === 2) return matchSearch && b.status === 'cancelled';
    return matchSearch;
  });

  return (
    <DashboardLayout>
      {/* Page header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
          Good {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p style={{ fontSize: 13, color: '#AAAAAA', margin: '3px 0 0' }}>{today}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {STAT_CARDS.map(({ key, label, bg, accent, DecorIcon, isRevenue }) => {
          const raw = data?.[key] ?? 0;
          const display = isRevenue ? Number(raw).toFixed(3) : raw;
          return (
            <div key={key} style={{ background: bg, borderRadius: 16, padding: '18px 18px 14px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: 10, top: 10, opacity: 0.15, pointerEvents: 'none' }}>
                <DecorIcon color={accent} />
              </div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#888', letterSpacing: '0.6px', margin: '0 0 8px', textTransform: 'uppercase' }}>{label}</p>
              <p style={{ fontSize: 34, fontWeight: 700, color: '#1A1A1A', margin: '0 0 14px', lineHeight: 1 }}>
                {loading ? '—' : display}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>{label}</span>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bookings table */}
      <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EBEBEB', overflow: 'hidden' }}>
        {/* Tabs + search */}
        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                padding: '7px 14px', fontSize: 13,
                fontWeight: tab === i ? 700 : 400,
                color: tab === i ? '#1A1A1A' : '#AAAAAA',
                borderBottom: tab === i ? '2px solid #1A1A1A' : '2px solid transparent',
                transition: 'all 0.12s',
              }}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: '#F5F4F0', borderRadius: 9, padding: '0 11px', gap: 8, height: 34 }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#AAAAAA" strokeWidth="1.4"/><path d="M11 11L14.5 14.5" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#333', width: 160, fontFamily: 'inherit' }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
                {['Client', 'Service', 'Staff', 'Date', 'Time', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#BBBBBB', letterSpacing: '0.5px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center' }}><Spinner /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#AAAAAA', fontSize: 13 }}>No bookings found</td></tr>
              ) : (
                filtered.map((b: any, i: number) => {
                  const s = STATUS_COLORS[b.status?.toLowerCase()] || { bg: '#F0F0F0', color: '#888' };
                  const startDate = b.start_time ? new Date(b.start_time) : null;
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #F7F7F7', background: i % 2 === 0 ? '#FFF' : '#FAFAFA' }}>
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarBg(b.customer_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#FFF', flexShrink: 0 }}>
                            {initials(b.customer_name)}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: '#1A1A1A' }}>{b.customer_name || '—'}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA' }}>{b.customer_email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 18px', color: '#555' }}>{b.service_name || '—'}</td>
                      <td style={{ padding: '12px 18px', color: '#555' }}>{b.staff_name || '—'}</td>
                      <td style={{ padding: '12px 18px', color: '#555' }}>{startDate ? format(startDate, 'dd MMM yyyy') : '—'}</td>
                      <td style={{ padding: '12px 18px', color: '#555' }}>{startDate ? format(startDate, 'HH:mm') : '—'}</td>
                      <td style={{ padding: '12px 18px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                          {b.status || 'Unknown'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        <Link href={`/dashboard/bookings`}>
                          <button style={{ width: 30, height: 30, borderRadius: 8, background: '#1A1A1A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" stroke="#FFF" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F0F0F0' }}>
          <span style={{ fontSize: 12, color: '#AAAAAA' }}>{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</span>
          <Link href="/dashboard/bookings" style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 600, textDecoration: 'none' }}>
            View all bookings →
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

/* ── Decorative stat icons ── */
function DecoClients({ color }: { color: string }) {
  return <svg width="60" height="60" viewBox="0 0 48 48" fill="none"><circle cx="18" cy="18" r="9" fill={color}/><circle cx="33" cy="14" r="6" fill={color} opacity="0.5"/><path d="M3 42c0-8.284 6.716-15 15-15s15 6.716 15 15" fill={color}/></svg>;
}
function DecoAppt({ color }: { color: string }) {
  return <svg width="60" height="60" viewBox="0 0 48 48" fill="none"><rect x="5" y="9" width="38" height="32" rx="6" fill={color} opacity="0.25"/><rect x="5" y="9" width="38" height="13" rx="6" fill={color}/><rect x="12" y="27" width="9" height="9" rx="2" fill={color}/><rect x="27" y="27" width="9" height="9" rx="2" fill={color} opacity="0.5"/></svg>;
}
function DecoStaff({ color }: { color: string }) {
  return <svg width="60" height="60" viewBox="0 0 48 48" fill="none"><path d="M9 9L24 3L39 9V28C39 37 24 45 24 45C24 45 9 37 9 28V9Z" fill={color} opacity="0.35"/><path d="M16 12L24 7L32 12V24C32 31 24 37 24 37C24 37 16 31 16 24V12Z" fill={color}/></svg>;
}
function DecoRevenue({ color }: { color: string }) {
  return <svg width="60" height="60" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="19" fill={color} opacity="0.15"/><circle cx="24" cy="24" r="13" fill={color} opacity="0.3"/><path d="M24 13v22M19 18h7a3 3 0 010 6h-5a3 3 0 000 6h7" stroke={color} strokeWidth="2.5" strokeLinecap="round"/></svg>;
}
