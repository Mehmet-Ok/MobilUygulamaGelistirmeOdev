// screens/UserList.js
import React, { useContext } from 'react';
import { View, Text, FlatList } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { styles } from '../styles/styles';

const UserList = () => {
  const { users } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User List</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.username}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>Username: {item.username}</Text>
            <Text>Type: {item.type}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default UserList;