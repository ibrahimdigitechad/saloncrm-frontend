'use client';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Modal, Input, Textarea, Card, EmptyState, Spinner } from '@/components/ui';

const PRESET_COLORS = ['#0B5ED7','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#be185d','#65a30d'];

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', duration_minutes: 30, price: 0, color:'#0B5ED7' });

  const load = useCallback(async () => {
    const res = await api.get('/services');
    setServices(res.data.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditing(null);
    setForm({ name:'', description:'', duration_minutes: 30, price: 0, color:'#0B5ED7' });
    setShowModal(true);
  }

  function openEdit(s: any) {
    setEditing(s);
    setForm({ name: s.name, description: s.description || '', duration_minutes: s.duration_minutes, price: parseFloat(s.price), color: s.color });
    setShowModal(true);
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Service name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/services/${editing.id}`, form);
        toast.success('Service updated');
      } else {
        await api.post('/services', form);
        toast.success('Service created');
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
    if (!confirm(`Deactivate "${name}"?`)) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deactivated');
      load();
    } catch { toast.error('Delete failed'); }
  }

  const totalRevenuePotential = services.reduce((s, sv) => s + parseFloat(sv.price || 0), 0);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Services</h1>
            <p className="text-sm text-slate-400">{services.length} active service{services.length !== 1 ? 's' : ''}</p>
          </div>
          <Button size="sm" onClick={openNew}><Plus size={14} /> Add service</Button>
        </div>

        {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : services.length === 0 ? (
          <EmptyState icon={Plus} title="No services yet" description="Add services so customers can start booking appointments" action={<Button size="sm" onClick={openNew}><Plus size={13} /> Add service</Button>} />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(s => (
                <Card key={s.id} className="p-5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-10 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <div>
                        <p className="font-semibold text-slate-900">{s.name}</p>
                        {s.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"><Edit2 size={13} /></button>
                      <button onClick={() => remove(s.id, s.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"><Trash2 size={13} /></button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock size={13} className="text-slate-400" />
                      <span className="text-sm">{s.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-800 font-semibold">
                      <span className="text-sm">{parseFloat(s.price).toFixed(3)} OMR</span>
                    </div>
                  </div>

                  {s.staff_count > 0 && (
                    <p className="text-xs text-slate-400 mt-2">{s.staff_count} staff member{s.staff_count !== 1 ? 's' : ''}</p>
                  )}
                </Card>
              ))}
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
              <span className="font-medium">{services.length} services</span> · avg {Math.round(services.reduce((s, sv) => s + sv.duration_minutes, 0) / services.length)} min per appointment · price range {Math.min(...services.map(s => parseFloat(s.price))).toFixed(3)} – {Math.max(...services.map(s => parseFloat(s.price))).toFixed(3)} OMR
            </div>
          </>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit service' : 'Add service'} size="lg">
        <div className="space-y-4">
          <Input label="Service name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Haircut & Beard Trim" />
          <Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Optional description shown to customers" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes) *</label>
              <input type="number" min="5" max="480" step="5" value={form.duration_minutes}
                onChange={e => setForm(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 30 }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (OMR) *</label>
              <input type="number" min="0" step="0.1" value={form.price}
                onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Calendar colour</label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                  className={`w-7 h-7 rounded-full border-2 transition ${form.color === c ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ background: c }} />
              ))}
              <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                className="w-7 h-7 rounded-full border border-slate-200 cursor-pointer" title="Custom color" />
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-2 h-10 rounded-full" style={{ background: form.color }} />
            <div>
              <p className="text-sm font-medium text-slate-800">{form.name || 'Service name'}</p>
              <p className="text-xs text-slate-400">{form.duration_minutes} min · {parseFloat(String(form.price)).toFixed(3)} OMR</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={save}>{editing ? 'Save changes' : 'Add service'}</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
