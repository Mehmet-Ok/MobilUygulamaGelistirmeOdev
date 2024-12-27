import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const ResultModal = ({ visible, onClose, patient, selectedDate, onSelectDate }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {patient?.name} {patient?.surname} - Lab Results
          </Text>
          
          <ScrollView style={styles.dateList}>
            {patient?.labResults && Object.keys(patient.labResults).map((date) => (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dateItem,
                  selectedDate === date && styles.selectedDate
                ]}
                onPress={() => onSelectDate(date)}
              >
                <Text style={styles.dateText}>
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedDate && patient?.labResults[selectedDate] && (
            <View style={styles.resultContainer}>
              {Object.entries(patient.labResults[selectedDate])
                .filter(([key]) => !['doctorId', 'testDate'].includes(key))
                .map(([key, value]) => (
                  <View key={key} style={styles.row}>
                    <Text style={styles.label}>{key}</Text>
                    <Text style={styles.value}>{value} g/L</Text>
                  </View>
                ))}
            </View>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
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
    color: '#333',
  },
  dateList: {
    maxHeight: 200,
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
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
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