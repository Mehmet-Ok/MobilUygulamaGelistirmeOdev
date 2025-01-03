import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

const MenuScreen = ({ navigation }) => {
  const handleLogout = () => {
    FIREBASE_AUTH.signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch((error) => {
        console.error('Logout error:', error);
        alert('Error logging out');
      });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('AdminPanel')}
      >
        <Text style={styles.menuText}>Tahlil sonucu gir</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('PatientManagement')}
      >
        <Text style={styles.menuText}>Hasta yönetimi</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('DoctorPanel')}
      >        
        <Text style={styles.menuText}>Doktor paneli</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('GuidelineProcessMenuScreen')}
      >
        <Text style={styles.menuText}>Kılavuz yönetimi</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItemLogout}
        onPress={handleLogout}
      >
        <Text style={styles.menuText}>Çıkış</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItem: {
    width: '80%',
    padding: 20,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    marginBottom: 15,
  },
  menuItemLogout: {
    width: '80%',
    padding: 20,
    backgroundColor: '#D01110',
    borderRadius: 8,
    marginBottom: 15,
  },
  menuText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MenuScreen;