import React, { useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';
import { useWebSocket } from '../../Context/WebSocketContext';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ChatScreen({ route }) {
  const { theme } = useTheme();
  const { ws, isConnected, messages, sendMessage, loadMessages, loading, handleTypingStatus, chats } = useWebSocket();
  const { user, token } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const flatListRef = useRef(null);
  const lastMessageRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const styles = createStyles(theme);
  const navigation = useNavigation();

  const { chatId, chatInfo, isNewChat, participants } = route.params;
  const chat = useMemo(() => {
    const currentChat = chats.find(c => c.chat_id === chatId) || chatInfo || {};
    console.log('Current chat:', currentChat);
    return currentChat;
  }, [chats, chatId, chatInfo]);

  // Mesajları memoize et ve sırala
  const currentMessages = useMemo(() => {
    const chatMessages = messages[chatId] || [];
    return [...chatMessages].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateA - dateB; // Eskiden yeniye doğru sırala
    });
  }, [messages, chatId]);

  // Header options'ı ayarla
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  // İlk yüklemede mesajları getir
  useEffect(() => {
    if (isInitialLoadRef.current && chatId && !isNewChat) {
      // Eğer mesajlar zaten varsa tekrar istek atma
      if (!messages[chatId] || messages[chatId].length === 0) {
        loadMessages(chatId, 1);
      }
      isInitialLoadRef.current = false;
    }
  }, [chatId, isNewChat, messages]);
  
  useEffect(() => {
    console.log("-------------------mesajlar değişti -------------------");
  }, [messages]);

  const handleMessageChange = useCallback((text) => {
    setMessage(text);
    handleTypingStatus(chatId, text.length > 0);
  }, [chatId, handleTypingStatus]);

  const handleSend = useCallback(() => {
    if (message.trim() && isConnected) {
      sendMessage(chatId, message.trim());
      setMessage('');
      handleTypingStatus(chatId, false);
    }
  }, [chatId, isConnected, message, sendMessage, handleTypingStatus]);

  const handleKeyPress = useCallback((event) => {
    if (event.nativeEvent.key === 'Enter') {
      handleSend();
    }
  }, [handleSend]);

  const renderMessage = ({ item }) => {
    if (!item || !item.message_id) {
      console.warn('Invalid message item:', item);
      return null;
    }

    const isMe = item.sender_id === user?.user_id;
    
    return (
      <View 
        key={item.message_id}
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.otherMessageContainer
        ]}
      >
        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMe ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content?.text || ''}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {new Date(item.timestamp).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            {isMe && (
              <MaterialCommunityIcons
                name={item.status === 'read' ? 'check-all' : 'check'}
                size={16}
                color={item.status === 'read' ? theme.colors.primary : theme.colors.textSecondary}
                style={styles.messageStatus}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && currentMessages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [currentMessages]);

  // Mesajlar değiştiğinde en aşağı kaydır
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  // Yazıyor durumunu göster
  const renderTypingIndicator = () => {
    console.log('Chat typing status:', chat.is_typing, chat.typing_user_id);
    if (chat.is_typing && chat.typing_user_id && chat.typing_user_id !== user?.user_id) {
      const typingUser = chat.participants_info?.find(p => p.user_id === chat.typing_user_id);
      console.log('Typing user:', typingUser);
      return (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>
            {typingUser?.full_name || 'Birisi'} yazıyor...
          </Text>
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {chat.is_group ? chat.group_name : chat.participants_info?.find(p => p.user_id !== user?.user_id)?.full_name || 'Sohbet'}
          </Text>
        </View>
      </View>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={currentMessages}
          renderItem={renderMessage}
          keyExtractor={item => item.message_id}
          contentContainerStyle={styles.messagesContainer}
          inverted={false}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          ListFooterComponent={
            <>
              {loading && <ActivityIndicator color={theme.colors.primary} />}
              {renderTypingIndicator()}
            </>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={1000}
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!message.trim() || !isConnected) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!message.trim() || !isConnected}
          >
            <MaterialCommunityIcons 
              name="send" 
              size={24} 
              color={message.trim() && isConnected ? theme.colors.primary : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 16,
    position: 'relative',
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 8,
    zIndex: 1,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginBottom: 4,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderTopRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: '#E5E5EA',
    borderTopLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageStatus: {
    marginLeft: 4,
  },
  typingContainer: {
    padding: 8,
    marginTop: 4,
  },
  typingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
}); 