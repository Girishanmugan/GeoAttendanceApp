import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAttendance } from '../context/AttendanceContext';
import { auth } from '../firebaseConfig';

const ProfileScreen = ({ navigation }) => {
  const { attendanceRecords, getWeeklyWorkingHours } = useAttendance();
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const reloadUser = async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        setUser(auth.currentUser);
      }
    };
    reloadUser();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => navigation.replace('Login'),
      },
    ]);
  };

  const totalRecords = attendanceRecords.length;
  const completedRecords = attendanceRecords.filter((r) => r.status === 'completed').length;
  const weeklyHours = getWeeklyWorkingHours();
  const avgDailyHours = weeklyHours / 7;

  const menuItems = [
    {
      id: 1,
      title: 'Settings',
      subtitle: 'App preferences and configurations',
      icon: 'settings',
      onPress: () => Alert.alert('Info', 'Settings screen coming soon!'),
    },
    {
      id: 2,
      title: 'Export Data',
      subtitle: 'Download attendance records',
      icon: 'file-download',
      onPress: () => Alert.alert('Info', 'Export feature coming soon!'),
    },
    {
      id: 3,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help',
      onPress: () => Alert.alert('Info', 'Help screen coming soon!'),
    },
    {
      id: 4,
      title: 'About',
      subtitle: 'App version and information',
      icon: 'info',
      onPress: () =>
        Alert.alert('About', 'Attendance Tracker v1.0.0\nGeolocation-based attendance system'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="person" size={60} color="white" />
        </View>
        <Text style={styles.nameText}>{user?.displayName || 'Unnamed User'}</Text>
        <Text style={styles.idText}>{user?.email || 'No Email'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <StatItem label="Total Records" value={totalRecords} />
        <StatItem label="Completed" value={completedRecords} />
        <StatItem label="Weekly Hours" value={`${weeklyHours.toFixed(1)}h`} />
        <StatItem label="Avg Daily" value={`${avgDailyHours.toFixed(1)}h`} />
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemContent}>
              <MaterialIcons name={item.icon} size={24} color="#2196F3" />
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="#f44336" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Attendance Tracker v1.0.0{'\n'}Built for GAIL (INDIA) LTD
        </Text>
      </View>
    </ScrollView>
  );
};

const StatItem = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#2196F3',
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  nameText: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  idText: { fontSize: 16, color: '#E3F2FD', marginTop: 5 },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#2196F3' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 5, textAlign: 'center' },
  menuContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    borderRadius: 10,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuItemText: { marginLeft: 15, flex: 1 },
  menuItemTitle: { fontSize: 16, fontWeight: '500', color: '#333' },
  menuItemSubtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 5,
  },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#f44336', marginLeft: 10 },
  footer: { alignItems: 'center', paddingVertical: 30 },
  footerText: { fontSize: 12, color: '#999', textAlign: 'center', lineHeight: 18 },
});

export default ProfileScreen;
