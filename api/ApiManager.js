import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

// URL'deki çift slash'leri temizle
const cleanUrl = (url) => {
  return url.replace(/\/+/g, '/');
};

// Retry mekanizması için yardımcı fonksiyon
const retry = async (fn, maxRetries = 5, delay = 500) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
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
const api = axios.create({
  
  baseURL: cleanUrl(API_URL),
  timeout: 5000,  // 5 saniye
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500; // 500'den küçük tüm status kodlarını kabul et
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('AccessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // URL'i temizle
      config.url = cleanUrl(config.url);
      return config;
    } catch (error) {
      console.error('Token alınırken hata:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor hatası:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      // Timeout hatası için özel mesaj
      const isLastAttempt = error.config?.isLastAttempt;
      if (isLastAttempt) {
        console.error('Bağlantı zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.');
      }
      return Promise.reject(new Error('Bağlantı zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.'));
    }
    
    if (error.response) {
      // Sunucu yanıt verdi ama hata kodu döndü
      console.error('API Hatası:', error.response.status, error.response.data);
      return Promise.reject(error);
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı
      console.error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.');
      return Promise.reject(new Error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.'));
    } else {
      // İstek oluşturulurken bir hata oluştu
      console.error('İstek oluşturulurken hata:', error.message);
      return Promise.reject(error);
    }
  }
);

// Retry mekanizması ile API isteklerini sarmala
const apiWithRetry = {
  get: async (url, config = {}) => {
    return retry(() => api.get(url, config));
  },
  post: async (url, data = {}, config = {}) => {
    return retry(() => api.post(url, data, config));
  },
  put: async (url, data = {}, config = {}) => {
    return retry(() => api.put(url, data, config));
  },
  delete: async (url, config = {}) => {
    return retry(() => api.delete(url, config));
  },
  patch: async (url, data = {}, config = {}) => {
    return retry(() => api.patch(url, data, config));
  }
};

export default apiWithRetry;
