'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface Detection {
  id: string
  event_id: string
  captured_at: string
  egg_cluster_count: number
  photo_url: string | null
  photo_size: number | null
  camera_label: string | null
  confidence: number | null
}

type FilterType = 'all' | 'eggs' | 'clear'

interface Props { session: Session }

export default function Dashboard({ session }: Props) {
  const [detections, setDetections] = useState<Detection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchDetections()
  }, [])

  async function fetchDetections() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('snail_detections')
        .select('*')
        .order('captured_at', { ascending: false })
        .limit(100)

      if (err) throw err
      setDetections(data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load detections')
    } finally {
      setLoading(false)
    }
  }

  const filtered = detections.filter(d => {
    if (filter === 'eggs')  return d.egg_cluster_count > 0
    if (filter === 'clear') return d.egg_cluster_count === 0
    return true
  })

  // Stats
  const today = new Date().toDateString()
  const todayCount   = detections.filter(d => new Date(d.captured_at).toDateString() === today).length
  const withEggs     = detections.filter(d => d.egg_cluster_count > 0).length
  const avgConf      = detections.filter(d => d.confidence).reduce((a, d, _, arr) => a + (d.confidence! / arr.length), 0)
  const lastDetected = detections[0] ? formatRelative(detections[0].captured_at) : '—'

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-[#f0f0f0]">Overview</h1>
          <p className="text-xs text-[#444] mt-0.5">
            Showing {detections.length} total detection{detections.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1a0d] border border-[#1a3d1a] text-[#4ade80] text-xs rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse-dot" />
            Live
          </div>
          <button
            onClick={fetchDetections}
            className="px-3 py-1.5 bg-[#111] hover:bg-[#1a1a1a] text-[#aaa] hover:text-white text-xs font-medium rounded-lg border border-border transition-all"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total detections',  val: String(detections.length), sub: 'All time',          subColor: 'text-[#555]' },
          { label: 'Today',             val: String(todayCount),        sub: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), subColor: 'text-[#555]' },
          { label: 'With egg clusters', val: String(withEggs),          sub: detections.length ? `${Math.round(withEggs / detections.length * 100)}% of scans` : '—', subColor: withEggs > 0 ? 'text-[#f87171]' : 'text-[#555]' },
          { label: 'Avg confidence',    val: avgConf ? `${Math.round(avgConf)}%` : '—', sub: 'Across detections', subColor: 'text-[#555]' },
        ].map((m) => (
          <div key={m.label} className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs text-[#444] mb-1.5">{m.label}</div>
            <div className="text-2xl font-medium text-[#f0f0f0]">{loading ? '…' : m.val}</div>
            <div className={`text-xs mt-1 ${m.subColor}`}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Detection log */}
      <div className="bg-[#0d0d0d] border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <span className="text-sm font-medium text-[#ccc]">Detection log</span>
          <div className="flex gap-1.5">
            {(['all', 'eggs', 'clear'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[11px] px-3 py-1 rounded-md border transition-all capitalize ${
                  filter === f
                    ? 'bg-[#1a1a2e] border-[#3d3d7a] text-accent-light'
                    : 'bg-transparent border-[#222] text-[#555] hover:text-[#888]'
                }`}
              >
                {f === 'eggs' ? '🥚 With eggs' : f === 'clear' ? '✓ Clear' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-[#333] border-t-accent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="px-5 py-8 text-center">
            <div className="text-[#f87171] text-sm mb-2">{error}</div>
            <button onClick={fetchDetections} className="text-xs text-accent-light hover:underline">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-[#444] text-sm">
            {detections.length === 0
              ? 'No detections yet. Scans from the mobile app will appear here.'
              : 'No detections match this filter.'}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {['Timestamp', 'Camera', 'Egg clusters', 'Confidence', 'Size', 'Capture'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[#444] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((det) => (
                <>
                  <tr
                    key={det.id}
                    className="border-b border-[#111] hover:bg-[#111] transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === det.id ? null : det.id)}
                  >
                    <td className="px-4 py-3 font-mono text-[#555]">{formatTimestamp(det.captured_at)}</td>
                    <td className="px-4 py-3 text-[#666]">{det.camera_label || 'Unknown cam'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        det.egg_cluster_count > 0
                          ? 'bg-[#1a0d0d] text-[#f87171] border border-[#3d1a1a]'
                          : 'bg-[#0d130d] text-[#4ade80] border border-[#1a3d1a]'
                      }`}>
                        {det.egg_cluster_count > 0 ? `🥚 ${det.egg_cluster_count} cluster${det.egg_cluster_count !== 1 ? 's' : ''}` : '✓ Clear'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {det.confidence != null
                        ? <span className={det.confidence >= 90 ? 'text-[#f87171]' : det.confidence >= 75 ? 'text-[#fbbf24]' : 'text-[#aaa]'}>{det.confidence}%</span>
                        : <span className="text-[#333]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[#555]">
                      {det.photo_size ? formatSize(det.photo_size) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {det.photo_url ? (
                        <div className="w-10 h-7 rounded overflow-hidden border border-[#2a2a5a] bg-[#1a1a2e] relative">
                          <Image src={det.photo_url} alt="capture" fill className="object-cover" />
                        </div>
                      ) : (
                        <span className="text-[#333]">—</span>
                      )}
                    </td>
                  </tr>
                  {expandedId === det.id && (
                    <tr key={`${det.id}-expanded`} className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
                      <td colSpan={6} className="px-5 py-4">
                        <div className="flex gap-5">
                          {det.photo_url && (
                            <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-[#222] flex-shrink-0">
                              <Image src={det.photo_url} alt="Detection capture" fill className="object-cover" />
                            </div>
                          )}
                          <div className="space-y-1.5">
                            <div className="text-xs text-[#555]"><span className="text-[#333]">Event ID:</span> <span className="font-mono">{det.event_id}</span></div>
                            <div className="text-xs text-[#555]"><span className="text-[#333]">Captured:</span> {formatTimestamp(det.captured_at)}</div>
                            <div className="text-xs text-[#555]"><span className="text-[#333]">Egg clusters:</span> {det.egg_cluster_count}</div>
                            {det.confidence != null && <div className="text-xs text-[#555]"><span className="text-[#333]">Confidence:</span> {det.confidence}%</div>}
                            {det.camera_label && <div className="text-xs text-[#555]"><span className="text-[#333]">Camera:</span> {det.camera_label}</div>}
                            {det.photo_url && (
                              <a href={det.photo_url} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-accent-light hover:underline mt-1">
                                View full image ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#111]">
            <span className="text-xs text-[#444] font-mono">{filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'}</span>
            <span className="text-xs text-[#333] font-mono">Last scan: {lastDetected}</span>
          </div>
        )}
      </div>
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

function formatRelative(raw: string): string {
  try {
    const diff = Date.now() - new Date(raw).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)   return 'Just now'
    if (mins < 60)  return `${mins}m ago`
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
    return `${Math.floor(mins / 1440)}d ago`
  } catch { return raw }
}

function formatSize(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
  if (bytes >= 1024)    return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}
