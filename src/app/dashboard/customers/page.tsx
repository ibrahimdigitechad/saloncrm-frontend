'use client';
import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Search, Plus, UserX, Star } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Modal, Input, Select, Textarea, Badge, Card, EmptyState, Spinner } from '@/components/ui';

const TAGS = ['new', 'regular', 'vip', 'at-risk'];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', tag: 'new', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (search) params.set('search', search);
    if (tag) params.set('tag', tag);
    const res = await api.get(`/customers?${params}`);
    setCustomers(res.data.data);
    setTotal(res.data.total);
    setLoading(false);
  }, [search, tag]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function openProfile(c: any) {
    setSelected(c);
    const res = await api.get(`/customers/${c.id}`);
    setProfile(res.data.data);
  }

  async function save() {
    setSaving(true);
    try {
      await api.post('/customers', form);
      toast.success('Customer added!');
      setShowModal(false);
      setForm({ name: '', phone: '', email: '', tag: 'new', notes: '' });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to add customer');
    } finally {
      setSaving(false);
    }
  }

  async function toggleBlock(id: string, blocked: boolean) {
    try {
      await api.put(`/customers/${id}`, { is_blocked: !blocked });
      toast.success(blocked ? 'Customer unblocked' : 'Customer blocked');
      setSelected(null);
      setProfile(null);
      load();
    } catch { toast.error('Update failed'); }
  }

  async function updateTag(id: string, newTag: string) {
    try {
      await api.put(`/customers/${id}`, { tag: newTag });
      toast.success('Tag updated');
      load();
    } catch { toast.error('Update failed'); }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Customers</h1>
            <p className="text-sm text-slate-400">{total} total</p>
          </div>
          <Button size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Add customer</Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, email..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-1.5">
            {['', ...TAGS].map(t => (
              <button key={t} onClick={() => setTag(t)} className={`px-3 py-2 text-xs rounded-lg border transition capitalize ${tag === t ? 'bg-[#0B5ED7] text-white border-[#0B5ED7]' : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'}`}>
                {t || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
          <Card className="overflow-hidden">
            {customers.length === 0 ? (
              <EmptyState icon={Search} title="No customers found" description="Try a different search or add your first customer" action={<Button size="sm" onClick={() => setShowModal(true)}><Plus size={13} />Add customer</Button>} />
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100 bg-slate-50">
                  {['Name','Phone','Email','Tag','Bookings','Last visit',''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {customers.map(c => (
                    <tr key={c.id} className={`hover:bg-slate-50 transition cursor-pointer ${c.is_blocked ? 'opacity-50' : ''}`} onClick={() => openProfile(c)}>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-[#0B5ED7]">{c.name[0]?.toUpperCase()}</div>
                          {c.name}
                          {c.is_blocked && <UserX size={13} className="text-red-400" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{c.phone}</td>
                      <td className="px-4 py-3 text-slate-500">{c.email || '—'}</td>
                      <td className="px-4 py-3"><Badge label={c.tag || 'regular'} /></td>
                      <td className="px-4 py-3 text-slate-600">{c.booking_count || 0}</td>
                      <td className="px-4 py-3 text-slate-400">{c.last_booking_at ? format(new Date(c.last_booking_at), 'dd MMM yy') : '—'}</td>
                      <td className="px-4 py-3 text-right"><button className="text-xs text-[#0B5ED7] hover:underline">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}
      </div>

      {/* Add customer modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add customer">
        <div className="space-y-4">
          <Input label="Full name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Mohammed Al-Harthy" />
          <Input label="Phone *" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+968 9123 4567" />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Optional" />
          <Select label="Tag" value={form.tag} onChange={e => setForm(p => ({ ...p, tag: e.target.value }))} options={TAGS.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))} />
          <Textarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Any notes..." />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={save}>Add customer</Button>
          </div>
        </div>
      </Modal>

      {/* Customer profile drawer */}
      {selected && (
        <Modal open={!!selected} onClose={() => { setSelected(null); setProfile(null); }} title="Customer profile" size="xl">
          {!profile ? <div className="flex justify-center py-8"><Spinner /></div> : (
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-[#0B5ED7]">{profile.name[0]?.toUpperCase()}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{profile.name}</h3>
                  <p className="text-sm text-slate-500">{profile.phone} {profile.email ? `· ${profile.email}` : ''}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge label={profile.tag || 'regular'} />
                    {profile.is_blocked && <Badge label="blocked" />}
                  </div>
                </div>
                <div className="flex gap-2">
                  {TAGS.map(t => <button key={t} onClick={() => updateTag(profile.id, t)} className={`text-xs px-2 py-1 rounded border transition ${profile.tag === t ? 'bg-[#0B5ED7] text-white border-transparent' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>{t}</button>)}
                </div>
              </div>

              {profile.notes && <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">{profile.notes}</div>}

              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Booking history ({profile.bookings?.length})</h4>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {(profile.bookings || []).map((b: any) => (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
                      <div className="w-1.5 h-10 rounded-full" style={{ background: b.service_color || '#0B5ED7' }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{b.service_name}</p>
                        <p className="text-xs text-slate-400">{b.staff_name} · {format(new Date(b.start_time), 'dd MMM yyyy HH:mm')}</p>
                      </div>
                      <Badge label={b.status} />
                    </div>
                  ))}
                  {!profile.bookings?.length && <p className="text-sm text-slate-400 py-4 text-center">No bookings yet</p>}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button variant="danger" size="sm" onClick={() => toggleBlock(profile.id, profile.is_blocked)}>
                  <UserX size={13} />{profile.is_blocked ? 'Unblock' : 'Block'} customer
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </DashboardLayout>
  );
}
