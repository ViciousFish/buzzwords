// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { AppThunk } from "./store";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3rpr6J37OvUB5oZ6qfghS7AD7fkWrPhI",
  authDomain: "buzzwords-32e5b.firebaseapp.com",
  projectId: "buzzwords-32e5b",
  storageBucket: "buzzwords-32e5b.appspot.com",
  messagingSenderId: "190832778675",
  appId: "1:190832778675:web:92bcdf46f531f223e13fc6",
};

let app: FirebaseApp;
let messaging;

export function configure_firebase() {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
}

export async function configure_firebase_messaging() {
  if (!("serviceWorker" in navigator)) {
    return false;
  }
  console.log("🚀 ~ configure_firebase_messaging ~ import.meta.env.MODE === \"production\":", import.meta.env.MODE === "production")
  const registration = await navigator.serviceWorker.register(
    import.meta.env.MODE === "production" ? "/sw.js" : "/dev-sw.js?dev-sw",
    { type: import.meta.env.MODE === "production" ? "classic" : "module" }
  );
  const token = await getToken(messaging, {
    vapidKey:
      "BIYsGBDfSJxey0PNgvDYHpNjNRmAoA8oExcXfr7pSE42DI3gtpFBI61zjq4ekTXd6kL3xEQkylUQlXWETonOLEM",
    serviceWorkerRegistration: registration,
  });
  return token;
}

export const subscribeToMessages = (): AppThunk => async (dispatch) => {
  onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);
  });
};

// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken, onMessage } from "firebase/messaging";

// const firebaseApp = initializeApp(<your-firebase-config>);
// const messaging = getMessaging(firebaseApp);
