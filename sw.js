/* Minimal service worker: only used to display message notifications. It does not cache or intercept requests. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if ('focus' in c) { try { await c.focus(); return } catch (err) {} }
    }
    if (self.clients.openWindow) await self.clients.openWindow('./');
  })());
});
