import React, { useState, useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack"; // 1. Import prop type
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";

import {
  subscribeToNotes,
  addNote,
  updateNote,
  deleteNote,
  Note,
  NoteData,
} from "../firebaseServices/notesService"; // Adjust path
import { logOut } from "../firebaseServices/authService"; // Import logOut
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker"; // <-- 3. Import ImagePicker
import { uploadNoteImage } from "../firebaseServices/storageService"; // <-- 4. Import new function
// 2. Define the prop type
type Props = NativeStackScreenProps<any, "MyNotes">;

const placeholderImage = "https://via.placeholder.com/100"; // Placeholder

export default function NotesScreen({ navigation }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null); // <-- 5. State for local or remote image URI
  const [isUploading, setIsUploading] = useState(false); // <-- 6. State for loading

  useEffect(() => {
    // Subscribe to the user's notes
    const unsubscribe = subscribeToNotes((notesData) => {
      setNotes(notesData);
    });
    return () => unsubscribe();
  }, []);

  const clearInputs = () => {
    setTitle("");
    setContent("");
    setSelectedId(null);
    setImageUri(null); // <-- 7. Clear image
    setIsUploading(false);
  };

  // 8. Add image picker function (from ProfileScreen)
  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Sorry, we need camera roll permissions.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // Landscape for notes
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri); // Show local preview
    }
  };

  const handleAddOrUpdateNote = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title.");
      return;
    }
    setIsUploading(true);

    try {
      if (selectedId) {
        // --- UPDATE ---
        let downloadURL: string | undefined = undefined;

        // Check if image was changed (it will be a local 'file://' URI)
        if (imageUri && imageUri.startsWith("file://")) {
          downloadURL = await uploadNoteImage(imageUri, selectedId);
        }

        const dataToUpdate: Partial<NoteData> = { title, content };
        if (downloadURL) {
          dataToUpdate.imageUrl = downloadURL; // Add new image URL
        } else if (imageUri === null) {
          dataToUpdate.imageUrl = ""; // Image was removed
        }

        await updateNote(selectedId, dataToUpdate);
      } else {
        // --- CREATE ---
        // 1. Create note with text data first
        const noteData: NoteData = { title, content, imageUrl: "" };
        const docRef = await addNote(noteData);
        const newNoteId = docRef.id;

        // 2. If user picked an image, upload it now
        if (imageUri && imageUri.startsWith("file://")) {
          const downloadURL = await uploadNoteImage(imageUri, newNoteId);
          // 3. Update the note with the new image URL
          await updateNote(newNoteId, { imageUrl: downloadURL });
        }
      }
      Alert.alert("Success", "Note saved!");
      clearInputs();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
    setIsUploading(false);
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setImageUri(note.imageUrl || null); // <-- 10. Load note's image
  };

  const renderItem = ({ item }: { item: Note }) => (
    <View style={styles.itemContainer}>
      {/* 11. Render image in the list if it exists */}
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      )}
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemText}>{item.title}</Text>
        <Text>{item.content}</Text>
      </View>
      <View style={styles.itemButtonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.selectButton]}
          onPress={() => handleSelectNote(item)}
        >
          <Text style={styles.buttonText}>Select</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDeleteNote(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
        {/* 4. Add a Profile button */}
        <View style={styles.headerButtons}>
          <Button
            title="Profile"
            onPress={() => navigation.navigate("Profile")}
          />
          <View style={{ width: 10 }} />
          <Button title="Sign Out" onPress={logOut} color="#dc3545" />
        </View>
      </View>

      <View style={styles.inputContainer}>
        {/* 12. Image Previewer */}
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
        {/* Button to remove image */}
        {imageUri && (
          <Button
            title="Remove Image"
            onPress={() => setImageUri(null)}
            color="#888"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Title"
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
          title={selectedId ? "Update Note" : "Add Note"}
          onPress={handleAddOrUpdateNote}
          disabled={isUploading}
        />
        {selectedId && (
          <View style={styles.clearButton}>
            <Button
              title="Cancel"
              onPress={clearInputs}
              color="#888"
              disabled={isUploading}
            />
          </View>
        )}
      </View>

      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

// 13. Add new styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 20,
    backgroundColor: "#f4f4f4",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: "row",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
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
  clearButton: {
    marginTop: 10,
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
    // Note: flexDirection is column by default
  },
  itemImage: {
    width: "100%",
    height: 150, // Fixed height for list item images
    borderRadius: 5,
    marginBottom: 10,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end", // Align buttons to the right
    marginTop: 10,
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
  },
  selectButton: {
    backgroundColor: "#007bff",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  // --- New Styles for Image Picker ---
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
    zIndex: 10, // Make sure it's on top
  },
});
