'use client'
import Image from 'next/image'

interface Props {
  onLogin: () => void
  onSignup: () => void
  onOpenDash: () => void
}

export default function HeroPage({ onLogin, onSignup, onOpenDash }: Props) {
  return (
    <div className="min-h-screen bg-bg text-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a1a2e] border border-[#3d3d7a] flex items-center justify-center text-base">🐌</div>
          <span className="text-sm font-medium tracking-tight text-white">SnailCam</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onLogin}
            className="px-4 py-2 text-sm text-[#aaa] border border-border rounded-lg hover:border-accent-light hover:text-white transition-all"
          >
            Log in
          </button>
          <button
            onClick={onSignup}
            className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-light transition-all"
          >
            Sign up free
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
        {/* Radial glow bg */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 40%, #1a1a3e 0%, #080808 68%)' }} />

        {/* Live badge */}
        <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#222] bg-[#111] text-[#888] text-xs mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
          Live detection active — 3 cameras online
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl md:text-6xl font-light leading-[1.1] text-[#f5f5f5] max-w-3xl mb-5 tracking-tight">
          Detect snails before they{' '}
          <span className="text-accent-light italic font-normal">damage</span>{' '}
          your crops
        </h1>
        <p className="relative text-lg text-[#666] max-w-lg leading-relaxed mb-10">
          AI-powered camera surveillance that identifies snail activity in real time.
          Get instant alerts, log captures, and protect your plants automatically.
        </p>

        {/* CTAs */}
        <div className="relative flex gap-3 flex-wrap justify-center">
          <button
            onClick={onOpenDash}
            className="px-7 py-3 text-base font-medium bg-accent text-white rounded-xl hover:bg-accent-light transition-all hover:-translate-y-0.5"
          >
            Open dashboard
          </button>
          <button
            onClick={onSignup}
            className="px-7 py-3 text-base text-[#ccc] border border-[#333] rounded-xl hover:border-[#555] hover:text-white transition-all"
          >
            Start free trial
          </button>
        </div>

        {/* Stats row */}
        <div className="relative flex items-center gap-12 mt-16">
          {[
            { val: '98.4%', label: 'Detection accuracy' },
            { val: '<0.3s', label: 'Alert latency' },
            { val: '24/7', label: 'Camera monitoring' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-12">
              {i > 0 && <div className="w-px h-8 bg-[#222]" />}
              <div className="text-center">
                <div className="text-2xl font-medium text-[#f5f5f5]">{s.val}</div>
                <div className="text-xs text-[#555] mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SNAIL EGG SHOWCASE */}
      <section className="py-20 px-8 bg-[#0d0d0d] border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image side */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#1e1e1e] bg-[#0a0a0a]">
                <Image
                  src="/snail-eggs.png"
                  alt="Snail egg cluster detected on plant stem — SnailCam AI capture"
                  width={560}
                  height={400}
                  className="w-full h-72 object-cover"
                  priority
                />
                {/* Overlay HUD */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Detection box simulation */}
                  <div className="absolute top-8 left-12 w-36 h-20 border border-[#f87171]/60 rounded"
                    style={{ boxShadow: '0 0 12px #f8717120' }} />
                  <div className="absolute top-6 left-12 bg-[#f87171] text-white text-[10px] font-mono px-2 py-0.5 rounded-sm">
                    EGG CLUSTER · 96%
                  </div>
                  {/* Bottom bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-[#4ade80]">● REC  CAM-02 · Seedbed</span>
                      <span className="font-mono text-[10px] text-[#555]">14:32:07</span>
                    </div>
                  </div>
                  {/* Corner brackets */}
                  {[
                    'top-3 left-3 border-t-2 border-l-2',
                    'top-3 right-3 border-t-2 border-r-2',
                    'bottom-3 left-3 border-b-2 border-l-2',
                    'bottom-3 right-3 border-b-2 border-r-2',
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-5 h-5 border-accent-light/50 ${cls}`} />
                  ))}
                </div>
              </div>
              {/* Caption card */}
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg">
                <span className="w-2 h-2 rounded-full bg-[#f87171] animate-pulse-dot flex-shrink-0" />
                <span className="text-xs text-[#666] font-mono">Alert triggered · snail eggs detected on plant stem</span>
              </div>
            </div>

            {/* Text side */}
            <div>
              <div className="text-xs text-[#555] uppercase tracking-widest mb-3 font-mono">Detection example</div>
              <h2 className="text-3xl font-light text-[#f0f0f0] mb-4 leading-snug">
                Catches what the eye misses
              </h2>
              <p className="text-[#666] leading-relaxed mb-6">
                SnailCam's vision model is trained to spot snail eggs, trails, and adults even in low-light or dense foliage conditions. The image above was captured automatically at night — no human present.
              </p>
              <div className="space-y-3">
                {[
                  { icon: '🥚', title: 'Egg cluster detection', desc: 'Identifies egg masses before they hatch' },
                  { icon: '🐌', title: 'Adult & juvenile tracking', desc: 'Tracks movement across frames' },
                  { icon: '〰️', title: 'Slime trail analysis', desc: 'Detects trails as early-warning signals' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl">
                    <span className="text-base mt-0.5">{item.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-[#e0e0e0]">{item.title}</div>
                      <div className="text-xs text-[#555] mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 px-8 bg-bg">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs text-[#444] uppercase tracking-widest text-center mb-2 font-mono">Capabilities</div>
          <h2 className="text-3xl font-light text-center text-[#f0f0f0] mb-10">Everything you need to stop snails</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '📷', title: 'Multi-camera feeds', desc: 'Monitor up to 16 streams simultaneously' },
              { icon: '🔍', title: 'AI snail detection', desc: 'Trained on 50k+ snail images' },
              { icon: '🔔', title: 'Instant alerts', desc: 'Push, SMS, and email with snapshot' },
              { icon: '📋', title: 'Detection logs', desc: 'Full history with confidence scores' },
            ].map((f, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5">
                <div className="w-9 h-9 bg-[#1a1a2e] border border-[#2a2a5a] rounded-lg flex items-center justify-center text-base mb-3">
                  {f.icon}
                </div>
                <div className="text-sm font-medium text-[#e0e0e0] mb-1">{f.title}</div>
                <div className="text-xs text-[#555] leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border px-8 py-6 flex items-center justify-between text-xs text-[#444]">
        <div className="flex items-center gap-2">
          <span>🐌</span>
          <span>SnailCam © 2025</span>
        </div>
        <div className="flex gap-6">
          <span className="hover:text-[#888] cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-[#888] cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-[#888] cursor-pointer transition-colors">Docs</span>
        </div>
      </footer>
    </div>
  )
}
