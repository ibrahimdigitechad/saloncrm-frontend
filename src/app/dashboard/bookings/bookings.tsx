'use client';
import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Plus, RefreshCw, Calendar, List } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Modal, Input, Select, Textarea, Badge, Card, Spinner } from '@/components/ui';

const FullCalendar = dynamic(() => import('@fullcalendar/react').then(m => m.default), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center"><Spinner size="lg" /></div>,
});

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: '#E8F8EE', color: '#2E8B57' },
  pending:   { bg: '#FFF8E0', color: '#A07800' },
  cancelled: { bg: '#FEECEC', color: '#C84444' },
  completed: { bg: '#E8F0FF', color: '#3355CC' },
  'no-show': { bg: '#FFF0E8', color: '#C86400' },
};

const AVATAR_COLORS = ['#C8825C','#5C8AC8','#5CC87A','#C85C8A','#8A5CC8','#C8B55C'];
function avatarBg(name?: string) {
  if (!name) return '#AAA';
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}
function initials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [saving, setSaving] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [form, setForm] = useState({ customer_id: '', staff_id: '', service_id: '', start_time: '', notes: '' });

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

  useEffect(() => {
    if (!form.staff_id || !form.service_id || !form.start_time) return;
    const dateOnly = form.start_time.slice(0, 10);
    api.get(`/bookings/availability?staff_id=${form.staff_id}&service_id=${form.service_id}&date=${dateOnly}`)
      .then(r => setAvailableSlots(r.data.data))
      .catch(() => setAvailableSlots([]));
  }, [form.staff_id, form.service_id, form.start_time?.slice(0, 10)]);

  async function createBooking() {
    if (!form.customer_id || !form.staff_id || !form.service_id || !form.start_time) {
      toast.error('Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      await api.post('/bookings', form);
      toast.success('Booking created!');
      setShowModal(false);
      setForm({ customer_id: '', staff_id: '', service_id: '', start_time: '', notes: '' });
      load();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Failed to create booking'); }
    finally { setSaving(false); }
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
    backgroundColor: b.service_color || '#1A1A1A',
    borderColor: 'transparent',
    extendedProps: b,
  }));

  const staffForService = form.service_id
    ? staff.filter(s => s.services?.some((sv: any) => sv.id === form.service_id))
    : staff;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Bookings</h1>
            <p style={{ fontSize: 13, color: '#AAAAAA', margin: '3px 0 0' }}>{bookings.length} total bookings</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* View toggle */}
            <div style={{ display: 'flex', background: '#F5F4F0', borderRadius: 10, padding: 3, gap: 2 }}>
              {(['list', 'calendar'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: view === v ? '#1A1A1A' : 'transparent',
                  color: view === v ? '#FFF' : '#666', fontSize: 12, fontWeight: view === v ? 600 : 400,
                  transition: 'all 0.12s',
                }}>
                  {v === 'list' ? <List size={13} /> : <Calendar size={13} />}
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={load} style={{ width: 34, height: 34, borderRadius: 9, background: '#F5F4F0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={14} color="#666" />
            </button>
            <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#1A1A1A', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
              <Plus size={14} /> New Booking
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size="lg" /></div>
        ) : view === 'calendar' ? (
          <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EBEBEB', padding: 20 }}>
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
              // @ts-ignore
              dateClick={({ dateStr }) => { setForm(p => ({ ...p, start_time: dateStr })); setShowModal(true); }}
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              nowIndicator
            />
          </div>
        ) : (
          <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EBEBEB', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
                    {['Client', 'Service', 'Staff', 'Date & Time', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#BBBBBB', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 60, textAlign: 'center', color: '#AAAAAA', fontSize: 13 }}>No bookings yet</td></tr>
                  ) : (
                    bookings.map((b, i) => {
                      const s = STATUS_COLORS[b.status?.toLowerCase()] || { bg: '#F0F0F0', color: '#888' };
                      return (
                        <tr key={b.id} style={{ borderBottom: '1px solid #F7F7F7', background: i % 2 === 0 ? '#FFF' : '#FAFAFA', cursor: 'pointer' }}
                          onClick={() => { setSelected(b); setShowDetail(true); }}>
                          <td style={{ padding: '12px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarBg(b.customer_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#FFF', flexShrink: 0 }}>
                                {initials(b.customer_name)}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 600, color: '#1A1A1A' }}>{b.customer_name}</p>
                                <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA' }}>{b.customer_phone || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 18px', color: '#555' }}>{b.service_name}</td>
                          <td style={{ padding: '12px 18px', color: '#555' }}>{b.staff_name}</td>
                          <td style={{ padding: '12px 18px', color: '#555' }}>{format(new Date(b.start_time), 'dd MMM · HH:mm')}</td>
                          <td style={{ padding: '12px 18px' }}>
                            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                              {b.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 18px' }}>
                            <button style={{ width: 30, height: 30, borderRadius: 8, background: '#1A1A1A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={e => { e.stopPropagation(); setSelected(b); setShowDetail(true); }}>
                              <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" stroke="#FFF" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Booking" size="lg">
        <div className="space-y-4">
          <Select label="Customer *" value={form.customer_id} onChange={e => setForm(p => ({ ...p, customer_id: e.target.value }))}
            options={[{ value: '', label: 'Select customer...' }, ...customers.map(c => ({ value: c.id, label: `${c.name} – ${c.phone}` }))]} />
          <Select label="Service *" value={form.service_id} onChange={e => setForm(p => ({ ...p, service_id: e.target.value, staff_id: '' }))}
            options={[{ value: '', label: 'Select service...' }, ...services.map(s => ({ value: s.id, label: `${s.name} (${s.duration_minutes} min)` }))]} />
          <Select label="Staff member *" value={form.staff_id} onChange={e => setForm(p => ({ ...p, staff_id: e.target.value }))}
            options={[{ value: '', label: 'Select staff...' }, ...staffForService.map(s => ({ value: s.id, label: s.name }))]} />
          <Input label="Date *" type="date" value={form.start_time?.slice(0, 10)} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />
          {availableSlots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Available slots</label>
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map(slot => (
                  <button key={slot} onClick={() => setForm(p => ({ ...p, start_time: slot }))}
                    style={{ padding: '7px 0', fontSize: 12, borderRadius: 8, border: `1px solid ${form.start_time === slot ? '#1A1A1A' : '#E8E8E8'}`, background: form.start_time === slot ? '#1A1A1A' : '#FFF', color: form.start_time === slot ? '#FFF' : '#555', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.1s' }}>
                    {format(new Date(slot), 'HH:mm')}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Textarea label="Notes (optional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Any special requests..." />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={createBooking}>Create Booking</Button>
          </div>
        </div>
      </Modal>

      {/* Booking detail modal */}
      {selected && (
        <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Booking Details">
          <div className="space-y-3 text-sm">
            <DetailRow label="Customer" value={selected.customer_name} />
            <DetailRow label="Phone" value={selected.customer_phone} />
            <DetailRow label="Service" value={selected.service_name} />
            <DetailRow label="Staff" value={selected.staff_name} />
            <DetailRow label="Time" value={`${format(new Date(selected.start_time), 'EEEE d MMM · HH:mm')} – ${format(new Date(selected.end_time), 'HH:mm')}`} />
            <DetailRow label="Status" value={<Badge label={selected.status} />} />
            {selected.notes && <DetailRow label="Notes" value={selected.notes} />}
            {selected.price && <DetailRow label="Price" value={`${parseFloat(selected.price).toFixed(3)} OMR`} />}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid #F0F0F0' }}>
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

function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ color: '#AAAAAA', minWidth: 80, fontSize: 13 }}>{label}</span>
      <span style={{ color: '#1A1A1A', fontWeight: 600, flex: 1, fontSize: 13 }}>{value}</span>
    </div>
  );
}
