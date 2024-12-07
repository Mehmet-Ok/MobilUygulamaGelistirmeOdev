import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';

export function AdminDashboardScreen({ navigation }) {
    return (
        <View style={styles.dashboardContainer}>
            <Text style={styles.welcomeText}>Yönetici Paneli</Text>
            <TouchableOpacity 
                style={styles.button} 
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.buttonText}>Çıkış Yap</Text>
            </TouchableOpacity>
        </View>
    );
}