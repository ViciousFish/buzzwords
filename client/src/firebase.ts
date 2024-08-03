// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { AppThunk } from "./app/store";

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

export function configure_firebase() {
  app = initializeApp(firebaseConfig);
  console.log("🚀 ~ app:", app)
}

export async function configure_firebase_messaging() {
  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey:
      "BIYsGBDfSJxey0PNgvDYHpNjNRmAoA8oExcXfr7pSE42DI3gtpFBI61zjq4ekTXd6kL3xEQkylUQlXWETonOLEM",
  })
  return token;
}

export const subscribeToMessages = (): AppThunk => async (dispatch) => {
  const messaging = getMessaging(app);
  onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);
  });
}
