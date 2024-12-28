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
        <Text style={styles.menuText}>Enter Lab Values</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('PatientManagement')}
      >
        <Text style={styles.menuText}>Manage Patients</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('DoctorPanel')}
      >        
        <Text style={styles.menuText}>Doctor Panel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('GuidelineManager')}
      >        
        <Text style={styles.menuText}>Guidline Management</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('GuidelineProcessMenuScreen')}
      >
        <Text style={styles.menuText}>Guideline Process</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItemLogout}
        onPress={handleLogout}
      >
        <Text style={styles.menuText}>Logout</Text>
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