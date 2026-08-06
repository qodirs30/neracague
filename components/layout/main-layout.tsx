'use client'

import { BottomNav } from './bottom-nav'
import { TopNav } from './top-nav'

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function MainLayout({ children, sidebar }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation (Desktop only) */}
      <div className="hidden md:block">
        <TopNav />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Desktop: 2-column layout */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-6 md:p-6">
          <div className={sidebar ? 'md:col-span-2' : 'md:col-span-3'}>
            {children}
          </div>
          {sidebar && (
            <div className="md:col-span-1 sticky top-24 h-fit">
              {sidebar}
            </div>
          )}
        </div>

        {/* Mobile: Single column with bottom nav */}
        <div className="md:hidden pb-20">
          {children}
        </div>
      </div>

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav />
    </div>
  )
}
