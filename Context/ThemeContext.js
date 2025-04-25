import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tema renkleri
export const themes = {
    neonSpace: {
        name: 'Neon Space',
        colors: {
            primary: '#63B3ED',          // Neon mavi
            secondary: '#8B5CF6',        // Parlak mor
            background: '#0B0B2B',       // Koyu lacivert/mor
            surface: '#1A1A3F',          // Biraz daha açık arka plan
            text: '#FFFFFF',             // Beyaz metin
            textSecondary: '#A0AEC0',    // İkincil metin
            border: '#63B3ED',           // Kenarlıklar için neon mavi
            error: '#FF4E4E',            // Hata mesajları
            success: '#48BB78',          // Başarı mesajları
            warning: '#F6AD55',          // Uyarı mesajları
            inactive: '#8B5CF6',         // Pasif durumlar
            card: '#0B0B2B',             // Kart arka planı
            cardBorder: '#63B3ED',       // Kart kenarlığı
            shadow: '#63B3ED',           // Gölge rengi
        }
    },
    darkNavy: {
        name: 'Dark Navy',
        colors: {
            primary: '#FFFFFF',          // Beyaz vurgu rengi
            secondary: '#9CA3AF',        // Gri ton
            background: '#000000',       // Tam siyah arka plan
            surface: '#111111',          // Çok koyu gri yüzey
            text: '#FFFFFF',             // Beyaz metin
            textSecondary: '#9CA3AF',    // Gri ikincil metin
            border: '#333333',           // Koyu gri kenarlıklar
            error: '#FF4444',            // Parlak kırmızı
            success: '#00FF00',          // Parlak yeşil
            warning: '#FFA500',          // Parlak turuncu
            inactive: '#666666',         // Orta gri pasif durumlar
            card: '#111111',             // Koyu gri kart
            cardBorder: '#333333',       // Koyu gri kart kenarlığı
            shadow: 'rgba(0, 0, 0, 0.5)', // Daha belirgin gölge
        }
    },
    // Diğer temalar buraya eklenebilir
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(themes.darkNavy);

    // Tema değiştirme fonksiyonu
    const changeTheme = async () => {
        const newTheme = currentTheme === themes.neonSpace ? themes.darkNavy : themes.neonSpace;
        setCurrentTheme(newTheme);
        try {
            await AsyncStorage.setItem('selectedTheme', newTheme === themes.neonSpace ? 'neonSpace' : 'darkNavy');
        } catch (error) {
            console.log('Tema kaydedilirken hata oluştu:', error);
        }
    };

    // AsyncStorage'dan tema yükleme
    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('selectedTheme');
            if (savedTheme && themes[savedTheme]) {
                setCurrentTheme(themes[savedTheme]);
            } else {
                setCurrentTheme(themes.darkNavy);
            }
        } catch (error) {
            console.log('Tema yüklenirken hata oluştu:', error);
            setCurrentTheme(themes.darkNavy);
        }
    };

    React.useEffect(() => {
        loadTheme();
    }, []);

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook for using theme
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 