# 📱 ICON OLUŞTURMA REHBERİ

## Gerekli Icon Boyutları:

- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192 (maskable)
- 384x384
- 512x512 (maskable)

## Online Araçlar:

1. **PWA Image Generator**
   - https://www.pwabuilder.com/imageGenerator
   - Tek bir 512x512 yükle, tüm boyutları oluşturur

2. **Favicon.io**
   - https://favicon.io/
   - Text'ten veya emoji'den icon oluştur

3. **RealFaviconGenerator**
   - https://realfavicongenerator.net/
   - Tüm platformlar için icon

## Manuel Oluşturma (Photoshop/Figma):

1. 512x512 artboard aç
2. Gradient arka plan (#667eea → #764ba2)
3. Ortaya 📚 emoji veya "SP" logo
4. Export: PNG, tüm boyutlar

## Maskable Icon:

- Safe zone: Icon'un %80'i içeride olmalı
- Kenarlar kesilir (iOS, Android)
- https://maskable.app/ ile test et

## Placeholder Icon (Hızlı Test):

```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>">
```
