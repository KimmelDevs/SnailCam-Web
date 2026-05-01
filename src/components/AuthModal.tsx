'use client'
import { useState } from 'react'
import type { AuthTab } from '@/app/page'
import { supabase } from '@/lib/supabaseClient'

interface Props {
  tab: AuthTab
  onTabChange: (tab: AuthTab) => void
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ tab, onTabChange, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const clearState = () => {
    setError(null)
    setMessage(null)
  }

  const handleSubmit = async () => {
    clearState()

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)

    if (tab === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      setMessage('Account created! Check your email to confirm, then log in.')
      setLoading(false)
      return
    }

    // Login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess()
  }

  const handleTabChange = (t: AuthTab) => {
    clearState()
    onTabChange(t)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#111] border border-[#222] rounded-2xl p-8 w-[400px] max-w-[95vw] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1a1a2e] border border-[#3d3d7a] rounded-lg flex items-center justify-center text-sm">🐌</div>
            <span className="text-base font-medium text-[#f0f0f0]">
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#444] hover:text-[#aaa] transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0a0a0a] rounded-lg p-1 mb-6">
          {(['login', 'signup'] as AuthTab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex-1 py-2 rounded-md text-sm transition-all ${
                tab === t
                  ? 'bg-[#1e1e3a] text-accent-light font-medium'
                  : 'text-[#555] hover:text-[#888]'
              }`}
            >
              {t === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        {/* Banners */}
        {error && (
          <div className="mb-4 px-3 py-2.5 bg-[#1a0d0d] border border-[#3d1a1a] rounded-lg text-[#f87171] text-xs">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 px-3 py-2.5 bg-[#0d1a0d] border border-[#1a3d1a] rounded-lg text-[#4ade80] text-xs">
            {message}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs text-[#555] mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-[#0d0d0d] border border-[#222] rounded-lg text-[#e5e5e5] px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors placeholder:text-[#333]"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-[#555] mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#0d0d0d] border border-[#222] rounded-lg text-[#e5e5e5] px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors placeholder:text-[#333]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#555] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              className="w-full bg-[#0d0d0d] border border-[#222] rounded-lg text-[#e5e5e5] px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors placeholder:text-[#333]"
            />
          </div>

          {tab === 'login' && (
            <div className="text-right">
              <span className="text-xs text-[#555] hover:text-accent-light cursor-pointer transition-colors">
                Forgot password?
              </span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-all mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                {tab === 'login' ? 'Logging in…' : 'Creating account…'}
              </>
            ) : (
              tab === 'login' ? 'Log in to dashboard →' : 'Create account →'
            )}
          </button>


        </div>

        <p className="text-center text-xs text-[#444] mt-5">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => handleTabChange(tab === 'login' ? 'signup' : 'login')}
            className="text-accent-light cursor-pointer hover:underline"
          >
            {tab === 'login' ? 'Sign up free' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  )
}