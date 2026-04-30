'use client'
import { useState } from 'react'
import Image from 'next/image'

interface Props {
  onBack: () => void
}

type LogType = 'alert' | 'detection' | 'warning' | 'system'
type FilterType = 'all' | 'alert' | 'detection' | 'warning' | 'system'

interface LogEntry {
  id: number
  timestamp: string
  camera: string
  type: LogType
  object: string
  confidence: number | null
  hasCapture: boolean
  isEggImage?: boolean
}

const LOGS: LogEntry[] = [
  { id: 1, timestamp: 'Today 14:32:07', camera: 'Cam-02 · Seedbed', type: 'alert', object: 'Egg cluster detected', confidence: 96, hasCapture: true, isEggImage: true },
  { id: 2, timestamp: 'Today 11:20:18', camera: 'Cam-01 · Garden A', type: 'detection', object: 'Egg cluster × 1', confidence: 89, hasCapture: true, isEggImage: true },
  { id: 3, timestamp: 'Today 09:15:52', camera: 'Cam-03 · Greenhouse', type: 'system', object: 'Camera calibrated', confidence: null, hasCapture: false },
  { id: 4, timestamp: 'Yesterday 20:11:05', camera: 'Cam-01 · Garden A', type: 'detection', object: 'Egg cluster', confidence: 88, hasCapture: true, isEggImage: true },
  { id: 5, timestamp: 'Yesterday 18:33:22', camera: 'Cam-03 · Greenhouse', type: 'warning', object: 'Low light mode', confidence: null, hasCapture: false },
  { id: 6, timestamp: 'Yesterday 16:05:14', camera: 'Cam-04 · Perimeter', type: 'system', object: 'Cam-04 went offline', confidence: null, hasCapture: false },
  { id: 7, timestamp: 'Yesterday 14:47:02', camera: 'Cam-02 · Seedbed', type: 'alert', object: 'Egg cluster detected', confidence: 94, hasCapture: true, isEggImage: true },
  { id: 8, timestamp: 'Yesterday 10:02:33', camera: 'Cam-01 · Garden A', type: 'detection', object: 'Egg mass × 2', confidence: 91, hasCapture: true, isEggImage: true },
  { id: 9, timestamp: '2 days ago 22:15:09', camera: 'Cam-03 · Greenhouse', type: 'system', object: 'Motion threshold adjusted', confidence: null, hasCapture: false },
  { id: 10, timestamp: '2 days ago 08:30:41', camera: 'Cam-02 · Seedbed', type: 'detection', object: 'Egg cluster × 3', confidence: 97, hasCapture: true, isEggImage: true },
]

const TYPE_STYLES: Record<LogType, string> = {
  alert: 'bg-[#1a0d0d] text-[#f87171] border border-[#3d1a1a]',
  detection: 'bg-[#1a0d1a] text-[#c084fc] border border-[#3d1a3d]',
  warning: 'bg-[#1a140d] text-[#fbbf24] border border-[#3d300d]',
  system: 'bg-[#0d130d] text-[#4ade80] border border-[#1a3d1a]',
}

const CONF_COLOR = (c: number) => c >= 90 ? 'text-[#f87171]' : c >= 75 ? 'text-[#fbbf24]' : 'text-[#aaa]'

const CAMERAS = [
  { id: 'Cam-01', name: 'Garden A', status: 'active' },
  { id: 'Cam-02', name: 'Seedbed', status: 'alert' },
  { id: 'Cam-03', name: 'Greenhouse', status: 'active' },
  { id: 'Cam-04', name: 'Perimeter', status: 'offline' },
]

const NAV_ITEMS = [
  { icon: '⊞', label: 'Dashboard', active: true },
  { icon: '📋', label: 'Logs' },
  { icon: '🔔', label: 'Alerts' },
  { icon: '📊', label: 'Reports' },
  { icon: '⚙', label: 'Settings' },
]

