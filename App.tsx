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
  Alert,
} from "react-native";

// Import our new service functions and types
import {
  subscribeToUsers,
  addUser,
  updateUser,
  deleteUser,
  User, // Our main User interface
  UserData, // Our data-only interface
} from "./firebaseServices/userService"; // Adjust path as needed

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // --- READ (Real-time) ---
  useEffect(() => {
    // Call subscribeToUsers and pass our state updater
    const unsubscribe = subscribeToUsers((usersData) => {
      setUsers(usersData);
    });

    // Return the unsubscribe function to be called when the component unmounts
    return () => unsubscribe();
  }, []);

  // --- Helper Functions ---
  const clearInputs = () => {
    setName("");
    setAge("");
    setSelectedId(null);
  };

  // --- Handlers (Create, Update, Delete) ---

  const handleAddOrUpdateUser = async () => {
    if (!name || !age) {
      Alert.alert("Error", "Please enter both name and age.");
      return;
    }

    // Prepare the data. The service expects a number for age.
    const userData: UserData = {
      name: name,
      age: parseInt(age),
    };

    try {
      if (selectedId) {
        // --- UPDATE ---
        await updateUser(selectedId, userData);
        Alert.alert("Success", "User updated!");
      } else {
        // --- CREATE ---
        await addUser(userData);
        Alert.alert("Success", "User added!");
      }
      clearInputs();
    } catch (error) {
      console.error("Error saving document: ", error);
      Alert.alert("Error", "Could not save user.");
    }
  };

  // --- DELETE ---
  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      Alert.alert("Success", "User deleted!");
      // No need to manually remove from state, onSnapshot will do it
    } catch (error) {
      console.error("Error deleting document: ", error);
      Alert.alert("Error", "Could not delete user.");
    }
  };

  // Pre-fill form for updating
  const handleSelectUser = (user: User) => {
    setSelectedId(user.id);
    setName(user.name);
    setAge(user.age.toString());
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
          onPress={() => handleDeleteUser(item.id)}
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
          onPress={handleAddOrUpdateUser} // Use the new handler
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

// --- Styles (No Changes) ---
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
