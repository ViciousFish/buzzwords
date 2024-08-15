/// <reference lib="WebWorker" />
// TODO why does typescript not know about service worker stuff?
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
// import { clientsClaim } from 'workbox-core';
// import { NavigationRoute, registerRoute } from 'workbox-routing';

const firebaseConfig = {
  apiKey: "AIzaSyC3rpr6J37OvUB5oZ6qfghS7AD7fkWrPhI",
  authDomain: "buzzwords-32e5b.firebaseapp.com",
  projectId: "buzzwords-32e5b",
  storageBucket: "buzzwords-32e5b.appspot.com",
  messagingSenderId: "190832778675",
  appId: "1:190832778675:web:92bcdf46f531f223e13fc6",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  const notificationTitle = payload.notification?.title;
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/apple-touch-icon.png'
  };

  // @ts-ignore
  self.registration.showNotification(notificationTitle, notificationOptions);
});


// non-messaging stuff
// self.__WB_MANIFEST is default injection point
// @ts-ignore
// precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
// cleanupOutdatedCaches();

// let allowlist;
// if (import.meta.env.DEV) {
//   allowlist = [/^\/$/];
// }

// to allow work offline
// registerRoute(new NavigationRoute(
//   createHandlerBoundToURL('index.html'),
//   { allowlist },
// ));

// @ts-ignore
// self.skipWaiting(); // I don't think we need this?
// clientsClaim(); // I don't think we need this?