export default function Dashboard({ onBack }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = filter === 'all' ? LOGS : LOGS.filter(l => l.type === filter)

  return (
    <div className="flex min-h-screen bg-bg text-white">
      {/* SIDEBAR */}
      <aside className="w-52 bg-[#0d0d0d] border-r border-border flex flex-col gap-1 px-3 py-5 shrink-0">
        <div className="flex items-center gap-2 px-2 pb-4 mb-1 border-b border-border">
          <div className="w-7 h-7 bg-[#1a1a2e] border border-[#3d3d7a] rounded-lg flex items-center justify-center text-sm">🥚</div>
          <span className="text-sm font-medium text-white">SnailEggs</span>
        </div>

        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
              item.active
                ? 'bg-[#1a1a2e] text-accent-light'
                : 'text-[#555] hover:bg-[#111] hover:text-[#aaa]'
            }`}
          >
            <span className="text-sm w-4 text-center">{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div className="mt-auto">
          <div
            onClick={onBack}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#555] hover:bg-[#111] hover:text-[#aaa] cursor-pointer transition-all"
          >
            <span className="text-sm w-4 text-center">←</span>
            Back to site
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 px-8 py-6 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-medium text-[#f0f0f0]">Overview</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1a0d] border border-[#1a3d1a] text-[#4ade80] text-xs rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse-dot" />
              3 cameras live
            </div>
            <button className="px-3 py-1.5 bg-accent hover:bg-accent-light text-white text-xs font-medium rounded-lg transition-all">
              + Add camera
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Egg detections today', val: '8', sub: '↑ 3 from yesterday', subColor: 'text-[#4ade80]' },
            { label: 'Cameras online', val: '3 / 4', sub: '1 offline', subColor: 'text-[#fbbf24]' },
            { label: 'Avg confidence', val: '91%', sub: '↑ 2% this week', subColor: 'text-[#4ade80]' },
            { label: 'Alerts sent', val: '11', sub: 'Last: 14 min ago', subColor: 'text-[#555]' },
          ].map((m) => (
            <div key={m.label} className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-[#444] mb-1.5">{m.label}</div>
              <div className="text-2xl font-medium text-[#f0f0f0]">{m.val}</div>
              <div className={`text-xs mt-1 ${m.subColor}`}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Camera feeds */}
        <div className="text-xs text-[#555] font-mono uppercase tracking-widest mb-3">Live feeds</div>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {CAMERAS.map((cam) => (
            <div key={cam.id} className="bg-[#0d0d0d] border border-border rounded-xl overflow-hidden">
              {/* Feed area */}
              <div className={`h-24 relative flex items-center justify-center ${cam.status === 'offline' ? 'opacity-25' : ''}`}
                style={{ background: cam.status === 'alert' ? '#0d0806' : '#060606' }}>
                {cam.id === 'Cam-02' ? (
                  <Image
                    src="/snail-eggs.png"
                    alt="Egg cluster alert"
                    fill
                    className="object-cover opacity-60"
                  />
                ) : null}
                {/* Crosshair */}
                <div className="relative w-10 h-10 z-10">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#333]" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-[#333]" />
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border ${
                    cam.status === 'alert'
                      ? 'border-[#f87171] animate-pulse-dot'
                      : 'border-accent/60'
                  }`} />
                </div>
                {/* Rec indicator */}
                {cam.status !== 'offline' && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                    <span className={`w-1.5 h-1.5 rounded-full ${cam.status === 'alert' ? 'bg-[#f87171]' : 'bg-[#4ade80]'} animate-pulse-dot`} />
                    <span className="font-mono text-[9px] text-[#444]">REC</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-[#aaa]">{cam.id} · {cam.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                  cam.status === 'active' ? 'bg-[#0d1a0d] text-[#4ade80] border border-[#1a3d1a]' :
                  cam.status === 'alert' ? 'bg-[#1a0d0d] text-[#f87171] border border-[#3d1a1a]' :
                  'bg-[#111] text-[#444] border border-border'
                }`}>
                  {cam.status === 'active' ? 'Active' : cam.status === 'alert' ? 'Alert!' : 'Offline'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Detection Logs */}
        <div className="bg-[#0d0d0d] border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <span className="text-sm font-medium text-[#ccc]">Detection log</span>
            <div className="flex gap-1.5">
              {(['all', 'alert', 'detection', 'warning', 'system'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[11px] px-3 py-1 rounded-md border transition-all capitalize ${
                    filter === f
                      ? 'bg-[#1a1a2e] border-[#3d3d7a] text-accent-light'
                      : 'bg-transparent border-[#222] text-[#555] hover:text-[#888]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {['Timestamp', 'Camera', 'Type', 'Detected', 'Confidence', 'Capture'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[#444] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-[#111] hover:bg-[#111] transition-colors group">
                  <td className="px-4 py-3 font-mono text-[#555]">{log.timestamp}</td>
                  <td className="px-4 py-3 text-[#666]">{log.camera}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono capitalize ${TYPE_STYLES[log.type]}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#aaa]">{log.object}</td>
                  <td className="px-4 py-3 font-mono">
                    {log.confidence !== null
                      ? <span className={CONF_COLOR(log.confidence)}>{log.confidence}%</span>
                      : <span className="text-[#333]">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    {log.hasCapture ? (
                      <div className="w-10 h-7 rounded overflow-hidden border border-[#2a2a5a] bg-[#1a1a2e] relative">
                        {log.isEggImage && (
                          <Image src="/snail-eggs.png" alt="capture" fill className="object-cover opacity-80" />
                        )}
                      </div>
                    ) : (
                      <span className="text-[#333]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-5 py-3 border-t border-[#111]">
            <span className="text-xs text-[#444] font-mono">{filtered.length} entries</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((p) => (
                <button key={p} className={`text-[11px] px-2.5 py-1 rounded border transition-all ${
                  p === 1 ? 'bg-[#1a1a2e] border-[#3d3d7a] text-accent-light' : 'bg-transparent border-[#222] text-[#555]'
                }`}>{p}</button>
              ))}
              <button className="text-[11px] px-2.5 py-1 rounded border border-[#222] text-[#555]">›</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}