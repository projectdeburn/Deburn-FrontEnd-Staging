/**
 * Layout Component
 * Main app layout with sidebar and header
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
