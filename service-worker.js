// service-worker.js

// This event is triggered when the service worker is first installed.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // This forces the waiting service worker to become the active service worker.
  self.skipWaiting();
});

// This event is triggered when the service worker is activated.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // This ensures that any new clients are controlled by this service worker.
  event.waitUntil(self.clients.claim());
});

/**
 * This event handles incoming push notifications from a push server.
 * A real backend is required to send these types of notifications.
 */
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');
  try {
    const data = event.data.json();
    const { title, body, icon, image } = data;

    const options = {
      body: body,
      icon: icon || '/logo.png', // A default icon
      badge: '/badge.png', // An icon for the notification bar
      image: image, // An image to display within the notification
    };

    // The service worker remains active until the notification is shown.
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.error('Error processing push event:', e);
    // Fallback notification if parsing fails
    event.waitUntil(self.registration.showNotification('New Notification', {
        body: 'You have a new message.',
        icon: '/logo.png'
    }));
  }
});

/**
 * This event handles messages sent from the client-side of the application (e.g., from notificationService.ts).
 * It's used to show notifications when the app tab is open but in the background.
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, ...options } = event.data.payload;
        if (title) {
            self.registration.showNotification(title, options);
        }
    }
});

// This can be used to handle clicks on the notification
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked.');
  event.notification.close();

  // This example focuses on the most recent client, but you can customize this logic
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
