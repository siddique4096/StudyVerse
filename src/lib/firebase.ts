// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsd2y9lQYphCPFQ0X5AvjeTgo58VyDidE",
  authDomain: "studyverse-68soh.firebaseapp.com",
  projectId: "studyverse-68soh",
  storageBucket: "studyverse-68soh.firebasestorage.app",
  messagingSenderId: "847510398379",
  appId: "1:847510398379:web:2f8eeeb9af6b4ab5ee9eee",
};

// Initialize Firebase for SSR
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const auth: Auth = getAuth(app);

export { app, db, storage, auth };
