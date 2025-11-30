# 🚀 Deployment Rehberi

## GitHub Pages'e Deploy Etme

### Adım 1: GitHub Repo Oluştur
1. https://github.com/new adresine git
2. Repository adı: `calisma-programi-asistan`
3. Public seç
4. "Create repository" tıkla

### Adım 2: Git Remote Ekle ve Push Et

GitHub'da repoyu oluşturduktan sonra terminalde şu komutları çalıştır:

```bash
cd "c:\Users\dogan\projecalisma\calisma-programi-asistan-v2"

# GitHub repo URL'ini ekle (kendi username'inle değiştir)
git remote add origin https://github.com/KULLANICI_ADIN/calisma-programi-asistan.git

# Ana branch'i main olarak ayarla
git branch -M main

# Push et
git push -u origin main
```

### Adım 3: GitHub Pages'i Aktif Et

1. GitHub repo sayfasına git
2. **Settings** sekmesine tıkla
3. Sol menüden **Pages** seç
4. **Source** bölümünde:
   - Branch: `main` seç
   - Folder: `/ (root)` seç
5. **Save** tıkla

### Adım 4: Link'i Al

Birkaç dakika sonra sayfanı şu adreste görürsün:

```
https://KULLANICI_ADIN.github.io/calisma-programi-asistan/
```

---

## 🎯 Alternatif: Netlify (Daha Hızlı)

Eğer GitHub Pages beklemek istemiyorsan:

### Netlify Drop (Drag & Drop)

1. https://app.netlify.com/drop adresine git
2. Proje klasörünü sürükle-bırak
3. Anında link al!

### Netlify CLI

```bash
# Netlify CLI'yi yükle
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

## ⚡ Vercel (En Hızlı)

```bash
# Vercel CLI'yi yükle
npm i -g vercel

# Deploy
vercel --prod
```

---

## 📝 Deployment Sonrası Kontroller

✅ Link açılıyor mu?
✅ Console'da hata var mı?
✅ Chart.js yükleniyor mu?
✅ Tüm modüller çalışıyor mu?
✅ Responsive görünüm düzgün mü?

---

## 🔄 Güncelleme Yapmak İçin

Değişiklik yaptığında:

```bash
git add .
git commit -m "Güncelleme açıklaması"
git push
```

GitHub Pages otomatik olarak güncellenecek (2-3 dakika).

---

## 🎊 Başarılı Deploy!

Link'i arkadaşlarınla paylaşabilirsin! 🚀
