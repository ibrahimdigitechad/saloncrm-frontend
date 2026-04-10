'use client';
import { useEffect, useState, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, StatCard, Spinner } from '@/components/ui';
import { TrendingUp, DollarSign, Calendar, Users } from 'lucide-react';

const COLORS = ['#0B5ED7', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];

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
      date: format(new Date(r.date), range === '90' ? 'dd MMM' : 'dd MMM'),
      bookings: r.total,
      completed: r.completed,
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {(['7','30','90'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 text-sm transition ${range === r ? 'bg-[#0B5ED7] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                {r}d
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total bookings" value={totalBookings} sub={`last ${range} days`} icon={Calendar} color="blue" />
              <StatCard label="Revenue" value={`${totalRevenue.toFixed(3)} OMR`} sub="completed only" icon={DollarSign} color="green" />
              <StatCard label="Completion rate" value={`${completionRate}%`} sub="of all bookings" icon={TrendingUp} color="purple" />
              <StatCard label="Total customers" value={overview?.total_customers ?? 0} sub="across all time" icon={Users} color="amber" />
            </div>

            {/* Bookings over time */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Bookings & revenue over time</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={bookingChart} barSize={range === '90' ? 12 : 20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={range === '30' ? 4 : range === '90' ? 1 : 0} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="bookings" fill="#dbeafe" radius={[3, 3, 0, 0]} name="Bookings" />
                  <Bar yAxisId="left" dataKey="completed" fill="#0B5ED7" radius={[3, 3, 0, 0]} name="Completed" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} dot={false} name="Revenue (OMR)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Services breakdown */}
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-4">Services by bookings</h2>
                {serviceStats.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">No data yet</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={serviceStats.slice(0, 6)} dataKey="booking_count" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={2}>
                          {serviceStats.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {serviceStats.slice(0, 6).map((s, i) => (
                        <div key={s.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="text-slate-700">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-500">
                            <span>{s.booking_count} bookings</span>
                            <span className="font-medium text-slate-700">{parseFloat(s.revenue).toFixed(3)} OMR</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>

              {/* Staff performance */}
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-4">Staff performance</h2>
                {staffStats.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {staffStats.map((s, i) => {
                      const max = staffStats[0]?.booking_count || 1;
                      return (
                        <div key={s.id}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-[#0B5ED7]">{s.name[0]}</div>
                              <span className="text-slate-700 font-medium">{s.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500 text-xs">{s.booking_count} bookings</span>
                              <span className="text-slate-700 font-medium ml-3">{parseFloat(s.revenue).toFixed(3)} OMR</span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full">
                            <div className="h-full bg-[#0B5ED7] rounded-full" style={{ width: `${(s.booking_count / max) * 100}%` }} />
                          </div>
                          {s.no_shows > 0 && <p className="text-xs text-red-400 mt-0.5">{s.no_shows} no-show{s.no_shows !== 1 ? 's' : ''}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
