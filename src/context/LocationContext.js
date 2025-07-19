import React, { createContext, useContext, useState, useEffect } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [watchId, setWatchId] = useState(null);

  const officeLocations = [
    {
      id: 1,
      name: 'Main Office',
      latitude: 11.198949,
      longitude: 77.476942,
      radius: 500
    }
  ];

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to location for attendance tracking.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startLocationTracking = async () => {
    console.log('📍 startLocationTracking called');
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    const id = Geolocation.watchPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp
        };
        console.log('✅ Updated location:', coords);
        setCurrentLocation(coords);
        setIsLocationEnabled(true);
      },
      (error) => {
        console.error('❌ Location error:', error);
        setIsLocationEnabled(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 10
      }
    );
    console.log('📍 Location watch started, watchId:', id);
    setWatchId(id);
  };

  const stopLocationTracking = () => {
    if (watchId != null) {
      Geolocation.clearWatch(watchId);
      console.log('🛑 Location watch stopped, watchId:', watchId);
      setWatchId(null);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const isInOfficeRadius = (userLat, userLon) => {
    if (!userLat || !userLon) {
      console.log('⚠️ No user coordinates available');
      return null;
    }

    return officeLocations.find(office => {
      const distance = calculateDistance(userLat, userLon, office.latitude, office.longitude);
      console.log(`📏 Office: ${office.name}`);
      console.log(`   ↳ User: ${userLat}, ${userLon}`);
      console.log(`   ↳ Office: ${office.latitude}, ${office.longitude}`);
      console.log(`   ↳ Distance: ${distance.toFixed(2)} m (radius: ${office.radius})`);
      return distance <= office.radius;
    });
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );
    });
  };

  useEffect(() => {
    startLocationTracking();
    return () => {
      stopLocationTracking();
    };
  }, []);

  return (
    <LocationContext.Provider value={{
      currentLocation,
      isLocationEnabled,
      officeLocations,
      isInOfficeRadius,
      getCurrentLocation,
      calculateDistance,
      startLocationTracking,
      stopLocationTracking
    }}>
      {children}
    </LocationContext.Provider>
  );
};
