import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


import Login from './app/screens/login';
import Dashboard from './app/screens/Dashboard';
import AdminPanel from './app/screens/AdminPanel';
import DoctorPanel from './app/screens/DoctorPanel';
import PatientManagement from './app/screens/PatientManagement';
import MenuScreen from './app/screens/MenuScreen';
import List from './app/screens/List';
import Profile from './app/screens/Profile';
import GuidelineManager from './app/screens/GuidelineManager';
import GuidelineProcessMenuScreen from './app/screens/GuidelineProcessMenuScreen';
import GuidelineList from './app/screens/GuidelineList';
import GuidelineEditScreen from './app/screens/GuidelineEditScreen';

const Stack = createNativeStackNavigator();

function DoctorLayout() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MenuScreen" component={MenuScreen} />
      <Stack.Screen name="AdminPanel" component={AdminPanel} />
      <Stack.Screen name="PatientManagement" component={PatientManagement} />
      <Stack.Screen name="DoctorPanel" component={DoctorPanel} />
      <Stack.Screen name="GuidelineManager" component={GuidelineManager} />
      <Stack.Screen name="GuidelineProcessMenuScreen" component={GuidelineProcessMenuScreen} />
      <Stack.Screen name="GuidelineList" component={GuidelineList} />
      <Stack.Screen name="GuidelineEditScreen" component={GuidelineEditScreen} />
    </Stack.Navigator>
  );
}

function PatientLayout() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="List" component={List} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
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
      <Stack.Navigator>
        {user ? (
          userType === 'doctor' ? (
            <Stack.Screen name="DoctorLayout" component={DoctorLayout} options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="PatientLayout" component={PatientLayout} options={{ headerShown: false }} />
          )
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}