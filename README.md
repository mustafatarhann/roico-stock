# ROICO STOCK — İlk Çalışan Prototip

Bu sürüm:
- Android + iPhone için Expo/React Native kullanır.
- Café tarzı arayüze sahiptir.
- Çoklu birimleri destekler: kg, L, ml, adet.
- Barkod kamerayla okutulabilir.
- Ürünlerde giriş/çıkış yapılabilir.
- Hareket geçmişini tutar.
- Kritik stokları gösterir.

## Çalıştırma

1. Node.js kurulu olmalı.
2. Klasörde terminal aç:
   npm install
3. Başlat:
   npx expo start

Telefonunda Expo Go ile QR kodu okutabilirsin.

## Önemli
Bu ilk prototipte veriler cihazın belleğinde tutulur; uygulama kapanıp yeniden açıldığında sıfırlanabilir.
Bir sonraki aşamada Firebase/Supabase gibi ortak bir bulut veritabanı bağlanarak çalışanların aynı stokları canlı görmesi sağlanmalıdır.
