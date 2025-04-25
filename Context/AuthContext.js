import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { get_user_info } from "../api/user_api";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        console.log('AuthContext - checkLoginStatus - Starting');
        const token = await AsyncStorage.getItem("AccessToken");
        
        if (token) {
          const response = await get_user_info();
          
          if (response.success) {
            const userWithToken = {
              ...response.data,
              token: token
            };
            setUser(userWithToken);
          } else {
            console.log("AuthContext - User is not logged in");
            setUser(null);
          }
        } else {
          console.log("AuthContext - Token not found");
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext - Login status check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (response) => {
    try {
      
      if (!response.success) {
        throw new Error(response.message || "Giriş yapılırken bir hata oluştu");
      }

      // Store the token
      await AsyncStorage.setItem("AccessToken", response.token.AccessToken);
      console.log('AuthContext - login - Token stored in AsyncStorage');
      
      // Get the stored token
      const token = await AsyncStorage.getItem("AccessToken");
      
      // Set the user data with token
      const userWithToken = {
        ...response.data,
        token: token
      };
      setUser(userWithToken);
    } catch (error) {
      console.error("AuthContext - Login error:", error);
      throw new Error(error.message || "Giriş yapılırken bir hata oluştu");
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("AccessToken");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Çıkış yapılırken bir hata oluştu");
    }
  };

  const refreshUserData = async () => {
    try {
      console.log('AuthContext - refreshUserData - Starting');
      const token = await AsyncStorage.getItem("AccessToken");
      console.log('AuthContext - refreshUserData - Token from storage:', token);
      
      if (token) {
        const response = await get_user_info();
        console.log('AuthContext - refreshUserData - User info response:', response);
        
        if (response.success) {
          const userWithToken = {
            ...response.data,
            token: token
          };
          console.log('AuthContext - refreshUserData - Setting user with token:', userWithToken);
          setUser(userWithToken);
          return userWithToken;
        }
      }
      return null;
    } catch (error) {
      console.error("AuthContext - Kullanıcı bilgileri yenileme hatası:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
