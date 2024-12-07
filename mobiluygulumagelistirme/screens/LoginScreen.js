import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { styles } from '../styles';

export function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const users = [
    { username: 'admin', password: '12345', role: 'admin' },
    { username: 'user1', password: 'password1', role: 'user' },
    { username: 'user2', password: 'password2', role: 'user' },
  ];

  // Kimlik doğrulama işlemi
  const handleLogin = () => {
    const user = users.find(
      (user) => user.username === username && user.password === password
    );

    if (user) {
      if (user.role === 'admin') {
        // Yönetici ise Admin Paneeline Yönlendir
        navigation.navigate('AdminDashboard');
      } else {
        // Sıradan kullanıcı ise Kullanıcı Paneeline Yönlendir
        navigation.navigate('UserDashboard');
      }
    } else {
      Alert.alert('Hata', 'Kullanıcı adı veya şifre hatalı!');
    }
  };

  return (
    <View style={styles.loginContainer}>
      <Text style={styles.title}>Giriş Yap</Text>

      {/* Kullanıcı adı giriş alanı */}
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        value={username}
        onChangeText={setUsername}
      />

      {/* Şifre giriş alanı */}
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Giriş yap butonu */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>
    
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Hesabın yok mu? Kayıt ol</Text>
      </TouchableOpacity>
    </View>
  );
}
