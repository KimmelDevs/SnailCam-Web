'use client'
import { useState } from 'react'
import type { AuthTab } from '@/app/page'
import { supabase } from '../lib/supabaseClient'

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

          <div className="relative flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#1e1e1e]" />
            <span className="text-xs text-[#444]">or</span>
            <div className="flex-1 h-px bg-[#1e1e1e]" />
          </div>

          <button className="w-full bg-transparent border border-[#222] hover:border-[#333] text-[#888] hover:text-[#ccc] py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
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