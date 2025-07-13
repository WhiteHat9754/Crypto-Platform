// src/components/Layout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Menubar from './Menubar';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ✅ Menubar at the top */}
      <Menubar />

      {/* ✅ Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
