import firebase, { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAXjvy6kRYhJLXKR1JjXRemTxwHjxc6qgw",
    authDomain: "contacts-app-38a5e.firebaseapp.com",
    projectId: "contacts-app-38a5e",
    storageBucket: "contacts-app-38a5e.appspot.com",
    messagingSenderId: "607723695014",
    appId: "1:607723695014:web:f2396bf82f062f9e73bd67"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { app, db, auth, storage };