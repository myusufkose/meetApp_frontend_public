# MeetApp

MeetApp, React Native ve Expo kullanılarak geliştirilmiş modern bir mobil uygulama. Uygulama, kullanıcıların etkinlikleri görüntülemesine, detaylarını incelemesine ve etkileşimde bulunmasına olanak sağlar.

## 🚀 Özellikler

- Modern ve kullanıcı dostu arayüz
- Tab navigasyonu ile kolay gezinme
- Redux ile state yönetimi
- AsyncStorage ile yerel veri depolama
- Responsive tasarım
- TypeScript desteği

## 🛠️ Teknolojiler

- React Native
- Expo
- TypeScript
- Redux Toolkit
- React Navigation
- Axios
- AsyncStorage
- React Native Reanimated
- React Native SVG
- React Native Parallax Scroll View

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn
- Expo CLI
- iOS için Xcode (macOS)
- Android için Android Studio

## 🔧 Kurulum

1. Projeyi klonlayın:
```bash
git clone [repository-url]
cd MeetApp
```

2. Bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn install
```

3. `.env` dosyasını oluşturun:
```bash
API_URL=your_api_url
API_TIMEOUT=10000
TOKEN_KEY=AccessToken
```

4. Uygulamayı başlatın:
```bash
npm start
# veya
yarn start
```

## 📱 Uygulamayı Çalıştırma

- iOS için:
```bash
npm run ios
# veya
yarn ios
```

- Android için:
```bash
npm run android
# veya
yarn android
```

- Web için:
```bash
npm run web
# veya
yarn web
```

## 📁 Proje Yapısı

```
MeetApp/
├── api/           # API istekleri
├── assets/        # Resimler, fontlar vb.
├── Components/    # Yeniden kullanılabilir bileşenler
├── Context/       # React Context dosyaları
├── Screens/       # Uygulama ekranları
├── Authentication/# Kimlik doğrulama ile ilgili dosyalar
└── App.js         # Ana uygulama bileşeni
```

## 🔐 Güvenlik

- Hassas bilgiler `.env` dosyasında saklanır
- API istekleri için token tabanlı kimlik doğrulama kullanılır
- Güvenli veri depolama için AsyncStorage kullanılır

