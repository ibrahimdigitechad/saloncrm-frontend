'use client';
import { useEffect, useState } from 'react';
import { use } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { CheckCircle, ChevronLeft, Zap } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { clsx } from 'clsx';

const PUBLIC_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

type Step = 'service' | 'staff' | 'slot' | 'details' | 'done';

export default function PublicBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [step, setStep] = useState<Step>('service');
  const [sel, setSel] = useState({ service: null as any, staff: null as any, slot: '', date: format(new Date(), 'yyyy-MM-dd') });
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', notes: '' });
  const [confirmation, setConfirmation] = useState<any>(null);

  useEffect(() => {
    axios.get(`${PUBLIC_API}/public/${slug}`)
      .then(r => {
        setBusiness(r.data.data.tenant);
        setServices(r.data.data.services);
        setStaff(r.data.data.staff);
      })
      .catch(() => setError('Business not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!sel.service || !sel.staff || !sel.date) return;
    setSlotsLoading(true);
    axios.get(`${PUBLIC_API}/public/${slug}/availability?staff_id=${sel.staff.id}&service_id=${sel.service.id}&date=${sel.date}`)
      .then(r => setSlots(r.data.data))
      .finally(() => setSlotsLoading(false));
  }, [sel.service, sel.staff, sel.date, slug]);

  const staffForService = sel.service
    ? staff.filter(s => (s.service_ids || []).includes(sel.service.id))
    : staff;

  async function submit() {
    if (!customer.name || !customer.phone) { toast('Name and phone are required'); return; }
    setSubmitting(true);
    try {
      const res = await axios.post(`${PUBLIC_API}/public/${slug}/book`, {
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || undefined,
        staff_id: sel.staff.id,
        service_id: sel.service.id,
        start_time: sel.slot,
        notes: customer.notes || undefined,
      });
      setConfirmation(res.data.data);
      setStep('done');
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function toast(msg: string) { alert(msg); } // Simple fallback — real app uses sonner

  if (loading) return <PageShell><div className="flex justify-center py-20"><Spinner size="lg" /></div></PageShell>;
  if (error || !business) return <PageShell><div className="text-center py-20"><p className="text-slate-500">{error || 'Not found'}</p></div></PageShell>;

  return (
    <PageShell>
      <div className="max-w-lg mx-auto">
        {/* Business header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0B5ED7] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">{business.name[0]}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{business.name}</h1>
          <p className="text-slate-400 mt-1">Book your appointment online</p>
        </div>

        {/* Steps indicator */}
        {step !== 'done' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {(['service','staff','slot','details'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={clsx('w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold transition-all',
                  step === s ? 'bg-[#0B5ED7] text-white' :
                  ['service','staff','slot','details'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400')}>
                  {['service','staff','slot','details'].indexOf(step) > i ? '✓' : i + 1}
                </div>
                {i < 3 && <div className={clsx('w-8 h-0.5', ['service','staff','slot','details'].indexOf(step) > i ? 'bg-green-500' : 'bg-slate-100')} />}
              </div>
            ))}
          </div>
        )}

        {/* Step: Service */}
        {step === 'service' && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Choose a service</h2>
            <div className="space-y-2">
              {services.map(s => (
                <button key={s.id} onClick={() => { setSel(p => ({ ...p, service: s })); setStep('staff'); }}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-[#0B5ED7] hover:shadow-sm transition text-left group">
                  <div className="w-3 h-10 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{s.name}</p>
                    {s.description && <p className="text-sm text-slate-400 mt-0.5">{s.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{parseFloat(s.price).toFixed(3)} OMR</p>
                    <p className="text-xs text-slate-400">{s.duration_minutes} min</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Staff */}
        {step === 'staff' && (
          <div>
            <button onClick={() => setStep('service')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition"><ChevronLeft size={14} /> Back</button>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Choose a staff member</h2>
            <p className="text-sm text-slate-400 mb-4">For: <span className="text-slate-700 font-medium">{sel.service?.name}</span></p>
            <div className="space-y-2">
              {staffForService.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No staff available for this service</p>
              ) : staffForService.map(s => (
                <button key={s.id} onClick={() => { setSel(p => ({ ...p, staff: s })); setStep('slot'); }}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-[#0B5ED7] hover:shadow-sm transition text-left">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-[#0B5ED7] flex-shrink-0">
                    {s.name[0]?.toUpperCase()}
                  </div>
                  <p className="font-semibold text-slate-900">{s.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Slot */}
        {step === 'slot' && (
          <div>
            <button onClick={() => setStep('staff')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition"><ChevronLeft size={14} /> Back</button>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Pick a date & time</h2>
            <p className="text-sm text-slate-400 mb-4">With <span className="text-slate-700 font-medium">{sel.staff?.name}</span></p>

            <input type="date" value={sel.date} min={format(new Date(), 'yyyy-MM-dd')}
              onChange={e => setSel(p => ({ ...p, date: e.target.value, slot: '' }))}
              className="w-full mb-4 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />

            {slotsLoading ? <div className="flex justify-center py-8"><Spinner /></div> : slots.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No availability on this day. Try another date.</p>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {slots.map(slot => (
                    <button key={slot} onClick={() => setSel(p => ({ ...p, slot }))}
                      className={clsx('py-2.5 text-sm rounded-xl border font-medium transition',
                        sel.slot === slot ? 'bg-[#0B5ED7] text-white border-[#0B5ED7]' : 'bg-white border-slate-200 text-slate-700 hover:border-[#0B5ED7] hover:text-[#0B5ED7]')}>
                      {format(new Date(slot), 'HH:mm')}
                    </button>
                  ))}
                </div>
                <Button className="w-full" disabled={!sel.slot} onClick={() => setStep('details')}>Continue</Button>
              </>
            )}
          </div>
        )}

        {/* Step: Details */}
        {step === 'details' && (
          <div>
            <button onClick={() => setStep('slot')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition"><ChevronLeft size={14} /> Back</button>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Your details</h2>

            {/* Summary */}
            <div className="bg-blue-50 rounded-xl p-4 mb-5 text-sm">
              <div className="flex justify-between mb-1"><span className="text-slate-500">Service</span><span className="font-medium text-slate-800">{sel.service?.name}</span></div>
              <div className="flex justify-between mb-1"><span className="text-slate-500">Staff</span><span className="font-medium text-slate-800">{sel.staff?.name}</span></div>
              <div className="flex justify-between mb-1"><span className="text-slate-500">Date</span><span className="font-medium text-slate-800">{format(new Date(sel.slot), 'EEEE, d MMMM')}</span></div>
              <div className="flex justify-between mb-1"><span className="text-slate-500">Time</span><span className="font-medium text-slate-800">{format(new Date(sel.slot), 'HH:mm')}</span></div>
              <div className="flex justify-between pt-2 border-t border-blue-100 mt-2"><span className="text-slate-500">Price</span><span className="font-bold text-[#0B5ED7]">{parseFloat(sel.service?.price || 0).toFixed(3)} OMR</span></div>
            </div>

            <div className="space-y-3">
              <input value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))} placeholder="Your full name *"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number * (e.g. +968 9123 4567)"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={customer.email} onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))} placeholder="Email address (optional)"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea value={customer.notes} onChange={e => setCustomer(p => ({ ...p, notes: e.target.value }))} placeholder="Any special requests? (optional)" rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <Button className="w-full mt-4" loading={submitting} onClick={submit}>Confirm booking</Button>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && confirmation && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking confirmed!</h2>
            <p className="text-slate-500 mb-6">We'll send you a WhatsApp confirmation shortly.</p>
            <div className="bg-slate-50 rounded-xl p-5 text-left text-sm space-y-2 mb-6">
              <div className="flex justify-between"><span className="text-slate-400">Service</span><span className="font-medium">{confirmation.service_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Date & time</span><span className="font-medium">{format(new Date(confirmation.start_time), 'EEEE d MMM · HH:mm')}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Booking ID</span><span className="font-mono text-xs text-slate-500">{confirmation.booking_id.slice(0, 8)}</span></div>
            </div>
            <button onClick={() => { setStep('service'); setSel({ service: null, staff: null, slot: '', date: format(new Date(), 'yyyy-MM-dd') }); setCustomer({ name: '', phone: '', email: '', notes: '' }); }}
              className="text-sm text-[#0B5ED7] hover:underline">Book another appointment</button>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10 px-4">
      {children}
      <div className="flex items-center justify-center gap-1.5 mt-10 text-xs text-slate-300">
        <Zap size={11} /> Powered by SalonCRM
      </div>
    </div>
  );
}
