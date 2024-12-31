import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { FIREBASE_DB, addGuideline } from '../../FirebaseConfig';

const GuidelineManager = () => {
  const [ageRange, setAgeRange] = useState('');
  const [ageRanges, setAgeRanges] = useState([]);
  const [testName, setTestName] = useState('');
  const [guidelines, setGuidelines] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRangeIndex, setCurrentRangeIndex] = useState(null);
  const [currentTestValues, setCurrentTestValues] = useState({
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
  });

  const handleAddAgeRange = () => {
    if (!ageRange) {
      Alert.alert('Error', 'Please enter an age range');
      return;
    }
    setAgeRanges([...ageRanges, { ageRange, testValues: {} }]);
    setAgeRange('');
  };

  const handleRemoveAgeRange = (index) => {
    const newAgeRanges = ageRanges.filter((_, i) => i !== index);
    setAgeRanges(newAgeRanges);
  };

  const handleAddGuideline = async () => {
    if (ageRanges.length === 0 || !testName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    for (const range of ageRanges) {
      const { testValues } = range;
      if (
        !testValues.minIgA || !testValues.maxIgA ||
        !testValues.minIgM || !testValues.maxIgM ||
        !testValues.minIgG || !testValues.maxIgG ||
        !testValues.minIgG1 || !testValues.maxIgG1 ||
        !testValues.minIgG2 || !testValues.maxIgG2 ||
        !testValues.minIgG3 || !testValues.maxIgG3 ||
        !testValues.minIgG4 || !testValues.maxIgG4
      ) {
        Alert.alert('Error', 'Please fill in all test values for each age range');
        return;
      }
    }

    const newGuideline = {
      ageRanges,
      testName,
    };

    try {
      await addGuideline(newGuideline);
      setGuidelines([...guidelines, newGuideline]);
      setAgeRanges([]);
      setTestName('');
      Alert.alert('Success', 'Guideline added successfully');
    } catch (error) {
      console.error('Error adding guideline:', error);
      Alert.alert('Error', `Failed to add guideline: ${error.message}`);
    }
  };

  const handleTestValueChange = (key, value) => {
    setCurrentTestValues({ ...currentTestValues, [key]: value });
  };

  const handleSaveTestValues = () => {
    const newAgeRanges = [...ageRanges];
    newAgeRanges[currentRangeIndex].testValues = currentTestValues;
    setAgeRanges(newAgeRanges);
    setModalVisible(false);
    setCurrentTestValues({
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
    });
  };

  const handleOpenModal = (index) => {
    setCurrentRangeIndex(index);
    setCurrentTestValues(ageRanges[index].testValues);
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Kılavuz ekle</Text>
      <Text style={styles.label}>Yaş Aralığı (Örnek: 0-12 ay)</Text>
      <View style={styles.row}>
        <View style={styles.ageRangeInputContainer}>
          <TextInput
            style={styles.ageRangeInput}
            placeholder="Örnek: 0-12 ay"
            value={ageRange}
            onChangeText={setAgeRange}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddAgeRange}>
            <Text style={styles.addButtonText}>Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.ageRangesContainer}>
        {ageRanges.map((range, index) => (
          <View key={index} style={styles.ageRange}>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => handleOpenModal(index)} style={styles.flex1}>
                <Text style={styles.ageRangeText}>{range.ageRange}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemoveAgeRange(index)}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.label}>Kılavuz adı</Text>
      <TextInput
        style={styles.input}
        placeholder="Kılavuz adı"
        value={testName}
        onChangeText={setTestName}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddGuideline}>
        <Text style={styles.buttonText}>Kılavuz ekle</Text>
      </TouchableOpacity>
      <View style={styles.guidelinesContainer}>
        {guidelines.map((guideline, index) => (
          <View key={index} style={styles.guideline}>
            <Text style={styles.guidelineText}>
              {guideline.ageRanges.map(range => range.ageRange).join(', ')} - {guideline.testName}: 
              {guideline.ageRanges.map(range => (
                `IgA (${range.testValues?.minIgA} - ${range.testValues?.maxIgA}), 
                IgM (${range.testValues?.minIgM} - ${range.testValues?.maxIgM}), 
                IgG (${range.testValues?.minIgG} - ${range.testValues?.maxIgG}), 
                IgG1 (${range.testValues?.minIgG1} - ${range.testValues?.maxIgG1}), 
                IgG2 (${range.testValues?.minIgG2} - ${range.testValues?.maxIgG2}), 
                IgG3 (${range.testValues?.minIgG3} - ${range.testValues?.maxIgG3}), 
                IgG4 (${range.testValues?.minIgG4} - ${range.testValues?.maxIgG4})`
              )).join('; ')}
            </Text>
          </View>
        ))}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Test değeri gir</Text>
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Min IgA</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 0.5"
                    value={currentTestValues.minIgA}
                    onChangeText={(value) => handleTestValueChange('minIgA', value)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Max IgA</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 2.5"
                    value={currentTestValues.maxIgA}
                    onChangeText={(value) => handleTestValueChange('maxIgA', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Min IgM</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 0.4"
                    value={currentTestValues.minIgM}
                    onChangeText={(value) => handleTestValueChange('minIgM', value)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Max IgM</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 2.0"
                    value={currentTestValues.maxIgM}
                    onChangeText={(value) => handleTestValueChange('maxIgM', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Min IgG</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 7.0"
                    value={currentTestValues.minIgG}
                    onChangeText={(value) => handleTestValueChange('minIgG', value)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Max IgG</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 16.0"
                    value={currentTestValues.maxIgG}
                    onChangeText={(value) => handleTestValueChange('maxIgG', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Min IgG1</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 4.0"
                    value={currentTestValues.minIgG1}
                    onChangeText={(value) => handleTestValueChange('minIgG1', value)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Max IgG1</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 10.0"
                    value={currentTestValues.maxIgG1}
                    onChangeText={(value) => handleTestValueChange('maxIgG1', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Min IgG2</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 1.0"
                    value={currentTestValues.minIgG2}
                    onChangeText={(value) => handleTestValueChange('minIgG2', value)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Max IgG2</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 6.0"
                    value={currentTestValues.maxIgG2}
                    onChangeText={(value) => handleTestValueChange('maxIgG2', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Min IgG3</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 0.2"
                    value={currentTestValues.minIgG3}
                    onChangeText={(value) => handleTestValueChange('minIgG3', value)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Max IgG3</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 1.0"
                    value={currentTestValues.maxIgG3}
                    onChangeText={(value) => handleTestValueChange('maxIgG3', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Min IgG4</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 0.1"
                    value={currentTestValues.minIgG4}
                    onChangeText={(value) => handleTestValueChange('minIgG4', value)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Max IgG4</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 1.0"
                    value={currentTestValues.maxIgG4}
                    onChangeText={(value) => handleTestValueChange('maxIgG4', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveTestValues}>
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  ageRangeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ageRangeInput: {
    flex: 0.75,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  ageRangesContainer: {
    marginBottom: 15,
  },
  ageRange: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 5,
  },
  ageRangeText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  removeButtonText: {
    color: '#FF0000',
    fontSize: 16,
    marginLeft: 10,
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
  guidelinesContainer: {
    marginTop: 20,
  },
  guideline: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  guidelineText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalScrollView: {
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flex1: {
    flex: 1,
  },
});

export default GuidelineManager;