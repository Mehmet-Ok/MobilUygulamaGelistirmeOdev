import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const GuidelineEditScreen = ({ navigation }) => {
  const [guidelines, setGuidelines] = useState([]);
  const [selectedGuideline, setSelectedGuideline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIREBASE_DB, 'guidelines'));
        const guidelinesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGuidelines(guidelinesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching guidelines:', error);
        Alert.alert('Error', 'Failed to fetch guidelines');
        setLoading(false);
      }
    };
    fetchGuidelines();
  }, []);

  const handleSaveChanges = async () => {
    if (!selectedGuideline) return;
    try {
      const docRef = doc(FIREBASE_DB, 'guidelines', selectedGuideline.id);
      await updateDoc(docRef, selectedGuideline);
      Alert.alert('Success', 'Guideline updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update guideline');
    }
  };

  const deleteGuideline = async () => {
    if (!selectedGuideline) return;
    
    Alert.alert(
      "Delete Guideline",
      "Are you sure you want to delete this guideline?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const docRef = doc(FIREBASE_DB, 'guidelines', selectedGuideline.id);
              await deleteDoc(docRef);
              setGuidelines(guidelines.filter(g => g.id !== selectedGuideline.id));
              setSelectedGuideline(null);
              Alert.alert('Success', 'Guideline deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete guideline');
            }
          }
        }
      ]
    );
  };

  const addAgeRange = () => {
    if (!selectedGuideline) return;
    const newAgeRange = {
      ageRange: "New Age Range",
      testValues: {
        minIgA: '',
        maxIgA: '',
        minIgM: '',
        maxIgM: '',
        minIgG: '',
        maxIgG: '',
        minIgG1: '',
        maxIgG1: '',
        minIgG2: '',
        maxIgG2: '',
        minIgG3: '',
        maxIgG3: '',
        minIgG4: '',
        maxIgG4: '',
      }
    };
    setSelectedGuideline({
      ...selectedGuideline,
      ageRanges: [...selectedGuideline.ageRanges, newAgeRange]
    });
  };

  const removeAgeRange = (indexToRemove) => {
    if (!selectedGuideline) return;
    const newAgeRanges = selectedGuideline.ageRanges.filter((_, index) => index !== indexToRemove);
    setSelectedGuideline({
      ...selectedGuideline,
      ageRanges: newAgeRanges
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Guidelines</Text>
      <View style={styles.guidelineHeader}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedGuideline?.id}
            onValueChange={(itemValue) => {
              const selected = guidelines.find(g => g.id === itemValue);
              setSelectedGuideline(selected);
            }}
            style={styles.picker}
          >
            <Picker.Item label="Select a guideline" value={null} />
            {guidelines.map(guideline => (
              <Picker.Item 
                key={guideline.id} 
                label={guideline.testName} 
                value={guideline.id}
              />
            ))}
          </Picker>
        </View>
        {selectedGuideline && (
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={deleteGuideline}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedGuideline && (
        <View style={styles.guidelineContainer}>
          <TouchableOpacity style={styles.addButton} onPress={addAgeRange}>
            <Text style={styles.buttonText}>Add Age Range</Text>
          </TouchableOpacity>

          {selectedGuideline.ageRanges.map((ageRange, index) => (
            <View key={index} style={styles.ageRangeContainer}>
              <View style={styles.ageRangeHeader}>
                <View style={styles.ageRangeRow}>
                  <Text style={styles.ageRangeLabel}>Age Range:</Text>
                  <TextInput
                    style={styles.ageRangeInput}
                    value={ageRange.ageRange}
                    // placeholder='New Age Range'
                    onChangeText={(text) => {
                      const newAgeRanges = [...selectedGuideline.ageRanges];
                      newAgeRanges[index].ageRange = text;
                      setSelectedGuideline({ ...selectedGuideline, ageRanges: newAgeRanges });
                    }}
                  />
                </View>
                <TouchableOpacity 
                  style={styles.removeButton} 
                  onPress={() => removeAgeRange(index)}
                >
                  <Text style={styles.removeButtonText}>X</Text>
                </TouchableOpacity>
              </View>

              {Object.keys(ageRange.testValues)
                .filter(key => key.startsWith('min'))
                .map(key => {
                  const baseName = key.replace('min', '');
                  const maxKey = `max${baseName}`;
                  return (
                    <View key={key} style={styles.row}>
                      <Text style={styles.testName}>{baseName}:</Text>
                      <View style={styles.inputGroup}>
                        <TextInput
                          style={styles.groupedInput}
                          placeholder="Min"
                          value={ageRange.testValues[key]?.toString() || ''}
                          onChangeText={(text) => {
                            const newAgeRanges = [...selectedGuideline.ageRanges];
                            newAgeRanges[index].testValues[key] = text;
                            setSelectedGuideline({ ...selectedGuideline, ageRanges: newAgeRanges });
                          }}
                          keyboardType="numeric"
                        />
                        <Text style={styles.separator}>-</Text>
                        <TextInput
                          style={styles.groupedInput}
                          placeholder="Max"
                          value={ageRange.testValues[maxKey]?.toString() || ''}
                          onChangeText={(text) => {
                            const newAgeRanges = [...selectedGuideline.ageRanges];
                            newAgeRanges[index].testValues[maxKey] = text;
                            setSelectedGuideline({ ...selectedGuideline, ageRanges: newAgeRanges });
                          }}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  );
                })}
            </View>
          ))}
          <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  guidelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginRight: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guidelineContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  ageRangeContainer: {
    marginBottom: 20,
  },
  ageRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ageRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ageRangeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  ageRangeInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  testName: {
    fontSize: 16,
    width: '30%',
    color: '#333',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 5,
  },
  groupedInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  separator: {
    paddingHorizontal: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#f44336',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GuidelineEditScreen;