import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Launch'>;

const LaunchScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4B7BE5" barStyle="light-content" />

      <Image
        source={{ uri: 'https://img.icons8.com/fluency/96/attendance-mark.png' }}
        style={styles.logo}
      />

      <Text style={styles.title}>Geo-Location Attendance Tracker</Text>
      <Text style={styles.subtitle}>Automate & Secure Employee Attendance</Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LaunchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B7BE5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#4B7BE5',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
