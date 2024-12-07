import AsyncStorage from '@react-native-async-storage/async-storage';
import User from '../models/user';

// Kullanıcıları al
export const getUsers = async () => {
  const users = await AsyncStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

// Kullanıcı kaydet
export const registerUser = async (user) => {
  const users = await getUsers();
  users.push(user);
  await AsyncStorage.setItem('users', JSON.stringify(users));
};

// Kullanıcı giriş kontrolü
export const loginUser = async (email, password) => {
  const users = await getUsers();
  return users.find((u) => u.email === email && u.password === password);
};

// Kullanıcı bilgilerini güncelle
export const updateUser = async (updatedUser) => {
  const users = await getUsers();
  const updatedUsers = users.map((user) =>
    user.id === updatedUser.id ? { ...user, ...updatedUser } : user
  );
  await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
};
