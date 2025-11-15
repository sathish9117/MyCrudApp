import { db, auth } from "../firebaseConfig"; // Adjust path. We need auth now!
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
export interface Note {
  id: string;
  title: string;
  content: string;
}

export interface NoteData {
  title: string;
  content: string;
}

// --- Helper Function ---
// This function gets the path to the current user's notes
const getNotesCollection = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user authenticated to perform this operation.");
  }
  // This path MUST match your security rules: "users/{userId}/notes"
  return collection(db, "users", user.uid, "notes");
};

// --- Service Functions ---

/**
 * Subscribes to real-time updates on the current user's notes.
 * @param callback - A function to call with the new notes array.
 * @returns An unsubscribe function.
 */
export const subscribeToNotes = (callback: (notes: Note[]) => void) => {
  const notesCollection = getNotesCollection();

  const unsubscribe = onSnapshot(notesCollection, (snapshot: QuerySnapshot) => {
    const notesData: Note[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Note[];
    callback(notesData);
  });

  return unsubscribe;
};

/**
 * Adds a new note document to the current user's collection.
 * @param noteData - The note data to add (title and content).
 */
export const addNote = (noteData: NoteData) => {
  const notesCollection = getNotesCollection();
  return addDoc(notesCollection, noteData);
};

/**
 * Updates an existing note document in the current user's collection.
 * @param id - The ID of the document to update.
 * @param noteData - The new data for the note.
 */
export const updateNote = (id: string, noteData: NoteData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user authenticated.");

  // We need the full path for doc()
  const noteDoc = doc(db, "users", user.uid, "notes", id);
  return updateDoc(noteDoc, noteData as any); // Use 'as any' if updateDoc complains
};

/**
 * Deletes a note document from the current user's collection.
 * @param id - The ID of the document to delete.
 */
export const deleteNote = (id: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user authenticated.");

  const noteDoc = doc(db, "users", user.uid, "notes", id);
  return deleteDoc(noteDoc);
};
