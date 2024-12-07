import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboard';
import { UserDashboardScreen } from '../screens/UserDashboard';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="UserDashboard" component={UserDashboardScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}