import { auth } from "../firebaseConfig"; // Adjust path as needed
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

// --- Functions ---

export const signUp = ({ email, password }: AuthCredentials) => {
  return createUserWithEmailAndPassword(auth, email, password);
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
