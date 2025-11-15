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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { updateNote, NoteData } from "../firebaseServices/notesService";
import { uploadNoteImage } from "../firebaseServices/storageService";
import { AppStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AppStackParamList, "UpdateNote">;

const placeholderImage = "https://via.placeholder.com/100";

export default function UpdateNoteScreen({ route, navigation }: Props) {
  const { note } = route.params;

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || "");
  const [imageUri, setImageUri] = useState<string | null>(
    note.imageUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUpdateNote = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title.");
      return;
    }
    setIsUploading(true);

    try {
      let downloadURL: string | undefined = undefined;

      // Check if image was changed (it will be a local 'file://' URI)
      if (imageUri && imageUri.startsWith("file://")) {
        downloadURL = await uploadNoteImage(imageUri, note.id);
      }

      const dataToUpdate: Partial<NoteData> = { title, content };
      if (downloadURL) {
        dataToUpdate.imageUrl = downloadURL; // Add new image URL
      } else if (imageUri === null) {
        dataToUpdate.imageUrl = ""; // Image was removed
      }

      await updateNote(note.id, dataToUpdate);
      Alert.alert("Success", "Note updated!");
      navigation.goBack(); // Go back to the notes list
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
    setIsUploading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Update Note</Text>
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
          title="Update Note"
          onPress={handleUpdateNote}
          disabled={isUploading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
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
