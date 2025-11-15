import { db } from "../firebaseConfig"; // Adjust path if firebaseConfig isn't in the root
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  QuerySnapshot,
} from "firebase/firestore";

// --- Types ---

// This is the data structure in Firestore
export interface User {
  id: string; // Firestore document ID
  name: string;
  age: number;
}

// This is the data we need to create or update a user (no id)
export interface UserData {
  name: string;
  age: number;
}

// Reference to the 'users' collection
const usersCollection = collection(db, "users");

// --- Service Functions ---

/**
 * Subscribes to real-time updates on the 'users' collection.
 * @param callback - A function to call with the new users array.
 * @returns An unsubscribe function from onSnapshot.
 */
export const subscribeToUsers = (callback: (users: User[]) => void) => {
  // onSnapshot listens for real-time updates
  const unsubscribe = onSnapshot(usersCollection, (snapshot: QuerySnapshot) => {
    const usersData: User[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];

    // Call the provided callback with the new data
    callback(usersData);
  });

  // Return the unsubscribe function to be called on cleanup
  return unsubscribe;
};

/**
 * Adds a new user document to Firestore.
 * @param userData - The user data to add (name and age).
 */
export const addUser = (userData: UserData) => {
  return addDoc(usersCollection, userData);
};

/**
 * Updates an existing user document in Firestore.
 * @param id - The ID of the document to update.
 * @param userData - The new data for the user.
 */
export const updateUser = (id: string, userData: UserData) => {
  const userDoc = doc(db, "users", id);
  return updateDoc(userDoc, userData);
};

/**
 * Deletes a user document from Firestore.
 * @param id - The ID of the document to delete.
 */
export const deleteUser = (id: string) => {
  const userDoc = doc(db, "users", id);
  return deleteDoc(userDoc);
};
