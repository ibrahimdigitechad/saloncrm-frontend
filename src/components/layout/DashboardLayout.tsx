'use client';
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Calendar, Users, UserCheck, Scissors, BarChart2, Settings, LogOut, Menu, X, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const NAV = [
  { href: '/dashboard',           label: 'Dashboard',  icon: BarChart2 },
  { href: '/dashboard/bookings',  label: 'Bookings',   icon: Calendar },
  { href: '/dashboard/customers', label: 'Customers',  icon: Users },
  { href: '/dashboard/staff',     label: 'Staff',      icon: UserCheck },
  { href: '/dashboard/services',  label: 'Services',   icon: Scissors },
  { href: '/dashboard/analytics', label: 'Analytics',  icon: BarChart2 },
  { href: '/dashboard/settings',  label: 'Settings',   icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed lg:static inset-y-0 left-0 z-30 w-60 bg-white border-r border-slate-100 flex flex-col transition-transform duration-200',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0B5ED7] rounded-lg flex items-center justify-center"><Zap size={16} className="text-white" /></div>
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">SalonCRM</p>
              <p className="text-xs text-slate-400 truncate max-w-[130px]">{user?.business_name || user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={clsx('flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group', active ? 'bg-blue-50 text-[#0B5ED7] font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}>
                <Icon size={16} className={active ? 'text-[#0B5ED7]' : 'text-slate-400 group-hover:text-slate-600'} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-[#0B5ED7]" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-[#0B5ED7]">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"><Menu size={20} /></button>
          <span className="font-semibold text-slate-900">SalonCRM</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
