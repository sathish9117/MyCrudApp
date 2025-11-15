import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
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
  phoneNumber: string; // 1. Add phone number
}

// 2. Add a new interface for our full user profile
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

// --- Functions ---

export const signUp = async ({
  email,
  password,
  name,
  phoneNumber,
}: SignUpCredentials) => {
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
      phoneNumber: phoneNumber, // 4. Save phone number
      createdAt: new Date(), // Good practice to add a timestamp
      profileImageUrl: "", // Start with an empty image URL
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

// 5. NEW FUNCTION: Get the current user's profile from Firestore
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const user = auth.currentUser;
  if (!user) {
    console.log("No user signed in");
    return null;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      console.log("No such user document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile: ", error);
    throw error;
  }
};

// 6. NEW FUNCTION: Update parts of the user's profile
export const updateUserProfile = (dataToUpdate: Partial<UserProfile>) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user authenticated to update profile.");

  const userDocRef = doc(db, "users", user.uid);
  return updateDoc(userDocRef, dataToUpdate);
};
