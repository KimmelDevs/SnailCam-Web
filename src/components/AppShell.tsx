'use client'
import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import Dashboard from './Dashboard'
import LogsPage from './LogsPage'
import AlertsPage from './AlertsPage'
import ProfilePanel from './ProfilePanel'
import { supabase } from '@/lib/supabaseClient'

type Tab = 'dashboard' | 'logs' | 'alerts' | 'profile'

interface Props {
  session: Session
  onLogout: () => void
}

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'logs',      icon: '📋', label: 'Logs' },
  { id: 'alerts',    icon: '🔔', label: 'Alerts' },
  { id: 'profile',   icon: '👤', label: 'Profile' },
]

export default function AppShell({ session, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [unreadAlerts, setUnreadAlerts] = useState(0)

  useEffect(() => {
    // Fetch initial unread count
    supabase
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .is('reviewed_at', null)
      .then(({ count }) => setUnreadAlerts(count ?? 0))

    // Live updates
    const channel = supabase
      .channel('alerts-badge')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'alerts',
        filter: `user_id=eq.${session.user.id}`,
      }, () => {
        supabase
          .from('alerts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .is('reviewed_at', null)
          .then(({ count }) => setUnreadAlerts(count ?? 0))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session.user.id])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  const name: string = (session.user.user_metadata?.full_name as string) || session.user.email || 'Tracker'
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')

  return (
    <div className="flex min-h-screen bg-bg text-white">
      {/* SIDEBAR */}
      <aside className="w-52 bg-[#0a0a0a] border-r border-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
          <div className="w-7 h-7 bg-[#1a1a2e] border border-[#3d3d7a] rounded-lg flex items-center justify-center text-sm">🥚</div>
          <span className="text-sm font-medium text-white tracking-tight">SnailEggs</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-left w-full ${
                tab === item.id
                  ? 'bg-[#1a1a2e] text-accent-light'
                  : 'text-[#555] hover:bg-[#111] hover:text-[#aaa]'
              }`}
            >
              <span className="w-4 text-center text-sm">{item.icon}</span>
              {item.label}
              {item.id === 'alerts' && unreadAlerts > 0 && (
                <span className="ml-auto text-[10px] bg-[#f87171] text-black font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {unreadAlerts > 99 ? '99+' : unreadAlerts}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-border px-3 py-3">
          <button
            onClick={() => setTab('profile')}
            className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-[#111] transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-[#1e1e3a] border border-[#3d3d7a] flex items-center justify-center text-xs font-bold text-accent-light flex-shrink-0">
              {initials || '?'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-medium text-[#ccc] truncate">{name}</div>
              <div className="text-[10px] text-[#444] truncate">{session.user.email}</div>
            </div>
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {tab === 'dashboard' && <Dashboard session={session} />}
        {tab === 'logs'      && <LogsPage session={session} />}
        {tab === 'alerts'    && <AlertsPage session={session} />}
        {tab === 'profile'   && <ProfilePanel session={session} onLogout={handleLogout} />}
      </main>
    </div>
  )
}