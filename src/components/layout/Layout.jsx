/**
 * Layout Component
 * Main app layout with sidebar and header
 */

import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

// Mobile nav icons
const mobileNavIcons = {
  dashboard: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  ),
  checkin: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path>
    </svg>
  ),
  coach: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),
  learning: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  ),
  circles: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  feedback: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  admin: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ),
};

const mobileNavItems = [
  { key: 'dashboard', path: '/', labelKey: 'common:nav.dashboard', label: 'Home' },
  { key: 'checkin', path: '/checkin', labelKey: 'common:nav.checkin', label: 'Check-in' },
  { key: 'coach', path: '/coach', labelKey: 'common:nav.coach', label: 'Eve' },
  { key: 'learning', path: '/learning', labelKey: 'common:nav.learning', label: 'Learn' },
  { key: 'circles', path: '/circles', labelKey: 'common:nav.circles', label: 'Circles' },
  { key: 'feedback', path: '/feedback', labelKey: 'common:nav.feedback', label: 'Feedback' },
];

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.isHubAdmin || user?.isOrgAdmin;

  return (
    <div className="screen active">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content area */}
      <main className="main-content">
        {/* Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Page content */}
        <div className="content-area">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="mobile-nav">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/'}
          >
            {mobileNavIcons[item.key]}
            <span>{t(item.labelKey, item.label)}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/circles/admin"
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            {mobileNavIcons.admin}
            <span>{t('common:nav.admin', 'Admin')}</span>
          </NavLink>
        )}
      </nav>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Auth Layout - For login/register pages (no sidebar)
 * Pages handle their own full-screen layout with .auth-screen class
 */
export function AuthLayout() {
  return <Outlet />;
}

/**
 * Hub Layout - For hub admin pages
 */
export function HubLayout() {
  return (
    <div className="hub-page">
      <Outlet />
    </div>
  );
}
