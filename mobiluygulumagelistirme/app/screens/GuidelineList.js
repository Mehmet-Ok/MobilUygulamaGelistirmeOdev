import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, Button } from 'react-native';
import { fetchGuidelines } from '../../FirebaseConfig';

const GuidelineList = () => {
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGuideline, setSelectedGuideline] = useState(null);

  useEffect(() => {
    const loadGuidelines = async () => {
      try {
        const fetchedGuidelines = await fetchGuidelines();
        console.log('Fetched Guidelines:', JSON.stringify(fetchedGuidelines, null, 2)); // Debug log
        setGuidelines(fetchedGuidelines);
      } catch (err) {
        setError('Failed to load guidelines');
        console.error('Error fetching guidelines:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGuidelines();
  }, []);

  const openModal = (guideline) => {
    setSelectedGuideline(guideline);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedGuideline(null);
  };

  const formatTestValues = (testValues) => {
    const formattedValues = {};
    for (const [key, value] of Object.entries(testValues)) {
      const baseKey = key.replace(/^(min|max)/, '');
      if (!formattedValues[baseKey]) {
        formattedValues[baseKey] = {};
      }
      if (key.startsWith('min')) {
        formattedValues[baseKey].min = value;
      } else if (key.startsWith('max')) {
        formattedValues[baseKey].max = value;
      }
    }
    return formattedValues;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {guidelines.map((guideline) => (
          <TouchableOpacity key={guideline.id} style={styles.guidelineContainer} onPress={() => openModal(guideline)}>
            <Text style={styles.guidelineTitle}>Kılavuz adı: {guideline.testName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedGuideline && (
        <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.scrollView}>
              <Text style={styles.modalTitle}>Kılavuz adı: {selectedGuideline.testName}</Text>
              {selectedGuideline.ageRanges?.map((ageRange, index) => (
                <View key={index} style={styles.ageRangeContainer}>
                  <Text style={styles.ageRangeTitle}>Yaş aralığı: {ageRange.ageRange}</Text>
                  {Object.entries(formatTestValues(ageRange.testValues)).map(([key, value]) => (
                    <Text key={key} style={styles.testValueText}>{key}: {value.min}-{value.max}</Text>
                  ))}
                </View>
              ))}
            </ScrollView>
            <Button title="Close" onPress={closeModal} />
          </View>
        </View>
      </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guidelineContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  guidelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  ageRangeContainer: {
    marginTop: 8,
    paddingLeft: 16,
  },
  ageRangeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  testValueText: {
    fontSize: 14,
    color: '#495057',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',  // ekran yüksekliğinin %80'i
  },
  scrollView: {
    width: '100%',
    marginBottom: 10
  },
  ageRangeContainer: {
    marginBottom: 10,
    width: '100%'
  },
  testValueText: {
    fontSize: 14,
    marginVertical: 2
  }
});

export default GuidelineList;