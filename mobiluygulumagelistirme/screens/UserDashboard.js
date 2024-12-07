import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';

export function UserDashboardScreen({ navigation }) {
    return (
        <View style={styles.dashboardContainer}>
            <Text style={styles.welcomeText}>Kullanıcı Paneli</Text>
            <TouchableOpacity 
                style={styles.button} 
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.buttonText}>Çıkış Yap</Text>
            </TouchableOpacity>
        </View>
    );
}