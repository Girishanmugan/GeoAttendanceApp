import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocation } from './LocationContext';

const AttendanceContext = createContext();

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

export const AttendanceProvider = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const { currentLocation, isInOfficeRadius } = useLocation();

  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      handleLocationBasedAttendance();
    }
  }, [currentLocation]);

  const loadAttendanceRecords = async () => {
    try {
      const records = await AsyncStorage.getItem('attendanceRecords');
      if (records) {
        setAttendanceRecords(JSON.parse(records));
      }
      
      const session = await AsyncStorage.getItem('currentSession');
      if (session) {
        setCurrentSession(JSON.parse(session));
        setIsCheckedIn(true);
      }
    } catch (error) {
      console.error('Error loading attendance records:', error);
    }
  };

  const saveAttendanceRecords = async (records) => {
    try {
      await AsyncStorage.setItem('attendanceRecords', JSON.stringify(records));
    } catch (error) {
      console.error('Error saving attendance records:', error);
    }
  };

  const saveCurrentSession = async (session) => {
    try {
      if (session) {
        await AsyncStorage.setItem('currentSession', JSON.stringify(session));
      } else {
        await AsyncStorage.removeItem('currentSession');
      }
    } catch (error) {
      console.error('Error saving current session:', error);
    }
  };

  const handleLocationBasedAttendance = () => {
    if (!currentLocation) return;

    const office = isInOfficeRadius(currentLocation.latitude, currentLocation.longitude);
    
    if (office && !isCheckedIn) {
      // Auto check-in when entering office radius
      checkIn(office.name, currentLocation, 'automatic');
    } else if (!office && isCheckedIn && currentSession?.type === 'automatic') {
      // Auto check-out when leaving office radius
      checkOut(currentLocation, 'automatic');
    }
  };

  const checkIn = async (locationName, location, type = 'manual') => {
    const session = {
      id: Date.now().toString(),
      employeeId: 'EMP001', // This should come from user context
      locationName,
      checkInTime: new Date().toISOString(),
      checkInLocation: location,
      type,
      status: 'active'
    };

    setCurrentSession(session);
    setIsCheckedIn(true);
    await saveCurrentSession(session);
  };

  const checkOut = async (location, type = 'manual') => {
    if (!currentSession) return;

    const checkOutTime = new Date().toISOString();
    const workingHours = calculateWorkingHours(currentSession.checkInTime, checkOutTime);

    const record = {
      ...currentSession,
      checkOutTime,
      checkOutLocation: location,
      workingHours,
      status: 'completed'
    };

    const updatedRecords = [...attendanceRecords, record];
    setAttendanceRecords(updatedRecords);
    await saveAttendanceRecords(updatedRecords);

    setCurrentSession(null);
    setIsCheckedIn(false);
    await saveCurrentSession(null);
  };

  const calculateWorkingHours = (checkInTime, checkOutTime) => {
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);
    const diffMs = checkOut - checkIn;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100;
  };

  const manualCheckIn = async (locationName, location) => {
    await checkIn(locationName, location, 'manual');
  };

  const manualCheckOut = async (location) => {
    await checkOut(location, 'manual');
  };

  const getTotalWorkingHours = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayRecords = attendanceRecords.filter(record => 
      record.checkInTime.split('T')[0] === dateStr && record.status === 'completed'
    );
    return dayRecords.reduce((total, record) => total + record.workingHours, 0);
  };

  const getWeeklyWorkingHours = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekRecords = attendanceRecords.filter(record => 
      new Date(record.checkInTime) >= weekAgo && record.status === 'completed'
    );
    
    return weekRecords.reduce((total, record) => total + record.workingHours, 0);
  };

  return (
    <AttendanceContext.Provider value={{
      attendanceRecords,
      isCheckedIn,
      currentSession,
      manualCheckIn,
      manualCheckOut,
      getTotalWorkingHours,
      getWeeklyWorkingHours,
      calculateWorkingHours
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};