'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'
import HeroPage from '@/components/HeroPage'
import AuthModal from '@/components/AuthModal'
import AppShell from '@/components/AppShell'

export type AuthTab = 'login' | 'signup'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<AuthTab>('login')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  const openAuth = (tab: AuthTab) => { setAuthTab(tab); setAuthOpen(true) }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#333] border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {session ? (
        <AppShell session={session} onLogout={() => setSession(null)} />
      ) : (
        <HeroPage onLogin={() => openAuth('login')} onSignup={() => openAuth('signup')} />
      )}
      {authOpen && !session && (
        <AuthModal
          tab={authTab}
          onTabChange={setAuthTab}
          onClose={() => setAuthOpen(false)}
          onSuccess={() => setAuthOpen(false)}
        />
      )}
    </>
  )
}
