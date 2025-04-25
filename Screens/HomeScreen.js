import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions, ActivityIndicator, Alert, ImageBackground, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAllActivities } from '../api/activity_api';
import ActivityCard from '../Components/ActivityCard';
import { useTheme } from '../Context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.6; // Ekran genişliğinin %60'ı

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  banner: {
    paddingTop: 0,
    paddingBottom: 30,
    backgroundColor: theme.colors.background,
  },
  bannerBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerContent: {
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerSmallText: {
    fontSize: 16,
    color: theme.colors.primary,
    marginLeft: 8,
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: theme.colors.secondary,
    marginBottom: 25,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  createButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  activitiesContainer: {
    paddingVertical: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
  },
  cardContainer: {
    marginRight: 10,
    marginVertical: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.secondary,
    fontStyle: 'italic',
  },
  pastCardContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  activityDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  activityInfo: {
    gap: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  seeAllButton: {
    position: 'absolute',
    right: 16,
    top: 0,
  },
  seeAllText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export function HomeScreen() {
  const navigation = useNavigation();
  const [activities, setActivities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await getAllActivities();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Aktiviteler yüklenirken hata:', error);
      setActivities([]);
      Alert.alert(
        'Hata',
        'Aktiviteler yüklenirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
        [
          {
            text: 'Tekrar Dene',
            onPress: () => fetchActivities()
          }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchActivities();
    };
    loadData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchActivities();
  }, []);

  const handleActivityPress = (activity) => {
    navigation.navigate('ActivityDetails', { activity });
  };

  // Aktif ve geçmiş aktiviteleri filtrele
  const now = new Date();
  const activeActivities = Array.isArray(activities) ? activities.filter(activity =>
    new Date(activity.activity_date) > now
  ) : [];
  const pastActivities = Array.isArray(activities) ? activities.filter(activity =>
    new Date(activity.activity_date) <= now
  ) : [];

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
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.banner}>
          <ImageBackground
            source={require('../assets/popular-09.jpg')}
            style={styles.bannerBackground}
          >
            <View style={styles.bannerContent}>
              <View style={styles.welcomeContainer}>
                <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.primary} />
                <Text style={styles.bannerSmallText}>Hoş Geldiniz!</Text>
              </View>
              <Text style={styles.bannerTitle}>MeetApp</Text>
              <Text style={styles.bannerSubtitle}>Arkadaşlarınızla buluşmanın en kolay yolu</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateActivity')}
              >
                <MaterialCommunityIcons name="plus-circle" size={24} color={theme.colors.text} />
                <Text style={styles.createButtonText}>Yeni Etkinlik Oluştur</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.activitiesContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Yaklaşan Etkinlikler</Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('AllActivities')}
              >
                <Text style={styles.seeAllText}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {activeActivities.length > 0 ? (
                activeActivities.map((activity) => (
                  <View key={activity.activity_id} style={styles.cardContainer}>
                    <ActivityCard activity={activity} />
                  </View>
                ))
              ) : (
                <View key="empty-active" style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="calendar-blank" size={48} color={theme.colors.textSecondary} />
                  <Text style={styles.emptyText}>Yaklaşan etkinlik bulunmuyor</Text>
                </View>
              )}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Geçmiş Etkinlikler</Text>
            {pastActivities.length > 0 ? (
              pastActivities.map((activity) => (
                <View key={activity.activity_id} style={styles.pastCardContainer}>
                  <View style={styles.activityCard}>
                    <View style={styles.activityContent}>
                      <View style={styles.activityHeader}>
                        <Text style={styles.activityTitle}>{activity.title}</Text>
                        <Text style={styles.activityDate}>
                          {new Date(activity.activity_date).toLocaleDateString('tr-TR')}
                        </Text>
                      </View>
                      <View style={styles.activityInfo}>
                        <View key={`${activity.activity_id}-location`} style={styles.infoItem}>
                          <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.textSecondary} />
                          <Text style={styles.infoText}>{activity.location}</Text>
                        </View>
                        <View key={`${activity.activity_id}-participants`} style={styles.infoItem}>
                          <MaterialCommunityIcons name="account-group" size={16} color={theme.colors.textSecondary} />
                          <Text style={styles.infoText}>
                            {activity.participants?.length || 0}/{activity.max_participants} Katılımcı
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View key="empty-past" style={styles.emptyContainer}>
                <MaterialCommunityIcons name="calendar-blank" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>Geçmiş etkinlik bulunmuyor</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}