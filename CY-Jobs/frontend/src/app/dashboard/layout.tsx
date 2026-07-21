"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users2, 
  Settings, 
  Menu, 
  X, 
  Bell, 
  LogOut 
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Jobs Matching", href: "/dashboard", icon: Briefcase },
    { name: "Candidates", href: "/dashboard", icon: Users2 },
    { name: "Settings", href: "/dashboard", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8F8] flex flex-col md:flex-row font-sans text-[#364153]">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E5E5E5]/50 flex-shrink-0 shadow-sm">
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-[#E5E5E5]/50 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1976D2] to-[#0098B6] flex items-center justify-center text-white font-black text-sm">
              CY
            </div>
            <span className="font-bold text-lg tracking-tight text-[#364153]">CY-Jobs</span>
          </Link>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            // Highlighting active states
            const isActive = idx === 0; // Temporary indicator
            return (
              <Link 
                key={idx}
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? "bg-blue-50 text-[#1976D2]" 
                    : "text-[#6A7282] hover:bg-zinc-50 hover:text-[#364153]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#1976D2]" : "text-[#6A7282]"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Nav */}
        <div className="p-4 border-t border-[#E5E5E5]/50">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="md:hidden h-16 bg-white border-b border-[#E5E5E5]/50 flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-[#364153]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-base text-[#364153]">CY-Jobs</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded-lg hover:bg-zinc-100 text-[#6A7282] relative">
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#1976D2]/10 border border-[#1976D2]/20 flex items-center justify-center text-[#1976D2] font-bold text-sm">
            C
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <div className="relative flex flex-col w-64 bg-white h-full max-w-xs shadow-2xl p-4 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
              <span className="font-bold text-lg text-[#364153]">Navigation</span>
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1.5">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = idx === 0;
                return (
                  <Link 
                    key={idx}
                    href={item.href} 
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? "bg-blue-50 text-[#1976D2]" 
                        : "text-[#6A7282] hover:bg-zinc-50 hover:text-[#364153]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-[#E5E5E5]">
              <Link 
                href="/" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex h-20 bg-white border-b border-[#E5E5E5]/50 items-center justify-between px-8">
          <h2 className="text-xl font-bold text-[#364153]">Overview</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl hover:bg-zinc-50 border border-[#E5E5E5]/40 text-[#6A7282] relative transition-all shadow-sm">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1976D2]/10 border border-[#1976D2]/20 flex items-center justify-center text-[#1976D2] font-black text-sm">
                C
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#364153]">Candidate Account</p>
                <p className="text-xs text-[#6A7282]">candidate@example.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
