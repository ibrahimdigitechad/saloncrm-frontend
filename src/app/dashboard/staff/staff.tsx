'use client';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Modal, Input, EmptyState, Spinner } from '@/components/ui';

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'] as const;
const DAY_LABELS: Record<string, string> = { mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' };
const DEFAULT_HOURS = Object.fromEntries(DAYS.map(d => [d, { open:'09:00', close:'18:00', off: d === 'sun' }]));
const AVATAR_COLORS = ['#C8825C','#5C8AC8','#5CC87A','#C85C8A','#8A5CC8','#C8B55C'];
function avatarBg(name?: string) { return !name ? '#AAA' : AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }

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
    setStaff(sRes.data.data); setServices(svRes.data.data); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() { setEditing(null); setForm({ name:'', phone:'', email:'', service_ids:[], working_hours: { ...DEFAULT_HOURS } }); setShowModal(true); }
  function openEdit(s: any) {
    setEditing(s);
    setForm({ name: s.name, phone: s.phone || '', email: s.email || '', service_ids: (s.services || []).map((sv: any) => sv.id), working_hours: s.working_hours || { ...DEFAULT_HOURS } });
    setShowModal(true);
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      editing ? await api.put(`/staff/${editing.id}`, form) : await api.post('/staff', form);
      toast.success(editing ? 'Staff updated' : 'Staff member added');
      setShowModal(false); load();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Remove ${name} from staff?`)) return;
    try { await api.delete(`/staff/${id}`); toast.success('Staff member removed'); load(); }
    catch { toast.error('Delete failed'); }
  }

  function toggleService(id: string) {
    setForm(p => ({ ...p, service_ids: p.service_ids.includes(id) ? p.service_ids.filter(s => s !== id) : [...p.service_ids, id] }));
  }
  function setHours(day: string, field: string, val: string | boolean) {
    setForm(p => ({ ...p, working_hours: { ...p.working_hours, [day]: { ...p.working_hours[day], [field]: val } } }));
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Staff</h1>
            <p style={{ fontSize: 13, color: '#AAAAAA', margin: '3px 0 0' }}>{staff.length} team member{staff.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#1A1A1A', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
            <Plus size={14} /> Add Staff
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size="lg" /></div>
        ) : staff.length === 0 ? (
          <EmptyState icon={Plus} title="No staff yet" description="Add your first team member to start taking bookings"
            action={<Button size="sm" onClick={openNew}><Plus size={13} /> Add staff</Button>} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {staff.map(s => (
              <div key={s.id} style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EBEBEB', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: avatarBg(s.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#FFF', flexShrink: 0 }}>
                      {s.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#1A1A1A', fontSize: 14 }}>{s.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#AAAAAA' }}>{s.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openEdit(s)} style={{ width: 28, height: 28, borderRadius: 8, background: '#F5F4F0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Edit2 size={12} color="#666" />
                    </button>
                    <button onClick={() => remove(s.id, s.name)} style={{ width: 28, height: 28, borderRadius: 8, background: '#FEF2F2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={12} color="#E05252" />
                    </button>
                  </div>
                </div>

                {s.services?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                    {s.services.map((sv: any) => (
                      <span key={sv.id} style={{ fontSize: 11, padding: '3px 9px', background: '#F5F4F0', color: '#666', borderRadius: 20 }}>{sv.name}</span>
                    ))}
                  </div>
                )}

                {s.working_hours && (
                  <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                      <Clock size={11} color="#AAAAAA" />
                      <span style={{ fontSize: 11, color: '#AAAAAA' }}>Custom hours</span>
                    </div>
                    {DAYS.filter(d => !s.working_hours[d]?.off).map(d => (
                      <div key={d} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                        <span style={{ color: '#888', textTransform: 'capitalize' }}>{d}</span>
                        <span style={{ color: '#555' }}>{s.working_hours[d]?.open} – {s.working_hours[d]?.close}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Staff Member' : 'Add Staff Member'} size="xl">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Khalid Al-Balushi" />
            <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+968 9xxx xxxx" />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Optional" />

          {services.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Services offered</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {services.map(sv => (
                  <button key={sv.id} onClick={() => toggleService(sv.id)} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8, border: `1px solid ${form.service_ids.includes(sv.id) ? '#1A1A1A' : '#E8E8E8'}`, background: form.service_ids.includes(sv.id) ? '#1A1A1A' : '#FFF', color: form.service_ids.includes(sv.id) ? '#FFF' : '#666', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.1s' }}>
                    {sv.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Working hours <span style={{ color: '#AAAAAA', fontWeight: 400 }}>(leave blank to use business hours)</span></label>
            <div className="space-y-2">
              {DAYS.map(day => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: '#555', width: 90 }}>{DAY_LABELS[day]}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!form.working_hours[day]?.off} onChange={e => setHours(day, 'off', !e.target.checked)} style={{ width: 14, height: 14 }} />
                    <span style={{ fontSize: 12, color: '#888' }}>Open</span>
                  </label>
                  {!form.working_hours[day]?.off && (
                    <>
                      <input type="time" value={form.working_hours[day]?.open || '09:00'} onChange={e => setHours(day, 'open', e.target.value)} style={{ fontSize: 12, border: '1px solid #E8E8E8', borderRadius: 8, padding: '4px 8px', outline: 'none', fontFamily: 'inherit' }} />
                      <span style={{ fontSize: 12, color: '#AAAAAA' }}>to</span>
                      <input type="time" value={form.working_hours[day]?.close || '18:00'} onChange={e => setHours(day, 'close', e.target.value)} style={{ fontSize: 12, border: '1px solid #E8E8E8', borderRadius: 8, padding: '4px 8px', outline: 'none', fontFamily: 'inherit' }} />
                    </>
                  )}
                  {form.working_hours[day]?.off && <span style={{ fontSize: 12, color: '#AAAAAA' }}>Day off</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={save}>{editing ? 'Save Changes' : 'Add Staff Member'}</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
