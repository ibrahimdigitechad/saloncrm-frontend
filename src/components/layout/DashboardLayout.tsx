'use client';
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const NAV_SECTIONS = [
  {
    label: 'MAIN MENU',
    items: [
      { href: '/dashboard',           label: 'Dashboard',  icon: IconGrid },
      { href: '/dashboard/bookings',  label: 'Bookings',   icon: IconCalendar },
      { href: '/dashboard/customers', label: 'Customers',  icon: IconUsers },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { href: '/dashboard/staff',     label: 'Staff',      icon: IconPerson },
      { href: '/dashboard/services',  label: 'Services',   icon: IconScissors },
      { href: '/dashboard/analytics', label: 'Analytics',  icon: IconChart },
      { href: '/dashboard/settings',  label: 'Settings',   icon: IconSettings },
    ],
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [search, setSearch] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SA';

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F5F4F0', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflow: 'hidden' }}>
      <aside style={{ width: 220, minWidth: 220, background: '#FFF', borderRight: '1px solid #EBEBEB', display: 'flex', flexDirection: 'column', padding: '22px 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 18px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: '#1A1A1A', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconScissorsWhite />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A', margin: 0, lineHeight: 1.3, letterSpacing: '-0.3px' }}>SalonCRM</p>
            <p style={{ fontSize: 11, color: '#AAAAAA', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
              {user?.business_name || user?.email || ''}
            </p>
          </div>
        </div>

        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#BBBBBB', letterSpacing: '0.8px', padding: '0 18px', marginBottom: 4 }}>
              {section.label}
            </p>
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', margin: '1px 8px', borderRadius: 8, background: active ? '#1A1A1A' : 'transparent', color: active ? '#FFF' : '#666', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.12s' }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = '#F5F4F0'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  >
                    <Icon active={active} />
                    {label}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop: 'auto', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderTop: '1px solid #F0F0F0', paddingTop: 12, marginBottom: 2 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#C8A882,#8B6B4A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Admin'}</p>
              <p style={{ fontSize: 10, color: '#AAAAAA', margin: 0, textTransform: 'capitalize' }}>{user?.role || 'admin'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#E05252', fontSize: 13, fontFamily: 'inherit', transition: 'background 0.12s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <IconLogout />
            Sign out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header style={{ height: 60, background: '#FFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14, flexShrink: 0 }}>
          <div style={{ flex: 1, maxWidth: 360, display: 'flex', alignItems: 'center', background: '#F5F4F0', borderRadius: 10, padding: '0 12px', gap: 9, height: 36 }}>
            <IconSearch />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients, bookings..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#333', width: '100%', fontFamily: 'inherit' }} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F5F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <IconBell />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#C8A882,#8B6B4A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 12, fontWeight: 700 }}>
                {initials}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0, lineHeight: 1.3 }}>{user?.name || 'Admin'}</p>
                <p style={{ fontSize: 10, color: '#AAAAAA', margin: 0, textTransform: 'capitalize' }}>{user?.role || 'Administrator'}</p>
              </div>
            </div>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>{children}</main>
      </div>
    </div>
  );
}

function IconGrid({ active }: { active?: boolean }) {
  const c = active ? '#FFF' : '#888';
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><rect x="1" y="1" width="6" height="6" rx="1.5" fill={c}/><rect x="9" y="1" width="6" height="6" rx="1.5" fill={c}/><rect x="1" y="9" width="6" height="6" rx="1.5" fill={c}/><rect x="9" y="9" width="6" height="6" rx="1.5" fill={c}/></svg>;
}
function IconCalendar({ active }: { active?: boolean }) {
  const c = active ? '#FFF' : '#888';
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><rect x="1.5" y="3" width="13" height="11" rx="2" stroke={c} strokeWidth="1.4"/><path d="M5 1.5V4M11 1.5V4M1.5 6.5H14.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function IconUsers({ active }: { active?: boolean }) {
  const c = active ? '#FFF' : '#888';
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="6" cy="5" r="2.5" stroke={c} strokeWidth="1.4"/><path d="M1 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M11 7c1.105 0 2 .895 2 2M13 13c0-1.657-1.343-3-3-3" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function IconPerson({ active }: { active?: boolean }) {
  const c = active ? '#FFF' : '#888';
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="8" cy="5" r="3" stroke={c} strokeWidth="1.4"/><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function IconScissors({ active }: { active?: boolean }) {
  const c = active ? '#FFF' : '#888';
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="4" cy="4" r="2" stroke={c} strokeWidth="1.4"/><circle cx="4" cy="12" r="2" stroke={c} strokeWidth="1.4"/><path d="M5.5 5.5L14 14M5.5 10.5L14 2" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function IconChart({ active }: { active?: boolean }) {
  const c = active ? '#FFF' : '#888';
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M2 12L6 7L9 10L14 4" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IconSettings({ active }: { active?: boolean }) {
  const c = active ? '#FFF' : '#888';
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="8" cy="8" r="2.5" stroke={c} strokeWidth="1.4"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function IconScissorsWhite() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="4" r="2" stroke="#FFF" strokeWidth="1.5"/><circle cx="4" cy="12" r="2" stroke="#FFF" strokeWidth="1.5"/><path d="M5.5 5.5L14 14M5.5 10.5L14 2" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IconLogout() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="#E05252" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IconSearch() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#BBBBBB" strokeWidth="1.4"/><path d="M11 11L14.5 14.5" stroke="#BBBBBB" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function IconBell() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4.5 4.5 0 003.5 6v3l-1.5 2H14l-1.5-2V6A4.5 4.5 0 008 1.5z" stroke="#777" strokeWidth="1.4" strokeLinejoin="round"/><path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="#777" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
