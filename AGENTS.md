# AGENTS.md — Uçuş Keşfi (React Native case)

Bu depoda çalışan AI agent'ın kuralları. Her oturumun başında oku. Buradaki bir kural brief'le çelişirse brief geçerlidir; çelişkiyi bana bildir.

## 1. Proje

Bir işe alım case'i: İstanbul–Antalya uçuşlarını listeleyen, filtreleyip sıralayan ve favorilere kaydeden bir React Native + TypeScript uygulaması. Veri `case-kit/` içindeki yerel mock servisten gelir.

Değerlendirme görsellikten çok şunlara bakıyor: istenen davranışların doğruluğu, asenkron veri akışı, state yönetimi, testler ve README'deki gerekçeler. Kodu ben (aday) inceleyip teknik mülakatta savunacağım. Bu yüzden okunur ve açık kod yaz; zekice tek satırlıklar yerine anlaşılır bir akış kur, kritik yerlere kısa bir "neden" yorumu ekle.

## 2. Kaynaklar (öncelik sırasıyla)

1. `docs/case/React-Native-Case.md`: görev ve kabul kriterleri (P0/P1). Asıl doğruluk kaynağı.
2. `case-kit/README.md`: servis sözleşmesi, debug uçları, veri kuralları.
3. `docs/case/BASLA.md`: başlangıç adımları ve hızlı doğrulama.
4. Bu dosya: teknik kararlar ve çalışma kuralları.

`docs/case/` yereldir, repoya girmez (§10). API davranışı hakkında tahmin yürütme: `curl` ile dene ya da `case-kit/server.js`'i oku.

## 3. Sabit teknik kararlar

| Konu | Karar |
|---|---|
| Platform | Expo SDK 57 (expo 57.0.x, React Native 0.86.x, React 19.2.x), TypeScript `strict` |
| Kurulum | `npx create-expo-app@latest <klasör> --template blank-typescript@sdk-57` |
| Çalıştırma | iOS Simulator + Expo Go. Native build yok. |
| Navigasyon | React Navigation: kök native-stack içinde `Tabs` (bottom-tabs: Uçuşlar, Favoriler) ve `FlightDetail`. expo-router yok. |
| Liste verisi | `api` katmanı + saf reducer + `useFlights` hook'u (`useReducer`). TanStack Query ve Redux yok. |
| Favoriler | Zustand + `persist` + AsyncStorage. Uçuşun tamamı saklanır (kimlik → `FlightDto`). |
| Test | Jest (`jest-expo` preset) + React Native Testing Library + kütüphanelerin resmi jest mock'ları |
| Paket kurulumu | Expo'nun bildiği paketler `npx expo install` ile (SDK 57 uyumlu sürüm), diğerleri npm ile. Kilit dosyası `package-lock.json`. |

Native build olmamasının nedeni: makinede Xcode 27 var. iOS 27 SDK'sıyla derlenip scene yaşam döngüsüne geçmemiş bir uygulama açılışta çöküyor. Expo Go ile bu sorun oluşmuyor.

## 4. Kesin yasaklar

- `git push`, `git remote add` veya herhangi bir uzak depo işlemi yok. Her şey yerel.
- `npx expo prebuild`, `npx expo run:ios|android`, `eas build` ve `expo-dev-client` yok; `ios/` ve `android/` klasörü oluşmayacak. Expo Go'da çalışmayan native modül ekleme.
- SDK 58'e, beta ya da canary sürümlere geçme. Sürüm uyarısı görürsen bana sor.
- `case-kit/` içindeki dosyaları değiştirme.
- Listede istemci tarafında filtreleme veya sıralama yok; ikisi de sunucuda (`sort`, `onlyDirect`).
- Brief'in "İstenmiyor" listesindekiler yok: arama formu, rota/tarih seçimi, giriş, ödeme, animasyon, harita, bottom sheet, çoklu dil, koyu tema, logo. Görsel cila ve ek özellik ekleme.
- Bileşen içinde HTTP çağrısı yok. Repository, DI gibi soyutlama katmanları ve ölçülmemiş optimizasyon yok.
- `any` veya `@ts-ignore` ile hata susturma yok.
- Testler ağa çıkmaz; yalnızca snapshot testi yazma.
- `npm install --force` veya `--legacy-peer-deps` yok; peer çakışması olursa doğru sürümle çöz ve bana yaz.
- `React.StrictMode` ekleme: dev'de effect'leri iki kez çalıştırır, ilk sayfa sunucuya iki kez gidebilir.

