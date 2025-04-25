import ApiManager from './ApiManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const user_login = async (data) => {
  try {
    const result = await ApiManager.post('/user/login', data);
    return result;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('E-posta veya şifre hatalı');
      }
      throw new Error(error.response.data.message || 'Giriş yapılırken bir hata oluştu');
    }
    throw new Error('Sunucuya bağlanılamadı');
  }
};

export const get_all_users = async () => {
  try {
    const result = await ApiManager.get('/allusers');
    return result;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Kullanıcılar alınırken bir hata oluştu');
    }
    throw new Error('Sunucuya bağlanılamadı');
  }
};

export const get_user_activities = async (userId) => {
  try {
    const result = await ApiManager.get(`/users/${userId}/activities`);
    return result.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Kullanıcı aktiviteleri alınırken bir hata oluştu');
    }
    throw new Error('Sunucuya bağlanılamadı');
  }
};

export const isLoggedIn = async () => {
  try {
    const result = await ApiManager.get('/isLoggedIn');
    return result;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Oturum kontrolü yapılırken bir hata oluştu');
    }
    throw new Error('Sunucuya bağlanılamadı');
  }
};

export const user_register = async (data) => {
  try {
    const result = await ApiManager.post('/user/signup', {
      email: data.email,
      full_name: data.name,
      password: data.password
    });
    return result;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Kayıt olurken bir hata oluştu');
    }
    throw new Error('Sunucuya bağlanılamadı');
  }
};

export const get_user_friends = async () => {
  try {
    const result = await ApiManager.get('/friends');
    return result.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Arkadaş listesi alınırken bir hata oluştu');
    }
    throw new Error('Sunucuya bağlanılamadı');
  }
};

export const search_users = async (query) => {
  try {
    const result = await ApiManager.get(`/users/search?q=${query}`);
    return result.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Kullanıcılar aranırken bir hata oluştu');
    }
    throw new Error('Sunucuya bağlanılamadı');
  }
};

export const add_friend = async (userId) => {
  try {
    const result = await ApiManager.post('/add-friend', userId);
    return result.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Arkadaş eklenirken bir hata oluştu');
    }
    throw new Error('Sunucuya bağlanılamadı');
  }
};

export const get_user_info = async () => {
  try {
    const result = await ApiManager.get('/user/me');
    return result.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Kullanıcı bilgileri alınırken bir hata oluştu');
    }
    throw new Error('Sunucuya bağlanılamadı');
  }
};

export const accept_friend_request = async (friend_id) => {
  try {
    const response = await ApiManager.post('/accept-friend-request', friend_id);
    return response.data;
  } catch (error) {
    console.error('Arkadaşlık isteği kabul edilirken hata:', error);
    throw error;
  }
};

