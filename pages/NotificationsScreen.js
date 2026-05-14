import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from '../components/ui/ToastProvider';
import styles from '../styles/NotificationsStyles';
import { UserStore } from '../store/UserStore';

export default function NotificationsScreen({ navigation }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notificationData, setNotificationData] = useState({
    currentUser: null,
    items: [],
    unreadCount: 0,
    readCount: 0,
  });

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const data = await UserStore.getNotificationsSummary();
    setLoading(false);

    if (!data) {
      navigation.replace('Login');
      return;
    }

    setNotificationData(data);
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleRead = async (itemId) => {
    const result = await UserStore.updateNotificationItem(itemId);

    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }

    showToast('Notification marked as read.', 'success');
    loadNotifications();
  };

  return (
    <View style={styles.root}>
      <TouchableOpacity
        onPress={() => navigation.navigate('QuickMenu')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 6,
        }}
      >
        <Feather name="arrow-left" size={20} color="#1d4ed8" />
        <Text style={{ color: '#1d4ed8', fontSize: 14, fontWeight: '600' }}>Back</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Live Notifications</Text>
          <Text style={styles.heroTitle}>Current Notification Records</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, styles.metricPrimary]}>
            <Text style={styles.metricValue}>{notificationData.items.length}</Text>
            <Text style={styles.metricLabel}>Total</Text>
          </View>
          <View style={[styles.metricCard, styles.metricSecondary]}>
            <Text style={styles.metricValue}>{notificationData.unreadCount}</Text>
            <Text style={styles.metricLabel}>Unread</Text>
          </View>
          <View style={[styles.metricCard, styles.metricAccent]}>
            <Text style={styles.metricValue}>{notificationData.readCount}</Text>
            <Text style={styles.metricLabel}>Read</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notification Fields</Text>
          
          <View style={styles.fieldGrid}>
            {['title', 'message', 'date', 'status'].map((field) => (
              <View key={field} style={styles.fieldPill}>
                <Text style={styles.fieldPillText}>{field}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notification Records</Text>
          

          {loading ? (
            <Text style={styles.loadingText}>Loading notifications...</Text>
          ) : notificationData.items.length ? (
            notificationData.items.map((item) => (
              <View key={item.id} style={styles.notificationCard}>
                <View style={styles.notificationTopRow}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <View style={[styles.statusBadge, item.status === 'Unread' ? styles.unreadBadge : styles.readBadge]}>
                    <Text style={styles.statusBadgeText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.notificationDate}>{item.date}</Text>
                {item.status === 'Unread' ? (
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleRead(item.id)}>
                    <Feather name="eye" size={15} color="#2563eb" />
                    <Text style={styles.actionButtonText}>Mark as Read</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No notifications found.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
