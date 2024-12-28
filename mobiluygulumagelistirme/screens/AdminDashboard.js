// screens/AdminDashboard.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { styles } from '../styles/styles';

const AdminDashboard = ({ navigation }) => {
  const { users, setCurrentUser, deleteUser, deleteAllUsers } = useContext(AuthContext);

  const handleDelete = (username) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: async () => {
            const success = await deleteUser(username);
            if (success) {
              alert('User deleted successfully');
            } else {
              alert('Failed to delete user');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleDeleteAllUsers = () => {
    Alert.alert(
      "Delete All Users",
      "Are you sure you want to delete all non-admin users?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete All",
          onPress: async () => {
            const success = await deleteAllUsers();
            if (success) {
              alert('All users deleted successfully');
            } else {
              alert('Failed to delete all users');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    if (item.type === 'admin') return null;

    return (
      <View style={styles.userCard}>
        <Text style={styles.userCardText}>Username: {item.username}</Text>
        <Text style={styles.userCardText}>Type: {item.type}</Text>
        <View style={styles.userCardButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.editButton]}
            onPress={() => navigation.navigate('EditUser', { user: item })}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]}
            onPress={() => handleDelete(item.username)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <TouchableOpacity 
        style={[styles.button, styles.deleteAllButton]}
        onPress={handleDeleteAllUsers}
      >
        <Text style={styles.buttonText}>Delete All Users</Text>
      </TouchableOpacity>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.username}
      />
      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]}
        onPress={() => {
          setCurrentUser(null);
          navigation.replace('Login');
        }}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminDashboard;