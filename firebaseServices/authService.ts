import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig"; // Adjust path as needed
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as AuthUser, // Renamed to avoid conflicts
} from "firebase/auth";

// --- Types ---
export { AuthUser }; // Re-export the user type

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends AuthCredentials {
  name: string;
}

// --- Functions ---

export const signUp = async ({ email, password, name }: SignUpCredentials) => {
  try {
    // a. Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // b. Create the user document in Firestore
    // We use setDoc to specify the exact ID (the user's UID)
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      name: name,
      createdAt: new Date(), // Good practice to add a timestamp
    });

    return userCredential;
  } catch (error) {
    // Handle errors (e.g., email already in use)
    console.error("Error during sign up: ", error);
    throw error;
  }
};

export const signIn = ({ email, password }: AuthCredentials) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = () => {
  return signOut(auth);
};

/**
 * Subscribes to the user's authentication state.
 * @param callback - A function to call with the auth user object or null.
 * @returns An unsubscribe function.
 */
export const subscribeToAuthChanges = (
  callback: (user: AuthUser | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};
