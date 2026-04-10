'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navSections = [
  {
    label: 'MAIN MENU',
    items: [
      { href: '/dashboard', icon: GridIcon, label: 'Dashboard' },
      { href: '/bookings', icon: CalendarIcon, label: 'Bookings' },
      { href: '/customers', icon: UsersIcon, label: 'Customers' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { href: '/staff', icon: PersonIcon, label: 'Staff' },
      { href: '/services', icon: ScissorsIcon, label: 'Services' },
      { href: '/analytics', icon: ChartIcon, label: 'Analytics' },
    ],
  },
  {
    label: 'OTHER',
    items: [
      { href: '/settings', icon: SettingsIcon, label: 'Settings' },
      { href: '/help', icon: HelpIcon, label: 'Help Center' },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [search, setSearch] = useState('');

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F5F4F0', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        minWidth: 220,
        background: '#FFFFFF',
        borderRight: '1px solid #EBEBEB',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, background: '#1A1A1A', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ScissorsSmallIcon />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px', color: '#1A1A1A' }}>SalonCRM</span>
        </div>

        {/* Nav */}
        {navSections.map((section) => (
          <div key={section.label} style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#AAAAAA', letterSpacing: '0.8px', padding: '0 20px', marginBottom: 6 }}>
              {section.label}
            </p>
            {section.items.map(({ href, icon: Icon, label }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 20px', margin: '2px 10px', borderRadius: 8,
                    background: active ? '#1A1A1A' : 'transparent',
                    color: active ? '#FFFFFF' : '#555555',
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <Icon active={active} />
                    {label}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Logout */}
        <div style={{ marginTop: 'auto', padding: '0 10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 20px', borderRadius: 8, cursor: 'pointer',
            color: '#E05252', fontSize: 13,
          }}>
            <LogoutIcon />
            Log Out
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 64, background: '#FFFFFF', borderBottom: '1px solid #EBEBEB',
          display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16,
        }}>
          <div style={{
            flex: 1, maxWidth: 380, display: 'flex', alignItems: 'center',
            background: '#F5F4F0', borderRadius: 10, padding: '0 14px', gap: 10, height: 38,
          }}>
            <SearchIcon />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients, bookings..."
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                fontSize: 13, color: '#333', width: '100%',
              }}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: '#F5F4F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <BellIcon />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 50%, background: 'linear-gradient(135deg, #C8A882, #8B6B4A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFF', fontSize: 13, fontWeight: 600,
              }}>
                SA
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0, lineHeight: 1.3 }}>Salon Admin</p>
                <p style={{ fontSize: 11, color: '#AAAAAA', margin: 0 }}>Administrator</p>
              </div>
              <ChevronIcon />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ---- Icons ----
function GridIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill={active ? '#FFF' : '#888'} />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill={active ? '#FFF' : '#888'} />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill={active ? '#FFF' : '#888'} />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill={active ? '#FFF' : '#888'} />
    </svg>
  );
}
function CalendarIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3" width="13" height="11" rx="2" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" />
      <path d="M5 1.5V4M11 1.5V4M1.5 6.5H14.5" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function UsersIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" />
      <path d="M1 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 7c1.105 0 2 .895 2 2M13 13c0-1.657-1.343-3-3-3" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function PersonIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" />
      <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function ScissorsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="4" cy="4" r="2" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" />
      <circle cx="4" cy="12" r="2" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" />
      <path d="M5.5 5.5L14 14M5.5 10.5L14 2" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function ChartIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12L6 7L9 10L14 4" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SettingsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function HelpIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" />
      <path d="M6 6c0-1.105.895-2 2-2s2 .895 2 2c0 1.333-2 2-2 2v1M8 12v.5" stroke={active ? '#FFF' : '#888'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="#E05252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ScissorsSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="4" cy="4" r="2" stroke="#FFF" strokeWidth="1.5" />
      <circle cx="4" cy="12" r="2" stroke="#FFF" strokeWidth="1.5" />
      <path d="M5.5 5.5L14 14M5.5 10.5L14 2" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="#AAAAAA" strokeWidth="1.5" />
      <path d="M11 11L14.5 14.5" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5A4.5 4.5 0 003.5 6v3l-1.5 2H14l-1.5-2V6A4.5 4.5 0 008 1.5z" stroke="#555" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}