import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { registerUser } from '../services/userService';
import User from '../models/user';
import { styles } from '../styles';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_again, setPassword_again] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Hata', 'Tüm alanları doldurun!');
      return;
    }

    const newUser = new User(Date.now(), name, email, password);
    await registerUser(newUser);
    Alert.alert('Başarılı', 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
    navigation.navigate('LoginScreen');
  };

  return (
    <View style={styles.loginContainer}>
      <TextInput
        placeholder="Kullanıcı adı"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Şifre Tekrar"
        value={password_again}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Kayıt Ol" onPress={handleRegister} />
    </View>
  );
};

export default RegisterScreen;
