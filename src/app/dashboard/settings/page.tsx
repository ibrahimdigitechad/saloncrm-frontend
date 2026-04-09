'use client';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CheckCircle, Wifi, Mail, Building2, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Input, Select, Card, Spinner } from '@/components/ui';

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'] as const;
const DAY_LABELS: Record<string, string> = { mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' };

const TABS = [
  { key: 'business', label: 'Business', icon: Building2 },
  { key: 'hours', label: 'Working hours', icon: Clock },
  { key: 'whatsapp', label: 'WhatsApp', icon: Wifi },
  { key: 'email', label: 'Email', icon: Mail },
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
    try {
      await api.put('/settings', business);
      toast.success('Business settings saved');
      load();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  }

  async function saveHours() {
    setSaving(true);
    try {
      await api.put('/settings', { working_hours: hours });
      toast.success('Working hours saved');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  }

  async function saveWa() {
    if (!wa.wa_phone_number_id || !wa.wa_access_token) { toast.error('Both fields are required'); return; }
    setSaving(true);
    try {
      await api.put('/settings/whatsapp', wa);
      toast.success('WhatsApp configuration saved');
      load();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  }

  async function testWa() {
    setTestingWa(true);
    try {
      await api.post('/settings/whatsapp/test');
      toast.success('Test message sent! Check your WhatsApp.');
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Test failed'); }
    finally { setTestingWa(false); }
  }

  async function saveEmail() {
    if (!email.email_api_key || !email.email_from) { toast.error('API key and from address are required'); return; }
    setSaving(true);
    try {
      await api.put('/settings/email', email);
      toast.success('Email configuration saved');
      load();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 flex-1 justify-center py-2 text-sm rounded-lg transition font-medium ${tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* Business */}
        {tab === 'business' && (
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Business details</h2>
              <p className="text-sm text-slate-400">This information is shown on your public booking page</p>
            </div>

            <div className="space-y-4">
              <Input label="Business name" value={business.name} onChange={e => setBusiness(p => ({ ...p, name: e.target.value }))} />
              <Input label="Phone number" value={business.phone} onChange={e => setBusiness(p => ({ ...p, phone: e.target.value }))} placeholder="+968 9123 4567" />
              <div className="grid grid-cols-2 gap-3">
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
                    { value: 'OMR', label: 'OMR — Omani Rial' },
                    { value: 'AED', label: 'AED — UAE Dirham' },
                    { value: 'SAR', label: 'SAR — Saudi Riyal' },
                    { value: 'KWD', label: 'KWD — Kuwaiti Dinar' },
                    { value: 'USD', label: 'USD — US Dollar' },
                  ]} />
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                <span className="text-slate-400">Public booking URL:</span>{' '}
                <a href={`/book/${settings?.slug}`} target="_blank" className="text-[#0B5ED7] font-medium hover:underline">
                  app.saloncrm.io/book/{settings?.slug}
                </a>
              </div>
            </div>

            <Button loading={saving} onClick={saveBusiness}>Save business settings</Button>
          </Card>
        )}

        {/* Working hours */}
        {tab === 'hours' && (
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Default working hours</h2>
              <p className="text-sm text-slate-400">These apply to the whole business. Individual staff can override them.</p>
            </div>

            <div className="space-y-3">
              {DAYS.map(day => (
                <div key={day} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-sm text-slate-700 w-24 font-medium">{DAY_LABELS[day]}</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-9 h-5 rounded-full transition-colors relative ${!hours[day]?.off ? 'bg-[#0B5ED7]' : 'bg-slate-200'}`}
                      onClick={() => setHour(day, 'off', !hours[day]?.off)}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${!hours[day]?.off ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-xs text-slate-500">{hours[day]?.off ? 'Closed' : 'Open'}</span>
                  </label>
                  {!hours[day]?.off && (
                    <div className="flex items-center gap-2 ml-2">
                      <input type="time" value={hours[day]?.open || '09:00'} onChange={e => setHour(day, 'open', e.target.value)}
                        className="text-sm border border-slate-200 bg-white rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <span className="text-slate-300">—</span>
                      <input type="time" value={hours[day]?.close || '18:00'} onChange={e => setHour(day, 'close', e.target.value)}
                        className="text-sm border border-slate-200 bg-white rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button loading={saving} onClick={saveHours}>Save working hours</Button>
          </Card>
        )}

        {/* WhatsApp */}
        {tab === 'whatsapp' && (
          <Card className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-800 mb-1">WhatsApp Cloud API</h2>
                <p className="text-sm text-slate-400">Connect your Meta Business account to send automated confirmations and reminders</p>
              </div>
              {settings?.wa_configured && (
                <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium bg-green-50 px-3 py-1.5 rounded-full">
                  <CheckCircle size={14} /> Connected
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 space-y-1">
              <p className="font-medium">How to get your credentials:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Go to <a href="https://developers.facebook.com" target="_blank" className="underline">developers.facebook.com</a></li>
                <li>Create a Meta App → Add WhatsApp product</li>
                <li>Copy your Phone Number ID and Permanent Access Token</li>
                <li>Set webhook URL to: <code className="bg-blue-100 px-1 rounded text-xs">https://your-api.railway.app/v1/webhook/whatsapp</code></li>
              </ol>
            </div>

            <div className="space-y-4">
              <Input label="Phone Number ID" value={wa.wa_phone_number_id} onChange={e => setWa(p => ({ ...p, wa_phone_number_id: e.target.value }))} placeholder="1234567890123456" hint="Found in Meta App Dashboard → WhatsApp → API Setup" />
              <Input label="Access Token" type="password" value={wa.wa_access_token} onChange={e => setWa(p => ({ ...p, wa_access_token: e.target.value }))} placeholder="EAAxxxx..." hint="Use a permanent token, not a temporary one" />

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                <input type="checkbox" checked={wa.notifications_wa} onChange={e => setWa(p => ({ ...p, notifications_wa: e.target.checked }))} className="w-4 h-4 rounded accent-blue-600" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Enable WhatsApp notifications</p>
                  <p className="text-xs text-slate-400">Send confirmation and reminder messages via WhatsApp</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <Button loading={saving} onClick={saveWa}>Save WhatsApp config</Button>
              {settings?.wa_configured && <Button variant="secondary" loading={testingWa} onClick={testWa}>Send test message</Button>}
            </div>
          </Card>
        )}

        {/* Email */}
        {tab === 'email' && (
          <Card className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-800 mb-1">Email notifications</h2>
                <p className="text-sm text-slate-400">Send booking confirmations and cancellations by email</p>
              </div>
              {settings?.email_configured && (
                <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium bg-green-50 px-3 py-1.5 rounded-full">
                  <CheckCircle size={14} /> Configured
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Select label="Email provider" value={email.email_provider} onChange={e => setEmail(p => ({ ...p, email_provider: e.target.value }))}
                options={[
                  { value: 'resend', label: 'Resend (recommended)' },
                  { value: 'sendgrid', label: 'SendGrid' },
                ]} />
              <Input label="API Key" type="password" value={email.email_api_key} onChange={e => setEmail(p => ({ ...p, email_api_key: e.target.value }))}
                placeholder={email.email_provider === 'resend' ? 're_xxxx...' : 'SG.xxxx...'}
                hint={email.email_provider === 'resend' ? 'Get your key at resend.com/api-keys' : 'Get your key at sendgrid.com'} />
              <Input label="From email address" type="email" value={email.email_from} onChange={e => setEmail(p => ({ ...p, email_from: e.target.value }))} placeholder="bookings@yoursalon.com" hint="Must be a verified sender in your email provider" />

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                <input type="checkbox" checked={email.notifications_email} onChange={e => setEmail(p => ({ ...p, notifications_email: e.target.checked }))} className="w-4 h-4 rounded accent-blue-600" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Enable email notifications</p>
                  <p className="text-xs text-slate-400">Send confirmation and cancellation emails to customers</p>
                </div>
              </label>
            </div>

            <Button loading={saving} onClick={saveEmail}>Save email config</Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
