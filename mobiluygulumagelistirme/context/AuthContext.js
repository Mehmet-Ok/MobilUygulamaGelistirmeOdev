// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const isUsernameTaken = (username) => {
    return users.some(user => user.username.toLowerCase() === username.toLowerCase());
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      setUsers([]);
      setCurrentUser(null);
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  };

  const resetToInitialState = async () => {
    try {
      // Create initial admin user
      const initialAdmin = {
        username: 'admin',
        password: 'admin123',
        type: 'admin'
      };
      await AsyncStorage.setItem('users', JSON.stringify([initialAdmin]));
      setUsers([initialAdmin]);
      setCurrentUser(null);
      return true;
    } catch (error) {
      console.error('Error resetting storage:', error);
      return false;
    }
  };

  const loadUsers = async () => {
    try {
      const savedUsers = await AsyncStorage.getItem('users');
      if (savedUsers) setUsers(JSON.parse(savedUsers));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const saveUser = async (newUser) => {
    try {
      const updatedUsers = [...users, newUser];
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  };

  // context/AuthContext.js - Update with edit functionality
  const updateUser = async (updatedUser) => {
    try {
      const updatedUsers = users.map(user =>
        user.username === currentUser.username ? updatedUser : user
      );
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setCurrentUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  const deleteUser = async (username) => {
    try {
      const updatedUsers = users.filter(user => user.username !== username);
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };

  const deleteAllUsers = async () => {
    try {
      const adminUsers = users.filter(user => user.type === 'admin');
      await AsyncStorage.setItem('users', JSON.stringify(adminUsers));
      setUsers(adminUsers);
      return true;
    } catch (error) {
      console.error('Error deleting all users:', error);
      return false;
    }
  };

  const updateUserByAdmin = async (username, updatedData) => {
    try {
      const updatedUsers = users.map(user =>
        user.username === username ? { ...user, ...updatedData } : user
      );
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  // Add updateUser to AuthContext.Provider value


  return (
    <AuthContext.Provider value={{ 
            users, 
            currentUser, 
            setCurrentUser, 
            saveUser, 
            updateUser, 
            deleteUser, 
            updateUserByAdmin,
            deleteAllUsers,
            clearStorage,
            resetToInitialState,
            isUsernameTaken,
     }}>
      {children}
    </AuthContext.Provider>
  );
};