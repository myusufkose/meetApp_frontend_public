import api from './ApiManager';

// Chat oluştur
export const createChat = async (data) => {
  try {
    const response = await api.post('/chat/', data);
    return response.data;
  } catch (error) {
    console.error('WebSocketContext - createChat - Error:', error);
    throw error;
  }
};

// Kullanıcının tüm chat'lerini getir
export const get_chats = async () => {
  try {
    const response = await api.get('/chat/with-recent-messages');
    
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Invalid API response format:', response.data);
      return [];
    }

    // Her sohbet için son mesaj kontrolü
    const validChats = response.data.map(chat => ({
      ...chat,
      last_message: chat.last_message || {
        content: '',
        timestamp: chat.created_at,
        sender_id: null
      }
    }));

    // Sohbetleri son mesaj tarihine göre sırala
    return validChats.sort((a, b) => {
      const dateA = new Date(a.last_message?.timestamp || a.created_at);
      const dateB = new Date(b.last_message?.timestamp || b.created_at);
      return dateB - dateA;
    });

  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
};

// Belirli bir chat'in mesajlarını getir
export const get_messages = async (chat_id, page = 1, page_size = 20) => {
  try {
    
    const response = await api.get(`/chat/${chat_id}/messages`, {
      params: {
        page,
        page_size
      }
    });

    
    if (!response.data) {
      console.error('get_messages - Invalid response format:', response);
      return [];
    }

    // Mesajları doğru formatta döndür
    const messages = response.data.messages.map(msg => ({
      message_id: msg.message_id,
      chat_id: msg.chat_id,
      sender_id: msg.sender_id,
      content: msg.content,
      timestamp: msg.timestamp,
      is_read: msg.is_read,
      status: {
        is_delivered: msg.is_delivered,
        is_read: msg.is_read
      }
    }));

    return messages;
  } catch (error) {
    console.error('get_messages - Error:', error);
    throw error;
  }
};

