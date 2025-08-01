// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { LocationProvider } from './src/context/LocationContext';
import { AttendanceProvider } from './src/context/AttendanceContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import AttendanceHistoryScreen from './src/screens/AttendanceHistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ManualCheckInScreen from './src/screens/ManualCheckInScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'History') {
            iconName = 'history';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={AttendanceHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// In App.js, update your navigation:
const App = () => {
  return (
    <PaperProvider>
      <LocationProvider>
        <AttendanceProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Signup"
                component={SignupScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MainApp"
                component={TabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ManualCheckIn"
                component={ManualCheckInScreen}
                options={{ title: 'Manual Check-In' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AttendanceProvider>
      </LocationProvider>
    </PaperProvider>
  );
};

export default App;