## 5. Komutlar

```bash
node case-kit/server.js > /tmp/flight-case-server.log 2>&1 &   # mock servis, port 4000; iş bitince kapat
curl -s localhost:4000/health
curl -s "localhost:4000/flights?page=1&limit=8&sort=price"      # ilk üç kayıt: FL004, FL009, FL006
npm test                     # package.json: "test": "TZ=America/New_York jest"
npx tsc --noEmit
npx expo install --check     # bağımlılıklar SDK 57 ile uyumlu mu
npx expo export --platform ios --output-dir /tmp/flight-case-export   # bundle derleniyor mu
```

- Servisi arka planda başlatamıyorsan benden ayrı bir terminalde başlatmamı iste.
- Expo dev server'ı (`npx expo start`, sonra `i`) ben kendi terminalimde çalıştırırım; sen başlatma.
- Simülatörü görmen gerekirse `xcrun simctl io booted screenshot /tmp/shot.png` ile ekran görüntüsü alabilirsin.

## 6. Mimari

Önerilen yapı; gerekirse sadeleştir, katman ekleme:

```
App.tsx                  # SafeAreaProvider + NavigationContainer
src/
  config.ts              # API_BASE_URL = EXPO_PUBLIC_API_URL ?? (android ? http://10.0.2.2:4000 : http://localhost:4000)
  api/
    flight.types.ts      # case-kit/flight.types.ts'in birebir kopyası (wire tipleri)
    client.ts            # fetch sarmalayıcı: ApiError {status, code, message}, AbortSignal, __DEV__'de istek log'u
    flights.ts           # buildFlightsQuery, getFlights
  domain/
    format.ts            # formatPrice, formatDuration, formatTime, formatDate, baggageText, isNextDay
    flightView.ts        # FlightDto → ekran modeli (toFlightView)
  features/flights/      # flightsReducer.ts, useFlights.ts, FlightListScreen.tsx, FlightDetailScreen.tsx
  features/favorites/    # favoritesStore.ts, FavoritesScreen.tsx
  components/            # FlightCard, FavoriteButton, StateView (yükleniyor/hata/boş), ListFooter
  navigation/            # RootNavigator.tsx, types.ts
```

