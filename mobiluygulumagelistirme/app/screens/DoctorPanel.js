import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const DoctorPanel = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [guidelines, setGuidelines] = useState([]);
  const [selectedGuideline, setSelectedGuideline] = useState('');
  const [mergedGuideline, setMergedGuideline] = useState(null);

  useEffect(() => {
    checkAdminAndLoadData();
    fetchGuidelines();
  }, []);

  const checkAdminAndLoadData = async () => {
    fetchPatients(FIREBASE_AUTH.currentUser.uid);
  };

  const getAgeInMonths = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
    return ageInMonths;
  };

  const findAgeRange = (ageInMonths, ageRanges) => {
    return ageRanges && ageRanges.find(range => {
      const [min, max] = range.ageRange.split('-').map(Number);
      return ageInMonths >= min && (max === undefined || ageInMonths <= max);
    });
  };

  const evaluateLabResults = (labResults, guidelineRanges, patientBirthDate) => {
    if (!labResults || !guidelineRanges || !guidelineRanges.ageRanges || !patientBirthDate) {
      return {};
    }

    const evaluations = {};
    const firstResultKey = Object.keys(labResults)[0];
    const testResults = labResults[firstResultKey];

    if (!testResults) return {};
    const patientAgeInMonths = getAgeInMonths(patientBirthDate);
    const ageRange = findAgeRange(patientAgeInMonths, guidelineRanges.ageRanges);

    if (!ageRange) {
      return {};
    }

    Object.entries(testResults).forEach(([testName, value]) => {
      if (testName === 'doctorId' || testName === 'testDate') return;
      const testValues = ageRange.testValues;
      if (testValues && testValues[`min${testName}`] !== undefined && testValues[`max${testName}`] !== undefined) {
        const min = parseFloat(testValues[`min${testName}`] === '-' ? -Infinity : testValues[`min${testName}`]);
        const max = parseFloat(testValues[`max${testName}`] === '-' ? Infinity : testValues[`max${testName}`]);
        const testValue = parseFloat(value);

        if (testValue < min) {
          evaluations[testName] = { status: 'LOW', color: '#ff6b6b' };
        } else if (testValue > max) {
          evaluations[testName] = { status: 'HIGH', color: '#ff9f43' };
        } else {
          evaluations[testName] = { status: 'NORMAL', color: '#51cf66' };
        }
      }
    });

    console.log('Evaluations:', evaluations); // Add this line to log evaluations to the console
    return evaluations;
  };

  const fetchGuidelines = async () => {
    try {
      const guidelinesCollection = collection(FIREBASE_DB, 'guidelines');
      const guidelinesSnapshot = await getDocs(guidelinesCollection);
      const guidelinesList = guidelinesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGuidelines(guidelinesList);
    } catch (error) {
      console.error("Error fetching guidelines:", error);
      alert("Error loading guidelines");
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

  const handleGuidelineChange = (itemValue) => {
    setSelectedGuideline(itemValue);
    const selectedItem = guidelines.find(g => g.id === itemValue);
    if (selectedItem) {
      const merged = selectedItem.ageRanges.map(range => {
        const mergedValues = {};
        Object.entries(range.testValues).forEach(([key, value]) => {
          const testName = key.replace(/^(min|max)/, '');
          if (!mergedValues[testName]) {
            mergedValues[testName] = {};
          }
          mergedValues[testName][key.startsWith('min') ? 'min' : 'max'] = parseFloat(value === '-' ? (key.startsWith('min') ? -Infinity : Infinity) : value);
        });
        return { ...range, testValues: mergedValues };
      });
      setMergedGuideline({ ...selectedItem, ageRanges: merged });
      console.log('Merged Guideline:', mergedGuideline); // Log merged guideline
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setSelectedDate(null);
    setModalVisible(true);

    if (mergedGuideline) {
      const evaluations = evaluateLabResults(patient.labResults, mergedGuideline, patient.birthDate);
      console.log('Evaluations for selected patient:', evaluations); // Log evaluations for selected patient
      setSelectedPatient({ ...patient, evaluations });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Doktor paneli</Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => fetchPatients(FIREBASE_AUTH.currentUser.uid)}
      >
        <Text style={styles.refreshButtonText}>Yenile</Text>
      </TouchableOpacity>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedGuideline}
          onValueChange={handleGuidelineChange}
          style={styles.picker}
        >
          <Picker.Item label="Bir kılavuz seçin" value="" />
          {guidelines.map((guideline) => (
            <Picker.Item
              key={guideline.id}
              label={guideline.testName}
              value={guideline.id}
            />
          ))}
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        patients.map((patient) => (
          <TouchableOpacity
            key={patient.id}
            style={styles.patientContainer}
            onPress={() => handlePatientSelect(patient)}
          >
            <Text style={styles.patientName}>{`${patient.name} ${patient.surname}`}</Text>
            <Text style={styles.patientInfo}>Yaş: {patient.age}</Text>
            <Text style={styles.patientInfo}>Cinsiyet: {patient.gender}</Text>
          </TouchableOpacity>
        ))
      )}

      {selectedPatient && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setModalVisible(false);
            setSelectedPatient(null);
            setSelectedDate(null);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {`${selectedPatient.name} ${selectedPatient.surname} Sonuçları`}
              </Text>

              <ScrollView style={styles.dateList}>
                {selectedPatient?.labResults && Object.keys(selectedPatient.labResults).map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[styles.dateItem, selectedDate === date && styles.selectedDate]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={styles.dateText}>{formatDate(date)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedDate && selectedPatient?.labResults[selectedDate] && (
                <ScrollView style={styles.resultContainer}>
                  {Object.entries(selectedPatient.labResults[selectedDate])
                    .filter(([key]) => key !== 'doctorId' && key !== 'testDate')
                    .map(([testName, value]) => {
                      const evaluation = selectedPatient.evaluations?.[testName];
                      console.log('Evaluation for', testName, ':', evaluation); // Add this line to log evaluations to the console
                      return (
                        <View key={testName} style={styles.resultRow}>
                          <Text style={styles.testName}>{testName}</Text>
                          <View style={styles.valueStatusContainer}>
                            <Text style={styles.testValue}>{value} g/L</Text>
                            {evaluation && (
                              <View style={[styles.statusBadge, { backgroundColor: evaluation.color }]}>
                                <Text style={styles.statusText}>{evaluation.status}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                </ScrollView>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={() => {
                setModalVisible(false);
                setSelectedPatient(null);
                setSelectedDate(null);
              }}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  },
  pickerContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  dateList: {
    maxHeight: 150,
    marginBottom: 15,
  },
  dateItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedDate: {
    backgroundColor: '#e3f2fd',
  },
  dateText: {
    fontSize: 16,
    color: '#2196F3',
  },
  resultContainer: {
    marginTop: 10,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  valueStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  testValue: {
    fontSize: 16,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DoctorPanel;