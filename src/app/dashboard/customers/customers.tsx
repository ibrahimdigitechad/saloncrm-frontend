'use client';
import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Search, Plus, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Modal, Input, Select, Textarea, Badge, EmptyState, Spinner } from '@/components/ui';

const TAGS = ['new', 'regular', 'vip', 'at-risk'];
const AVATAR_COLORS = ['#C8825C','#5C8AC8','#5CC87A','#C85C8A','#8A5CC8','#C8B55C'];
function avatarBg(name?: string) { return !name ? '#AAA' : AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
function initials(name?: string) { return !name ? '?' : name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

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

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

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
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  }

  async function toggleBlock(id: string, blocked: boolean) {
    try {
      await api.put(`/customers/${id}`, { is_blocked: !blocked });
      toast.success(blocked ? 'Customer unblocked' : 'Customer blocked');
      setSelected(null); setProfile(null); load();
    } catch { toast.error('Update failed'); }
  }

  async function updateTag(id: string, newTag: string) {
    try {
      await api.put(`/customers/${id}`, { tag: newTag });
      toast.success('Tag updated'); load();
    } catch { toast.error('Update failed'); }
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Customers</h1>
            <p style={{ fontSize: 13, color: '#AAAAAA', margin: '3px 0 0' }}>{total} total customers</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#1A1A1A', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
            <Plus size={14} /> Add Customer
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', background: '#FFF', border: '1px solid #E8E8E8', borderRadius: 10, padding: '0 12px', gap: 8, height: 38 }}>
            <Search size={13} color="#AAAAAA" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, email..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#333', width: '100%', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['', ...TAGS].map(t => (
              <button key={t} onClick={() => setTag(t)} style={{
                padding: '7px 14px', fontSize: 12, borderRadius: 9, fontFamily: 'inherit',
                border: `1px solid ${tag === t ? '#1A1A1A' : '#E8E8E8'}`,
                background: tag === t ? '#1A1A1A' : '#FFF',
                color: tag === t ? '#FFF' : '#666',
                cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.1s',
              }}>{t || 'All'}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size="lg" /></div>
        ) : customers.length === 0 ? (
          <EmptyState icon={Search} title="No customers found" description="Try a different search or add your first customer"
            action={<Button size="sm" onClick={() => setShowModal(true)}><Plus size={13} /> Add customer</Button>} />
        ) : (
          <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EBEBEB', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
                    {['Name', 'Phone', 'Email', 'Tag', 'Bookings', 'Last Visit', ''].map(h => (
                      <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#BBBBBB', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #F7F7F7', background: i % 2 === 0 ? '#FFF' : '#FAFAFA', cursor: 'pointer', opacity: c.is_blocked ? 0.5 : 1 }}
                      onClick={() => openProfile(c)}>
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarBg(c.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#FFF', flexShrink: 0 }}>
                            {initials(c.name)}
                          </div>
                          <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{c.name}</span>
                          {c.is_blocked && <UserX size={13} color="#E05252" />}
                        </div>
                      </td>
                      <td style={{ padding: '12px 18px', color: '#555', fontFamily: 'monospace', fontSize: 12 }}>{c.phone}</td>
                      <td style={{ padding: '12px 18px', color: '#888' }}>{c.email || '—'}</td>
                      <td style={{ padding: '12px 18px' }}><Badge label={c.tag || 'regular'} /></td>
                      <td style={{ padding: '12px 18px', color: '#555' }}>{c.booking_count || 0}</td>
                      <td style={{ padding: '12px 18px', color: '#AAAAAA' }}>{c.last_booking_at ? format(new Date(c.last_booking_at), 'dd MMM yy') : '—'}</td>
                      <td style={{ padding: '12px 18px' }}>
                        <button style={{ width: 30, height: 30, borderRadius: 8, background: '#1A1A1A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={e => { e.stopPropagation(); openProfile(c); }}>
                          <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" stroke="#FFF" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add customer modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Customer">
        <div className="space-y-4">
          <Input label="Full name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Mohammed Al-Harthy" />
          <Input label="Phone *" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+968 9123 4567" />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Optional" />
          <Select label="Tag" value={form.tag} onChange={e => setForm(p => ({ ...p, tag: e.target.value }))} options={TAGS.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))} />
          <Textarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Any notes..." />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={save}>Add Customer</Button>
          </div>
        </div>
      </Modal>

      {/* Customer profile modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => { setSelected(null); setProfile(null); }} title="Customer Profile" size="xl">
          {!profile ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div> : (
            <div className="space-y-5">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: avatarBg(profile.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#FFF', flexShrink: 0 }}>
                  {initials(profile.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{profile.name}</h3>
                  <p style={{ fontSize: 13, color: '#888', margin: '3px 0 8px' }}>{profile.phone}{profile.email ? ` · ${profile.email}` : ''}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Badge label={profile.tag || 'regular'} />
                    {profile.is_blocked && <Badge label="blocked" variant="cancelled" />}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {TAGS.map(t => (
                    <button key={t} onClick={() => updateTag(profile.id, t)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 7, border: `1px solid ${profile.tag === t ? '#1A1A1A' : '#E8E8E8'}`, background: profile.tag === t ? '#1A1A1A' : '#FFF', color: profile.tag === t ? '#FFF' : '#666', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {profile.notes && <div style={{ background: '#FFF8E0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#A07800' }}>{profile.notes}</div>}

              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#BBBBBB', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 10 }}>
                  Booking History ({profile.bookings?.length || 0})
                </p>
                <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(profile.bookings || []).map((b: any) => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: '1px solid #F0F0F0', background: '#FAFAFA' }}>
                      <div style={{ width: 4, height: 36, borderRadius: 4, background: b.service_color || '#1A1A1A', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#1A1A1A', fontSize: 13 }}>{b.service_name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA' }}>{b.staff_name} · {format(new Date(b.start_time), 'dd MMM yyyy HH:mm')}</p>
                      </div>
                      <Badge label={b.status} />
                    </div>
                  ))}
                  {!profile.bookings?.length && <p style={{ textAlign: 'center', color: '#AAAAAA', fontSize: 13, padding: '20px 0' }}>No bookings yet</p>}
                </div>
              </div>

              <div style={{ paddingTop: 12, borderTop: '1px solid #F0F0F0' }}>
                <Button variant="danger" size="sm" onClick={() => toggleBlock(profile.id, profile.is_blocked)}>
                  <UserX size={13} /> {profile.is_blocked ? 'Unblock' : 'Block'} Customer
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </DashboardLayout>
  );
}
