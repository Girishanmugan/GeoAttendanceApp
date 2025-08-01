import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAttendance } from '../context/AttendanceContext';

const AttendanceHistoryScreen = () => {
  const { attendanceRecords } = useAttendance();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, week, month

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filterRecords = () => {
    const now = new Date();
    let filtered = [...attendanceRecords];

    switch (filter) {
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = attendanceRecords.filter(record =>
          new Date(record.checkInTime) >= weekAgo
        );
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = attendanceRecords.filter(record =>
          new Date(record.checkInTime) >= monthAgo
        );
        break;
      default:
        break;
    }

    return filtered.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
  };

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString();

  const filteredRecords = filterRecords();
  const totalHours = filteredRecords
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + (r.workingHours || 0), 0);

  const daysPresent = filteredRecords.filter(r => r.status === 'completed').length;

  const renderAttendanceItem = ({ item }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleContainer}>
          <Icon
            name={item.type === 'automatic' ? 'gps-fixed' : 'edit-location'}
            size={20}
            color={item.status === 'completed' ? '#4CAF50' : '#ff9800'}
          />
          <Text style={styles.recordLocation}>{item.locationName}</Text>
        </View>
        <View style={styles.recordStatus}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'completed' ? '#4CAF50' : '#ff9800' }
          ]}>
            {item.status === 'completed' ? 'Completed' : 'Active'}
          </Text>
        </View>
      </View>

      <View style={styles.recordDetails}>
        <Text style={styles.recordDate}>{formatDate(item.checkInTime)}</Text>
        <View style={styles.timeContainer}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Check In</Text>
            <Text style={styles.timeValue}>{formatTime(item.checkInTime)}</Text>
          </View>
          {item.checkOutTime && (
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Check Out</Text>
              <Text style={styles.timeValue}>{formatTime(item.checkOutTime)}</Text>
            </View>
          )}
          {item.workingHours && (
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Hours</Text>
              <Text style={[styles.timeValue, { color: '#4CAF50', fontWeight: 'bold' }]}>
                {item.workingHours.toFixed(1)}h
              </Text>
            </View>
          )}
        </View>
        <View style={styles.typeContainer}>
          <Text style={styles.typeText}>
            Type: {item.type === 'automatic' ? 'Automatic' : 'Manual'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Attendance History</Text>
      </View>

      {/* ✅ Added summary card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Icon name="access-time" size={24} color="#2196F3" />
          <Text style={styles.summaryValue}>{totalHours.toFixed(1)}h</Text>
          <Text style={styles.summaryLabel}>Total Hours</Text>
        </View>
        <View style={styles.summaryItem}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.summaryValue}>{daysPresent}</Text>
          <Text style={styles.summaryLabel}>Days Present</Text>
        </View>
        <View style={styles.summaryItem}>
          <Icon name="event-note" size={24} color="#FF9800" />
          <Text style={styles.summaryValue}>{filteredRecords.length}</Text>
          <Text style={styles.summaryLabel}>Records</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'week', 'month'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.activeFilterButton]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === f && styles.activeFilterButtonText
            ]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRecords}
        renderItem={renderAttendanceItem}
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="history" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No attendance records found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#2196F3', padding: 20, paddingTop: 40 },
  headerText: { fontSize: 24, fontWeight: 'bold', color: 'white' },

  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: 'space-around',
    elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2,
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 2 },
  summaryLabel: { fontSize: 12, color: '#666' },

  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15, marginTop: 5,
    borderRadius: 10, padding: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
  },
  filterButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeFilterButton: { backgroundColor: '#2196F3' },
  filterButtonText: { color: '#666', fontWeight: '500' },
  activeFilterButtonText: { color: 'white', fontWeight: 'bold' },

  list: { flex: 1, paddingTop: 10 },
  recordItem: {
    backgroundColor: 'white', marginHorizontal: 15, marginBottom: 10,
    borderRadius: 10, padding: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  recordTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  recordLocation: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 10 },
  recordStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#f0f0f0' },
  statusText: { fontSize: 12, fontWeight: 'bold' },

  recordDetails: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  recordDate: { fontSize: 14, color: '#666', marginBottom: 10 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  timeItem: { alignItems: 'center' },
  timeLabel: { fontSize: 12, color: '#666', marginBottom: 2 },
  timeValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  typeContainer: { alignItems: 'flex-end' },
  typeText: { fontSize: 12, color: '#666', fontStyle: 'italic' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 16, color: '#ccc', marginTop: 20 },
});

export default AttendanceHistoryScreen;
