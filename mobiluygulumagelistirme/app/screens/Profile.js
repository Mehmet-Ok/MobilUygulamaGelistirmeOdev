import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Profile = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    email: '',
    birthDate: '',
    gender: '',
    age: '',
    months: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) {
        alert('Please login first');
        navigation.replace('Login');
        return;
      }

      const userRef = doc(FIREBASE_DB, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserData(userDoc.data());
        console.log(userData.age, "\n");
        console.log(userData.months, "\n");
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('Error fetching user data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAgeAndMonths = (birthDate) => {
    const birth = new Date(birthDate.split('/').reverse().join('-'));
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear();
    const months = (now.getMonth() - birth.getMonth()) + (age * 12);
    return { age, months };
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) {
        alert('Please login first');
        navigation.replace('Login');
        return;
      }

      const { age, months } = calculateAgeAndMonths(userData.birthDate);
      const updatedData = { ...userData, age, months };

      const userRef = doc(FIREBASE_DB, 'users', currentUser.uid);
      await updateDoc(userRef, updatedData);

      // Update local state with new data
      setUserData(updatedData);


      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <View style={styles.profileCard}>
        <TextInput
          style={styles.input}
          placeholder="Ad"
          value={userData.name}
          onChangeText={(text) => setUserData({ ...userData, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Soyad"
          value={userData.surname}
          onChangeText={(text) => setUserData({ ...userData, surname: text })}
        />
        <TextInput
          style={styles.inputMail }
          placeholder="Email"
          value={userData.email}
          onChangeText={(text) => setUserData({ ...userData, email: text })}
          editable={false} // Email is not editable
        />
        <TextInput
          style={styles.input}
          placeholder="Doğum tarihi (DD/MM/YYYY)"
          value={userData.birthDate}
          onChangeText={(text) => setUserData({ ...userData, birthDate: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Cinsiyet"
          value={userData.gender}
          onChangeText={(text) => setUserData({ ...userData, gender: text })}
        />
        {/* <TextInput
          style={styles.input}
          placeholder="Age"
          value={userData.age}
          // onChangeText={(text) => setUserData({ ...userData, age: text })}
          editable = {false}
        />
        <TextInput
          style={styles.input}
          placeholder="Months"
          value={userData.months}
          // onChangeText={(text) => setUserData({ ...userData, months: text })}
          editable={false} 
        /> */}
        <Text style={styles.textBox}>Yaş: {userData.age}</Text>
        <Text style={styles.textBox}>Ay: {userData.months}</Text>
        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Profili güncelle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  inputMail: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#d1d1d1',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textBox:{
    fontSize: 16,
    marginBottom: 15,
    borderWidth:1,
    borderRadius: 8,
    backgroundColor: '#d1d1d1',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    padding: 14,
    borderColor: '#ddd',
  }
});

export default Profile;