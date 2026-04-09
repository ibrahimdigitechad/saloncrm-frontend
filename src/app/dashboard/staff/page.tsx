'use client';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Modal, Input, Card, EmptyState, Spinner, Badge } from '@/components/ui';

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'] as const;
const DAY_LABELS: Record<string, string> = { mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' };

const DEFAULT_HOURS = Object.fromEntries(DAYS.map(d => [d, { open:'09:00', close:'18:00', off: d === 'sun' }]));

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:'', phone:'', email:'', service_ids:[] as string[], working_hours: DEFAULT_HOURS as any });

  const load = useCallback(async () => {
    const [sRes, svRes] = await Promise.all([api.get('/staff'), api.get('/services')]);
    setStaff(sRes.data.data);
    setServices(svRes.data.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditing(null);
    setForm({ name:'', phone:'', email:'', service_ids:[], working_hours: { ...DEFAULT_HOURS } });
    setShowModal(true);
  }

  function openEdit(s: any) {
    setEditing(s);
    setForm({
      name: s.name,
      phone: s.phone || '',
      email: s.email || '',
      service_ids: (s.services || []).map((sv: any) => sv.id),
      working_hours: s.working_hours || { ...DEFAULT_HOURS },
    });
    setShowModal(true);
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/staff/${editing.id}`, form);
        toast.success('Staff updated');
      } else {
        await api.post('/staff', form);
        toast.success('Staff member added');
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Remove ${name} from staff?`)) return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success('Staff member removed');
      load();
    } catch { toast.error('Delete failed'); }
  }

  function toggleService(id: string) {
    setForm(p => ({
      ...p,
      service_ids: p.service_ids.includes(id) ? p.service_ids.filter(s => s !== id) : [...p.service_ids, id],
    }));
  }

  function setHours(day: string, field: string, val: string | boolean) {
    setForm(p => ({ ...p, working_hours: { ...p.working_hours, [day]: { ...p.working_hours[day], [field]: val } } }));
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Staff</h1>
          <Button size="sm" onClick={openNew}><Plus size={14} /> Add staff</Button>
        </div>

        {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : staff.length === 0 ? (
          <EmptyState icon={Plus} title="No staff yet" description="Add your first team member to start taking bookings" action={<Button size="sm" onClick={openNew}><Plus size={13} /> Add staff</Button>} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map(s => (
              <Card key={s.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-[#0B5ED7]">
                      {s.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"><Edit2 size={13} /></button>
                    <button onClick={() => remove(s.id, s.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"><Trash2 size={13} /></button>
                  </div>
                </div>

                {s.services?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {s.services.map((sv: any) => (
                      <span key={sv.id} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{sv.name}</span>
                    ))}
                  </div>
                )}

                {s.working_hours && (
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Clock size={11} className="text-slate-400" />
                      <span className="text-xs text-slate-400">Custom hours</span>
                    </div>
                    <div className="space-y-0.5">
                      {DAYS.filter(d => !s.working_hours[d]?.off).map(d => (
                        <div key={d} className="flex justify-between text-xs">
                          <span className="text-slate-500 capitalize">{d}</span>
                          <span className="text-slate-700">{s.working_hours[d]?.open} – {s.working_hours[d]?.close}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit staff member' : 'Add staff member'} size="xl">
        <div className="space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Khalid Al-Balushi" />
            <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+968 9xxx xxxx" />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Optional" />

          {/* Services */}
          {services.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Services offered</label>
              <div className="flex flex-wrap gap-2">
                {services.map(sv => (
                  <button key={sv.id} onClick={() => toggleService(sv.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition ${form.service_ids.includes(sv.id) ? 'bg-[#0B5ED7] text-white border-[#0B5ED7]' : 'border-slate-200 text-slate-600 bg-white hover:border-slate-400'}`}>
                    {sv.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Working hours */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Working hours <span className="text-slate-400 font-normal">(leave blank to use business hours)</span></label>
            <div className="space-y-2">
              {DAYS.map(day => (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-24">{DAY_LABELS[day]}</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={!form.working_hours[day]?.off} onChange={e => setHours(day, 'off', !e.target.checked)}
                      className="w-3.5 h-3.5 rounded accent-blue-600" />
                    <span className="text-xs text-slate-500">Open</span>
                  </label>
                  {!form.working_hours[day]?.off && (
                    <>
                      <input type="time" value={form.working_hours[day]?.open || '09:00'} onChange={e => setHours(day, 'open', e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <span className="text-slate-400 text-xs">to</span>
                      <input type="time" value={form.working_hours[day]?.close || '18:00'} onChange={e => setHours(day, 'close', e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </>
                  )}
                  {form.working_hours[day]?.off && <span className="text-xs text-slate-400">Day off</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={save}>{editing ? 'Save changes' : 'Add staff member'}</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
