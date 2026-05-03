import { supabase } from './supabaseClient'

// Replace with your VAPID public key (generated in next step)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  const buffer  = new ArrayBuffer(raw.length)
  const view    = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i)
  return buffer
}

export async function registerPush(userId: string): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[Push] Not supported in this browser')
      return false
    }

    // Register service worker
    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('[Push] Permission denied')
      return false
    }

    // Subscribe
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })

    const sub = subscription.toJSON()

    // Save to Supabase (upsert by endpoint so we don't duplicate)
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id:  userId,
        endpoint: sub.endpoint,
        p256dh:   sub.keys?.p256dh,
        auth:     sub.keys?.auth,
        device:   navigator.userAgent.slice(0, 120),
      },
      { onConflict: 'endpoint' }
    )

    if (error) {
      console.error('[Push] Failed to save subscription:', error.message)
      return false
    }

    console.info('[Push] Subscribed and saved ✓')
    return true
  } catch (e) {
    console.error('[Push] registerPush error:', e)
    return false
  }
}

export async function unregisterPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  const reg = await navigator.serviceWorker.getRegistration('/sw.js')
  if (!reg) return
  const sub = await reg.pushManager.getSubscription()
  if (!sub) return
  await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
  await sub.unsubscribe()
  console.info('[Push] Unsubscribed ✓')
}

export async function getPushState(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported'
  return Notification.permission as 'granted' | 'denied' | 'default'
}