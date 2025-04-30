// firebase.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCF_3HjBke6AAySif7OC6RXGXOdpZXVSbQ",
  authDomain: "agribazaar-dbdad.firebaseapp.com",
  projectId: "agribazaar-dbdad",
  storageBucket: "agribazaar-dbdad.appspot.com",
  messagingSenderId: "940971806602",
  appId: "1:940971806602:web:cf99721f09aa50a8f4c273",
  measurementId: "G-QZY5XF2V84"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
