'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { registerPush, unregisterPush, getPushState } from '@/lib/push'

interface Detection {
  id: string
  event_id: string
  captured_at: string
  egg_cluster_count: number
  photo_url: string | null
  platform: string | null
}

interface Alert {
  id: string
  detection_id: string
  reviewed_at: string | null
  created_at: string
  detection: Detection
}

interface Props { session: Session }

export default function AlertsPage({ session }: Props) {
  const [alerts, setAlerts]         = useState<Alert[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [pushState, setPushState]   = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default')
  const [pushLoading, setPushLoading] = useState(false)
  const [filter, setFilter]         = useState<'all' | 'unread'>('unread')

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('alerts')
        .select(`
          id, detection_id, reviewed_at, created_at,
          detection:snaildetections ( id, event_id, captured_at, egg_cluster_count, photo_url, platform )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(200)
      if (err) throw err
      setAlerts((data as any) || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }, [session.user.id])

  useEffect(() => {
    fetchAlerts()
    getPushState().then(setPushState)

    // Realtime subscription — new alerts appear instantly
    const channel = supabase
      .channel('alerts-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
        filter: `user_id=eq.${session.user.id}`,
      }, () => fetchAlerts())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchAlerts, session.user.id])

  async function handlePushToggle() {
    setPushLoading(true)
    if (pushState === 'granted') {
      await unregisterPush()
      setPushState('default')
    } else {
      const ok = await registerPush(session.user.id)
      setPushState(ok ? 'granted' : 'denied')
    }
    setPushLoading(false)
  }

  async function markReviewed(alertId: string) {
    await supabase
      .from('alerts')
      .update({ reviewed_at: new Date().toISOString() })
      .eq('id', alertId)
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, reviewed_at: new Date().toISOString() } : a
    ))
  }

  async function markAllReviewed() {
    const unread = alerts.filter(a => !a.reviewed_at).map(a => a.id)
    if (!unread.length) return
    await supabase
      .from('alerts')
      .update({ reviewed_at: new Date().toISOString() })
      .in('id', unread)
    setAlerts(prev => prev.map(a => ({ ...a, reviewed_at: a.reviewed_at ?? new Date().toISOString() })))
  }

  const filtered  = filter === 'unread' ? alerts.filter(a => !a.reviewed_at) : alerts
  const unreadCount = alerts.filter(a => !a.reviewed_at).length

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-[#f0f0f0]">Alerts</h1>
          <p className="text-xs text-[#444] mt-0.5">Egg detection events that need your attention</p>
        </div>

        {/* Push toggle */}
        <div className="flex items-center gap-3">
          {pushState === 'unsupported' ? (
            <span className="text-xs text-[#444]">Push not supported in this browser</span>
          ) : pushState === 'denied' ? (
            <span className="text-xs text-[#f87171]">Notifications blocked — enable in browser settings</span>
          ) : (
            <button
              onClick={handlePushToggle}
              disabled={pushLoading}
              className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                pushState === 'granted'
                  ? 'bg-[#0d1a0d] border-[#1a3d1a] text-[#4ade80] hover:bg-[#0d220d]'
                  : 'bg-[#111] border-[#222] text-[#666] hover:text-[#aaa]'
              } disabled:opacity-50`}
            >
              {pushLoading ? (
                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{pushState === 'granted' ? '🔔' : '🔕'}</span>
              )}
              {pushState === 'granted' ? 'Notifications on' : 'Enable notifications'}
            </button>
          )}
        </div>
      </div>

      {/* Summary + filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {[
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'all',    label: `All (${alerts.length})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${
                filter === f.id
                  ? 'bg-[#1a1a2e] border-[#3d3d7a] text-accent-light'
                  : 'bg-transparent border-[#222] text-[#555] hover:text-[#888]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllReviewed}
            className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors"
          >
            Mark all as reviewed
          </button>
        )}
      </div>

      {/* Alert list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-[#333] border-t-accent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-[#f87171] text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-3xl">🔔</div>
          <div className="text-[#444] text-sm">
            {filter === 'unread' ? 'All caught up — no unread alerts' : 'No alerts yet'}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(alert => (
            <div
              key={alert.id}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${
                alert.reviewed_at
                  ? 'bg-[#0a0a0a] border-[#111]'
                  : 'bg-[#0d0a0a] border-[#2a1515]'
              }`}
            >
              {/* Unread dot */}
              <div className="w-2 flex-shrink-0 flex justify-center">
                {!alert.reviewed_at && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
                )}
              </div>

              {/* Thumbnail */}
              {alert.detection?.photo_url ? (
                <div className="relative w-12 h-9 rounded-lg overflow-hidden border border-[#222] flex-shrink-0">
                  <Image src={alert.detection.photo_url} alt="detection" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-12 h-9 rounded-lg bg-[#111] border border-[#1a1a1a] flex items-center justify-center text-lg flex-shrink-0">
                  🥚
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#ddd] font-medium">
                  🥚 {alert.detection?.egg_cluster_count} egg cluster{alert.detection?.egg_cluster_count !== 1 ? 's' : ''} detected
                </div>
                <div className="text-[10px] text-[#444] mt-0.5 font-mono">
                  {formatTimestamp(alert.created_at)}
                  {alert.detection?.platform && ` · ${alert.detection.platform}`}
                </div>
              </div>

              {/* Action */}
              {!alert.reviewed_at ? (
                <button
                  onClick={() => markReviewed(alert.id)}
                  className="text-[11px] px-3 py-1 rounded-lg bg-[#111] border border-[#222] text-[#666] hover:text-[#ccc] hover:border-[#333] transition-all flex-shrink-0"
                >
                  Mark reviewed
                </button>
              ) : (
                <span className="text-[10px] text-[#333] flex-shrink-0">Reviewed</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatTimestamp(raw: string): string {
  try {
    return new Date(raw).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
  } catch { return raw }
}