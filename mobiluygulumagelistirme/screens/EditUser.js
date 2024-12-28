// screens/EditUser.js - Verify file exists and is properly exported
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { styles } from '../styles/styles';

const EditUser = ({ route, navigation }) => {
  const { user } = route.params;
  const { updateUserByAdmin } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: user.username,
    password: '',
    type: user.type
  });

  const handleUpdate = async () => {
    if (formData.username) {
      const success = await updateUserByAdmin(user.username, formData);
      if (success) {
        alert('User updated successfully');
        navigation.goBack();
      } else {
        alert('Failed to update user');
      }
    } else {
      alert('Username is required');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit User</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={formData.username}
        onChangeText={(text) => setFormData({...formData, username: text})}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password (optional)"
        value={formData.password}
        onChangeText={(text) => setFormData({...formData, password: text})}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update User</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, styles.cancelButton]} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditUser; // Make sure this is exported