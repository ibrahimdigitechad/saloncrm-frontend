'use client';
import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

// ── Button ────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}
export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:   'bg-[#1A1A1A] text-white hover:bg-[#333] focus:ring-gray-500',
    secondary: 'bg-white text-[#1A1A1A] border border-[#E8E8E8] hover:bg-[#F5F4F0] focus:ring-gray-300',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
    ghost:     'text-[#555] hover:bg-[#F5F4F0] focus:ring-gray-300',
  };
  const sizes = { sm: 'text-xs px-3 py-1.5 gap-1.5', md: 'text-sm px-4 py-2 gap-2', lg: 'text-sm px-5 py-2.5 gap-2' };
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{label}</label>}
    <input
      ref={ref}
      className={clsx(
        'w-full rounded-xl border px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent transition',
        error ? 'border-red-400 bg-red-50' : 'border-[#E8E8E8] bg-white hover:border-[#BBBBBB]',
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    {hint && !error && <p className="mt-1 text-xs text-[#AAAAAA]">{hint}</p>}
  </div>
));
Input.displayName = 'Input';

// ── Select ────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{label}</label>}
    <select
      ref={ref}
      className={clsx(
        'w-full rounded-xl border px-3 py-2 text-sm text-[#1A1A1A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent transition',
        error ? 'border-red-400' : 'border-[#E8E8E8] hover:border-[#BBBBBB]',
        className
      )}
      {...props}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
Select.displayName = 'Select';

// ── Textarea ──────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{label}</label>}
    <textarea
      ref={ref}
      className={clsx(
        'w-full rounded-xl border px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent transition resize-none',
        error ? 'border-red-400 bg-red-50' : 'border-[#E8E8E8] bg-white hover:border-[#BBBBBB]',
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

// ── Badge ─────────────────────────────────────────────────
type BadgeVariant = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'vip' | 'regular' | 'new' | 'at-risk' | 'default';

const badgeStyles: Record<BadgeVariant, string> = {
  pending:   'bg-[#FFF8E0] text-[#A07800]',
  confirmed: 'bg-[#E8F8EE] text-[#2E8B57]',
  completed: 'bg-[#E8F0FF] text-[#3355CC]',
  cancelled: 'bg-[#FEECEC] text-[#C84444]',
  'no-show': 'bg-[#FFF0E8] text-[#C86400]',
  vip:       'bg-[#EDE8FF] text-[#6B44C8]',
  regular:   'bg-[#F0F0F0] text-[#666]',
  new:       'bg-[#E8F8EE] text-[#2E8B57]',
  'at-risk': 'bg-[#FFF3E8] text-[#C87800]',
  default:   'bg-[#F0F0F0] text-[#666]',
};

export function Badge({ label, variant, className }: { label: string; variant?: BadgeVariant; className?: string }) {
  const key = (variant || label?.toLowerCase()) as BadgeVariant;
  const style = badgeStyles[key] || badgeStyles.default;
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold capitalize', style, className)}>
      {label}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={clsx('relative bg-white rounded-2xl shadow-xl w-full', widths[size])} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F0]">
          <h3 className="font-semibold text-[#1A1A1A]">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#AAAAAA] hover:text-[#1A1A1A] hover:bg-[#F5F4F0] transition">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-white rounded-2xl border border-[#EBEBEB]', className)}>
      {children}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────
const statBgs: Record<string, { bg: string; accent: string }> = {
  blue:   { bg: '#EAF0FF', accent: '#7B9EF0' },
  green:  { bg: '#E8F8EE', accent: '#5EC481' },
  purple: { bg: '#EDE8FF', accent: '#9B7EE8' },
  amber:  { bg: '#FFF3E8', accent: '#E8A86A' },
};

export function StatCard({ label, value, sub, icon: Icon, color = 'blue' }: {
  label: string; value: string | number; sub?: string; icon?: React.ComponentType<{ size?: number; className?: string }>; color?: string;
}) {
  const { bg, accent } = statBgs[color] || statBgs.blue;
  return (
    <div style={{ background: bg, borderRadius: 16, padding: '18px 18px 14px', position: 'relative', overflow: 'hidden' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#888', letterSpacing: '0.6px', margin: '0 0 8px', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#888', margin: '0 0 10px' }}>{sub}</p>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }: {
  icon?: React.ComponentType<{ size?: number; className?: string }>; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-12 h-12 bg-[#F5F4F0] rounded-2xl flex items-center justify-center mb-4">
          <Icon size={24} className="text-[#AAAAAA]" />
        </div>
      )}
      <p className="font-semibold text-[#1A1A1A]">{title}</p>
      {description && <p className="text-sm text-[#AAAAAA] mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Loading spinner ───────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return <div className={clsx('border-2 border-[#E8E8E8] border-t-[#1A1A1A] rounded-full animate-spin', sizes[size])} />;
}
