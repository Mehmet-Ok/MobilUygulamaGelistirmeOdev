// screens/UserDashboard.js
import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { styles } from '../styles/styles';

const UserDashboard = ({ navigation }) => {
  const { currentUser, setCurrentUser, updateUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(currentUser?.username);
  const [password, setPassword] = useState('');

  const handleLogout = () => {
    setCurrentUser(null);
    navigation.replace('Login');
  };

  const handleUpdate = async () => {
    if (username && password) {
      const success = await updateUser({
        ...currentUser,
        username,
        password,
      });
      if (success) {
        setIsEditing(false);
        alert('Profile updated successfully');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {currentUser?.username}!</Text>
      
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={() => setIsEditing(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.profileContainer}>
          <Text style={styles.profileText}>Username: {currentUser?.username}</Text>
          <Text style={styles.profileText}>Account Type: {currentUser?.type}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserDashboard;