import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SnailCam — AI Snail Detection System',
  description: 'Detect and monitor snail activity in real time with AI-powered camera surveillance.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
