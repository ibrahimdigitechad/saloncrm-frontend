'use client';
import { ButtonHTMLAttributes, InputHTMLAttributes, HTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

export function Button({ className = '', variant = 'primary', size = 'md', loading, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; size?: 'sm' | 'md' | 'lg'; loading?: boolean }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = { primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500', secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-blue-500', danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500', ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-500' };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>{loading ? <span className="animate-spin mr-2">⏳</span> : null}{children}</button>;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string }>(({ label, error, hint, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <input ref={ref} className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-slate-300'} ${className}`} {...props} />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
  </div>
));
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }>(({ label, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <textarea ref={ref} className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-slate-300'} ${className}`} {...props} />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }>(({ label, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <select ref={ref} className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-slate-300'} ${className}`} {...props} />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
Select.displayName = 'Select';

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`} {...props}>{children}</div>;
}

export function Badge({ className = '', variant = 'default', children }: HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const variants = { default: 'bg-slate-100 text-slate-700', success: 'bg-green-100 text-green-700', warning: 'bg-yellow-100 text-yellow-700', danger: 'bg-red-100 text-red-700' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>;
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return <svg className={`animate-spin text-blue-600 ${sizes[size]}`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>;
}

export function StatCard({ title, label, value, icon: Icon, sub, trend, color, className = '' }: { title?: string; label?: string; value: string | number; icon?: any; sub?: string; trend?: string; color?: string; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-500">{label || title}</p>
        {Icon && <div className="text-blue-600"><Icon size={20} /></div>}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      {(sub || trend) && <p className="text-xs text-slate-400 mt-1">{sub || trend}</p>}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-4">📭</div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}/>
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {title && <h2 className="text-lg font-semibold text-slate-800 mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
}