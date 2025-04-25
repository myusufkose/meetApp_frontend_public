import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../Context/ThemeContext';

const { width } = Dimensions.get('window');

const ActivityCard = ({ activity, onPress, isPast = false }) => {
  const { theme } = useTheme();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
      marginRight: 0,
      minHeight: 180,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      marginLeft: 8,
    },
    date: {
      fontSize: 16,
      color: theme.colors.secondary,
      marginLeft: 8,
    },
    info: {
      gap: 6,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoText: {
      fontSize: 14,
      color: '#A0AEC0',
      marginLeft: 4,
    },
    statusContainer: {
      justifyContent: 'center',
      marginLeft: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#48BB78',
    },
    pastStatusText: {
      color: '#A0AEC0',
    },
    emptyState: {
      alignItems: 'center',
      padding: 24,
      backgroundColor: '#1A202C',
      borderRadius: 16,
      marginTop: 16,
    },
    emptyStateText: {
      fontSize: 16,
      color: '#A0AEC0',
      marginTop: 16,
      textAlign: 'center',
    },
    createActivityButton: {
      backgroundColor: '#4299E1',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    createActivityButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    defaultAvatar: {
      backgroundColor: '#2D3748',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pastCard: {
      backgroundColor: '#0B0B2B',
      opacity: 0.8,
      width: width * 0.9,
      borderColor: '#8B5CF6',
    },
    details: {
      gap: 12,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailText: {
      marginLeft: 8,
      fontSize: 16,
      color: theme.colors.primary,
      flex: 1,
    },
    pastBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: theme.colors.secondary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    pastBadgeText: {
      fontSize: 12,
      color: theme.colors.text,
    },
    pastText: {
      color: theme.colors.secondary,
    },
  });

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        isPast && styles.pastCard
      ]} 
      onPress={onPress}
      disabled={isPast}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name={isPast ? "calendar-check" : "calendar-clock"} 
          size={24} 
          color={isPast ? theme.colors.secondary : theme.colors.primary} 
        />
        <Text style={[styles.title, isPast && styles.pastText]} numberOfLines={2}>
          {activity.title}
        </Text>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons 
            name="map-marker" 
            size={20} 
            color={isPast ? theme.colors.secondary : theme.colors.primary} 
          />
          <Text style={[styles.detailText, isPast && styles.pastText]} numberOfLines={1}>
            {activity.location}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons 
            name="clock-outline" 
            size={20} 
            color={isPast ? theme.colors.secondary : theme.colors.primary} 
          />
          <Text style={[styles.detailText, isPast && styles.pastText]} numberOfLines={1}>
            {formatDate(activity.activity_date)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons 
            name="account-group" 
            size={20} 
            color={isPast ? theme.colors.secondary : theme.colors.primary} 
          />
          <Text style={[styles.detailText, isPast && styles.pastText]} numberOfLines={1}>
            {activity.participants.length}/{activity.max_participants} Katılımcı
          </Text>
        </View>
      </View>

      {isPast && (
        <View style={styles.pastBadge}>
          <Text style={styles.pastBadgeText}>Geçmiş Etkinlik</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ActivityCard; 