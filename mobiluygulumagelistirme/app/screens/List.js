import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const List = ({ navigation }) => {
  const [labResults, setLabResults] = useState([]);
  const currentUser = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    const fetchLabResults = async () => {
      try {
        const q = query(
          collection(FIREBASE_DB, 'labResults'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
        setLabResults(results);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchLabResults();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Details', { resultId: item.id })}
    >
      <Text style={styles.date}>
        {new Date(item.testDate).toLocaleDateString()}
      </Text>
      <View style={styles.values}>
        <View style={styles.row}>
          <Text>IgA: {item.IgA} mg/dL</Text>
          <Text>IgM: {item.IgM} mg/dL</Text>
        </View>
        <View style={styles.row}>
          <Text>IgG: {item.IgG} mg/dL</Text>
          <Text>IgG1: {item.IgG1} mg/dL</Text>
        </View>
        <View style={styles.row}>
          <Text>IgG2: {item.IgG2} mg/dL</Text>
          <Text>IgG3: {item.IgG3} mg/dL</Text>
        </View>
        <Text>IgG4: {item.IgG4} mg/dL</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Laboratory Results</Text>
      <FlatList
        data={labResults}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  values: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  }
});

export default List;