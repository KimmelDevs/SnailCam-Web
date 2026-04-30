'use client'
import { useState } from 'react'
import HeroPage from '@/components/HeroPage'
import AuthModal from '@/components/AuthModal'
import Dashboard from '@/components/Dashboard'

export type Page = 'hero' | 'dashboard'
export type AuthTab = 'login' | 'signup'

export default function Home() {
  const [page, setPage] = useState<Page>('hero')
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<AuthTab>('login')

  const openAuth = (tab: AuthTab) => {
    setAuthTab(tab)
    setAuthOpen(true)
  }

  const handleAuthSuccess = () => {
    setAuthOpen(false)
    setPage('dashboard')
  }

  return (
    <>
      {page === 'hero' && (
        <HeroPage
          onLogin={() => openAuth('login')}
          onSignup={() => openAuth('signup')}
          onOpenDash={() => setPage('dashboard')}
        />
      )}
      {page === 'dashboard' && (
        <Dashboard onBack={() => setPage('hero')} />
      )}
      {authOpen && (
        <AuthModal
          tab={authTab}
          onTabChange={setAuthTab}
          onClose={() => setAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  )
}
