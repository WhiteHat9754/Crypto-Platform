// ✅ src/components/Layout/Layout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Menubar from './Menubar';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ✅ Sticky menubar */}
      <Menubar />

      {/* ✅ Main content — adds padding so it doesn’t slide under the fixed navbar */}
      <main className="flex-1 pt-20 bg-white">
        <Outlet />
      </main>
    </div>
  );
}
