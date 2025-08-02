import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, ScrollView, StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';
import { useAttendance } from '../context/AttendanceContext';

const AttendanceHistoryScreen = () => {
  const { attendanceRecords } = useAttendance();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, week, month
  const [selectedMonth, setSelectedMonth] = useState(new Date()); // default: current month

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();
  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Filter logic
  let filteredRecords = [...attendanceRecords];
  const now = new Date();
  const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);

  if (filter === 'week') {
    filteredRecords = filteredRecords.filter(r => new Date(r.checkInTime) >= weekAgo);
  } else if (filter === 'month') {
    filteredRecords = filteredRecords.filter(r => {
      const d = new Date(r.checkInTime);
      return d.getFullYear() === selectedMonth.getFullYear()
          && d.getMonth() === selectedMonth.getMonth();
    });
  }

  filteredRecords.sort((a,b) => new Date(b.checkInTime)-new Date(a.checkInTime));

  // Mark calendar dates
  const markedDates = {};
  filteredRecords.forEach(record => {
    const date = record.checkInTime.slice(0,10);
    markedDates[date] = {
      marked: true,
      dotColor: record.status==='completed' ? '#4CAF50' : '#FF9800',
    };
  });

  const totalHours = filteredRecords.filter(r=>r.status==='completed')
    .reduce((sum, r)=>sum+(r.workingHours||0), 0);
  const daysPresent = filteredRecords.filter(r=>r.status==='completed').length;

  const renderAttendanceItem = ({ item }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleContainer}>
          <Icon name={item.type==='automatic'?'gps-fixed':'edit-location'} size={20}
            color={item.status==='completed'?'#4CAF50':'#ff9800'} />
          <Text style={styles.recordLocation}>{item.locationName}</Text>
        </View>
        <Text style={[styles.statusText, {color:item.status==='completed'?'#4CAF50':'#ff9800'}]}>
          {item.status==='completed'?'Completed':'Active'}
        </Text>
      </View>
      <Text style={styles.recordDate}>{formatDate(item.checkInTime)}</Text>
      <View style={styles.timeContainer}>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>In</Text>
          <Text style={styles.timeValue}>{formatTime(item.checkInTime)}</Text>
        </View>
        {item.checkOutTime && (
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Out</Text>
            <Text style={styles.timeValue}>{formatTime(item.checkOutTime)}</Text>
          </View>
        )}
        {item.workingHours && (
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Hours</Text>
            <Text style={[styles.timeValue, {color:'#4CAF50'}]}>{item.workingHours.toFixed(1)}h</Text>
          </View>
        )}
      </View>
      <Text style={styles.typeText}>Type: {item.type==='automatic'?'Automatic':'Manual'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}><Text style={styles.headerText}>Attendance History</Text></View>

      {/* Summary card */}
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

      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        {['all','week','month'].map(f=>(
          <TouchableOpacity key={f}
            style={[styles.filterButton, filter===f && styles.activeFilterButton]}
            onPress={()=>setFilter(f)}
          >
            <Text style={[styles.filterButtonText, filter===f && styles.activeFilterButtonText]}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Calendar only in month view */}
      {filter==='month' && (
        <Calendar
          markedDates={markedDates}
          onMonthChange={(monthObj) => {
            setSelectedMonth(new Date(monthObj.year, monthObj.month -1));
          }}
          style={styles.calendar}
        />
      )}

      {/* Week mini view */}
      {filter==='week' && (
        <FlatList horizontal
          data={[...new Set(filteredRecords.map(r=>r.checkInTime.slice(0,10)))]}
          renderItem={({item})=>(
            <View style={styles.weekItem}>
              <Text style={styles.weekDate}>{item}</Text>
              <Icon name="check-circle" size={20} color={markedDates[item]?.dotColor||'#ccc'} />
            </View>
          )}
          keyExtractor={d=>d}
          showsHorizontalScrollIndicator={false}
          style={styles.weekList}
        />
      )}

      {/* Attendance list */}
      <FlatList
        data={filteredRecords}
        renderItem={renderAttendanceItem}
        keyExtractor={item=>item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<View style={styles.emptyContainer}>
          <Icon name="history" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No attendance records found</Text>
        </View>}
      />
    </ScrollView>
  );
};

export default AttendanceHistoryScreen;

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#f5f5f5' },
  header: { backgroundColor:'#2196F3', padding:20, paddingTop:40 },
  headerText: { fontSize:22, fontWeight:'bold', color:'white' },

  summaryCard: {
    flexDirection:'row', backgroundColor:'white',
    margin:10, borderRadius:10, paddingVertical:10,
    justifyContent:'space-around', elevation:3
  },
  summaryItem:{ alignItems:'center' },
  summaryValue:{ fontSize:16, fontWeight:'bold', color:'#333', marginTop:2 },
  summaryLabel:{ fontSize:12, color:'#666' },

  filterContainer:{
    flexDirection:'row', margin:10,
    backgroundColor:'white', borderRadius:8,
    overflow:'hidden', elevation:2
  },
  filterButton:{ flex:1, alignItems:'center', padding:10 },
  activeFilterButton:{ backgroundColor:'#2196F3' },
  filterButtonText:{ color:'#666' },
  activeFilterButtonText:{ color:'white', fontWeight:'bold' },

  calendar:{ margin:10, borderRadius:8, elevation:2 },

  weekList:{ padding:5 },
  weekItem:{ alignItems:'center', margin:5 },
  weekDate:{ fontSize:12 },

  recordItem:{
    backgroundColor:'white', margin:10, borderRadius:8,
    padding:10, elevation:2
  },
  recordHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  recordTitleContainer:{ flexDirection:'row', alignItems:'center' },
  recordLocation:{ marginLeft:8, fontWeight:'bold', fontSize:16 },
  statusText:{ fontSize:12, fontWeight:'bold' },
  recordDate:{ marginTop:4, color:'#666' },
  timeContainer:{ flexDirection:'row', justifyContent:'space-between', marginTop:4 },
  timeItem:{ alignItems:'center' },
  timeLabel:{ fontSize:12, color:'#444' },
  timeValue:{ fontSize:14, fontWeight:'bold', color:'#333' },
  typeText:{ marginTop:4, fontSize:12, color:'#666', fontStyle:'italic' },

  emptyContainer:{ alignItems:'center', justifyContent:'center', padding:50 },
  emptyText:{ fontSize:16, color:'#ccc', marginTop:20 },
});
