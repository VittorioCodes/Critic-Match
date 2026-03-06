# 🎯 BAŞLAMAK İÇİN HIZLI KILAVUZ

## ⚡ 3 Adımda Başla

### 1️⃣ Terminal'i Aç ve Şunu Çalıştır:
```bash
cd E:\Coding\CriticMatch\YeniProje\critic-match
npm install i18next-browser-languagedetector
```

### 2️⃣ API Anahtarları (İsteğe Bağlı)

**Seçenek A: Demo Modu** (Hemen test etmek için)
- Bu adımı atla! Uygulama sahte verilerle çalışacak.

**Seçenek B: Gerçek Veriler** (Önerilen)
1. `.env.example` dosyasını kopyala ve `.env` olarak adlandır
2. İçine API anahtarlarını ekle (detaylar SETUP.md'de)

### 3️⃣ Uygulamayı Başlat:
```bash
npm start
```

✅ **Tarayıcı otomatik açılacak:** http://localhost:3000

---

## 🎨 Ne Göreceksin?

### 🏠 Ana Sayfa (Hub)
- 3 büyük kart: Oyunlar 🎮 / Filmler 🎬 / Diziler 📺
- Sağ üst: 🌙 (Dark mode) ve 🌍 (Dil seçici)
- Sinematik tasarım, film grain efekti

### 📋 Seçim Sayfası
- Arama çubuğu
- Filtreler (Yıl, Puan)
- Poster grid
- Alt bar (seçilenler)
- "Eleştirmenleri Bul" butonu

### 🎯 Sonuçlar Sayfası
- Şu an placeholder (geliştirme aşamasında)
- Geri buton çalışıyor

---

## ✅ Çalışan Özellikler

- [x] Dark/Light mode geçişi
- [x] 7 dil desteği (TR, EN, DE, FR, ES, JA, PT)
- [x] Arama (300ms debounce)
- [x] Filtreler (Yıl, Puan)
- [x] İçerik seçimi
- [x] Kategori renkleri
- [x] Responsive tasarım
- [x] Film grain overlay
- [x] Smooth animasyonlar

---

## 🐛 Sorun mu Yaşıyorsun?

### Hata: "Cannot find module"
```bash
npm install i18next-browser-languagedetector
```

### Hata: Port 3000 kullanımda
```bash
netstat -ano | findstr :3000
taskkill /PID <SAYI> /F
```

### API Anahtarları çalışmıyor
1. `.env` dosyası `package.json` ile aynı klasörde olmalı
2. Anahtarlarda tırnak olmamalı: ✅ `KEY=abc123` ❌ `KEY="abc123"`
3. Sunucuyu yeniden başlat (Ctrl+C sonra `npm start`)

---

## 📁 Önemli Dosyalar

| Dosya | Ne İçin? |
|-------|----------|
| `SETUP.md` | Detaylı kurulum |
| `PROJECT_SUMMARY.md` | Tam özet |
| `CHECKLIST.md` | Test listesi |
| `.env.example` | API şablonu |
| `README.md` | Proje bilgisi |

---

## 🎯 Hızlı Test

1. ✅ Uygulama açılıyor mu?
2. ✅ Dark mode çalışıyor mu?
3. ✅ Dil değişiyor mu?
4. ✅ Kategori seçebiliyor musun?
5. ✅ Arama çalışıyor mu?
6. ✅ İçerik seçebiliyor musun?
7. ✅ Geri buton çalışıyor mu?

Hepsi ✅ ise → **Mükemmel! Her şey hazır! 🎉**

---

## 💡 İpuçları

- 🌙 Dark mode: Sağ üstteki ay ikonuna tıkla
- 🌍 Dil: Sağ üstteki bayrak seçiciden seç
- 🎮 Demo veri: API anahtarı olmadan da çalışır
- 📱 Mobil test: F12 → Device Toolbar
- ⚡ Hızlı yeniden başlat: Ctrl+C sonra `npm start`

---

## 🚀 HAZIR!

Her şey çalışıyor! Sadece:

```bash
npm install i18next-browser-languagedetector
npm start
```

**O kadar! 🎬**

---

**Soru/Sorun:** 
- `SETUP.md` dosyasına bak
- Browser console'u kontrol et (F12)
- `CHECKLIST.md` ile test et

**Başarılar! 🎯**
