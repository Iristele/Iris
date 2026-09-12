// Iris — service worker. Χρειάζεται μόνο για να λαμβάνει η συσκευή
// ειδοποιήσεις push (ήχος/δόνηση) ακόμα κι όταν η εφαρμογή είναι κλειστή.
// Δεν κάνει caching/offline — αν θέλεις να δουλεύει η Iris offline αυτό θα
// χρειαστεί ξεχωριστή δουλειά αργότερα.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "Iris", body: "Νέα ειδοποίηση" };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    // αν δεν είναι JSON, δείξε κάτι γενικό αντί να σκάσει το event
  }

  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    // δόνηση: 200ms παλμός, 100ms παύση, 200ms παλμός — λειτουργεί σε
    // Android/Chrome· η Apple δεν υποστηρίζει το vibrate API σε notifications.
    vibrate: [200, 100, 200],
    tag: data.tag || "iris-notification",
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(data.title || "Iris", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
