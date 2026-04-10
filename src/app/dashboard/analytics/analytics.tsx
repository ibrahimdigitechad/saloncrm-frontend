'use client';
import { useEffect, useState, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Spinner } from '@/components/ui';
import { TrendingUp, DollarSign, Calendar, Users } from 'lucide-react';

const COLORS = ['#1A1A1A','#C8825C','#5C8AC8','#5CC87A','#C85C8A','#8A5CC8'];

const STAT_CARDS = [
  { key: 'bookings',   label: 'Total Bookings',   bg: '#EAF0FF', accent: '#7B9EF0' },
  { key: 'revenue',    label: 'Revenue (OMR)',     bg: '#E8F8EE', accent: '#5EC481' },
  { key: 'completion', label: 'Completion Rate',  bg: '#EDE8FF', accent: '#9B7EE8' },
  { key: 'customers',  label: 'Total Customers',  bg: '#FFF3E8', accent: '#E8A86A' },
];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [bookingChart, setBookingChart] = useState<any[]>([]);
  const [serviceStats, setServiceStats] = useState<any[]>([]);
  const [staffStats, setStaffStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'7' | '30' | '90'>('30');

  const load = useCallback(async () => {
    setLoading(true);
    const from = format(subDays(new Date(), parseInt(range)), 'yyyy-MM-dd');
    const to = format(new Date(), 'yyyy-MM-dd');
    const [ov, bc, svc, stf] = await Promise.all([
      api.get('/analytics/overview'),
      api.get(`/analytics/bookings?from=${from}&to=${to}&granularity=${range === '90' ? 'week' : 'day'}`),
      api.get('/analytics/services'),
      api.get('/analytics/staff'),
    ]);
    setOverview(ov.data.data);
    setBookingChart(bc.data.data.map((r: any) => ({
      date: format(new Date(r.date), 'dd MMM'),
      bookings: r.total, completed: r.completed,
      revenue: parseFloat(r.revenue || 0),
    })));
    setServiceStats(svc.data.data);
    setStaffStats(stf.data.data);
    setLoading(false);
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const totalRevenue = bookingChart.reduce((s, r) => s + r.revenue, 0);
  const totalBookings = bookingChart.reduce((s, r) => s + r.bookings, 0);
  const completionRate = totalBookings > 0 ? Math.round((bookingChart.reduce((s, r) => s + r.completed, 0) / totalBookings) * 100) : 0;

  const statValues: Record<string, string | number> = {
    bookings:   totalBookings,
    revenue:    `${totalRevenue.toFixed(3)}`,
    completion: `${completionRate}%`,
    customers:  overview?.total_customers ?? 0,
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Analytics</h1>
            <p style={{ fontSize: 13, color: '#AAAAAA', margin: '3px 0 0' }}>Last {range} days</p>
          </div>
          <div style={{ display: 'flex', background: '#F5F4F0', borderRadius: 10, padding: 3, gap: 2 }}>
            {(['7','30','90'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: range === r ? '#1A1A1A' : 'transparent', color: range === r ? '#FFF' : '#666', fontSize: 12, fontWeight: range === r ? 600 : 400, transition: 'all 0.12s' }}>
                {r}d
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
              {STAT_CARDS.map(({ key, label, bg, accent }) => (
                <div key={key} style={{ background: bg, borderRadius: 16, padding: '18px 18px 14px', position: 'relative', overflow: 'hidden' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#888', letterSpacing: '0.6px', margin: '0 0 8px', textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ fontSize: 32, fontWeight: 700, color: '#1A1A1A', margin: '0 0 14px', lineHeight: 1 }}>{statValues[key]}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bookings chart */}
            <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EBEBEB', padding: '20px 20px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>Bookings & Revenue Over Time</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={bookingChart} barSize={range === '90' ? 10 : 16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F4F0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#AAAAAA' }} axisLine={false} tickLine={false} interval={range === '30' ? 4 : range === '90' ? 1 : 0} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#AAAAAA' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#AAAAAA' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="bookings" fill="#EAF0FF" radius={[4,4,0,0]} name="Bookings" />
                  <Bar yAxisId="left" dataKey="completed" fill="#7B9EF0" radius={[4,4,0,0]} name="Completed" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#5EC481" strokeWidth={2} dot={false} name="Revenue (OMR)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Services */}
              <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EBEBEB', padding: '20px 20px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>Services by Bookings</p>
                {serviceStats.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#AAAAAA', fontSize: 13, padding: '40px 0' }}>No data yet</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={serviceStats.slice(0, 6)} dataKey="booking_count" nameKey="name" cx="50%" cy="50%" outerRadius={65} paddingAngle={2}>
                          {serviceStats.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {serviceStats.slice(0, 5).map((s, i) => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 9, height: 9, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                            <span style={{ color: '#555' }}>{s.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 12, color: '#888' }}>
                            <span>{s.booking_count} bookings</span>
                            <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{parseFloat(s.revenue).toFixed(3)} OMR</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Staff */}
              <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EBEBEB', padding: '20px 20px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>Staff Performance</p>
                {staffStats.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#AAAAAA', fontSize: 13, padding: '40px 0' }}>No data yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {staffStats.map((s, i) => {
                      const max = staffStats[0]?.booking_count || 1;
                      return (
                        <div key={s.id}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 26, height: 26, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#FFF' }}>{s.name[0]}</div>
                              <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{s.name}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ color: '#888' }}>{s.booking_count} bookings</span>
                              <span style={{ fontWeight: 600, color: '#1A1A1A', marginLeft: 10 }}>{parseFloat(s.revenue).toFixed(3)} OMR</span>
                            </div>
                          </div>
                          <div style={{ width: '100%', height: 6, background: '#F5F4F0', borderRadius: 3 }}>
                            <div style={{ height: '100%', background: COLORS[i % COLORS.length], borderRadius: 3, width: `${(s.booking_count / max) * 100}%`, transition: 'width 0.3s' }} />
                          </div>
                          {s.no_shows > 0 && <p style={{ fontSize: 11, color: '#E05252', margin: '3px 0 0' }}>{s.no_shows} no-show{s.no_shows !== 1 ? 's' : ''}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
