import React, { useContext, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useWebSocket } from '../../Context/WebSocketContext';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';

export default function ChatListScreen() {
  const { chats, loading, loadChats } = useWebSocket();
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadChats();
    } catch (error) {
      console.error('Chat listesi yenilenirken hata oluştu:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadChats]);

  const renderMessageContent = (content) => {
    if (content.type === 'text') {
      return content.content;
    } else if (content.type === 'file') {
      return '📎 Dosya';
    }
    return '';
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getChatInfo = (chat) => {
    if (chat.is_group) {
      return {
        name: chat.group_name,
        lastMessage: chat.last_message ? renderMessageContent(chat.last_message.content) : '',
        isGroup: true
      };
    }
    
    if (!chat.participants_info || !Array.isArray(chat.participants_info)) {
      return {
        name: 'Bilinmeyen Kullanıcı',
        lastMessage: chat.last_message ? renderMessageContent(chat.last_message.content) : '',
        isGroup: false,
        initials: '??'
      };
    }
    
    const otherParticipant = chat.participants_info.find(
      p => p.user_id !== user?.user_id
    );
    
    return {
      name: otherParticipant?.full_name || 'Bilinmeyen Kullanıcı',
      lastMessage: chat.last_message ? renderMessageContent(chat.last_message.content) : '',
      isGroup: false,
      initials: getInitials(otherParticipant?.full_name)
    };
  };

  const renderLastMessage = (chat) => {
    if (!chat.last_message || !chat.last_message.content) {
      return (
        <Text style={[styles.lastMessage, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          Henüz mesaj yok
        </Text>
      );
    }

    const messageContent = chat.last_message.content;
    const isCurrentUser = chat.last_message.sender_id === user?.user_id;

    return (
      <View style={styles.messageContainer}>
        {isCurrentUser && (
          <Text style={[styles.senderIndicator, { color: theme.colors.primary }]}>Sen: </Text>
        )}
        <Text style={[styles.lastMessage, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {messageContent.content || 'Henüz mesaj yok'}
        </Text>
      </View>
    );
  };

  const handleChatPress = (chat) => {
    navigation.navigate('Chat', {
      chatId: chat.chat_id,
      chatInfo: {
        ...chat,
        participants_info: chat.participants_info || [],
        last_message: chat.last_message || null
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.chat_id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={({ item }) => {
            const { name, lastMessage, isGroup, initials } = getChatInfo(item);
            
            return (
              <TouchableOpacity 
                style={[styles.chatItem, { borderBottomColor: theme.colors.border }]}
                onPress={() => handleChatPress(item)}
              >
                <View style={[styles.avatarContainer, { 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.primary
                }]}>
                  {isGroup ? (
                    <MaterialCommunityIcons 
                      name="account-group" 
                      size={30} 
                      color={theme.colors.primary}
                    />
                  ) : (
                    <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{initials}</Text>
                  )}
                </View>
                <View style={styles.chatInfo}>
                  <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
                    {name}
                  </Text>
                  {renderLastMessage(item)}
                </View>
                {item.unread_count > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.unreadCount}>{item.unread_count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
      <TouchableOpacity
        style={[styles.newChatButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('NewChat')}
      >
        <Text style={styles.newChatButtonText}>Yeni Sohbet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 80,
  },
  newChatButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  newChatButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  chatInfo: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
  },
  unreadBadge: {
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderIndicator: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
}); 