// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyC3rpr6J37OvUB5oZ6qfghS7AD7fkWrPhI",
  authDomain: "buzzwords-32e5b.firebaseapp.com",
  projectId: "buzzwords-32e5b",
  storageBucket: "buzzwords-32e5b.appspot.com",
  messagingSenderId: "190832778675",
  appId: "1:190832778675:web:92bcdf46f531f223e13fc6",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "https://buzzwords.gg/apple-touch-icon.png",
    data: { url: payload.data.url },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

addEventListener("notificationclick", (event) => {
  if (!event.notification.data?.url) {
    return;
  }
  const urlToOpen = new URL(event.notification.data.url, self.location.origin)
    .href;

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
