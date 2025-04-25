import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../Context/AuthContext';
import { useTheme } from '../../Context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout, refreshUserData } = useContext(AuthContext);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
    } catch (error) {
      console.error('Veriler yenilenirken hata:', error);
      Alert.alert('Hata', 'Veriler yenilenirken bir hata oluştu.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Çıkış yaparken hata:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Kullanıcı bilgilerini al
  const userName = user?.full_name || 'İsimsiz Kullanıcı';
  const userEmail = user?.email || 'Email yok';
  const userActivities = user?.activities || [];
  const userFriends = user?.friends || [];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={theme.colors.text}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(userName)}</Text>
        </View>
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{userEmail}</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsScrollView}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="calendar-check" size={28} color={theme.colors.primary} />
            <Text style={styles.statNumber}>{userActivities.length}</Text>
            <Text style={styles.statLabel}>Oluşturulan{'\n'}Etkinlik</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="calendar-multiple" size={28} color={theme.colors.primary} />
            <Text style={styles.statNumber}>{userActivities.filter(activity => activity.participants?.includes(user?.user_id)).length}</Text>
            <Text style={styles.statLabel}>Katılınan{'\n'}Etkinlik</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="account-group" size={28} color={theme.colors.primary} />
            <Text style={styles.statNumber}>{userFriends.length}</Text>
            <Text style={styles.statLabel}>Toplam{'\n'}Arkadaş</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap Ayarları</Text>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="account-edit" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Profili Düzenle</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Bildirim Ayarları</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={() => navigation.navigate('PrivacyAndSecurity')}>
            <MaterialCommunityIcons name="shield-lock-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Gizlilik ve Güvenlik</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Etkinliklerim</Text>
          {userActivities.length > 0 ? (
            userActivities.map((activity, index) => (
              <TouchableOpacity 
                key={activity.activity_id || index} 
                style={styles.activityCard}
                onPress={() => navigation.navigate('ActivityDetails', { activity })}
              >
                <View style={styles.activityContent}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle} numberOfLines={1}>
                      {activity.title}
                    </Text>
                    <Text style={styles.activityDate}>
                      {new Date(activity.activity_date).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.secondary} />
                      <Text style={styles.infoText}>{activity.location}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="account-group" size={16} color={theme.colors.secondary} />
                      <Text style={styles.infoText}>
                        {activity.participants?.length || 0}/{activity.max_participants} Katılımcı
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.activityStatus}>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.secondary} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-blank" size={64} color={theme.colors.secondary} />
              <Text style={styles.emptyStateText}>Henüz etkinlik oluşturmadınız</Text>
              <TouchableOpacity 
                style={styles.createActivityButton}
                onPress={() => navigation.navigate('CreateActivity')}
              >
                <Text style={styles.createActivityButtonText}>Yeni Etkinlik Oluştur</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>Arkadaşlarım</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.friendsScrollView}
          >
            {userFriends.map((friend) => (
              <View key={friend.user_id} style={styles.friendCard}>
                <View style={styles.friendAvatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(friend.full_name)}
                  </Text>
                </View>
                <Text style={styles.friendName} numberOfLines={1}>
                  {friend.full_name || 'İsimsiz Kullanıcı'}
                </Text>
                <Text style={styles.friendEmail} numberOfLines={1}>
                  {friend.email}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color={theme.colors.text} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 48,
    color: theme.colors.primary,
    fontWeight: 'bold',
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: theme.colors.secondary,
    marginBottom: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsScrollView: {
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    gap: 12,
  },
  statCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    width: width / 3 - 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  activityCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  activityContent: {
    flex: 1,
    gap: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  activityDate: {
    fontSize: 12,
    color: theme.colors.secondary,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  activityStatus: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.secondary,
    marginBottom: 20,
  },
  createActivityButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginTop: 16,
  },
  createActivityButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  friendsSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  friendsScrollView: {
    marginTop: 10,
  },
  friendCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  friendName: {
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
  },
  friendEmail: {
    fontSize: 10,
    color: theme.colors.secondary,
    textAlign: 'center',
  },
});