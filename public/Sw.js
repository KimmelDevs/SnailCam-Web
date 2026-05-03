self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || '🥚 SnailEggs Alert', {
      body:    data.body  || 'Snail eggs detected!',
      icon:    data.icon  || '/icon-192.png',
      badge:   data.badge || '/icon-192.png',
      tag:     data.tag   || 'snail-alert',
      data:    data.url   ? { url: data.url } : {},
      requireInteraction: true,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})