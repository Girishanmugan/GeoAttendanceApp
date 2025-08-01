import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { useEffect} from 'react';
import { auth } from '../firebaseConfig';


const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    employeeId: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const { fullName, email, password, confirmPassword, phoneNumber, employeeId } = formData;

    if (!fullName || !email || !password || !confirmPassword || !phoneNumber || !employeeId) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
try {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, {
    displayName: fullName
  });
  Alert.alert('Success', 'Account created successfully!', [
    { text: 'OK', onPress: () => navigation.navigate('Login') }
  ]);
} catch (error) {
  console.error('Signup error:', error);
  Alert.alert('Signup failed', error.message);
} finally {
  setLoading(false);
}
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Icon name="person-add" size={60} color="#2196F3" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          {[
            { field: 'fullName', placeholder: 'Full Name', icon: 'person' },
            { field: 'email', placeholder: 'Email Address', icon: 'email' },
            { field: 'password', placeholder: 'Password', icon: 'lock', secure: true },
            { field: 'confirmPassword', placeholder: 'Confirm Password', icon: 'lock', secure: true },
            { field: 'phoneNumber', placeholder: 'Phone Number', icon: 'phone' },
            { field: 'employeeId', placeholder: 'Employee ID', icon: 'badge' },
            { field: 'department', placeholder: 'Department (Optional)', icon: 'work' },
          ].map(input => (
            <View style={styles.inputContainer} key={input.field}>
              <Icon name={input.icon} size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={input.placeholder}
                value={formData[input.field]}
                onChangeText={text => updateFormData(input.field, text)}
                secureTextEntry={input.secure}
                autoCapitalize={input.field === 'email' ? 'none' : 'sentences'}
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginRedirect}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginRedirectText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

// ✅ Styles (copy as is)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 15,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12, color: '#333' },
  signupButton: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  signupButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  loginRedirect: { marginTop: 20, alignItems: 'center' },
  loginRedirectText: { color: '#2196F3', fontSize: 14 },
});
