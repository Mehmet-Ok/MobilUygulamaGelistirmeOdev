import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FIREBASE_DB, FIREBASE_AUTH, isUserAdmin } from '../../FirebaseConfig';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

const PatientManagement = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctorPatient, setSelectedDoctorPatient] = useState('');

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) {
        alert('Please login first');
        navigation.replace('Login');
        return;
      }

      const admin = await isUserAdmin(currentUser.uid);
      if (!admin) {
        alert('Unauthorized access');
        navigation.navigate('Dashboard');
        return;
      }

      await fetchPatients();
      await fetchDoctorPatients(currentUser.uid);
    } catch (error) {
      console.error('Setup error:', error);
      alert('Error setting up patient management panel');
      navigation.navigate('Dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const patientsList = [];
      const querySnapshot = await getDocs(collection(FIREBASE_DB, 'users'));
      querySnapshot.forEach((doc) => {
        if (doc.data().userType === 'patient' && !doc.data().doctorId) {
          patientsList.push({ id: doc.id, ...doc.data() });
        }
      });
      setPatients(patientsList);
    } catch (error) {
      console.error('Fetch patients error:', error);
      throw error;
    }
  };

  const fetchDoctorPatients = async (doctorId) => {
    try {
      const doctorPatientsRef = doc(FIREBASE_DB, 'doctorPatients', doctorId);
      const doctorPatientsDoc = await getDoc(doctorPatientsRef);
      if (doctorPatientsDoc.exists()) {
        const patientIds = doctorPatientsDoc.data().patients;
        const patientsList = [];
        for (const patientId of patientIds) {
          const patientRef = doc(FIREBASE_DB, 'users', patientId);
          const patientDoc = await getDoc(patientRef);
          if (patientDoc.exists()) {
            patientsList.push({
              id: patientDoc.id,
              ...patientDoc.data()
            });
          }
        }
        setDoctorPatients(patientsList);
      }
    } catch (error) {
      console.error('Fetch doctor patients error:', error);
      throw error;
    }
  };

  const handleAssignPatient = async () => {
    if (!selectedPatient) {
      alert('Please select a patient');
      return;
    }

    try {
      setLoading(true);
      const currentUser = FIREBASE_AUTH.currentUser;
      const patientRef = doc(FIREBASE_DB, 'users', selectedPatient);
      await updateDoc(patientRef, { doctorId: currentUser.uid });

      const doctorPatientsRef = doc(FIREBASE_DB, 'doctorPatients', currentUser.uid);
      const doctorPatientsDoc = await getDoc(doctorPatientsRef);
      if (doctorPatientsDoc.exists()) {
        await updateDoc(doctorPatientsRef, {
          patients: [...doctorPatientsDoc.data().patients, selectedPatient]
        });
      } else {
        await setDoc(doctorPatientsRef, { patients: [selectedPatient] });
      }

      alert('Patient assigned successfully');
      await fetchPatients();
      await fetchDoctorPatients(currentUser.uid);
    } catch (error) {
      console.error('Assign patient error:', error);
      alert('Error assigning patient');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignPatient = async () => {
    if (!selectedDoctorPatient) {
      alert('Please select a patient');
      return;
    }

    try {
      setLoading(true);
      const currentUser = FIREBASE_AUTH.currentUser;
      const patientRef = doc(FIREBASE_DB, 'users', selectedDoctorPatient);
      await updateDoc(patientRef, { doctorId: '' });

      const doctorPatientsRef = doc(FIREBASE_DB, 'doctorPatients', currentUser.uid);
      const doctorPatientsDoc = await getDoc(doctorPatientsRef);
      if (doctorPatientsDoc.exists()) {
        const updatedPatients = doctorPatientsDoc.data().patients.filter(id => id !== selectedDoctorPatient);
        await updateDoc(doctorPatientsRef, { patients: updatedPatients });
      }

      alert('Patient unassigned successfully');
      await fetchPatients();
      await fetchDoctorPatients(currentUser.uid);
    } catch (error) {
      console.error('Unassign patient error:', error);
      alert('Error unassigning patient');
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
    <ScrollView style={styles.container}>
      
      
      <Text style={styles.subtitle}>Hasta al</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedPatient}
          onValueChange={setSelectedPatient}
          style={styles.picker}
        >
          <Picker.Item label="Hasta seçin" value="" />
          {patients.map((patient) => (
            <Picker.Item 
              key={patient.id} 
              label={`${patient.name} ${patient.surname}`} 
              value={patient.id} 
            />
          ))}
        </Picker>
      </View>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleAssignPatient}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Hasta çıkar</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDoctorPatient}
          onValueChange={setSelectedDoctorPatient}
          style={styles.picker}
        >
          <Picker.Item label="Hasta seçin" value="" />
          {doctorPatients.map((patient) => (
            <Picker.Item 
              key={patient.id} 
              label={`${patient.name} ${patient.surname}`} 
              value={patient.id} 
            />
          ))}
        </Picker>
      </View>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleUnassignPatient}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
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
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  picker: {
    height: 50,
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
  }
});

export default PatientManagement;