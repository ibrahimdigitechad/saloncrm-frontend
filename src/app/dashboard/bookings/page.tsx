'use client';
import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Modal, Input, Select, Textarea, Badge, Card, Spinner } from '@/components/ui';

const FullCalendar = dynamic(() => import('@fullcalendar/react').then(m => m.default), { ssr: false, loading: () => <div className="h-96 flex items-center justify-center"><Spinner size="lg" /></div> });

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [saving, setSaving] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [form, setForm] = useState({
    customer_id: '', staff_id: '', service_id: '', start_time: '', notes: '',
  });

  const load = useCallback(async () => {
    const [bookRes, custRes, staffRes, svcRes] = await Promise.all([
      api.get('/bookings?limit=200'),
      api.get('/customers?limit=100'),
      api.get('/staff'),
      api.get('/services'),
    ]);
    setBookings(bookRes.data.data);
    setCustomers(custRes.data.data);
    setStaff(staffRes.data.data);
    setServices(svcRes.data.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Fetch slots when staff + service + date are all set
  useEffect(() => {
    if (!form.staff_id || !form.service_id || !form.start_time) return;
    const dateOnly = form.start_time.slice(0, 10);
    api.get(`/bookings/availability?staff_id=${form.staff_id}&service_id=${form.service_id}&date=${dateOnly}`)
      .then(r => setAvailableSlots(r.data.data))
      .catch(() => setAvailableSlots([]));
  }, [form.staff_id, form.service_id, form.start_time?.slice(0, 10)]);

  async function createBooking() {
    if (!form.customer_id || !form.staff_id || !form.service_id || !form.start_time) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      await api.post('/bookings', { ...form, start_time: form.start_time });
      toast.success('Booking created!');
      setShowModal(false);
      setForm({ customer_id: '', staff_id: '', service_id: '', start_time: '', notes: '' });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to create booking');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api.put(`/bookings/${id}`, { status });
      toast.success(`Booking marked as ${status}`);
      setShowDetail(false);
      load();
    } catch { toast.error('Update failed'); }
  }

  const calendarEvents = bookings.map(b => ({
    id: b.id,
    title: `${b.customer_name} · ${b.service_name}`,
    start: b.start_time,
    end: b.end_time,
    backgroundColor: b.service_color || '#0B5ED7',
    borderColor: 'transparent',
    extendedProps: b,
  }));

  const staffForService = form.service_id
    ? staff.filter(s => !form.service_id || s.services?.some((sv: any) => sv.id === form.service_id))
    : staff;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Bookings</h1>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {(['calendar', 'list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-sm capitalize transition ${view === v ? 'bg-[#0B5ED7] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>{v}</button>
              ))}
            </div>
            <Button size="sm" onClick={load} variant="secondary"><RefreshCw size={13} /></Button>
            <Button size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> New booking</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : view === 'calendar' ? (
          <Card className="p-4">
            <FullCalendar
              plugins={[
                require('@fullcalendar/daygrid').default,
                require('@fullcalendar/timegrid').default,
                require('@fullcalendar/interaction').default,
              ]}
              initialView="timeGridWeek"
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
              events={calendarEvents}
              height="auto"
              eventClick={({ event }) => { setSelected(event.extendedProps); setShowDetail(true); }}
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                {['Customer','Service','Staff','Date & Time','Status',''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => { setSelected(b); setShowDetail(true); }}>
                    <td className="px-4 py-3 font-medium text-slate-800">{b.customer_name}</td>
                    <td className="px-4 py-3 text-slate-600">{b.service_name}</td>
                    <td className="px-4 py-3 text-slate-600">{b.staff_name}</td>
                    <td className="px-4 py-3 text-slate-600">{format(new Date(b.start_time), 'dd MMM · HH:mm')}</td>
                    <td className="px-4 py-3"><Badge label={b.status} /></td>
                    <td className="px-4 py-3 text-right"><button className="text-xs text-[#0B5ED7] hover:underline">View</button></td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No bookings found</td></tr>}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* New Booking Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New booking" size="lg">
        <div className="space-y-4">
          <Select label="Customer *" value={form.customer_id} onChange={e => setForm(p => ({ ...p, customer_id: e.target.value }))}
            options={[{ value: '', label: 'Select customer...' }, ...customers.map(c => ({ value: c.id, label: `${c.name} — ${c.phone}` }))]} />
          <Select label="Service *" value={form.service_id} onChange={e => setForm(p => ({ ...p, service_id: e.target.value, staff_id: '' }))}
            options={[{ value: '', label: 'Select service...' }, ...services.map(s => ({ value: s.id, label: `${s.name} (${s.duration_minutes} min)` }))]} />
          <Select label="Staff member *" value={form.staff_id} onChange={e => setForm(p => ({ ...p, staff_id: e.target.value }))}
            options={[{ value: '', label: 'Select staff...' }, ...staffForService.map(s => ({ value: s.id, label: s.name }))]} />
          <Input label="Date *" type="date" value={form.start_time?.slice(0, 10)} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />

          {availableSlots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Available slots</label>
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map(slot => (
                  <button key={slot} onClick={() => setForm(p => ({ ...p, start_time: slot }))}
                    className={`py-1.5 text-xs rounded-lg border transition ${form.start_time === slot ? 'bg-[#0B5ED7] text-white border-[#0B5ED7]' : 'border-slate-200 hover:border-[#0B5ED7] hover:text-[#0B5ED7]'}`}>
                    {format(new Date(slot), 'HH:mm')}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Textarea label="Notes (optional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Any special requests..." />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={createBooking}>Create booking</Button>
          </div>
        </div>
      </Modal>

      {/* Booking detail modal */}
      {selected && (
        <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Booking details">
          <div className="space-y-3 text-sm">
            <Row label="Customer" value={selected.customer_name} />
            <Row label="Phone" value={selected.customer_phone} />
            <Row label="Service" value={selected.service_name} />
            <Row label="Staff" value={selected.staff_name} />
            <Row label="Time" value={`${format(new Date(selected.start_time), 'EEEE d MMM · HH:mm')} — ${format(new Date(selected.end_time), 'HH:mm')}`} />
            <Row label="Status" value={<Badge label={selected.status} />} />
            {selected.notes && <Row label="Notes" value={selected.notes} />}
            {selected.price && <Row label="Price" value={`${parseFloat(selected.price).toFixed(3)} OMR`} />}
          </div>
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
            {selected.status === 'pending' && <Button size="sm" onClick={() => updateStatus(selected.id, 'confirmed')}>Confirm</Button>}
            {['pending','confirmed'].includes(selected.status) && <Button size="sm" variant="secondary" onClick={() => updateStatus(selected.id, 'completed')}>Complete</Button>}
            {['pending','confirmed'].includes(selected.status) && <Button size="sm" variant="danger" onClick={() => updateStatus(selected.id, 'cancelled')}>Cancel</Button>}
            {selected.status === 'confirmed' && <Button size="sm" variant="secondary" onClick={() => updateStatus(selected.id, 'no-show')}>No-show</Button>}
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex gap-3">
      <span className="text-slate-400 min-w-[80px]">{label}</span>
      <span className="text-slate-800 font-medium flex-1">{value}</span>
    </div>
  );
}
