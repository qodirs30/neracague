'use client'

import { useState } from 'react'

interface HeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title = 'neracague', subtitle, action }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0 ml-4">{action}</div>}
      </div>
    </header>
  )
}
