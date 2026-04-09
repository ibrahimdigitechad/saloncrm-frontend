'use client';
import { useEffect, useState } from 'react';
import { Calendar, Users, DollarSign, TrendingUp, Clock, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard, Card, Badge, Spinner, Button } from '@/components/ui';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [chart, setChart] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/analytics/bookings?granularity=day'),
      api.get(`/bookings?date=${format(new Date(), 'yyyy-MM-dd')}&limit=10`),
    ]).then(([overview, bookingChart, todayBookings]) => {
      setData(overview.data.data);
      setChart(bookingChart.data.data.slice(-14).map((r: any) => ({
        date: format(new Date(r.date), 'dd MMM'),
        bookings: r.total,
        revenue: parseFloat(r.revenue || 0),
      })));
      setUpcoming(todayBookings.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-sm text-slate-500 mt-0.5">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
          </div>
          <Link href="/dashboard/bookings">
            <Button size="sm"><Plus size={14} /> New booking</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Bookings today" value={data?.bookings_today ?? 0} icon={Calendar} color="blue" />
          <StatCard label="Total customers" value={data?.total_customers ?? 0} icon={Users} color="green" />
          <StatCard label="Revenue this month" value={`${data?.revenue_this_month?.toFixed(3) ?? '0.000'} OMR`} icon={DollarSign} color="purple" />
          <StatCard label="This week" value={data?.bookings_week?.reduce((s: number, r: any) => s + r.count, 0) ?? 0} sub="bookings" icon={TrendingUp} color="amber" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Bookings — last 14 days</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chart} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="bookings" fill="#0B5ED7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Status breakdown */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Status (last 30d)</h2>
            <div className="space-y-3">
              {(data?.status_breakdown || []).map((s: any) => (
                <div key={s.status} className="flex items-center justify-between">
                  <Badge label={s.status} />
                  <span className="text-sm font-medium text-slate-700">{s.count}</span>
                </div>
              ))}
              {!data?.status_breakdown?.length && <p className="text-sm text-slate-400">No data yet</p>}
            </div>
          </Card>
        </div>

        {/* Today's bookings */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Clock size={15} className="text-slate-400" /> Today's bookings</h2>
            <Link href="/dashboard/bookings" className="text-xs text-[#0B5ED7] hover:underline">View all</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="px-5 py-10 text-center"><p className="text-sm text-slate-400">No bookings today</p></div>
          ) : (
            <div className="divide-y divide-slate-50">
              {upcoming.map((b: any) => (
                <div key={b.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: b.service_color || '#0B5ED7' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{b.customer_name}</p>
                    <p className="text-xs text-slate-400">{b.service_name} · {b.staff_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{format(new Date(b.start_time), 'HH:mm')}</p>
                    <Badge label={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
