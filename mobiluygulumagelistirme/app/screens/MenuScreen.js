import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

const MenuScreen = ({ navigation }) => {
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
      <Text style={styles.title}>Admin Menu</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('AdminPanel')}
      >
        <Text style={styles.buttonText}>Enter Lab Values</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]} 
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default MenuScreen;