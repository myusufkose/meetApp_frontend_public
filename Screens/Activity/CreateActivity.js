import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Dimensions
} from 'react-native';
import { createActivity } from '../../api/activity_api';
import { AuthContext } from '../../Context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

export function CreateActivity() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [activityDate, setActivityDate] = useState(new Date());
  const [maxParticipants, setMaxParticipants] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(activityDate);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setTempDate(selectedTime);
    }
  };

  const handleSelect = () => {
    const now = new Date();
    const selectedDate = new Date(tempDate);
    
    // Sadece tarih kısmını karşılaştır (saat, dakika, saniye olmadan)
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Tarih seçimi kontrolü - bugün veya gelecek olmalı
    if (selectedDateOnly < todayOnly) {
      Alert.alert('Hata', 'Geçmiş bir tarih seçemezsiniz.');
      return;
    }

    if (showDatePicker) {
      setActivityDate(tempDate);
      setShowDatePicker(false);
      setShowTimePicker(true);
    } else if (showTimePicker) {
      // Bugün seçildiyse saat kontrolü yap
      if (selectedDateOnly.getTime() === todayOnly.getTime()) {
        // Saat seçimi kontrolü - şu anki saatten sonra olmalı
        if (selectedDate.getHours() < now.getHours() || 
            (selectedDate.getHours() === now.getHours() && selectedDate.getMinutes() <= now.getMinutes())) {
          Alert.alert('Hata', 'Geçmiş bir saat seçemezsiniz.');
          return;
        }
      }
      setActivityDate(tempDate);
      setShowTimePicker(false);
    }
  };

  const handleCreate = async () => {
    if (!user) {
      Alert.alert('Hata', 'Oturum açmanız gerekiyor.');
      navigation.navigate('Login');
      return;
    }

    const now = new Date();
    const activityTimestamp = activityDate.getTime();
    const nowTimestamp = now.getTime();
    
    if (activityTimestamp < nowTimestamp) {
      Alert.alert('Hata', 'Geçmiş bir tarihli etkinlik oluşturamazsınız.');
      return;
    }

    if (!title) {
      Alert.alert('Hata', 'Etkinlik başlığı boş bırakılamaz.');
      return;
    }

    if (!location) {
      Alert.alert('Hata', 'Etkinlik konumu boş bırakılamaz.');
      return;
    }

    if (!maxParticipants) {
      Alert.alert('Hata', 'Maksimum katılımcı sayısı boş bırakılamaz.');
      return;
    }

    if (isNaN(maxParticipants) || parseInt(maxParticipants) <= 0) {
      Alert.alert('Hata', 'Katılımcı sayısı geçerli bir sayı olmalıdır.');
      return;
    }

    try {
      setLoading(true);
      const activityData = {
        title,
        description,
        location,
        activity_date: activityDate.toISOString(),
        max_participants: parseInt(maxParticipants),
        creator: user.id
      };
      console.log('Etkinlik verisi:', activityData);
      // API çağrısını yap
      await createActivity(activityData);
      Alert.alert('Başarılı', 'Etkinlik başarıyla oluşturuldu!', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Etkinlik oluşturulurken bir hata oluştu.');
      console.error('Etkinlik oluşturma hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Yeni Etkinlik</Text>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Etkinlik İsmi</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="format-title" size={22} color={theme.colors.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Etkinliğinize bir isim verin"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Açıklama</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="text-box-outline" size={22} color={theme.colors.primary} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Etkinliğinizi detaylı bir şekilde açıklayın"
                    value={description}
                    onChangeText={setDescription}
                    numberOfLines={1}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Konum</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="map-marker" size={22} color={theme.colors.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Etkinlik konumu"
                    value={location}
                    onChangeText={setLocation}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tarih ve Katılımcılar</Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Tarih ve Saat</Text>
                <View style={styles.dateContainer}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => {
                      setShowDatePicker(true);
                    }}
                  >
                    <MaterialCommunityIcons name="calendar" size={22} color={theme.colors.primary} />
                    <Text style={styles.dateButtonText}>
                      {activityDate.toLocaleDateString('tr-TR')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => {
                      setShowTimePicker(true);
                    }}
                  >
                    <MaterialCommunityIcons name="clock-outline" size={22} color={theme.colors.primary} />
                    <Text style={styles.dateButtonText}>
                      {activityDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.quickDateContainer}>
                  <TouchableOpacity
                    style={styles.quickDateButton}
                    onPress={() => {
                      const today = new Date();
                      setActivityDate(today);
                    }}
                  >
                    <Text style={styles.quickDateButtonText}>Bugün</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickDateButton}
                    onPress={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setActivityDate(tomorrow);
                    }}
                  >
                    <Text style={styles.quickDateButtonText}>Yarın</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Maksimum Katılımcı</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="account-group" size={22} color={theme.colors.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Katılımcı sayısı"
                    value={maxParticipants}
                    onChangeText={setMaxParticipants}
                    keyboardType="numeric"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <Text style={styles.submitButtonText}>Etkinlik Oluştur</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showDatePicker || showTimePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showDatePicker ? 'Tarih Seçin' : 'Saat Seçin'}
              </Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={handleSelect}
              >
                <Text style={styles.selectButtonText}>
                  {showTimePicker ? 'Tamam' : 'Seç'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <DateTimePicker
              value={tempDate}
              mode={showDatePicker ? 'date' : 'time'}
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={showDatePicker ? handleDateChange : handleTimeChange}
              style={styles.dateTimePicker}
              minuteInterval={1}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowDatePicker(false);
                  setShowTimePicker(false);
                }}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    margin: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    height: 48,
    color: theme.colors.text,
    marginLeft: 8,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.text,
  },
  submitButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  submitButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: Dimensions.get('window').height * 0.5,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  modalButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  dateTimePicker: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  quickDateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 12,
    width: '50%',
  },
  quickDateButton: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flex: 1,
    marginRight: 6,
  },
  quickDateButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
}); 