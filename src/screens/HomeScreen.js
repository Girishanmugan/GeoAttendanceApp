import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocation } from '../context/LocationContext';
import { useAttendance } from '../context/AttendanceContext';

const HomeScreen = ({ navigation }) => {
  const { currentLocation, isLocationEnabled, isInOfficeRadius } = useLocation();
  const { 
    isCheckedIn, 
    currentSession, 
    manualCheckOut, 
    getTotalWorkingHours,
    getWeeklyWorkingHours 
  } = useAttendance();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleManualCheckOut = async () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    Alert.alert(
      'Confirm Check-Out',
      'Are you sure you want to check out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Check Out', 
          onPress: () => manualCheckOut(currentLocation) 
        }
      ]
    );
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLocationStatus = () => {
    if (!currentLocation) return 'Location not available';
    
    const office = isInOfficeRadius(currentLocation.latitude, currentLocation.longitude);
    return office ? `In ${office.name}` : 'Outside office';
  };

  const todayHours = getTotalWorkingHours(new Date());
  const weeklyHours = getWeeklyWorkingHours();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.dateText}>{formatDate(new Date())}</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Icon 
            name={isCheckedIn ? 'check-circle' : 'radio-button-unchecked'} 
            size={24} 
            color={isCheckedIn ? '#4CAF50' : '#ff9800'} 
          />
          <Text style={[styles.statusText, { color: isCheckedIn ? '#4CAF50' : '#ff9800' }]}>
            {isCheckedIn ? 'Checked In' : 'Checked Out'}
          </Text>
        </View>

        {isCheckedIn && currentSession && (
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionText}>
              Location: {currentSession.locationName}
            </Text>
            <Text style={styles.sessionText}>
              Check-in: {formatTime(currentSession.checkInTime)}
            </Text>
            <Text style={styles.sessionText}>
              Type: {currentSession.type === 'automatic' ? 'Auto' : 'Manual'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.locationCard}>
        <View style={styles.cardHeader}>
          <Icon name="location-on" size={24} color="#2196F3" />
          <Text style={styles.cardTitle}>Current Location</Text>
        </View>
        <Text style={styles.locationText}>{getLocationStatus()}</Text>
        <View style={styles.locationDetails}>
          <Text style={styles.detailText}>
            GPS: {isLocationEnabled ? 'Active' : 'Inactive'}
          </Text>
          {currentLocation && (
            <Text style={styles.detailText}>
              Coordinates: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.hoursCard}>
        <View style={styles.cardHeader}>
          <Icon name="access-time" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle}>Working Hours</Text>
        </View>
        <View style={styles.hoursGrid}>
          <View style={styles.hoursItem}>
            <Text style={styles.hoursValue}>{todayHours.toFixed(1)}h</Text>
            <Text style={styles.hoursLabel}>Today</Text>
          </View>
          <View style={styles.hoursItem}>
            <Text style={styles.hoursValue}>{weeklyHours.toFixed(1)}h</Text>
            <Text style={styles.hoursLabel}>This Week</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.manualButton}
          onPress={() => navigation.navigate('ManualCheckIn')}
        >
          <Icon name="add-location" size={24} color="white" />
          <Text style={styles.buttonText}>Manual Check-In</Text>
        </TouchableOpacity>

        {isCheckedIn && (
          <TouchableOpacity 
            style={styles.checkOutButton}
            onPress={handleManualCheckOut}
          >
            <Icon name="exit-to-app" size={24} color="white" />
            <Text style={styles.buttonText}>Check Out</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  dateText: {
    fontSize: 16,
    color: '#E3F2FD',
    marginTop: 5,
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sessionInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sessionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  locationCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  locationDetails: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  hoursCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  hoursGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  hoursItem: {
    alignItems: 'center',
  },
  hoursValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  hoursLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  actionButtons: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  manualButton: {
    backgroundColor: '#ff9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  checkOutButton: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default HomeScreen;