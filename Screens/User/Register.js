import { StyleSheet, Text, SafeAreaView, TextInput, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import CustomButton from '../../Components/Common/CustomButton.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { user_register } from '../../api/user_api.js';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../Context/AuthContext.js';
import { useTheme } from '../../Context/ThemeContext';
import React, { useContext, useState } from "react";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [emailError, setEmailError] = useState('');
    const [seePassword, setSeePassword] = useState(true);
    const navigation = useNavigation();
    const { login } = useContext(AuthContext);
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const styles = createStyles(theme);

    const handleCheckEmail = text => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmail(text);
        
        if (!text) {
            setEmailError('Email alanı boş bırakılamaz');
        } else if (!emailRegex.test(text)) {
            setEmailError('Geçerli bir email adresi giriniz');
        } else {
            setEmailError('');
        }
    };

    const handleRegister = async () => {
        try {
            if (!name || !email || !password) {
                alert('Lütfen tüm alanları doldurunuz');
                return;
            }

            if (emailError) {
                alert('Lütfen geçerli bir email adresi giriniz');
                return;
            }

            setLoading(true);
            const result = await user_register({
                name: name,
                email: email.toLowerCase(),
                password: password,
            });

            if (result.data.success) {
                await login(result.data);
            } else {
                alert(result.data.detail || 'Kayıt olurken bir hata oluştu');
            }
        } catch (error) {
            console.error('Kayıt hatası:', error);
            alert('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyiniz.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Hesabınız oluşturuluyor...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <MaterialCommunityIcons name="calendar-check" size={64} color={theme.colors.primary} />
                </View>
                <Text style={styles.title}>MeetApp'e Hoş Geldiniz</Text>
                <Text style={styles.subtitle}>Hesabınızı oluşturun ve etkinliklere katılmaya başlayın</Text>
            </View>
            
            <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="account-outline" size={24} color={theme.colors.primary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Adınız ve Soyadınız"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="email-outline" size={24} color={theme.colors.primary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="E-posta adresiniz"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={email}
                        onChangeText={handleCheckEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="lock-outline" size={24} color={theme.colors.primary} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Şifreniz"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={password}
                        secureTextEntry={seePassword}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setSeePassword(!seePassword)} style={styles.eyeIcon}>
                        <MaterialCommunityIcons 
                            name={seePassword ? "eye-off-outline" : "eye-outline"} 
                            size={24} 
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.registerButton}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.registerButtonText}>Kayıt Ol</Text>
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginLink}>Giriş Yap</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    header: {
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 32,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    formContainer: {
        padding: 24,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        flex: 1,
        shadowColor: theme.colors.shadow,
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    input: {
        flex: 1,
        height: 50,
        color: theme.colors.text,
        marginLeft: 12,
        fontSize: 16,
    },
    inputIcon: {
        marginRight: 8,
    },
    eyeIcon: {
        padding: 8,
    },
    errorText: {
        color: theme.colors.error,
        marginTop: -8,
        marginBottom: 16,
        marginLeft: 4,
    },
    registerButton: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    registerButtonText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    loginLink: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
}); 