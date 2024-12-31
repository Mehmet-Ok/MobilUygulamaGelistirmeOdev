import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect } from 'react';
import { FIREBASE_DB, FIREBASE_AUTH, isUserAdmin, addLabResult } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const AdminPanel = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [values, setValues] = useState({
    IgA: '',
    IgM: '',
    IgG: '',
    IgG1: '',
    IgG2: '',
    IgG3: '',
    IgG4: ''
  });

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
        navigation.navigate('Dashboard'); // Navigate to a specific screen instead of goBack
        return;
      }

      await fetchPatients(currentUser.uid);
    } catch (error) {
      console.error('Setup error:', error);
      alert('Error setting up admin panel');
      navigation.navigate('Dashboard'); // Navigate to a specific screen instead of goBack
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async (doctorId) => {
    setLoading(true);
    try {
      console.log('Fetching patients for doctor:', doctorId);

      const doctorPatientsRef = doc(FIREBASE_DB, 'doctorPatients', doctorId);
      const doctorPatientsDoc = await getDoc(doctorPatientsRef);

      if (!doctorPatientsDoc.exists()) {
        console.log('No patients found for doctor');
        setPatients([]);
        return;
      }

      const patientIds = doctorPatientsDoc.data().patients || [];
      console.log('Patient IDs:', patientIds);

      const patientsList = [];

      for (const patientId of patientIds) {
        const patientRef = doc(FIREBASE_DB, 'users', patientId);
        const patientDoc = await getDoc(patientRef);

        if (patientDoc.exists()) {
          const labResultsRef = doc(FIREBASE_DB, 'labResults', patientId);
          const labResultsDoc = await getDoc(labResultsRef);
          const labResults = labResultsDoc.exists() ? labResultsDoc.data() : {};

          console.log(`Lab results for patient ${patientId}:`, labResults);

          patientsList.push({
            id: patientId,
            ...patientDoc.data(),
            labResults
          });
        }
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

  const handleSave = async () => {
    if (!selectedPatient) {
      alert('Please select a patient');
      return;
    }

    try {
      setLoading(true);
      const currentUser = FIREBASE_AUTH.currentUser;

      await addLabResult({
        userId: selectedPatient,
        doctorId: currentUser.uid,
        testDate: new Date().toISOString(),
        ...values
      });

      alert('Values saved successfully');
      setSelectedPatient('');
      setValues({
        IgA: '',
        IgM: '',
        IgG: '',
        IgG1: '',
        IgG2: '',
        IgG3: '',
        IgG4: ''
      });
    } catch (error) {
      console.error('Error saving values:', error);
      alert('Error saving values');
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
      <Text style={styles.title}>Tahlil sonucu girin</Text>

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

      {Object.keys(values).map((key) => (
        <TextInput
          key={key}
          style={styles.input}
          placeholder={`${key} değeri`}
          value={values[key]}
          onChangeText={(text) => setValues({ ...values, [key]: text })}
          keyboardType="numeric"
        />
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
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

export default AdminPanel;