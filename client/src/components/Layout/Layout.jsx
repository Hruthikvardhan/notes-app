import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useNotes } from '../../hooks/useNotes';

const Layout = () => {
  const [view, setView] = useState('grid');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { fetchCategories } = useNotes();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="flex min-h-screen bg-paper dark:bg-surface-dark">
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 min-w-0">
        <Topbar view={view} setView={setView} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="p-3 sm:p-4">
          <Outlet context={{ view }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
