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

// 2. Define the prop type
type Props = NativeStackScreenProps<any, "MyNotes">;

export default function NotesScreen({ navigation }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
  };

  const handleAddOrUpdateNote = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title.");
      return;
    }
    const noteData: NoteData = { title, content };

    try {
      if (selectedId) {
        await updateNote(selectedId, noteData);
      } else {
        await addNote(noteData);
      }
      clearInputs();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
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
  };

  const renderItem = ({ item }: { item: Note }) => (
    <View style={styles.itemContainer}>
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
        />
        {selectedId && (
          <View style={styles.clearButton}>
            <Button
              title="Clear Selection"
              onPress={clearInputs}
              color="#888"
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
// (Add styles at the bottom)
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
    marginBottom: 10, // Replaced marginVertical from App.tsx
  },
  headerButtons: {
    // 5. Add style for the button group
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
});
