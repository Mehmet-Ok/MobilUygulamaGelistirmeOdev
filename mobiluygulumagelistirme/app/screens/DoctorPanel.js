import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH, isUserAdmin } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import ResultModal from '../components/ResultModal';
import { collection, query, where, getDocs } from 'firebase/firestore';

const DoctorPanel = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

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

      await fetchPatients(currentUser.uid);
    } catch (error) {
      console.error('Setup error:', error);
      alert('Error setting up doctor panel');
      navigation.navigate('Dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Get all users with userType 'patient'
      const usersRef = collection(FIREBASE_DB, 'users');
      const q = query(usersRef, where('userType', '==', 'patient'));
      const querySnapshot = await getDocs(q);
      
      const patientsList = [];
  
      // Get each patient's data and lab results
      for (const userDoc of querySnapshot.docs) {
        const patientData = userDoc.data();
        const patientId = userDoc.id;
  
        // Get lab results for each patient
        const labResultsRef = doc(FIREBASE_DB, 'labResults', patientId);
        const labResultsDoc = await getDoc(labResultsRef);
        const labResults = labResultsDoc.exists() ? labResultsDoc.data() : {};
  
        patientsList.push({
          id: patientId,
          ...patientData,
          labResults
        });
      }
  
      console.log('All patients with lab results:', patientsList);
      setPatients(patientsList);
  
    } catch (error) {
      console.error('Error fetching patients:', error);
      alert('Error loading patient data');
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
      <Text style={styles.title}>Doctor Panel</Text>
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={() => fetchPatients(FIREBASE_AUTH.currentUser.uid)}
      >
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
      
      {patients.map((patient) => (
        <TouchableOpacity
          key={patient.id}
          style={styles.patientContainer}
          onPress={() => {
            setSelectedPatient(patient);
            setSelectedDate(null);
            setModalVisible(true);
          }}
        >
          <Text style={styles.patientName}>{`${patient.name} ${patient.surname}`}</Text>
          <Text style={styles.patientInfo}>Age: {patient.age}</Text>
          <Text style={styles.patientInfo}>Gender: {patient.gender}</Text>
          <Text style={styles.patientInfo}>
            Lab Results: {Object.keys(patient.labResults).length || 'No'} results available
          </Text>
        </TouchableOpacity>
      ))}

      <ResultModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedPatient(null);
          setSelectedDate(null);
        }}
        patient={selectedPatient}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
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
  refreshButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  patientInfo: {
    fontSize: 16,
    marginBottom: 5,
  }
});

export default DoctorPanel;