'use client'
import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface Props {
  session: Session
  onLogout: () => void
}

interface Stats {
  total: number
  withEggs: number
  lastScan: string | null
}

export default function ProfilePanel({ session, onLogout }: Props) {
  const user = session.user
  const rawName: string = (user.user_metadata?.full_name as string) || ''

  const [name, setName]         = useState(rawName)
  const [editName, setEditName] = useState(rawName)
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saveMsg, setSaveMsg]   = useState<string | null>(null)
  const [stats, setStats]       = useState<Stats | null>(null)
  const [showLogout, setShowLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?'
  const joined = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const { data } = await supabase
        .from('snaildetections')
        .select('egg_cluster_count, captured_at')
        .order('captured_at', { ascending: false })

      if (data) {
        setStats({
          total:    data.length,
          withEggs: data.filter(d => d.egg_cluster_count > 0).length,
          lastScan: data[0]?.captured_at || null,
        })
      }
    } catch {}
  }

  async function saveName() {
    if (!editName.trim()) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: editName.trim() }
      })
      if (error) throw error

      // Also update snailtrackers table if it exists
      await supabase.from('snailtrackers').upsert({ id: user.id, name: editName.trim() })

      setName(editName.trim())
      setEditing(false)
      setSaveMsg('Name updated!')
      setTimeout(() => setSaveMsg(null), 3000)
    } catch (e: any) {
      setSaveMsg(`Error: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    onLogout()
  }

  function formatDate(raw: string | null): string {
    if (!raw) return '—'
    try {
      const diff = Date.now() - new Date(raw).getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1)    return 'Just now'
      if (mins < 60)   return `${mins}m ago`
      if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
      return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch { return raw }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-lg font-medium text-[#f0f0f0]">Profile</h1>
        <p className="text-xs text-[#444] mt-0.5">Your account and detection statistics</p>
      </div>

      {/* Avatar + identity card */}
      <div className="bg-[#0d0d0d] border border-border rounded-2xl p-6 mb-4 relative overflow-hidden">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative flex items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-[#1e1e3a] border-2 border-[#3d3d7a] flex items-center justify-center text-xl font-black text-accent-light">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#4ade80] border-2 border-[#0d0d0d]" />
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false) }}
                  className="bg-[#1a1a2e] border border-[#3d3d7a] rounded-lg px-3 py-1.5 text-sm text-white outline-none w-full"
                />
                <button
                  onClick={saveName}
                  disabled={saving}
                  className="text-xs px-3 py-1.5 bg-accent hover:bg-accent-light text-white rounded-lg transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {saving ? '…' : 'Save'}
                </button>
                <button onClick={() => { setEditing(false); setEditName(name) }} className="text-xs text-[#555] hover:text-[#aaa]">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-semibold text-white">{name || '—'}</span>
                <button
                  onClick={() => { setEditName(name); setEditing(true) }}
                  className="text-[10px] text-[#444] hover:text-accent-light transition-colors"
                >
                  ✏ Edit
                </button>
              </div>
            )}
            <div className="text-xs text-[#555]">{user.email}</div>
            <div className="text-[10px] text-[#333] mt-1">Member since {joined}</div>

            {saveMsg && (
              <div className={`text-[10px] mt-1 ${saveMsg.startsWith('Error') ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
                {saveMsg}
              </div>
            )}
          </div>

          {/* Role pill */}
          <div className="flex-shrink-0">
            <div className="text-[10px] px-2.5 py-1 bg-[#0d1a0d] border border-[#1a3d1a] text-[#4ade80] rounded-full font-mono">
              🐌 Field Tracker
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total scans',    val: stats ? String(stats.total)    : '…' },
          { label: 'With eggs',      val: stats ? String(stats.withEggs) : '…', red: stats ? stats.withEggs > 0 : false },
          { label: 'Last scan',      val: stats ? formatDate(stats.lastScan) : '…' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0d0d0d] border border-border rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold mb-1 ${s.red ? 'text-[#f87171]' : 'text-white'}`}>{s.val}</div>
            <div className="text-[10px] text-[#444] uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Account info */}
      <div className="bg-[#0d0d0d] border border-border rounded-xl overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-xs font-medium text-[#888] uppercase tracking-widest">Account</span>
        </div>
        {[
          { label: 'User ID',       val: user.id.slice(0, 8) + '…' + user.id.slice(-4) },
          { label: 'Email',         val: user.email || '—' },
          { label: 'Email verified',val: user.email_confirmed_at ? '✓ Verified' : '✗ Not verified', color: user.email_confirmed_at ? 'text-[#4ade80]' : 'text-[#f87171]' },
          { label: 'Auth provider', val: user.app_metadata?.provider || 'email' },
          { label: 'Joined',        val: joined },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3 border-b border-[#111] last:border-0">
            <span className="text-xs text-[#555]">{row.label}</span>
            <span className={`text-xs font-mono ${(row as any).color || 'text-[#888]'}`}>{row.val}</span>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="bg-[#0d0d0d] border border-[#1a0d0d] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1a0d0d]">
          <span className="text-xs font-medium text-[#555] uppercase tracking-widest">Session</span>
        </div>
        <div className="px-4 py-4">
          {!showLogout ? (
            <button
              onClick={() => setShowLogout(true)}
              className="text-sm text-[#f87171] hover:text-[#ff6b6b] transition-colors flex items-center gap-2"
            >
              <span>⟵</span> Log out of this account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#666]">You'll need to sign in again to access the dashboard.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="px-4 py-2 bg-[#1a0d0d] border border-[#3d1a1a] text-[#f87171] text-xs rounded-lg hover:bg-[#250d0d] transition-all disabled:opacity-50"
                >
                  {loggingOut ? 'Logging out…' : 'Confirm log out'}
                </button>
                <button
                  onClick={() => setShowLogout(false)}
                  className="px-4 py-2 text-[#555] text-xs hover:text-[#888] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