- State'te DTO'yu olduğu gibi tut; ekranda `toFlightView` ile biçimlendir.
- Detay ekranı parametre olarak uçuşun kendisini (`FlightDto`) alır, ek istek atmaz. Favori durumu her zaman store'dan, id ile okunur. Gerekçesi README'ye yazılır.
- Filtre, sıralama ve toplam sayı listenin üstünde sabit durur (FlatList'in dışında).

## 7. Davranış kuralları ve tuzaklar

### Liste ve sayfalama

- Parametreler her istekte açıkça gönderilir: `page`, `limit=8`, `sort` (`price` | `duration`), `onlyDirect` (`true` | `false`). Varsayılan: `sort=price`, `onlyDirect=false`.
- İlk sayfanın durumu tek bir `status` alanında: `loading | success | error`. Sonraki sayfa için ayrıca `loadingMore` ve `loadMoreError`. Yükleniyor, hata ve boş durum asla aynı anda görünmez.
- `onEndReached` art arda tetiklenir. Yükleme bayrağını `useRef` ile tut; sonraki sayfa yalnızca `status === 'success' && hasMore && !loadingMore && !loadMoreError` iken istenir.
- Sonraki sayfa hata verirse scroll ile otomatik tekrar deneme yok. Liste yerinde kalır, altında "Tekrar dene" görünür.
- Sonraki sayfa belirteci listenin altında (footer); ekranı kapatmaz.
- Her isteğe artan bir `requestId` ver. Filtre veya sıralama değişince bekleyen isteği `AbortController` ile iptal et; reducer eski `requestId`'li yanıtı yok saysın. Varsayılan gecikme her istekte 350–600 ms rastgele olduğu için bu koruma race modu kapalıyken de gerekli. `AbortError` hata olarak gösterilmez.
- Filtre veya sıralama değişince sayfalama başa döner, eski öğeler temizlenir, ilk sayfa yüklenir ve liste en üste kayar.
- Toplam sayı `meta.total` (filtre uygulandıktan sonraki toplam).
- İki ayrı boş durum: filtre açıkken sonuç boşsa açıklama ve "Filtreyi temizle" (`onlyDirect=false` yapar); filtre kapalıyken boşsa "Uçuş bulunamadı".
- Liste anahtarı `id`, indeks değil.

### Detay ve biçimlendirme

- Fiyat: `priceMinor` tam sayı kuruş. Tam sayı aritmetiğiyle `355000 → "3.550,00 TL"`. `Intl`'in para birimi biçimini kullanma (₺ verir).
- Saat ve tarih her zaman Europe/Istanbul'a göre. Cihazın saat dilimi sonucu değiştirmez (testler `TZ=America/New_York` altında koşar).
- FL024 ertesi gün varır: detayda kalkış ve varış tarihini ayrı ayrı göster, kartta varış saatinin yanına "+1" koy.
- Bagaj: `0 → "Bagaj dahil değil"`, `null → "Bagaj bilgisi yok"`, diğerleri `"<n> kg"`. `!baggageKg` gibi falsy kontrol yapma.
- `stops`: `0 → "Direkt"`, `1 → "1 aktarma"`. Süre: `"1 sa 15 dk"`.
- Uçuşları cihazın bugünkü tarihine göre eleme; tüm uçuşlar 15 Ekim 2026'da.

### Favoriler

- Tek kaynak favori store'u. Kart, detay ve favoriler ekranı durumu aynı store'dan, id ile okur. Uçuş nesnesine favori bayrağı kopyalanmaz.
- `persist` yalnızca favorileri yazar (`partialize`); `name` ve `version` tanımlı.
- Hydration tuzağı: AsyncStorage okunmadan yapılan her yazma kayıtlı favorileri ezebilir. Hydration bitene kadar favori aksiyonları çalışmaz (buton devre dışı, store aksiyonu da kontrol eder). Favoriler ekranı o sırada yükleniyor gösterir, "favori yok" demez.
- Favoriler ekranı liste filtresinden bağımsız; en son eklenen en üstte. Son favori çıkınca boş durum görünür.
- Favori butonu kartın tıklanabilir alanının içinde değil, onun kardeşi olarak durur. Böylece dokunuşlar ayrışır ve VoiceOver iki ayrı öğe görür (erişilebilir bir ebeveyn, çocuklarını tek öğede gruplar).

### Erişilebilirlik ve navigasyon

- Favori butonu: `accessibilityRole="button"`, `accessibilityLabel` ("{uçuş no} favorilere ekle" / "{uçuş no} favorilerden çıkar"), `accessibilityState={{ selected }}`. Görünür metin de durumu söyler ("Favori" / "Favoride"); bilgi yalnız renkle verilmez.
- Filtre: `Switch`, erişilebilir adı "Yalnızca direkt uçuşlar". Sıralama seçeneklerinde seçili durum `accessibilityState` ile ve görünür bir işaretle (✓ ya da metin) belirtilir.
- Kartın tıklanabilir alanı: `accessibilityRole="button"` ve uçuşu özetleyen bir etiket.
- Safe area doğru uygulanır. Geri butonu ve kaydırarak geri dönüş çalışır. Detaydan dönünce listenin filtresi, sıralaması ve yüklenmiş sayfaları korunur.

## 8. Arayüz metinleri (Türkçe)

Uçuşlar · Favoriler · Uçuş Detayı · "{n} uçuş" · Yalnızca direkt · En düşük fiyat · En kısa süre · Direkt · 1 aktarma · Uçuşlar yüklenemedi. · Sonraki sayfa yüklenemedi. · Tekrar dene · Bu filtreyle uçuş bulunamadı. · Filtreyi temizle · Uçuş bulunamadı. · Henüz favori uçuşun yok. · Favori · Favoride · Bagaj dahil değil · Bagaj bilgisi yok

Görünüm sade: sistem fontu, düz kartlar, tek vurgu rengi, ikonlar için `@expo/vector-icons`.

## 9. Testler

Davranış odaklı, ağa çıkmayan ve `npm test` ile tek komutta geçen testler. 1 ve 2, brief'in birinci zorunlu testinin iki seçeneğini de karşılar; 3 ikinci zorunlu test, 5 P1 testi.

1. `buildFlightsQuery`: varsayılanlar, `sort=duration`, `onlyDirect=true`, sayfa numarası.
2. Reducer: filtre veya sıralama değişince sayfalama ve öğeler sıfırlanır; eski `requestId`'li yanıt yok sayılır; sonraki sayfa hatası mevcut öğeleri silmez.
3. Favoriler: ekle/çıkar AsyncStorage'a yazılır; yeni bir store örneği depolamadan geri yükler; hydration bitmeden yapılan aksiyon kayıtlı favorileri silmez. Test için store'u `createFavoritesStore()` fabrikasıyla kur.
4. Biçimlendirme: fiyat, bagaj (0 / null / sayı), süre, İstanbul saati, FL024'teki "+1".
5. Ekran etkileşimi: liste ekranında ilk istek hata verir → "Tekrar dene"ye basılır → liste görünür. API modülünü mock'la.
6. (İsteğe bağlı) Karttaki favori butonuna basmak detay navigasyonunu tetiklemez.

## 10. Git ve kayıtlar

- Yalnızca yerel git. İlk iş `docs/case/`'i `.git/info/exclude`'a ekle; brief metinleri repoya girmez. `case-kit/` olduğu gibi commit'lenir.
- Her blok sonunda en az bir küçük, anlamlı commit (`feat(list): …`, `test(favorites): …`, `docs: …`). Commit'ten önce `npm test` ve `npx tsc --noEmit` geçmeli.
- Kod, yorumlar ve commit mesajları İngilizce; README ve arayüz metinleri Türkçe.
- `docs/ai/WORKLOG.md`: her bloğun başlangıç ve bitiş saati (`date '+%H:%M'`), yapılanlar, çalıştırılan doğrulama komutları ve sonuçları, ilk denemede yanlış yapıp sonra düzelttiğin şeyler (dürüstçe), açık riskler. README'deki AI bölümü buradan çıkacak.
- `docs/ai/CHECKLIST.md`: brief'teki her P0 ve P1 maddesi, nasıl doğrulandığı (test adı ya da manuel adım) ve durumu.

## 11. Bitti tanımı

- P0'ın tamamı CHECKLIST'te kanıtıyla işaretli; P1'in durumu açıkça yazılı.
- `npm test`, `npx tsc --noEmit` ve `npx expo install --check` temiz; `npx expo export --platform ios` derleniyor.
- Temiz klon testi geçiyor: `rm -rf /tmp/flight-case-clone && git clone . /tmp/flight-case-clone && cd /tmp/flight-case-clone && npm ci && npm test`
- README Türkçe ve brief §7'deki 7 maddeyi aynı sırayla ve aynı başlıklarla içeriyor. Ayrıca: sürümler (Expo SDK, React Native, React, Node, npm), favori saklama tercihi ve detay parametresinin gerekçesi, AI kullanımı.
- AI bölümünü taslak olarak yaz: hangi aracın neyi ürettiği, neyin nasıl doğrulandığı, nerede düzeltme gerektiği. "Harcanan süre"yi ben dolduracağım; sen WORKLOG'daki blok sürelerini özetle.
- `ios/` ve `android/` yok, uzak depo yok, çalışma ağacı temiz, mock servis kapalı.
