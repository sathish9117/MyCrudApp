import { storage, auth } from "../firebaseConfig"; // Adjust path
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads an image to Firebase Storage.
 * @param uri - The local file URI of the image (from image picker).
 * @returns The public download URL of the uploaded image.
 */
export const uploadImage = async (uri: string): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user authenticated for image upload.");

  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profile_images/${user.uid}`);
    const snapshot = await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw error;
  }
};

/**
 * Uploads a NOTE image to Firebase Storage.
 * @param uri - The local file URI of the image.
 * @param noteId - The ID of the note to associate the image with.
 * @returns The public download URL of the uploaded image.
 */

export const uploadNoteImage = async (
  uri: string,
  noteId: string
): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user authenticated for image upload.");

  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    // Path: users/{userId}/notes/{noteId}_image
    // This path matches our new storage rule
    const storageRef = ref(storage, `users/${user.uid}/notes/${noteId}_image`);

    const snapshot = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading note image: ", error);
    throw error;
  }
};
