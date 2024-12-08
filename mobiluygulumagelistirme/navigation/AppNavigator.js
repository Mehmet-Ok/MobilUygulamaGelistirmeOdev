// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import UserDashboard from '../screens/UserDashboard';
import AdminDashboard from '../screens/AdminDashboard';
import UserList from '../screens/UserList';
import EditUser from '../screens/EditUser';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { currentUser } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!currentUser ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : currentUser.type === 'admin' ? (
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="UserList" component={UserList} />
            <Stack.Screen name="EditUser" component={EditUser} />
          </>
        ) : (
          <Stack.Screen name="UserDashboard" component={UserDashboard} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}