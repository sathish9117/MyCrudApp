// firebaseConfig.ts
import { initializeApp, FirebaseApp } from "firebase/app";

// 1. Import both functions from the main 'firebase/auth' module
import { initializeAuth, getReactNativePersistence } from "firebase/auth";

// 2. Import AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Firestore, getFirestore } from "firebase/firestore";

// TODO: Add your own Firebase config object here
const firebaseConfig = {
  apiKey: "AIzaSyCd4MlXlusKZJ8ADFsVM1oa7QKe3tcu9co",
  authDomain: "reelsmix-9c6b1.firebaseapp.com",
  projectId: "reelsmix-9c6b1",
  storageBucket: "reelsmix-9c6b1.appspot.com",
  messagingSenderId: "180909739507",
  appId: "1:180909739507:web:fc04b7f928ad515634d686",
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize and export Firestore
export const db: Firestore = getFirestore(app);

// 3. This is the fix:
// We replace 'getAuth(app)' with 'initializeAuth'
// and tell it to use AsyncStorage for persistence.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
