import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useWebSocket } from '../../Context/WebSocketContext';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { search_users } from '../../api/user_api';
import debounce from 'lodash/debounce';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';

export default function NewChatScreen({ navigation }) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const { user } = useContext(AuthContext);
  const { createChat, chats, handleTypingStatus } = useWebSocket();
  const styles = createStyles(theme);

  // Yazma bildirimi gönderme fonksiyonu
  const handleTyping = useCallback(
    debounce((text) => {
      if (selectedUsers.length === 1) {
        handleTypingStatus(selectedUsers[0].user_id, text.length > 0);
      }
    }, 300),
    [selectedUsers, handleTypingStatus]
  );

  const searchUsers = useCallback(
    debounce(async (query) => {
      if (query.length < 3) {
        setSearchResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await search_users(query);
        if (response.success) {
          const filteredUsers = response.data.users.filter(
            (u) => u.user_id !== user?.user_id && !selectedUsers.some((su) => su.user_id === u.user_id)
          );
          setSearchResults(filteredUsers);
        } else {
          Alert.alert('Hata', response.message || 'Kullanıcı arama sırasında bir hata oluştu');
        }
      } catch (error) {
        console.error('Arama hatası:', error);
        Alert.alert('Hata', 'Kullanıcı arama sırasında bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [user?.user_id, selectedUsers]
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
    searchUsers(text);
    handleTyping(text); // Yazma bildirimi gönder
  };

  const checkExistingChat = (userId) => {
    // Mevcut sohbetleri kontrol et
    const existingChat = chats.find(chat => {
      if (chat.is_group) return false;
      
      const otherParticipant = chat.participants_info.find(
        p => p.user_id !== user?.user_id
      );
      
      return otherParticipant?.user_id === userId;
    });

    return existingChat;
  };

  const handleUserSelect = (user) => {
    if (isGroup) {
      setSelectedUsers(prev => {
        if (prev.some(u => u.user_id === user.user_id)) {
          return prev.filter(u => u.user_id !== user.user_id);
        } else {
          return [...prev, user];
        }
      });
    } else {
      // Birebir sohbet için kontrol
      const existingChat = checkExistingChat(user.user_id);
      if (existingChat) {
        Alert.alert(
          'Sohbet Zaten Var',
          'Bu kişiyle zaten bir sohbetiniz bulunuyor.',
          [
            {
              text: 'Sohbete Git',
              onPress: () => {
                navigation.navigate('Chat', {
                  chatId: existingChat.chat_id,
                  chatInfo: existingChat
                });
              }
            },
            {
              text: 'İptal',
              style: 'cancel'
            }
          ]
        );
        return;
      }
      setSelectedUsers([user]);
    }
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u.user_id !== userId));
  };

  const handleCreateChat = async () => {
    try {
      if (selectedUsers.length === 0) {
        Alert.alert('Hata', 'Lütfen en az bir kullanıcı seçin');
        return;
      }

      if (selectedUsers.length > 1 && !groupName.trim()) {
        Alert.alert('Hata', 'Grup sohbeti için isim giriniz');
        return;
      }

      // Token'dan user_id'yi al
      const token = user.token;
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const myUserId = tokenPayload.user_id;
      
      console.log('Token User ID:', myUserId);
      console.log('Context User ID:', user.user_id);
      console.log('Seçilen Kullanıcılar:', selectedUsers.map(u => u.user_id));
      
      // Kendi user_id'mizi ve seçilen kullanıcıların id'lerini ekle
      const allParticipants = [myUserId, ...selectedUsers.map(u => u.user_id)];
      
      // Katılımcıları benzersiz hale getir
      const uniqueParticipants = [...new Set(allParticipants)];
      
      const data = {
        participants: uniqueParticipants,
        chat_type: uniqueParticipants.length > 2 ? 'group' : 'direct',
        name: uniqueParticipants.length > 2 ? groupName.trim() : null
      };
      
      console.log('Gönderilen veri:', JSON.stringify(data, null, 2));
      
      const response = await createChat(data);
      console.log('API Response:', response);
      
      if (response && response.chat_id) {
        // Önce ChatList ekranına dön
        navigation.navigate('ChatList');
        // Sonra yeni sohbete git
        setTimeout(() => {
          navigation.navigate('Chat', {
            chatId: response.chat_id,
            chatInfo: response
          });
        }, 100);
      } else {
        console.error('Geçersiz API yanıtı:', response);
        Alert.alert('Hata', 'Sohbet oluşturulurken beklenmeyen bir yanıt alındı');
      }
    } catch (error) {
      console.error('Sohbet oluşturma hatası:', error);
      console.error('Hata detayları:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      Alert.alert(
        'Hata', 
        error.response?.data?.detail || error.message || 'Sohbet oluşturulurken bir hata oluştu'
      );
    }
  };

  const renderUserItem = ({ item }) => {
    const isSelected = selectedUsers.some((u) => u.user_id === item.user_id);
    
    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => isSelected ? handleUserRemove(item.user_id) : handleUserSelect(item)}
      >
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>
            {item.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.full_name}</Text>
          <Text style={styles.userUsername}>@{item.email.split('@')[0]}</Text>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const data = [
    ...(searchQuery.length >= 3 ? searchResults : []),
    ...(searchQuery.length < 3 ? user?.friends || [] : [])
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Kullanıcı ara..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isLoading && <ActivityIndicator style={styles.loadingIndicator} />}
      </View>

      <View style={styles.groupOptions}>
        <TouchableOpacity
          style={[styles.checkbox, isGroup && styles.checkboxChecked]}
          onPress={() => setIsGroup(!isGroup)}
        >
          {isGroup && <Text style={styles.checkboxText}>✓</Text>}
        </TouchableOpacity>
        <Text style={styles.groupLabel}>Grup Sohbeti</Text>
      </View>

      {isGroup && (
        <TextInput
          style={styles.groupNameInput}
          placeholder="Grup Adı"
          value={groupName}
          onChangeText={setGroupName}
          autoCapitalize="words"
        />
      )}

      <FlatList
        data={data}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      />

      <TouchableOpacity
        style={[styles.createButton, (!selectedUsers.length || (isGroup && !groupName)) && styles.createButtonDisabled]}
        onPress={handleCreateChat}
        disabled={!selectedUsers.length || (isGroup && !groupName) || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.createButtonText}>Sohbet Oluştur</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    height: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    color: theme.colors.text,
  },
  listContent: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  userItemSelected: {
    backgroundColor: theme.colors.primary + '20',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  userUsername: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupLabel: {
    color: theme.colors.text,
    fontSize: 16,
  },
  groupNameInput: {
    height: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    color: theme.colors.text,
    margin: 16,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
  },
  createButtonDisabled: {
    backgroundColor: theme.colors.surface,
  },
  createButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
}); 