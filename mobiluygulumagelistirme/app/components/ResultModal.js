import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

const ResultModal = ({ visible, onClose, patient, selectedDate, onSelectDate }) => {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {patient ? `${patient.name} ${patient.surname}'s Results` : 'Lab Results'}
          </Text>

          <ScrollView style={styles.dateList}>
            {patient?.labResults && Object.keys(patient.labResults).map((date) => (
              <TouchableOpacity
                key={date}
                style={[styles.dateItem, selectedDate === date && styles.selectedDate]}
                onPress={() => onSelectDate(date)}
              >
                <Text style={styles.dateText}>{formatDate(date)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedDate && patient?.labResults[selectedDate] && (
            <ScrollView style={styles.resultContainer}>
              {Object.entries(patient.labResults[selectedDate])
                .filter(([key]) => key !== 'doctorId')
                .map(([testName, value]) => {
                  const evaluation = patient.evaluations?.[testName];
                  return (
                    <TouchableOpacity
                      key={testName}
                      style={styles.resultRow}
                      onPress={() => {
                        setSelectedTest({ testName, value, evaluation });
                        setDetailModalVisible(true);
                      }}
                    >
                      <Text style={styles.testName}>{testName}</Text>
                      <View style={styles.valueStatusContainer}>
                        <Text style={styles.testValue}>{value} g/L</Text>
                        {evaluation && (
                          <View style={[styles.statusBadge, { backgroundColor: evaluation.color }]}>
                            <Text style={styles.statusText}>{evaluation.status}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        {selectedTest && (
          <Modal
            visible={detailModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setDetailModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedTest.testName}</Text>
                <Text style={styles.testValue}>{selectedTest.value} g/L</Text>
                {selectedTest.evaluation && (
                  <Text style={[styles.statusText, { color: selectedTest.evaluation.color }]}>
                    {selectedTest.evaluation.status}
                  </Text>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={() => setDetailModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default ResultModal;