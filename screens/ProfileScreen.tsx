import * as React from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  getUserProfile,
  updateUserProfile,
  UserProfile,
} from "../firebaseServices/authService";
import { uploadImage } from "../firebaseServices/storageService";

// A default placeholder image
const placeholderImage = "https://via.placeholder.com/150";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [imageUri, setImageUri] = React.useState<string | null>(null); // For local preview
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  // Load profile on screen mount
  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userProfile = await getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setName(userProfile.name);
        setPhone(userProfile.phoneNumber || "");
        setImageUri(userProfile.profileImageUrl || null);
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch profile data.");
    }
    setIsLoading(false);
  };

  // Handle picking an image
  const handleImagePick = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Sorry",
        "We need camera roll permissions to make this work!"
      );
      return;
    }

    // Launch the picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square
      quality: 0.5, // Compress image
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      setImageUri(localUri); // Show local preview
      handleImageUpload(localUri); // Start upload
    }
  };

  // Handle uploading the image
  const handleImageUpload = async (localUri: string) => {
    setIsUploading(true);
    try {
      const downloadURL = await uploadImage(localUri);
      // Save the new URL to the user's profile
      await updateUserProfile({ profileImageUrl: downloadURL });
      Alert.alert("Success", "Profile picture updated!");
      setImageUri(downloadURL); // Update to the cloud URL
    } catch (error) {
      Alert.alert("Error", "Could not upload image.");
      console.error(error);
      // Revert to old image if upload fails
      setImageUri(profile?.profileImageUrl || null);
    }
    setIsUploading(false);
  };

  // Handle saving text changes (name, phone)
  const handleUpdateProfile = async () => {
    if (!name || !phone) {
      Alert.alert("Error", "Name and phone cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      await updateUserProfile({ name: name, phoneNumber: phone });
      Alert.alert("Success", "Profile updated!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not update profile.");
      console.error(error);
    }
    setIsLoading(false);
  };

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri || placeholderImage }}
          style={styles.image}
        />
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </TouchableOpacity>
      <Button title="Change Photo" onPress={handleImagePick} />

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Full Name"
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone Number"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={profile?.email || ""}
        editable={false} // Email is not editable
        style={[styles.input, styles.disabledInput]}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? "Saving..." : "Save Profile"}
          onPress={handleUpdateProfile}
          disabled={isLoading || isUploading}
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
  imageContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 75,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#e9e9e9",
    color: "#888",
  },
  buttonContainer: {
    marginTop: 20,
  },
});
