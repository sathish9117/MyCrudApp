import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  addNote,
  updateNote, // Still needed for setting image URL after create
  NoteData,
} from "../firebaseServices/notesService"; // Adjust path
import { uploadNoteImage } from "../firebaseServices/storageService"; // Adjust path

const placeholderImage = "https://via.placeholder.com/100";

export default function NoteEditor() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // No more useEffect for noteToEdit

  const clearForm = () => {
    setTitle("");
    setContent("");
    setImageUri(null);
    setIsUploading(false);
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Sorry, we need camera roll permissions.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Simplified to ONLY add a new note
  const handleAddNewNote = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title.");
      return;
    }
    setIsUploading(true);

    try {
      // --- CREATE ---
      const noteData: NoteData = { title, content, imageUrl: "" };
      const docRef = await addNote(noteData);
      const newNoteId = docRef.id;

      if (imageUri && imageUri.startsWith("file://")) {
        const downloadURL = await uploadNoteImage(imageUri, newNoteId);
        await updateNote(newNoteId, { imageUrl: downloadURL });
      }

      Alert.alert("Success", "Note added!");
      clearForm(); // Clear form after creating
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
    setIsUploading(false);
  };

  return (
    <View style={styles.inputContainer}>
      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Saving...</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.imagePreviewContainer}
        onPress={handleImagePick}
      >
        <Image
          source={{ uri: imageUri || placeholderImage }}
          style={styles.imagePreview}
        />
        <Text style={styles.imagePickerText}>
          {imageUri ? "Change Image" : "Add Image"}
        </Text>
      </TouchableOpacity>
      {imageUri && (
        <Button
          title="Remove Image"
          onPress={() => setImageUri(null)}
          color="#888"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Add a new note..."
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Content (optional)"
        value={content}
        onChangeText={setContent}
      />
      <Button
        title="Add Note"
        onPress={handleAddNewNote}
        disabled={isUploading}
      />
      {/* No more "Clear Selection" button */}
    </View>
  );
}

// Styles (unchanged from your previous version)
const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "dashed",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 5,
    resizeMode: "cover",
  },
  imagePickerText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -10 }],
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    padding: 8,
    borderRadius: 5,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
