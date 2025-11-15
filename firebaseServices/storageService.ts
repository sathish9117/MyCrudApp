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
    // 1. Fetch the image from the local URI
    const response = await fetch(uri);
    const blob = await response.blob();

    // 2. Create a reference in Storage
    // We'll save it as 'profile_images/{userId}'
    const storageRef = ref(storage, `profile_images/${user.uid}`);

    // 3. Upload the file
    const snapshot = await uploadBytes(storageRef, blob);

    // 4. Get the public download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw error;
  }
};
