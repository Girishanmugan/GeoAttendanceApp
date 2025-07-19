import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocation } from '../context/LocationContext';
import { useAttendance } from '../context/AttendanceContext';

const ManualCheckInScreen = ({ navigation }) => {
  const { getCurrentLocation, calculateDistance } = useLocation();
  const { manualCheckIn, isCheckedIn } = useAttendance();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customLocation, setCustomLocation] = useState('');

  // Mock nearby locations (in real app, this would come from API)
  const nearbyLocations = [
    { id: 1, name: 'Client Office - ABC Corp', latitude: 28.6139, longitude: 77.2090 },
    { id: 2, name: 'Conference Hall - XYZ Building', latitude: 28.6129, longitude: 77.2095 },
    { id: 3, name: 'Training Center - DEF Complex', latitude: 28.6149, longitude: 77.2085 },
    { id: 4, name: 'Branch Office - GHI Tower', latitude: 28.6135, longitude: 77.2100 },
    { id: 5, name: 'Meeting Room - JKL Plaza', latitude: 28.6145, longitude: 77.2080 },
  ];

  useEffect(() => {
    if (isCheckedIn) {
      Alert.alert(
        'Already Checked In',
        'You are already checked in. Please check out first.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }
    
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      generateSuggestedLocations(location);
    } catch (error) {
      Alert.alert('Error', 'Unable to get current location');
    } finally {
      setIsLoading(false);
    }
  };

const generateSuggestedLocations = (userLocation) => {
  const locationsWithDistance = nearbyLocations.map(location => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      location.latitude,
      location.longitude
    );
    return {
      ...location,
      distance,
      isInRange: distance <= 500 //range
    };
  });

  const sorted = locationsWithDistance.sort((a, b) => a.distance - b.distance);
  setSuggestedLocations(sorted);
};


const handleLocationCheckIn = async (location) => {
  if (!currentLocation) {
    Alert.alert('Error', 'Current location not available');
    return;
  }

  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    location.latitude,
    location.longitude
  );

  console.log(`📏 Distance to selected location: ${distance} meters`);

  if (distance > 500) {  //range
    Alert.alert(
      'Outside Range',
      `You are too far from ${location.name} (Distance: ${Math.round(distance)}m). You must be within 500m to check in.`
    );
    return;
  }

  Alert.alert(
    'Confirm Check-In',
    `Check in at ${location.name}?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Check In',
        onPress: async () => {
          try {
            await manualCheckIn(location.name, currentLocation);
            Alert.alert('Success', 'Checked in successfully!', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          } catch (error) {
            Alert.alert('Error', 'Failed to check in');
          }
        }
      }
    ]
  );
};

  const handleCustomCheckIn = async () => {
    if (!customLocation.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Error', 'Current location not available');
      return;
    }

    Alert.alert(
      'Confirm Check-In',
      `Check in at ${customLocation}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check In',
          onPress: async () => {
            try {
              await manualCheckIn(customLocation, currentLocation);
              Alert.alert('Success', 'Checked in successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to check in');
            }
          }
        }
      ]
    );
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.locationItem}
      onPress={() => handleLocationCheckIn(item)}
    >
      <View style={styles.locationInfo}>
        <Icon name="location-on" size={24} color="#2196F3" />
        <View style={styles.locationDetails}>
          <Text style={styles.locationName}>{item.name}</Text>
          <Text style={styles.locationDistance}>
            {item.distance < 1000 
              ? `${Math.round(item.distance)}m away`
              : `${(item.distance / 1000).toFixed(1)}km away`
            }
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Manual Check-In</Text>
        <Text style={styles.subHeaderText}>
          Select a location or enter a custom location name
        </Text>
      </View>

      <View style={styles.customLocationSection}>
        <Text style={styles.sectionTitle}>Custom Location</Text>
        <View style={styles.customInputContainer}>
          <TextInput
            style={styles.customInput}
            placeholder="Enter location name"
            value={customLocation}
            onChangeText={setCustomLocation}
          />
          <TouchableOpacity
            style={styles.customCheckInButton}
            onPress={handleCustomCheckIn}
          >
            <Text style={styles.customCheckInText}>Check In</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.suggestedSection}>
        <Text style={styles.sectionTitle}>Suggested Locations</Text>
        <FlatList
          data={suggestedLocations}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={fetchCurrentLocation}
      >
        <Icon name="refresh" size={20} color="white" />
        <Text style={styles.refreshButtonText}>Refresh Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subHeaderText: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 5,
  },
  customLocationSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
  },
  customCheckInButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
  },
  customCheckInText: {
    color: 'white',
    fontWeight: 'bold',
  },
  suggestedSection: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationDetails: {
    marginLeft: 15,
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  locationDistance: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    marginHorizontal: 15,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ManualCheckInScreen;
