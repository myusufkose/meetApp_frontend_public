import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../Context/AuthContext';
import { useTheme } from '../../Context/ThemeContext';
import { accept_friend_request } from '../../api/user_api';

export default function NotificationsScreen() {
  const { user, refreshUserData } = useContext(AuthContext);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [processingRequest, setProcessingRequest] = useState(null);

  const handleAcceptFriendRequest = async (friendId) => {
    try {
      await accept_friend_request(friendId);
      await refreshUserData();
      Alert.alert('Başarılı', 'Arkadaşlık isteği kabul edildi');
    } catch (error) {
      console.error('Arkadaşlık isteği kabul edilirken hata:', error);
      Alert.alert('Hata', error.message || 'Arkadaşlık isteği kabul edilemedi');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {user?.received_requests && user.received_requests.length > 0 ? (
          user.received_requests.map((request, index) => (
            <View key={index} style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <MaterialCommunityIcons 
                  name="account-plus" 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.notificationText}>
                  {request} size arkadaşlık isteği gönderdi
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={() => handleAcceptFriendRequest(request)}
                disabled={processingRequest === request}
              >
                {processingRequest === request ? (
                  <ActivityIndicator color={theme.colors.surface} size="small" />
                ) : (
                  <Text style={styles.acceptButtonText}>Kabul Et</Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="bell-off" 
              size={64} 
              color={theme.colors.textSecondary} 
            />
            <Text style={styles.emptyText}>Henüz bildiriminiz yok</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
    flex: 1,
  },
  acceptButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  acceptButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
});
