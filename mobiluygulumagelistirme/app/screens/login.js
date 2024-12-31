import { StyleSheet, Text, View, TextInput, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const docRef = doc(FIREBASE_DB, 'users', userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        Alert.alert('Error', 'User data not found');
        return;
      }

      const userData = docSnap.data();
      if (userData.userType === 'doctor') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'DoctorLayout' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'PatientLayout' }],
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'An error occurred during login.';
      
      switch (error.code) {
        case 'auth/network-request-failed':
          errorMessage = 'Network connection failed. Please check your internet connection.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'User not found.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Invalid password.';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Login Error', errorMessage);
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

  const signUp = async () => {
    if (!email || !password || !name || !surname || !gender || !birthDate) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
      Alert.alert('Error', 'Invalid birth date format. Use DD/MM/YYYY');
      return;
    }

    if (!['M', 'F'].includes(gender.toUpperCase())) {
      Alert.alert('Error', 'Gender must be M or F');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { age, months } = calculateAgeAndMonths(birthDate);
      const userType = email.includes('admin') ? 'doctor' : 'patient';

      const userDocRef = doc(FIREBASE_DB, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email,
        name,
        surname,
        gender: gender.toUpperCase(),
        birthDate,
        age,
        months,
        userType,
        createdAt: new Date().toISOString()
      });
      
      Alert.alert('Success', 'Registration complete', [
        { text: 'OK', onPress: () => setIsRegistering(false) }
      ]);
      
      // Clear form
      setEmail('');
      setPassword('');
      setName('');
      setSurname('');
      setGender('');
      setBirthDate('');
      
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!isRegistering ? (
        <>
          <Text style={styles.title}>Giriş</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            autoCapitalize="none"
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#2196F3" />
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={signIn}>
                <Text style={styles.buttonText}>Giriş</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={() => setIsRegistering(true)}>
                <Text style={styles.buttonText}>Hesap oluştur</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      ) : (
        <>
          <Text style={styles.title}>Kayıt ol</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            autoCapitalize="none"
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
          />
          <TextInput
            style={styles.input}
            placeholder="Ad"
            onChangeText={setName}
            value={name}
          />
          <TextInput
            style={styles.input}
            placeholder="Soyad"
            onChangeText={setSurname}
            value={surname}
          />
          <TextInput
            style={styles.input}
            placeholder="Cinsiyet (M/F)"
            onChangeText={setGender}
            value={gender}
            maxLength={1}
            autoCapitalize="characters"
          />
          <TextInput
            style={styles.input}
            placeholder="Doğum tarihi (DD/MM/YYYY)"
            onChangeText={setBirthDate}
            value={birthDate}
            keyboardType="numeric"
          />
          {loading ? (
            <ActivityIndicator size="large" color="#2196F3" />
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={signUp}>
                <Text style={styles.buttonText}>Kayıt ol</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={() => setIsRegistering(false)}>
                <Text style={styles.buttonText}>Girişe dön</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
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
    color: '#333',
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
  button: {
    backgroundColor: '#2196F3',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default Login;