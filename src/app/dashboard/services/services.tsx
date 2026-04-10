'use client';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Modal, Input, Textarea, EmptyState, Spinner } from '@/components/ui';

const PRESET_COLORS = ['#1A1A1A','#C8825C','#5C8AC8','#5CC87A','#C85C8A','#8A5CC8','#C8B55C','#5CBEC8'];

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', duration_minutes: 30, price: 0, color:'#1A1A1A' });

  const load = useCallback(async () => {
    const res = await api.get('/services');
    setServices(res.data.data); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() { setEditing(null); setForm({ name:'', description:'', duration_minutes: 30, price: 0, color:'#1A1A1A' }); setShowModal(true); }
  function openEdit(s: any) {
    setEditing(s);
    setForm({ name: s.name, description: s.description || '', duration_minutes: s.duration_minutes, price: parseFloat(s.price), color: s.color });
    setShowModal(true);
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Service name is required'); return; }
    setSaving(true);
    try {
      editing ? await api.put(`/services/${editing.id}`, form) : await api.post('/services', form);
      toast.success(editing ? 'Service updated' : 'Service created');
      setShowModal(false); load();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Deactivate "${name}"?`)) return;
    try { await api.delete(`/services/${id}`); toast.success('Service deactivated'); load(); }
    catch { toast.error('Delete failed'); }
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Services</h1>
            <p style={{ fontSize: 13, color: '#AAAAAA', margin: '3px 0 0' }}>{services.length} active service{services.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#1A1A1A', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
            <Plus size={14} /> Add Service
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size="lg" /></div>
        ) : services.length === 0 ? (
          <EmptyState icon={Plus} title="No services yet" description="Add services so customers can start booking appointments"
            action={<Button size="sm" onClick={openNew}><Plus size={13} /> Add service</Button>} />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 16 }}>
              {services.map(s => (
                <div key={s.id} style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EBEBEB', padding: 20, position: 'relative', overflow: 'hidden' }}>
                  {/* Color accent bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.color, borderRadius: '16px 16px 0 0' }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 8, marginBottom: 14 }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#1A1A1A', fontSize: 14 }}>{s.name}</p>
                      {s.description && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#AAAAAA', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{s.description}</p>}
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

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #F0F0F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#666' }}>
                      <Clock size={12} color="#AAAAAA" />
                      <span style={{ fontSize: 13 }}>{s.duration_minutes} min</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{parseFloat(s.price).toFixed(3)} OMR</span>
                  </div>

                  {s.staff_count > 0 && (
                    <p style={{ fontSize: 11, color: '#AAAAAA', margin: '8px 0 0' }}>{s.staff_count} staff member{s.staff_count !== 1 ? 's' : ''}</p>
                  )}
                </div>
              ))}
            </div>

            <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: 12, padding: '12px 18px', fontSize: 13, color: '#666' }}>
              <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{services.length} services</span>
              {' · '}avg {Math.round(services.reduce((s, sv) => s + sv.duration_minutes, 0) / services.length)} min
              {' · '}price range {Math.min(...services.map(s => parseFloat(s.price))).toFixed(3)} – {Math.max(...services.map(s => parseFloat(s.price))).toFixed(3)} OMR
            </div>
          </>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Service' : 'Add Service'} size="lg">
        <div className="space-y-4">
          <Input label="Service name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Haircut & Beard Trim" />
          <Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Optional description shown to customers" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Duration (minutes) *</label>
              <input type="number" min="5" max="480" step="5" value={form.duration_minutes}
                onChange={e => setForm(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 30 }))}
                style={{ width: '100%', borderRadius: 10, border: '1px solid #E8E8E8', padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Price (OMR) *</label>
              <input type="number" min="0" step="0.1" value={form.price}
                onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', borderRadius: 10, border: '1px solid #E8E8E8', padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Calendar colour</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: `3px solid ${form.color === c ? '#555' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.1s' }} />
              ))}
              <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E8E8E8', cursor: 'pointer', padding: 0 }} />
            </div>
          </div>

          {/* Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#F5F4F0', borderRadius: 10, borderLeft: `4px solid ${form.color}` }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: '#1A1A1A', fontSize: 13 }}>{form.name || 'Service name'}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{form.duration_minutes} min · {parseFloat(String(form.price)).toFixed(3)} OMR</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={save}>{editing ? 'Save Changes' : 'Add Service'}</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
