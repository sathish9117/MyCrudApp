import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";

// Import our Firestore database instance
import { db } from "./firebaseConfig";

// Import Firestore functions
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot, // For real-time data
  QuerySnapshot,
} from "firebase/firestore";

// Define the TypeScript interface for our User object
interface User {
  id: string; // Firestore document ID
  name: string;
  age: number;
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // --- READ (Real-time) ---
  useEffect(() => {
    // Reference to the 'users' collection
    const usersCollection = collection(db, "users");

    // onSnapshot listens for real-time updates
    const unsubscribe = onSnapshot(
      usersCollection,
      (snapshot: QuerySnapshot) => {
        const usersData: User[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(usersData);
      }
    );

    // Cleanup: Unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // --- CREATE ---
  const createUser = async () => {
    if (!name || !age) {
      alert("Please enter both name and age.");
      return;
    }
    try {
      await addDoc(collection(db, "users"), {
        name: name,
        age: parseInt(age),
      });
      // Clear inputs
      clearInputs();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // --- UPDATE ---
  const updateUser = async () => {
    if (!selectedId) return;

    try {
      // Reference to the specific document
      const userDoc = doc(db, "users", selectedId);

      // Update the document
      await updateDoc(userDoc, {
        name: name,
        age: parseInt(age),
      });
      // Clear inputs and selection
      clearInputs();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // --- DELETE ---
  const deleteUser = async (id: string) => {
    try {
      // Reference to the specific document
      const userDoc = doc(db, "users", id);

      // Delete the document
      await deleteDoc(userDoc);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  // --- Helper Functions ---

  // Handle submit (decide whether to create or update)
  const handleSubmit = () => {
    if (selectedId) {
      updateUser();
    } else {
      createUser();
    }
  };

  // Pre-fill form for updating
  const handleSelectUser = (user: User) => {
    setSelectedId(user.id);
    setName(user.name);
    setAge(user.age.toString());
  };

  // Clear form
  const clearInputs = () => {
    setName("");
    setAge("");
    setSelectedId(null);
  };

  // --- Render Item for FlatList ---
  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.itemText}>Age: {item.age}</Text>
      </View>
      <View style={styles.itemButtonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.selectButton]}
          onPress={() => handleSelectUser(item)}
        >
          <Text style={styles.buttonText}>Select</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => deleteUser(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Firebase CRUD</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        <Button
          title={selectedId ? "Update User" : "Add User"}
          onPress={handleSubmit}
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
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

// --- Styles ---
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
