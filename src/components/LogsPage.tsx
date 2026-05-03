'use client'
import { useState, useEffect, Fragment } from 'react'
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
  platform: string | null
  bucket: string | null
  photo_path: string | null
  photo_original_name: string | null
  photo_mime_type: string | null
}

type FilterType = 'all' | 'eggs' | 'clear'
type SortField = 'captured_at' | 'egg_cluster_count' | 'photo_size'
type SortDir = 'asc' | 'desc'

interface Props { session: Session }

const PAGE_SIZE = 25

export default function LogsPage({ session }: Props) {
  const [detections, setDetections]   = useState<Detection[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [filter, setFilter]           = useState<FilterType>('all')
  const [search, setSearch]           = useState('')
  const [sortField, setSortField]     = useState<SortField>('captured_at')
  const [sortDir, setSortDir]         = useState<SortDir>('desc')
  const [expandedId, setExpandedId]   = useState<string | null>(null)
  const [page, setPage]               = useState(0)

  useEffect(() => { fetchDetections() }, [])

  async function fetchDetections() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('snaildetections')
        .select('*')
        .order('captured_at', { ascending: false })
        .limit(500)
      if (err) throw err
      setDetections(data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load detections')
    } finally {
      setLoading(false)
    }
  }

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
    setPage(0)
  }

  const filtered = detections
    .filter(d => {
      if (filter === 'eggs')  return d.egg_cluster_count > 0
      if (filter === 'clear') return d.egg_cluster_count === 0
      return true
    })
    .filter(d => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        d.event_id.toLowerCase().includes(q) ||
        (d.platform || '').toLowerCase().includes(q) ||
        formatTimestamp(d.captured_at).toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      let av: number, bv: number
      if (sortField === 'captured_at') {
        av = new Date(a.captured_at).getTime()
        bv = new Date(b.captured_at).getTime()
      } else if (sortField === 'egg_cluster_count') {
        av = a.egg_cluster_count; bv = b.egg_cluster_count
      } else {
        av = a.photo_size ?? 0; bv = b.photo_size ?? 0
      }
      return sortDir === 'asc' ? av - bv : bv - av
    })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const eggsCount = detections.filter(d => d.egg_cluster_count > 0).length
  const clearCount = detections.filter(d => d.egg_cluster_count === 0).length

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className={`ml-1 text-[10px] ${sortField === field ? 'text-accent-light' : 'text-[#333]'}`}>
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-[#f0f0f0]">Detection Log</h1>
          <p className="text-xs text-[#444] mt-0.5">
            Full history of all snail egg scan events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1a0d] border border-[#1a3d1a] text-[#4ade80] text-xs rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
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

      {/* Summary pills */}
      {!loading && !error && (
        <div className="flex gap-2 mb-5">
          {[
            { label: `${detections.length} total`,   color: 'bg-[#111] border-[#222] text-[#666]' },
            { label: `🥚 ${eggsCount} with eggs`,     color: eggsCount  > 0 ? 'bg-[#1a0d0d] border-[#3d1a1a] text-[#f87171]' : 'bg-[#111] border-[#222] text-[#444]' },
            { label: `✓ ${clearCount} clear`,         color: clearCount > 0 ? 'bg-[#0d130d] border-[#1a3d1a] text-[#4ade80]' : 'bg-[#111] border-[#222] text-[#444]' },
          ].map(p => (
            <span key={p.label} className={`text-[11px] px-3 py-1 rounded-full border font-mono ${p.color}`}>{p.label}</span>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] text-xs">⌕</span>
          <input
            type="text"
            placeholder="Search event ID, platform…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-7 pr-3 py-1.5 bg-[#0d0d0d] border border-border rounded-lg text-xs text-[#ccc] placeholder-[#333] focus:outline-none focus:border-[#3d3d7a] transition-colors"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-1">
          {(['all', 'eggs', 'clear'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0) }}
              className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all capitalize ${
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

      {/* Table */}
      <div className="bg-[#0d0d0d] border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-[#333] border-t-accent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="px-5 py-10 text-center">
            <div className="text-[#f87171] text-sm mb-2">{error}</div>
            <button onClick={fetchDetections} className="text-xs text-accent-light hover:underline">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-16 text-center text-[#444] text-sm">
            {detections.length === 0
              ? 'No detections yet. Scans from the mobile app will appear here.'
              : 'No detections match this filter.'}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th
                  className="px-4 py-3 text-left text-[#444] font-normal cursor-pointer hover:text-[#666] select-none"
                  onClick={() => toggleSort('captured_at')}
                >
                  Timestamp <SortIcon field="captured_at" />
                </th>
                <th className="px-4 py-3 text-left text-[#444] font-normal">Event ID</th>
                <th className="px-4 py-3 text-left text-[#444] font-normal">Platform</th>
                <th
                  className="px-4 py-3 text-left text-[#444] font-normal cursor-pointer hover:text-[#666] select-none"
                  onClick={() => toggleSort('egg_cluster_count')}
                >
                  Egg clusters <SortIcon field="egg_cluster_count" />
                </th>
                <th
                  className="px-4 py-3 text-left text-[#444] font-normal cursor-pointer hover:text-[#666] select-none"
                  onClick={() => toggleSort('photo_size')}
                >
                  Photo size <SortIcon field="photo_size" />
                </th>
                <th className="px-4 py-3 text-left text-[#444] font-normal">Capture</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((det) => (
                <Fragment key={det.id}>
                  <tr
                    className="border-b border-[#111] hover:bg-[#111] transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === det.id ? null : det.id)}
                  >
                    <td className="px-4 py-3 font-mono text-[#555]">{formatTimestamp(det.captured_at)}</td>
                    <td className="px-4 py-3 font-mono text-[#444] max-w-[140px] truncate" title={det.event_id}>
                      {det.event_id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 text-[#666]">{det.platform || 'android'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        det.egg_cluster_count > 0
                          ? 'bg-[#1a0d0d] text-[#f87171] border border-[#3d1a1a]'
                          : 'bg-[#0d130d] text-[#4ade80] border border-[#1a3d1a]'
                      }`}>
                        {det.egg_cluster_count > 0
                          ? `🥚 ${det.egg_cluster_count} cluster${det.egg_cluster_count !== 1 ? 's' : ''}`
                          : '✓ Clear'}
                      </span>
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
                    <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
                      <td colSpan={6} className="px-5 py-4">
                        <div className="flex gap-5">
                          {det.photo_url && (
                            <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-[#222] flex-shrink-0">
                              <Image src={det.photo_url} alt="Detection capture" fill className="object-cover" />
                            </div>
                          )}
                          <div className="space-y-1.5">
                            <div className="text-xs text-[#555]">
                              <span className="text-[#333]">Event ID:</span>{' '}
                              <span className="font-mono">{det.event_id}</span>
                            </div>
                            <div className="text-xs text-[#555]">
                              <span className="text-[#333]">Captured:</span>{' '}
                              {formatTimestamp(det.captured_at)}
                            </div>
                            <div className="text-xs text-[#555]">
                              <span className="text-[#333]">Egg clusters:</span>{' '}
                              {det.egg_cluster_count}
                            </div>
                            <div className="text-xs text-[#555]">
                              <span className="text-[#333]">Platform:</span>{' '}
                              {det.platform || 'android'}
                            </div>
                            {det.photo_original_name && (
                              <div className="text-xs text-[#555]">
                                <span className="text-[#333]">File:</span>{' '}
                                <span className="font-mono">{det.photo_original_name}</span>
                              </div>
                            )}
                            {det.photo_mime_type && (
                              <div className="text-xs text-[#555]">
                                <span className="text-[#333]">MIME:</span>{' '}
                                <span className="font-mono">{det.photo_mime_type}</span>
                              </div>
                            )}
                            {det.photo_url && (
                              <a
                                href={det.photo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-xs text-accent-light hover:underline mt-1"
                              >
                                View full image ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer: pagination + count */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#111]">
            <span className="text-xs text-[#444] font-mono">
              {filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'}
              {search || filter !== 'all' ? ` (filtered from ${detections.length})` : ''}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="text-[11px] px-2.5 py-1 rounded border border-[#222] text-[#555] hover:text-[#888] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                <span className="text-[11px] text-[#444] font-mono">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="text-[11px] px-2.5 py-1 rounded border border-[#222] text-[#555] hover:text-[#888] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
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

function formatSize(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
  if (bytes >= 1024)    return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}