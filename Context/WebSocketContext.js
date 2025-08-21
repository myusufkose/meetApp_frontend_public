import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get_chats, get_messages, createChat as createChatApi } from '../api/chat_api';
import { useAuth } from './AuthContext';
import { API_URL } from '@env';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {

  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;
  const reconnectTimeoutRef = useRef(null);
  const isFirstConnectionRef = useRef(true);
  const loadingRef = useRef(false); // Loading durumunu takip etmek için
  const { user } = useAuth();
  const typingTimeoutRef = useRef({});



  const loadChats = async () => {
    try {
      setLoading(true);
      const chats = await get_chats();

      // Her chat için messages state'ini güncelle
      chats.forEach(chat => {
        if (chat.messages && chat.messages.length > 0) {
          setMessages(prev => ({
            ...prev,
            [chat.chat_id]: chat.messages
          }));
        }
      });

      setChats(chats);
    } catch (error) {
      console.error('Sohbetler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId, page = 1) => {
    // Eğer zaten yükleme yapılıyorsa, yeni istek atma
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);

      const newMessages = await get_messages(chatId, page);

      setMessages(prev => {
        const currentMessages = prev[chatId] || [];
        const uniqueMessages = [...currentMessages];

        // Yeni mesajları ekle ve tekrarları önle
        newMessages.forEach(newMsg => {
          if (!uniqueMessages.some(msg => msg.message_id === newMsg.message_id)) {
            uniqueMessages.push(newMsg);
          }
        });

        // Mesajları timestamp'e göre sırala (eskiden yeniye)
        uniqueMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        return {
          ...prev,
          [chatId]: uniqueMessages
        };
      });

      return newMessages;
    } catch (error) {
      console.error('WebSocketContext - loadMessages - Error:', error);
      throw error;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const connectWebSocket = async () => {
    if (!user?.token) {
      return;
    }

    try {
      // Önce mevcut bağlantıyı kapat
      if (ws) {
        ws.close();
        setWs(null);
        setIsConnected(false);
      }

      // Remove 'https://' and trailing slash if exists
      
      const baseUrl = API_URL.replace('https://', '').replace(/\/$/, '');
      const wsUrl = `wss://${baseUrl}/chat?token=${user.token}`;
      console.log('WebSocket bağlantısı kuruluyor:', wsUrl);
      const socket = new WebSocket(wsUrl);

      // Bağlantı durumunu hemen güncelle
      setWs(socket);
      setIsConnected(false); // Bağlantı kurulana kadar false

      socket.onopen = () => {
        console.log('WebSocket bağlantısı başarıyla kuruldu');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Sadece ilk bağlantıda loadChats çağır
        if (isFirstConnectionRef.current) {
          loadChats();
          isFirstConnectionRef.current = false;
        }

        // Bağlantı kurulduğunda ping gönder
        const pingInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000); // Her 30 saniyede bir ping gönder

        // Cleanup
        return () => clearInterval(pingInterval);
      };

      socket.onerror = (error) => {
        console.error('WebSocketContext - connectWebSocket - Error:', error);
        setIsConnected(false);
        handleReconnect();
      };

      socket.onclose = (event) => {
        console.log('WebSocketContext - connectWebSocket - Closed:', event.code, event.reason);
        setIsConnected(false);
        handleReconnect();
      };

      socket.onmessage = (event) => {
        console.log('WebSocketContext - connectWebSocket - Message received:', event.data);
        handleWebSocketMessage(event);
      };
    } catch (error) {
      console.error('WebSocketContext - connectWebSocket - Error:', error);
      setIsConnected(false);
      handleReconnect();
    }
  };

  const handleReconnect = () => {

    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectAttemptsRef.current += 1;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, reconnectDelay);
    } else {
      console.error('WebSocketContext - handleReconnect - Max attempts reached');
    }
  };

  const sendTypingNotification = (chatId, isTyping) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket bağlantısı yok veya açık değil');
      return;
    }

    try {
      const message = {
        type: 'typing',
        chat_id: chatId,
        is_typing: isTyping,
        user_id: user?.user_id
      };

      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending typing notification:', error);
    }
  };

  const handleTypingStatus = useCallback((chatId, isTyping = true) => {
    // Önceki timeout'u temizle
    if (typingTimeoutRef.current[chatId]) {
      clearTimeout(typingTimeoutRef.current[chatId]);
    }

    // Yazıyor bildirimini gönder
    sendTypingNotification(chatId, isTyping);

    // Eğer yazıyor durumu true ise, 3 saniye sonra otomatik olarak false yap
    if (isTyping) {
      typingTimeoutRef.current[chatId] = setTimeout(() => {
        sendTypingNotification(chatId, false);
      }, 3000);
    }
  }, [ws, isConnected, user?.user_id]);

  const handleWebSocketMessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);

      switch (data.type) {
        case 'new_chat':
          // Yeni sohbet oluşturulduğunda
          if (data.chat) {
            setChats(prevChats => {
              // Eğer bu chat zaten varsa güncelle, yoksa yeni ekle
              const chatExists = prevChats.some(chat => chat.chat_id === data.chat.chat_id);

              if (!chatExists) {
                // Yeni chat oluştur
                const newChat = {
                  chat_id: data.chat.chat_id,
                  participants: data.chat.participants || [],
                  participants_info: data.chat.participants_info || [],
                  is_group: data.chat.is_group || false,
                  group_name: data.chat.group_name,
                  group_picture: data.chat.group_picture,
                  group_admin: data.chat.group_admin,
                  messages: data.chat.messages || [],
                  last_message: data.chat.last_message,
                  unread_count: data.chat.unread_count || 0,
                  created_at: data.chat.created_at,
                  updated_at: data.chat.updated_at,
                  is_active: data.chat.is_active
                };

                // Eğer participants_info eksikse, mevcut chatlerden bul
                if (!newChat.participants_info || newChat.participants_info.length === 0) {
                  const existingChat = prevChats.find(chat =>
                    chat.participants_info &&
                    chat.participants_info.some(p => newChat.participants.includes(p.user_id))
                  );

                  if (existingChat) {
                    newChat.participants_info = existingChat.participants_info.filter(p =>
                      newChat.participants.includes(p.user_id)
                    );
                  }
                }

                return [newChat, ...prevChats];
              }

              // Mevcut chat'i güncelle
              return prevChats.map(chat => {
                if (chat.chat_id === data.chat.chat_id) {
                  return {
                    ...chat,
                    ...data.chat,
                    updated_at: data.chat.updated_at
                  };
                }
                return chat;
              }).sort((a, b) => {
                const timeA = a.last_message?.timestamp || a.created_at;
                const timeB = b.last_message?.timestamp || b.created_at;
                return new Date(timeB) - new Date(timeA);
              });
            });
          }
          break;

        case 'new_message':
          // Yeni mesaj geldiğinde
          const newMessage = {
            message_id: data.message_id,
            chat_id: data.chat_id,
            sender_id: data.sender_id,
            content: data.content,
            timestamp: data.timestamp,
            status: {
              is_delivered: true,
              is_read: false
            }
          };

          // Mevcut sohbeti bul veya yeni sohbet oluştur
          setChats(prevChats => {
            const chatIndex = prevChats.findIndex(chat => chat.chat_id === data.chat_id);

            if (chatIndex === -1) {
              // Yeni sohbet oluştur
              const newChat = {
                chat_id: data.chat_id,
                participants: data.participants || [],
                last_message: newMessage,
                unread_count: 1,
                created_at: data.timestamp
              };
              return [newChat, ...prevChats];
            } else {
              // Mevcut sohbeti güncelle
              const updatedChats = [...prevChats];
              updatedChats[chatIndex] = {
                ...updatedChats[chatIndex],
                last_message: newMessage,
                unread_count: updatedChats[chatIndex].unread_count + 1
              };
              return updatedChats;
            }
          });

          // Mesajı ilgili sohbetin mesajlarına ekle
          setMessages(prevMessages => {
            const chatMessages = prevMessages[data.chat_id] || [];
            return {
              ...prevMessages,
              [data.chat_id]: [...chatMessages, newMessage]
            };
          });
          break;

        case 'chat_message':
          if (data.message && data.message.chat_id) {
            // Mesajları güncelle
            setMessages(prevMessages => {
              const chatMessages = prevMessages[data.message.chat_id] || [];

              // Eğer mesaj zaten varsa ekleme
              if (chatMessages.some(msg => msg.message_id === data.message.message_id)) {
                return prevMessages;
              }

              // WebSocket'ten gelen mesajı doğru formata dönüştür
              const formattedMessage = {
                message_id: data.message.message_id,
                chat_id: data.message.chat_id,
                sender_id: data.message.sender_id,
                content: data.message.content,
                timestamp: data.message.timestamp,
                status: data.message.status?.read_by?.length > 0 ? 'read' : 'sent'
              };

              // Yeni mesajı ekle ve sırala (eskiden yeniye)
              const newMessages = [...chatMessages, formattedMessage].sort((a, b) =>
                new Date(a.timestamp) - new Date(b.timestamp)
              );

              return {
                ...prevMessages,
                [data.message.chat_id]: newMessages
              };
            });

            // Sohbetleri güncelle
            setChats(prevChats => {
              // Eğer bu chat zaten varsa güncelle, yoksa yeni ekle
              const chatExists = prevChats.some(chat => chat.chat_id === data.message.chat_id);

              if (!chatExists) {
                // Yeni chat oluştur
                const newChat = {
                  chat_id: data.message.chat_id,
                  participants: data.message.participants || [],
                  participants_info: data.message.participants_info || [],
                  is_group: data.message.is_group || false,
                  group_name: data.message.group_name,
                  group_picture: data.message.group_picture,
                  group_admin: data.message.group_admin,
                  messages: [data.message],
                  last_message: data.message,
                  unread_count: 1,
                  created_at: data.message.timestamp,
                  updated_at: data.message.timestamp,
                  is_active: true
                };

                // Eğer participants_info eksikse, mevcut chatlerden bul
                if (!newChat.participants_info || newChat.participants_info.length === 0) {
                  const existingChat = prevChats.find(chat =>
                    chat.participants_info &&
                    chat.participants_info.some(p => newChat.participants.includes(p.user_id))
                  );

                  if (existingChat) {
                    newChat.participants_info = existingChat.participants_info.filter(p =>
                      newChat.participants.includes(p.user_id)
                    );
                  }
                }

                return [newChat, ...prevChats];
              }

              // Mevcut chat'i güncelle
              return prevChats.map(chat => {
                if (chat.chat_id === data.message.chat_id) {
                  return {
                    ...chat,
                    last_message: data.message,
                    updated_at: data.message.timestamp,
                    unread_count: chat.unread_count + 1
                  };
                }
                return chat;
              }).sort((a, b) => {
                const timeA = a.last_message?.timestamp || a.created_at;
                const timeB = b.last_message?.timestamp || b.created_at;
                return new Date(timeB) - new Date(timeA);
              });
            });

            // Mesaj geldiğinde yazıyor durumunu sıfırla
            if (data.message.sender_id !== user?.user_id) {
              console.log('Resetting typing status for other user message');
              setChats(prev => {
                return prev.map(chat => {
                  if (chat.chat_id === data.message.chat_id) {
                    return {
                      ...chat,
                      is_typing: false,
                      typing_user_id: null
                    };
                  }
                  return chat;
                });
              });
            }
          }
          break;

        case 'typing':
          // Sadece başka kullanıcıların yazıyor bildirimlerini al
          if (data.chat_id && data.user_id && data.user_id !== user?.user_id) {
            console.log('Typing notification received:', data);
            // Yazıyor durumunu güncelle
            setChats(prevChats => {
              const updatedChats = prevChats.map(chat => {
                if (chat.chat_id === data.chat_id) {
                  const updatedChat = {
                    ...chat,
                    is_typing: data.is_typing,
                    typing_user_id: data.is_typing ? data.user_id : null
                  };
                  console.log('Updated chat:', updatedChat);
                  return updatedChat;
                }
                return chat;
              });
              return updatedChats;
            });
          }
          break;

        case 'read_receipt':
          if (data.chat_id) {
            setMessages(prevMessages => {
              const chatMessages = prevMessages[data.chat_id] || [];
              return {
                ...prevMessages,
                [data.chat_id]: chatMessages.map(msg =>
                  msg.message_id === data.message_id
                    ? { ...msg, status: 'read' }
                    : msg
                )
              };
            });
          }
          break;

        case 'error':
          console.error('WebSocket error:', data.message);
          break;
      }
    } catch (error) {
      console.error('WebSocket message handling error:', error);
    }
  };

  const sendMessage = async (chatId, messageText) => {
    if (!ws || !isConnected) {
      console.error('WebSocket bağlantısı yok');
      return;
    }

    try {
      const message = {
        type: 'chat_message',
        chat_id: chatId,
        content: {
          type: 'text',
          text: messageText
        },
        sender_id: user?.user_id,
        timestamp: new Date().toISOString()
      };

      // Yazıyor durumunu sıfırla
      handleTypingStatus(chatId);

      // WebSocket üzerinden mesajı gönder
      ws.send(JSON.stringify(message));

      // WebSocket'ten gelen yanıtı bekle ve mesajı ekle
      const handleMessageResponse = (event) => {
        try {
          const response = JSON.parse(event.data);
          if (response.type === 'chat_message' && response.message.chat_id === chatId) {
            // Mesajı ekle
            setMessages(prevMessages => {
              const chatMessages = prevMessages[chatId] || [];

              // Eğer mesaj zaten varsa ekleme
              if (chatMessages.some(msg => msg.message_id === response.message.message_id)) {
                return prevMessages;
              }

              // Yeni mesajı ekle ve sırala (eskiden yeniye)
              const newMessages = [...chatMessages, response.message].sort((a, b) =>
                new Date(a.timestamp) - new Date(b.timestamp)
              );

              return {
                ...prevMessages,
                [chatId]: newMessages
              };
            });
            // Event listener'ı kaldır
            ws.removeEventListener('message', handleMessageResponse);
          }
        } catch (error) {
          console.error('Error handling message response:', error);
        }
      };

      // Geçici olarak message event listener'ı ekle
      ws.addEventListener('message', handleMessageResponse);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const createChat = async (data) => {
    try {
      const response = await createChatApi(data);

      if (response.success) {
        // Yeni chat'i chats listesine ekle
        setChats(prevChats => {
          const newChat = {
            chat_id: response.chat_id,
            participants: response.participants,
            participants_info: response.participants_info,
            is_group: response.is_group,
            group_name: response.group_name,
            group_picture: response.group_picture,
            group_admin: response.group_admin,
            messages: response.messages || [],
            last_message: response.last_message,
            unread_count: response.unread_count,
            created_at: response.created_at,
            updated_at: response.updated_at,
            is_active: response.is_active
          };
          return [newChat, ...prevChats];
        });
      }

      return response;
    } catch (error) {
      console.error('WebSocketContext - createChat - Error:', error);
      throw error;
    }
  };

  useEffect(() => {

    if (user?.token) {
      connectWebSocket();
    } else {
      if (ws) {
        ws.close();
        setWs(null);
        setIsConnected(false);
      }
    }

    return () => {
      console.log('WebSocketContext - Token effect - Cleanup');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [user?.token]);

  // WebSocket bağlantısı kurulduğunda sohbetleri yükle
  useEffect(() => {
    if (isConnected && isFirstConnectionRef.current) {
      loadChats();
      isFirstConnectionRef.current = false;
    }
  }, [isConnected]);

  useEffect(() => {
    console.log("-------------------mesajlar değişti context -------------------");

  }, [messages]);


  return (
    <WebSocketContext.Provider value={{
      ws,
      isConnected,
      messages,
      typingTimeoutRef,
      sendMessage,
      loadMessages,
      loading,
      loadChats,
      chats,
      createChat,
      handleTypingStatus
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return {
    ...context,
    loadChats: context.loadChats,
    chats: context.chats,
    createChat: context.createChat
  };
}; 