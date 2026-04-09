'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';
import { api, setTokens, saveUser } from '@/lib/api';
import { Button, Input } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ business_name: '', slug: '', owner_name: '', owner_email: '', password: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setField(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }));
    if (k === 'business_name' && !form.slug) {
      const auto = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setForm(p => ({ ...p, slug: auto }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const { data } = await api.post('/auth/register-tenant', form);
      setTokens(data.access_token, data.refresh_token);
      saveUser(data.user);
      toast.success('Business registered! Welcome to SalonCRM.');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Registration failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#0B5ED7] rounded-xl flex items-center justify-center shadow-md"><Zap size={20} className="text-white" /></div>
          <div><h1 className="text-xl font-bold text-slate-900">SalonCRM</h1><p className="text-xs text-slate-400">Booking & CRM Platform</p></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Register your business</h2>
          <p className="text-sm text-slate-500 mb-6">Get started in under 2 minutes</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Business name" placeholder="Ahmad's Barber" value={form.business_name} onChange={e => setField('business_name', e.target.value)} required />
              <Input label="URL slug" placeholder="ahmads-barber" value={form.slug} onChange={e => setField('slug', e.target.value)} hint="yourapp.com/book/slug" required />
            </div>
            <Input label="Your name" placeholder="Ahmad Al-Rashidi" value={form.owner_name} onChange={e => setField('owner_name', e.target.value)} required />
            <Input label="Email" type="email" placeholder="ahmad@salon.com" value={form.owner_email} onChange={e => setField('owner_email', e.target.value)} required />
            <Input label="Phone (optional)" placeholder="+968 9123 4567" value={form.phone} onChange={e => setField('phone', e.target.value)} />
            <Input label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setField('password', e.target.value)} required />
            <Button type="submit" className="w-full" loading={loading}>Create account</Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already registered? <Link href="/login" className="text-[#0B5ED7] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
