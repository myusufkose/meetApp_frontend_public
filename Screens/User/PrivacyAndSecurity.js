import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';
import { AuthContext } from '../../Context/AuthContext';

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.secondary,
  },
  dangerButton: {
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default function PrivacyAndSecurity() {
  const { theme } = useTheme();
  const { logout } = useContext(AuthContext);
  const styles = createStyles(theme);
  
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    locationSharing: true,
    activityVisibility: true,
    dataCollection: true,
  });

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              // Hesap silme API çağrısı buraya gelecek
              await logout();
            } catch (error) {
              Alert.alert('Hata', 'Hesap silinirken bir hata oluştu.');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Güvenlik</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)}
        >
          <MaterialCommunityIcons 
            name="two-factor-authentication" 
            size={24} 
            color={theme.colors.primary} 
          />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>İki Faktörlü Doğrulama</Text>
            <Text style={styles.settingDescription}>
              Hesabınıza ekstra güvenlik katmanı ekleyin
            </Text>
          </View>
          <Switch
            value={settings.twoFactorAuth}
            onValueChange={(value) => handleSettingChange('twoFactorAuth', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gizlilik</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => handleSettingChange('locationSharing', !settings.locationSharing)}
        >
          <MaterialCommunityIcons 
            name="map-marker" 
            size={24} 
            color={theme.colors.primary} 
          />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Konum Paylaşımı</Text>
            <Text style={styles.settingDescription}>
              Etkinliklerde konumunuzu diğer katılımcılarla paylaşın
            </Text>
          </View>
          <Switch
            value={settings.locationSharing}
            onValueChange={(value) => handleSettingChange('locationSharing', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => handleSettingChange('activityVisibility', !settings.activityVisibility)}
        >
          <MaterialCommunityIcons 
            name="eye" 
            size={24} 
            color={theme.colors.primary} 
          />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Etkinlik Görünürlüğü</Text>
            <Text style={styles.settingDescription}>
              Etkinliklerinizi diğer kullanıcılara gösterin
            </Text>
          </View>
          <Switch
            value={settings.activityVisibility}
            onValueChange={(value) => handleSettingChange('activityVisibility', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItem, styles.settingItemLast]}
          onPress={() => handleSettingChange('dataCollection', !settings.dataCollection)}
        >
          <MaterialCommunityIcons 
            name="database" 
            size={24} 
            color={theme.colors.primary} 
          />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Veri Toplama</Text>
            <Text style={styles.settingDescription}>
              Uygulama deneyimini iyileştirmek için veri toplanmasına izin verin
            </Text>
          </View>
          <Switch
            value={settings.dataCollection}
            onValueChange={(value) => handleSettingChange('dataCollection', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
        <MaterialCommunityIcons name="delete" size={24} color={theme.colors.text} />
        <Text style={styles.dangerButtonText}>Hesabı Sil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
} 