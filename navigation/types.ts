import { Note } from "../firebaseServices/notesService"; // Adjust path if needed

/**
 * Type definitions for the authentication stack (Login, SignUp).
 * 'undefined' means the screen takes no parameters.
 */
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

/**
 * Type definitions for the main app stack (screens after login).
 */
export type AppStackParamList = {
  MyNotes: undefined;
  Profile: undefined;
  UpdateNote: { note: Note }; // <-- This is the key change
};
