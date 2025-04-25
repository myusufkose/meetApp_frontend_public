import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../Context/ThemeContext';
import { search_users, add_friend } from '../api/user_api';
import { AuthContext } from '../Context/AuthContext';
import { useWebSocket } from '../Context/WebSocketContext';

export function DetailsScreen() {
  const { theme } = useTheme();
  const { user, refreshUserData } = useContext(AuthContext);
  const { ws, isConnected, sendMessage } = useWebSocket();
  const styles = createStyles(theme);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedQuery.length >= 3) {
        try {
          setLoading(true);
          const response = await search_users(debouncedQuery);
          setUsers(response.data.users || []);
        } catch (error) {
          Alert.alert('Hata', error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setUsers([]);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  const handleAddFriend = async (userId) => {
    try {
      setLoading(true);
      const response = await add_friend(userId);
      if (response.success) {
        await refreshUserData();
        
        sendMessage({
          type: 'friend_request',
          to_user_id: userId
        });
        
        Alert.alert('Başarılı', response.message || 'Arkadaş isteği gönderildi');
      } else {
        if (response.detail === "Bu kullanıcı zaten arkadaşınız" || 
            response.detail === "Bu kullanıcıya zaten arkadaşlık isteği gönderdiniz") {
          Alert.alert('Bilgi', response.detail);
        } else {
          Alert.alert('Hata', response.message || 'Arkadaş eklenirken bir hata oluştu');
        }
      }
    } catch (error) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }) => {
    const isCurrentUser = item.user_id === user?.user_id;
    const isFriend = user?.friends?.some(friend => friend.user_id === item.user_id);
    const isRequestSent = user?.sent_requests?.some(request => request.user_id === item.user_id);

    if (isCurrentUser) {
      return null;
    }

    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(item.full_name || item.email)}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.full_name || 'İsimsiz Kullanıcı'}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
        </View>
        {!isFriend && !isRequestSent && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => handleAddFriend(item.user_id)}
          >
            <MaterialCommunityIcons name="account-plus" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        {isRequestSent && (
          <View style={styles.requestSentContainer}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.requestSentText}>İstek Gönderildi</Text>
          </View>
        )}
      </View>
    );
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

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.primary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Kullanıcı ara..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length < 3 
                  ? 'Arama yapmak için en az 3 karakter girin'
                  : 'Kullanıcı bulunamadı'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: theme.colors.text,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  addButton: {
    padding: 8,
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
  },
  requestSentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  requestSentText: {
    marginLeft: 4,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});

