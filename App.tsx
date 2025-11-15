import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";

import {
  subscribeToAuthChanges,
  AuthUser,
} from "./firebaseServices/authService"; // Adjust path

// Import your screens
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import NotesScreen from "./screens/NotesScreen";
import ProfileScreen from "./screens/ProfileScreen"; // 1. Import ProfileScreen
// Define our navigation stacks
// This is for unauthenticated users
const AuthStack = createNativeStackNavigator();
// This is for authenticated users
const AppStack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = subscribeToAuthChanges((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Show a loading spinner while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        // User is LOGGED IN: Show the main app
        <AppStack.Navigator>
          <AppStack.Screen
            name="MyNotes"
            component={NotesScreen}
            options={{ headerShown: false }} // Hide header, NotesScreen has its own
          />
          {/* Add other app screens here */}
          {/* 3. Add the Profile screen to the stack */}
          <AppStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "My Profile" }} // Or customize header
          />
        </AppStack.Navigator>
      ) : (
        // User is LOGGED OUT: Show the auth flow
        <AuthStack.Navigator>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="SignUp" component={SignUpScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // --- Add ALL OTHER STYLES from your old App.tsx here ---
  // --- and add these new ones for Login/SignUp ---
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
  link: {
    color: "#007bff",
    textAlign: "center",
    marginTop: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
});
