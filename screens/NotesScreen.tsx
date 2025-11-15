import React, { useState, useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import {
  subscribeToNotes,
  deleteNote,
  Note,
} from "../firebaseServices/notesService";
import { logOut } from "../firebaseServices/authService";
import { SafeAreaView } from "react-native-safe-area-context";
import NoteEditor from "../components/NoteEditor"; // Import the create-only editor
import { AppStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AppStackParamList, "MyNotes">;

export default function NotesScreen({ navigation }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  // Removed all state related to editing

  useEffect(() => {
    const unsubscribe = subscribeToNotes((notesData) => {
      setNotes(notesData);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteNote = async (id: string) => {
    // You could add an Alert.confirm here
    try {
      await deleteNote(id);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const renderItem = ({ item }: { item: Note }) => (
    <View style={styles.itemContainer}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      )}
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemText}>{item.title}</Text>
        <Text>{item.content}</Text>
      </View>
      <View style={styles.itemButtonContainer}>
        {/* THIS IS THE NAVIGATION CHANGE */}
        <TouchableOpacity
          style={[styles.button, styles.selectButton]}
          onPress={() => navigation.navigate("UpdateNote", { note: item })}
        >
          <Text style={styles.buttonText}>Edit</Text>
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
        <View style={styles.headerButtons}>
          <Button
            title="Profile"
            onPress={() => navigation.navigate("Profile")}
          />
          <View style={{ width: 10 }} />
          <Button title="Sign Out" onPress={logOut} color="#dc3545" />
        </View>
      </View>

      {/* The NoteEditor is now just for creating new notes */}
      <NoteEditor />

      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

// Styles (removed unused styles from your previous file)
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
  list: {
    flex: 1,
    marginTop: 10, // Add space between editor and list
  },
  itemContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
  },
  itemImage: {
    width: "100%",
    height: 150,
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
    justifyContent: "flex-end",
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
});
