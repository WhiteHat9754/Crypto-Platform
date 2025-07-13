// src/components/Layout.tsx

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  // ✅ State to control sidebar open/close on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* ✅ Mobile hamburger toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 z-50 p-2 rounded bg-yellow-400 md:hidden"
      >
        <svg
          className="w-6 h-6 text-black"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* ✅ Sidebar now takes isOpen prop */}
      <Sidebar isOpen={sidebarOpen} />

      <main className="flex-1 min-h-screen main-wrapper">
        <Outlet />
      </main>
    </div>
  );
}
