import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

const Dashboard = ({ navigation }) => {
  const handleLogout = () => {
    FIREBASE_AUTH.signOut()
      .then(() => {
        navigation.navigate('Login'); // navigation.replace yerine navigation.navigate kullanıldı
      })
      .catch((error) => {
        console.error('Logout error:', error);
        alert('Error logging out');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to E-Laboratory</Text>
      
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('List')}>
          <Text style={styles.menuText}>Lab Results</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.menuText}>Profile Management</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  menuContainer: {
    width: '100%',
    maxWidth: 300,
  },
  menuItem: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Dashboard;