// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsd2y9lQYphCPFQ0X5AvjeTgo58VyDidE",
  authDomain: "studyverse-68soh.firebaseapp.com",
  projectId: "studyverse-68soh",
  storageBucket: "studyverse-68soh.firebasestorage.app",
  messagingSenderId: "847510398379",
  appId: "1:847510398379:web:2f8eeeb9af6b4ab5ee9eee",
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
