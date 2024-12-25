import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './app/screens/login';
import Dashboard from './app/screens/Dashboard';
import List from './app/screens/List';
import Profile from './app/screens/Profile';
import AdminPanel from './app/screens/AdminPanel';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';

const Stack = createNativeStackNavigator();
const InsideStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();

function AdminLayout() {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen name="AdminPanel" component={AdminPanel} />
    </AdminStack.Navigator>
  );
}

function UserLayout() {
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen name="Dashboard" component={Dashboard} />
      <InsideStack.Screen name="List" component={List} />
      <InsideStack.Screen name="Profile" component={Profile} />
    </InsideStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        const docRef = doc(FIREBASE_DB, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserType(docSnap.data().userType);
        }
      }
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {user ? (
          userType === 'admin' ? (
            <Stack.Screen 
              name="AdminInside" 
              component={AdminLayout} 
              options={{ headerShown: false }} 
            />
          ) : (
            <Stack.Screen 
              name="UserInside" 
              component={UserLayout} 
              options={{ headerShown: false }} 
            />
          )
        ) : (
          <Stack.Screen 
            name="Login" 
            component={Login} 
            options={{ headerShown: false }} 
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});