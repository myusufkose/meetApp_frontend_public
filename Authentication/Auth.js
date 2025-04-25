import AsyncStorage from '@react-native-async-storage/async-storage';
import { isLoggedIn } from '../api/user_api.js';

export const getIsLoggedIn = async () => {
  try {
    const token = await AsyncStorage.getItem('AccessToken');

    if (!token) {
      console.log("Token alınmamış");
      return false;
    }

    console.log("Token alınmış, API'ye gönderiliyor");

    const response = await isLoggedIn({
      'AccessToken': "Bearer " + token
    });

    console.log("Status:", response.status);
    return response.status === 200;
  } catch (error) {
    console.error("Hata oluştu:", error);
    return false;
  }
};
