import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const currentUser = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(FIREBASE_DB, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      {userData && (
        <View style={styles.profileCard}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{userData.name} {userData.surname}</Text>
          
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userData.email}</Text>
          
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>{userData.gender}</Text>
          
          <Text style={styles.label}>Birth Date</Text>
          <Text style={styles.value}>{userData.birthDate}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => FIREBASE_AUTH.signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default Profile;