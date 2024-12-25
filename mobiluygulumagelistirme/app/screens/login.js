import { StyleSheet, Text, View, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [gender, setGender] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const auth = FIREBASE_AUTH;

    const signIn = async () => {
        if (!email || !password) {
            alert('Please fill all fields');
            return;
        }
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const docRef = doc(FIREBASE_DB, 'users', userCredential.user.uid);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                alert('User data not found');
                return;
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async () => {
        if (!email || !password || !name || !surname || !gender || !birthDate) {
            alert('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            const userDocRef = doc(FIREBASE_DB, 'users', userCredential.user.uid);
            await setDoc(userDocRef, {
                email,
                name,
                surname,
                gender,
                birthDate,
                userType: 'user',
                createdAt: new Date().toISOString()
            });
            
            console.log('Registration complete');
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {!isRegistering ? (
                <>
                    <Text style={styles.title}>Login</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        autoCapitalize="none"
                        onChangeText={setEmail}
                        value={email}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        autoCapitalize="none"
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry={true}
                    />
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <>
                            <TouchableOpacity style={styles.button} onPress={signIn}>
                                <Text style={styles.buttonText}>Login</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.button, styles.secondaryButton]} 
                                onPress={() => setIsRegistering(true)}>
                                <Text style={styles.buttonText}>Create Account</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </>
            ) : (
                <>
                    <Text style={styles.title}>Register</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        autoCapitalize="none"
                        onChangeText={setEmail}
                        value={email}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        autoCapitalize="none"
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry={true}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        onChangeText={setName}
                        value={name}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Surname"
                        onChangeText={setSurname}
                        value={surname}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Gender (M/F)"
                        onChangeText={setGender}
                        value={gender}
                        maxLength={1}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Birth Date (DD/MM/YYYY)"
                        onChangeText={setBirthDate}
                        value={birthDate}
                    />
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <>
                            <TouchableOpacity style={styles.button} onPress={signUp}>
                                <Text style={styles.buttonText}>Register</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.button, styles.secondaryButton]} 
                                onPress={() => setIsRegistering(false)}>
                                <Text style={styles.buttonText}>Back to Login</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#2196F3',
        width: '100%',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    secondaryButton: {
        backgroundColor: '#757575',
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default Login;