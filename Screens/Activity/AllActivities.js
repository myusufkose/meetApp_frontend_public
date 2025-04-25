import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAllActivities } from '../../api/activity_api';
import ActivityCard from '../../Components/ActivityCard';
import { useTheme } from '../../Context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // İki kart arasında 16px boşluk, kenarlardan 16px padding

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardContainer: {
    width: CARD_WIDTH,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export function AllActivities() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await getAllActivities();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Aktiviteler yüklenirken hata:', error);
      Alert.alert(
        'Hata',
        'Aktiviteler yüklenirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchActivities();
  }, []);

  const handleActivityPress = (activity) => {
    navigation.navigate('ActivityDetails', { activity });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tüm Etkinlikler</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activities.length > 0 ? (
          activities.map((activity, index) => {
            if (index % 2 === 0) {
              return (
                <View key={activity.activity_id} style={styles.row}>
                  <View style={styles.cardContainer}>
                    <ActivityCard activity={activity} onPress={() => handleActivityPress(activity)} />
                  </View>
                  {activities[index + 1] && (
                    <View style={styles.cardContainer}>
                      <ActivityCard activity={activities[index + 1]} onPress={() => handleActivityPress(activities[index + 1])} />
                    </View>
                  )}
                </View>
              );
            }
            return null;
          })
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>Henüz etkinlik bulunmuyor</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 