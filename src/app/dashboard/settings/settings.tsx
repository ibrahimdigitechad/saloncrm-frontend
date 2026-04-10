'use client';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CheckCircle, Building2, Clock, Wifi, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Input, Select, Spinner } from '@/components/ui';

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'] as const;
const DAY_LABELS: Record<string, string> = { mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' };

const TABS = [
  { key: 'business', label: 'Business',      icon: Building2 },
  { key: 'hours',    label: 'Working Hours', icon: Clock },
  { key: 'whatsapp', label: 'WhatsApp',      icon: Wifi },
  { key: 'email',    label: 'Email',         icon: Mail },
];

export default function SettingsPage() {
  const [tab, setTab] = useState('business');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [testingWa, setTestingWa] = useState(false);

  const [business, setBusiness] = useState({ name: '', phone: '', timezone: 'Asia/Muscat', currency: 'OMR' });
  const [hours, setHours] = useState<any>({});
  const [wa, setWa] = useState({ wa_phone_number_id: '', wa_access_token: '', notifications_wa: false });
  const [email, setEmail] = useState({ email_provider: 'resend', email_api_key: '', email_from: '', notifications_email: false });

  const load = useCallback(async () => {
    const res = await api.get('/settings');
    const s = res.data.data;
    setSettings(s);
    setBusiness({ name: s.name, phone: s.phone || '', timezone: s.timezone, currency: s.currency });
    setHours(s.working_hours || {});
    setWa({ wa_phone_number_id: '', wa_access_token: '', notifications_wa: s.notifications_wa });
    setEmail({ email_provider: s.email_provider || 'resend', email_api_key: '', email_from: s.email_from || '', notifications_email: s.notifications_email });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function setHour(day: string, field: string, val: string | boolean) {
    setHours((p: any) => ({ ...p, [day]: { ...p[day], [field]: val } }));
  }

  async function saveBusiness() {
    setSaving(true);
    try { await api.put('/settings', business); toast.success('Business settings saved'); load(); }
    catch (err: any) { toast.error(err?.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  }

  async function saveHours() {
    setSaving(true);
    try { await api.put('/settings', { working_hours: hours }); toast.success('Working hours saved'); }
    catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  }

  async function saveWa() {
    if (!wa.wa_phone_number_id || !wa.wa_access_token) { toast.error('Both fields are required'); return; }
    setSaving(true);
    try { await api.put('/settings/whatsapp', wa); toast.success('WhatsApp configuration saved'); load(); }
    catch (err: any) { toast.error(err?.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  }

  async function testWa() {
    setTestingWa(true);
    try { await api.post('/settings/whatsapp/test'); toast.success('Test message sent! Check your WhatsApp.'); }
    catch (err: any) { toast.error(err?.response?.data?.error || 'Test failed'); }
    finally { setTestingWa(false); }
  }

  async function saveEmail() {
    if (!email.email_api_key || !email.email_from) { toast.error('API key and from address are required'); return; }
    setSaving(true);
    try { await api.put('/settings/email', email); toast.success('Email configuration saved'); load(); }
    catch (err: any) { toast.error(err?.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  }

  if (loading) return <DashboardLayout><div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 13, color: '#AAAAAA', margin: '3px 0 0' }}>Manage your business configuration</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#F5F4F0', borderRadius: 12, padding: 4, gap: 3, marginBottom: 20 }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: tab === key ? '#1A1A1A' : 'transparent',
              color: tab === key ? '#FFF' : '#666',
              fontSize: 12, fontWeight: tab === key ? 600 : 400, transition: 'all 0.12s',
            }}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        {/* ── BUSINESS ── */}
        {tab === 'business' && (
          <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EBEBEB', padding: 24 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>Business Details</p>
            <p style={{ fontSize: 13, color: '#AAAAAA', margin: '0 0 20px' }}>Shown on your public booking page</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Business name" value={business.name} onChange={e => setBusiness(p => ({ ...p, name: e.target.value }))} />
              <Input label="Phone number" value={business.phone} onChange={e => setBusiness(p => ({ ...p, phone: e.target.value }))} placeholder="+968 9123 4567" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Select label="Timezone" value={business.timezone} onChange={e => setBusiness(p => ({ ...p, timezone: e.target.value }))}
                  options={[
                    { value: 'Asia/Muscat', label: 'Muscat (GST +4)' },
                    { value: 'Asia/Dubai', label: 'Dubai (GST +4)' },
                    { value: 'Asia/Riyadh', label: 'Riyadh (AST +3)' },
                    { value: 'Asia/Kuwait', label: 'Kuwait (AST +3)' },
                    { value: 'Europe/London', label: 'London (GMT)' },
                  ]} />
                <Select label="Currency" value={business.currency} onChange={e => setBusiness(p => ({ ...p, currency: e.target.value }))}
                  options={[
                    { value: 'OMR', label: 'OMR – Omani Rial' },
                    { value: 'AED', label: 'AED – UAE Dirham' },
                    { value: 'SAR', label: 'SAR – Saudi Riyal' },
                    { value: 'KWD', label: 'KWD – Kuwaiti Dinar' },
                    { value: 'USD', label: 'USD – US Dollar' },
                  ]} />
              </div>
              <div style={{ background: '#F5F4F0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#666' }}>
                <span style={{ color: '#AAAAAA' }}>Public booking URL: </span>
                <a href={`/book/${settings?.slug}`} target="_blank" style={{ color: '#1A1A1A', fontWeight: 600 }}>
                  app.saloncrm.io/book/{settings?.slug}
                </a>
              </div>
              <Button loading={saving} onClick={saveBusiness}>Save Business Settings</Button>
            </div>
          </div>
        )}

        {/* ── WORKING HOURS ── */}
        {tab === 'hours' && (
          <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EBEBEB', padding: 24 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>Working Hours</p>
            <p style={{ fontSize: 13, color: '#AAAAAA', margin: '0 0 20px' }}>Default hours for the whole business. Staff can override individually.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {DAYS.map(day => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid #F0F0F0', background: '#FAFAFA' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#333', width: 90 }}>{DAY_LABELS[day]}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setHour(day, 'off', !hours[day]?.off)}>
                    <div style={{ width: 36, height: 20, borderRadius: 10, background: !hours[day]?.off ? '#1A1A1A' : '#E0E0E0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 2, left: !hours[day]?.off ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#FFF', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#888', minWidth: 38 }}>{hours[day]?.off ? 'Closed' : 'Open'}</span>
                  </div>
                  {!hours[day]?.off && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
                      <input type="time" value={hours[day]?.open || '09:00'} onChange={e => setHour(day, 'open', e.target.value)}
                        style={{ fontSize: 12, border: '1px solid #E8E8E8', borderRadius: 8, padding: '5px 8px', outline: 'none', fontFamily: 'inherit' }} />
                      <span style={{ color: '#AAAAAA', fontSize: 12 }}>–</span>
                      <input type="time" value={hours[day]?.close || '18:00'} onChange={e => setHour(day, 'close', e.target.value)}
                        style={{ fontSize: 12, border: '1px solid #E8E8E8', borderRadius: 8, padding: '5px 8px', outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button loading={saving} onClick={saveHours}>Save Working Hours</Button>
          </div>
        )}

        {/* ── WHATSAPP ── */}
        {tab === 'whatsapp' && (
          <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EBEBEB', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>WhatsApp Cloud API</p>
                <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0 }}>Send automated booking confirmations and reminders via WhatsApp</p>
              </div>
              {settings?.wa_configured && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#E8F8EE', color: '#2E8B57', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 20 }}>
                  <CheckCircle size={13} /> Connected
                </div>
              )}
            </div>

            {/* Setup guide */}
            <div style={{ background: '#EAF0FF', border: '1px solid #C8D8F8', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>How to get your credentials:</p>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#3355CC', lineHeight: 1.8 }}>
                <li>Go to <a href="https://developers.facebook.com" target="_blank" style={{ color: '#3355CC', fontWeight: 600 }}>developers.facebook.com</a></li>
                <li>Create a Meta App → Add WhatsApp product</li>
                <li>Copy your Phone Number ID and Permanent Access Token</li>
                <li>Set webhook URL to your Railway backend <code style={{ background: '#C8D8F8', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>/v1/webhook/whatsapp</code></li>
              </ol>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <Input label="Phone Number ID" value={wa.wa_phone_number_id} onChange={e => setWa(p => ({ ...p, wa_phone_number_id: e.target.value }))} placeholder="1234567890123456" hint="Found in Meta App Dashboard → WhatsApp → API Setup" />
              <Input label="Access Token" type="password" value={wa.wa_access_token} onChange={e => setWa(p => ({ ...p, wa_access_token: e.target.value }))} placeholder="EAAxxxx..." hint="Use a permanent token, not a temporary one" />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid #F0F0F0', cursor: 'pointer', background: '#FAFAFA' }}
                onClick={() => setWa(p => ({ ...p, notifications_wa: !p.notifications_wa }))}>
                <div style={{ width: 36, height: 20, borderRadius: 10, background: wa.notifications_wa ? '#1A1A1A' : '#E0E0E0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: wa.notifications_wa ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#FFF', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>Enable WhatsApp notifications</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#AAAAAA' }}>Send confirmation and reminder messages via WhatsApp</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button loading={saving} onClick={saveWa}>Save WhatsApp Config</Button>
              {settings?.wa_configured && <Button variant="secondary" loading={testingWa} onClick={testWa}>Send Test Message</Button>}
            </div>
          </div>
        )}

        {/* ── EMAIL ── */}
        {tab === 'email' && (
          <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EBEBEB', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>Email Notifications</p>
                <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0 }}>Send booking confirmations and cancellations by email</p>
              </div>
              {settings?.email_configured && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#E8F8EE', color: '#2E8B57', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 20 }}>
                  <CheckCircle size={13} /> Configured
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <Select label="Email provider" value={email.email_provider} onChange={e => setEmail(p => ({ ...p, email_provider: e.target.value }))}
                options={[
                  { value: 'resend', label: 'Resend (recommended)' },
                  { value: 'sendgrid', label: 'SendGrid' },
                ]} />
              <Input label="API Key" type="password" value={email.email_api_key} onChange={e => setEmail(p => ({ ...p, email_api_key: e.target.value }))}
                placeholder={email.email_provider === 'resend' ? 're_xxxx...' : 'SG.xxxx...'}
                hint={email.email_provider === 'resend' ? 'Get your key at resend.com/api-keys' : 'Get your key at sendgrid.com'} />
              <Input label="From email address" type="email" value={email.email_from} onChange={e => setEmail(p => ({ ...p, email_from: e.target.value }))} placeholder="bookings@yoursalon.com" hint="Must be a verified sender in your email provider" />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid #F0F0F0', cursor: 'pointer', background: '#FAFAFA' }}
                onClick={() => setEmail(p => ({ ...p, notifications_email: !p.notifications_email }))}>
                <div style={{ width: 36, height: 20, borderRadius: 10, background: email.notifications_email ? '#1A1A1A' : '#E0E0E0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: email.notifications_email ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#FFF', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>Enable email notifications</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#AAAAAA' }}>Send confirmation and cancellation emails to customers</p>
                </div>
              </div>
            </div>

            <Button loading={saving} onClick={saveEmail}>Save Email Config</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
