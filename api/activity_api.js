import api from './ApiManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Retry mekanizması için yardımcı fonksiyon
const retry = async (fn, maxRetries = 5, delay = 500) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Son denemeyi işaretle
        if (error.config) {
          error.config.isLastAttempt = true;
        }
      }
    }
  }
  
  throw lastError;
};

// Tüm aktiviteleri getir
export const getAllActivities = async () => {
  try {
    const fetchData = async () => {
      const response = await api.get('/activities', {
        timeout: 4000, // 4 saniye timeout
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      return response.data;
    };

    // Maksimum 5 deneme yap
    return await retry(fetchData, 5);
  } catch (error) {
    console.error('Aktiviteler getirilirken hata:', error);
    throw error;
  }
};

// Belirli bir aktiviteyi getir
export const getActivityById = async (id) => {
  try {
    const response = await api.get(`/activities/${id}`, {
      timeout: 30000,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Aktivite detayı getirilirken hata:', error);
    throw error;
  }
};

// Yeni aktivite oluştur
export const createActivity = async (activityData) => {
  try {
    const token = await AsyncStorage.getItem('AccessToken');
    if (!token) {
      throw new Error('Token bulunamadı');
    }

    const response = await api.post('/activities', activityData, {
      timeout: 30000,
      headers: {
        'Cache-Control': 'no-cache',
        'Authorization': `Bearer ${token}`
      },
    });
    return response.data;
  } catch (error) {
    console.error('Aktivite oluşturulurken hata:', error);
    throw error;
  }
};

// Aktivite güncelle
export const updateActivity = async (id, activityData) => {
  try {
    const response = await api.put(`/activities/${id}`, activityData, {
      timeout: 30000,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Aktivite güncellenirken hata:', error);
    throw error;
  }
};

// Aktivite sil
export const deleteActivity = async (id) => {
  try {
    await api.delete(`/activities/${id}`, {
      timeout: 30000,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Aktivite silinirken hata:', error);
    throw error;
  }
};

// Kullanıcının aktivitelerini getir
export const getUserActivities = async () => {
  try {
    const response = await api.get('/activities/user', {
      timeout: 30000,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Kullanıcı aktiviteleri getirilirken hata:', error);
    throw error;
  }
};
