# Uçuş Keşfi

İstanbul–Antalya uçuşlarını listeleyen, sunucu tarafında filtreleyip sıralayan, sayfa sayfa yükleyen ve favorileri
cihazda saklayan React Native + TypeScript uygulaması. Veri `case-kit/` içindeki yerel mock servisten gelir.

## Sürümler

| | Sürüm |
|---|---|
| Expo SDK | 57 (`expo` 57.0.27), Expo Go 57.0.9 |
| React Native | 0.86.3 |
| React | 19.2.3 |
| TypeScript | 6.0.3 (`strict`) |
| Node | 22.20.0 |
| npm | 10.9.3 (kilit dosyası `package-lock.json`) |
| Navigasyon | React Navigation 7 (native-stack 7.20, bottom-tabs 7.20) |
| State / depolama | Zustand 5.0.15, AsyncStorage 2.2.0 |
| Test | Jest 29.7, jest-expo 57.0.5, React Native Testing Library 14.1 |

## 1. Kurulum ve çalıştırma komutları

```bash
npm ci

# Terminal 1: mock servis (port 4000, bağımlılığı yok)
node case-kit/server.js
curl -s "http://localhost:4000/flights?page=1&limit=8&sort=price"   # ilk üç kayıt FL004, FL009, FL006

# Terminal 2: uygulama (iOS Simulator + Expo Go)
npx expo start      # ardından "i"
```

- iOS Simulator `http://localhost:4000`'e, Android Emulator `http://10.0.2.2:4000`'e bağlanır (`src/config.ts`).
- Fiziksel cihazda bilgisayarın LAN IP'si verilmelidir:
  `EXPO_PUBLIC_API_URL=http://192.168.x.x:4000 npx expo start`
- Native build gerekmez ve yoktur (`ios/`, `android/` oluşturulmadı). Uygulama Expo Go'da çalışır.
- Servis senaryoları (`/debug/fail-once`, `/debug/mode?value=race|slow`, `/debug/empty?value=on`, `/debug/reset`)
  sunucuyu yeniden başlatmadan `curl` ile açılıp kapatılır; ayrıntı `case-kit/README.md`'de.

## 2. Doğruladığın platform ve cihaz/simülatör

- **iOS Simulator, iPhone 18 Pro, iOS 27.0** (Xcode 27.0), **Expo Go 57.0.9**.
- Android'de çalıştırılmadı. Kod platforma özel bir şey içermiyor; yalnızca API adresi Android için `10.0.2.2`'ye ayarlı.

Manuel olarak kontrol edilenler: varsayılan sıra ve toplam sayı, sayfalamanın aynı sayfayı iki kez istememesi,
filtre/sıralama değişiminde başa dönme, race modu, ilk ve sonraki sayfa hatası + "Tekrar dene", iki ayrı boş durum,
yükleniyor durumu, detaydan dönünce listenin korunması, favori butonunun detayı açmaması, üç ekranda favori
tutarlılığı, FL024 ve bagajı 0 / null olan uçuşların detayı, Expo Go tamamen kapatılıp açıldıktan sonra favorilerin
korunması. Erişilebilirlik, otomatik testlere ek olarak Xcode Accessibility Inspector ile de kontrol edildi (kart ve
favori butonu ayrı öğeler). Ayrıntılı liste ve kanıtlar `docs/ai/CHECKLIST.md`'de.

## 3. Test komutu

```bash
npm test             # TZ=America/New_York jest  (9 suite, 60 test; ağa çıkmaz)
npx tsc --noEmit     # tip kontrolü
```

Testler bilerek İstanbul dışındaki bir saat diliminde koşar; saat biçimlendirmesi cihaz saat dilimine kayarsa testler düşer.

| Dosya | Ne doğruluyor |
|---|---|
| `src/api/flights.test.ts` | `buildFlightsQuery`: varsayılanlar, `sort=duration`, `onlyDirect=true`, sayfa no; hata gövdesinin `ApiError`'a dönüşmesi |
| `src/features/flights/flightsReducer.test.ts` | Filtre/sıralama değişince sayfalama ve öğelerin sıfırlanması; eski `requestId`'li yanıtın (ilk sayfa, sonraki sayfa, hata) yok sayılması; sonraki sayfa hatasının mevcut öğeleri silmemesi |
| `src/features/flights/useFlights.test.ts` | Art arda `onEndReached`'te sonraki sayfanın bir kez istenmesi, `hasMore=false`'ta durma, hatalı sayfanın kaydırmayla değil "Tekrar dene" ile denenmesi, filtre değişiminde bekleyen isteğin iptali |
| `src/features/favorites/favoritesStore.test.ts` | Ekle/çıkar'ın AsyncStorage'a yazılması, yalnız favorilerin saklanması, yeni store örneğinin depodan geri yüklemesi, hydration bitmeden yapılan aksiyonun kayıtlı favorileri silmemesi |
| `src/domain/format.test.ts`, `flightView.test.ts` | Fiyat (`355000 → 3.550,00 TL`), bagaj (0 / null / sayı), süre, İstanbul saati ve tarihi, FL024'te ertesi gün |
| `src/features/flights/FlightListScreen.test.tsx` | **(P1)** `<App />` üzerinde ilk istek hata → "Tekrar dene" → liste |
| `src/components/FlightCard.test.tsx` | Favori butonu detay navigasyonunu tetiklemiyor; karta basmak tetikliyor |
| `src/features/flights/FlightListControls.test.tsx` | Filtre switch'inin erişilebilir adı, sıralamanın seçili durumu ve görünür ✓ işareti |

Kritik testler mutasyonla da sınandı: korunan satır geçici olarak silindiğinde ilgili testin düştüğü görüldü
(`requestId` kontrolü, `isLoadingMore` kilidi, hydration koruması, retry).

## 4. Mimari kararların kısa gerekçesi

```
App.tsx                      SafeAreaProvider + NavigationContainer
src/config.ts                API adresi (EXPO_PUBLIC_API_URL ya da platform varsayılanı)
src/api/                     flight.types.ts (case-kit'ten birebir), client.ts (fetch + ApiError), flights.ts
src/domain/                  format.ts (saf biçimlendirme), flightView.ts (DTO → ekran modeli)
src/features/flights/        flightsReducer.ts, useFlights.ts, FlightListScreen, FlightListControls, FlightDetailScreen
src/features/favorites/      favoritesStore.ts, FavoritesScreen
src/components/              FlightCard, FlightCardList, FavoriteButton, ActionButton, StateView, ListFooter, theme (token'lar)
src/navigation/              RootNavigator (stack: Tabs + FlightDetail), types
```

**Expo + Expo Go.** Kurulum ve çalıştırma tek komutla oluyor. Ek bir sebep: geliştirme makinesinde Xcode 27 var ve
iOS 27 SDK'sıyla yerelde derlenen bir uygulama scene yaşam döngüsüne geçmemişse açılışta çöküyor; Expo Go ile bu sorun yok.

**React Navigation (expo-router değil).** Kökte bir native-stack var; içinde sekmeler (Uçuşlar, Favoriler) ve
`FlightDetail` duruyor. Detay sekmelerin üstünde açıldığı için liste ekranı mount kalıyor; geri dönünce filtre,
sıralama ve yüklenmiş sayfalar olduğu gibi duruyor. Native geri butonu ve kaydırarak geri dönme hazır geliyor.

**Liste: saf reducer + `useFlights` hook'u (`useReducer`).** Değerlendirilen davranışların hepsi state geçişlerinde:
sayfalama, sıfırlama, sırasız yanıt, hata türleri. Bunları React'ten bağımsız bir reducer'da toplamak her geçişi
tek satırlık testlerle doğrulamayı sağlıyor.
- İlk sayfanın durumu tek bir `status` alanında (`loading | success | error`). Yükleniyor, hata ve boş durumu bu yüzden
  aynı anda görünemiyor; ekranda tek bir `renderBody` dalı çalışıyor.
- Sonraki sayfa için ayrı `loadingMore` / `loadMoreError` bayrakları var. Sonraki sayfa hatası listeyi silmiyor, footer'da "Tekrar dene" gösteriyor.
- TanStack Query'nin infinite query'si bu davranışları kendi içinde çözerdi. Ama case tam olarak bu davranışları
  ölçüyor, bu yüzden açık yazmayı tercih ettim. Redux ise tek bir ekran state'i için gereksiz tören olurdu.

**Sırasız yanıta karşı iki katman.** Her istek artan bir `requestId` alıyor ve reducer yalnızca en son isteğin yanıtını
kabul ediyor. Ayrıca yeni istek, bekleyen isteği `AbortController` ile iptal ediyor. İptal ağ trafiğini azaltıyor;
`requestId` ise iptal yetişmese bile doğruluğu garanti ediyor. Varsayılan modda da gecikme her istekte 350–600 ms
rastgele olduğu için bu koruma yalnızca race modu için değil. `AbortError` kullanıcıya hata olarak gösterilmiyor.

**Aynı sayfa iki kez istenmiyor.** `onEndReached`, React yeniden render etmeden art arda tetiklenebiliyor ve o anda
state'teki `loadingMore` henüz eski değerinde oluyor. Bu yüzden kilit senkron bir `useRef`. Sonraki sayfa yalnızca
`status === 'success' && hasMore && !loadMoreError` ve kilit açıkken isteniyor.

**Filtre ve sıralama sunucuda.** Her istekte `page`, `limit=8`, `sort`, `onlyDirect` açıkça gönderiliyor; listede
istemci tarafında filtreleme ya da sıralama yok. Toplam sayı `meta.total`.

**State'te DTO, ekranda görünüm modeli.** State sunucunun döndürdüğü `FlightDto`'yu olduğu gibi tutuyor.
Biçimlendirme `toFlightView` ile render anında, tek bir yerde yapılıyor.
- Fiyat tam sayı aritmetiğiyle hesaplanıyor (`355000 → "3.550,00 TL"`). `Intl`'in TRY biçimi "₺" verdiği için kullanılmadı.
- Saat ve tarih cihaz saat diliminden bağımsız olarak İstanbul'a göre: Türkiye 2016'dan beri yıl boyu UTC+3 olduğu için
  sabit +3 saat ofsetle hesaplanıyor. Böylece Hermes'in `Intl` saat dilimi desteğine de bağımlı değil.
- Bagajda `0` ile `null` açıkça ayrılıyor; falsy kontrol yok.

**Favoriler: Zustand + `persist` + AsyncStorage, uçuşun tamamı saklanıyor.** Store'un yapısı `id → { flight, addedAt }`.
- **Neden tüm uçuş:** Favoriler ekranı ve detay ek istek, ek yükleniyor ya da hata durumu olmadan açılıyor; servis
  kapalıyken bile favoriler görülebiliyor. Veri sabit (24 kurgusal kayıt), yani bayatlama riski pratikte yok.
- **Bedeli:** Gerçek bir üründe fiyat değişebileceği için saklanan kopya eskiyebilir. O durumda açılışta `ids` ucuyla
  tazelemek gerekir. Bu uç `limit` verilmezse 8 kayıt döndürüyor, `limit=50` gönderilmeli.
- **Tek kaynak:** Kart, detay ve favoriler ekranı favori durumunu aynı store'dan uçuş kimliğiyle okuyor. Uçuş nesnesine
  favori bayrağı kopyalanmadığı için üç ekran her zaman tutarlı.
- **Hydration koruması:** AsyncStorage okunmadan yapılan bir yazma, kayıtlı favorileri ezebilir. Bu yüzden
  `hasHydrated` true olana kadar butonlar devre dışı ve store aksiyonları da kendi içinde kontrol edip hiçbir şey
  yapmıyor. Favoriler ekranı bu sırada "favori yok" değil, yükleniyor gösteriyor.
- `partialize` yalnızca favorileri yazıyor; `name` ve `version` tanımlı. Test için `createFavoritesStore()` fabrikası,
  uygulamanın yeniden açılmasını aynı depoya bağlı yeni bir store örneğiyle simüle ediyor.

**Detay ekranı parametre olarak uçuşun kendisini (`FlightDto`) alıyor ve ek istek atmıyor.** Liste de favoriler de
nesnenin tamamını zaten tutuyor ve veri sabit. Böylece detay ekranında yükleniyor ya da hata durumu gerekmiyor.
Favori durumu parametreden değil store'dan, id ile okunuyor; bu yüzden detayda bayat favori bilgisi oluşmuyor.
Nesne düz JSON olduğu için navigasyon state'inde serileştirilebilir. Bedeli: deep link ile yalnızca id gelirse detay
açılamaz. Bu case'te deep link yok; gerekseydi `/flights/:id` ucuyla id'den yükleme eklenirdi.

**Erişilebilirlik.**
- Favori butonu kartın tıklanabilir alanının içinde değil, onun kardeşi. Böylece dokunuşlar ayrışıyor ve VoiceOver iki
  ayrı öğe görüyor.
- Favori butonunun etiketi "{uçuş no} favorilere ekle / favorilerden çıkar", `accessibilityState.selected` tanımlı ve
  görünür metni "Favori" / "Favoride".
- Filtre bir `Switch` ("Yalnızca direkt uçuşlar"). Sıralama seçenekleri `selected` durumu ve görünür ✓ işaretiyle
  belirtiliyor; bilgi yalnızca renkle verilmiyor.
- Kartın tıklanabilir alanı uçuşu tek cümleyle özetleyen bir etiket taşıyor.

**Bilerek eklenmeyenler.** Repository, DI gibi soyutlama katmanları; `React.memo` gibi ölçülmemiş optimizasyonlar;
`React.StrictMode` (dev'de effect'leri iki kez çalıştırıp ilk sayfayı iki kez isteyebilir).

## 5. Harcadığın süre

_Aday dolduracak._

WORKLOG'daki blok saatleri (`date` çıktısı). Checkpoint'ler arasındaki süreler simülatörde yapılan manuel kontrollere ait:

| Blok | Saat |
|---|---|
| 0 — Okuma, sözleşme doğrulama | 20:52–21:04 |
| 1 — Kurulum ve iskelet | 21:04–21:08 |
| CHECKPOINT 1 (Expo Go'da açılış) | 21:08–21:36 |
| 2 — Liste | 21:36–21:40 |
| CHECKPOINT 2 (liste davranışları) | 21:40–22:22 |
| 3 — Detay | 22:22–22:23 |
| 4 — Favoriler | 22:23–22:26 |
| CHECKPOINT 3 (favoriler, detay) | 22:26–22:46 |
| 5 — Erişilebilirlik ve gözden geçirme | 22:46–22:47 |
| 6 — P1 | 22:47–22:48 |
| 7 — README ve son kontrol | 22:48–22:51 |

## 6. P1'de ne yaptın, ne yapmadın

İki P1 maddesi de yapıldı.

1. **Üçüncü test (ekran etkileşimi):** `FlightListScreen.test.tsx` uygulamanın tamamını (`<App />`) gerçek navigasyonla
   render ediyor; yalnızca API modülü mock'lu. İlk istek 500 döndürüyor ve "Uçuşlar yüklenemedi." görünüyor; yükleniyor
   ya da boş durum aynı anda görünmüyor. "Tekrar dene"ye basılınca liste ve "2 uçuş" görünüyor, hata kayboluyor.
   `retryFirstPage` geçici olarak boş bir fonksiyon yapıldığında testin düştüğü doğrulandı.
2. **Sırasız yanıt dayanıklılığı:** `requestId` + `AbortController`. Doğrulama:
   - **Birim testleri:** `flightsReducer.test.ts › stale responses` (geç gelen eski ilk sayfa, eski sonraki sayfa ve eski
     hata yok sayılıyor) ve `useFlights.test.ts › cancels the pending request…` (iptal + geç gelen eski sayfa yeni sonuca karışmıyor).
   - **Manuel:** `curl "localhost:4000/debug/mode?value=race"` açıkken filtre ve sıralama hızla değiştirildi ve
     "En düşük fiyat + Yalnızca direkt" seçiminde bırakıldı. Ekranda son seçimin sonucu (FL002, FL024, FL017, "17 uçuş") kaldı.

## 7. Bilinen eksikler

- **Android'de denenmedi.** Yalnızca iOS Simulator'da doğrulandı.
- **"Uçuş bulunamadı." ekranında yeniden yükleme yok.** Pull-to-refresh de yok. Sunucu sonradan veri döndürmeye başlarsa
  listeyi görmek için filtreyi değiştirmek ya da uygulamayı yenilemek gerekiyor.
- **Favoriler saklandığı andaki kopya.** Sunucuda fiyat değişirse favoriler ekranı eski değeri gösterir; bkz. Mimari.
- **Hydration'dan önceki dokunuşlar.** Kayıtlı favoriler okunmadan önce yapılan favori dokunuşu yok sayılıyor (buton
  zaten devre dışı). AsyncStorage okuması milisaniyeler sürdüğü için pratikte fark edilmiyor.
- **İstanbul saati sabit +3 ofsetle hesaplanıyor.** Türkiye yeniden yaz saatine geçerse `format.ts` güncellenmeli.
- **Ağ hataları tek mesajda.** Bağlantı hatası, 500 ve diğer hatalar aynı "Uçuşlar yüklenemedi." mesajını gösteriyor;
  ayrıntı yalnız dev log'unda.

## AI kullanımı

_Taslak; aday gözden geçirecek._

**Araç:** Claude Code (Claude Opus 5.5), VS Code eklentisi içinde.

**Nasıl kullanıldı:** Kuralları ve teknik kararları aday belirledi:
- `AGENTS.md`: sabit teknik kararlar, yasaklar, davranış kuralları ve test listesi.
- `docs/ai/KICKOFF.md`: blok planı ve checkpoint'ler.

AI bu çerçevede kodu, testleri ve dokümanları (`docs/ai/WORKLOG.md`, `docs/ai/CHECKLIST.md`, bu README) blok blok
üretti. Her blok sonunda testler ve tip kontrolü geçtikten sonra commit attı.

**AI'ın ürettikleri:**
- Proje kurulumu ve bağımlılık seçimi.
- API katmanı, liste reducer'ı ve hook'u.
- Biçimlendirme, favori store'u ve tüm ekran ve bileşenler.
- 9 test dosyası.
- Bu README'nin taslağı.

**Nasıl doğrulandı:**
- **Sözleşme:** Kod yazılmadan önce servis `curl` ile denendi: sıralama, `onlyDirect` toplamı, `ids` ucu, 404/400,
  debug uçları. Bagajı 0 ve null olan uçuşlar veriden çıkarıldı.
- **Otomatik:** Her blokta `npm test`, `npx tsc --noEmit`, `npx expo install --check` ve `npx expo export --platform ios`.
- **Mutasyon kontrolü:** Kritik korumalar (`requestId`, `isLoadingMore` kilidi, hydration koruması, retry) geçici
  olarak silinip ilgili testin düştüğü görüldü.
- **Manuel:** Simülatördeki davranışları aday üç checkpoint'te kontrol etti (bkz. §2). AI simülatörü göremediği için
  bu kontroller adayındı.

**Nerede düzeltme gerekti** (ayrıntı `docs/ai/WORKLOG.md`):
- **Hydration testi ilk hâliyle hatayı yakalamıyordu.** Koruma silinse de geçiyordu. Sebep: Zustand `persist` okumayı
  store oluşturulurken başlatıyor, test de okumanın yazmadan önce bittiği sırayı modelliyordu. Test, okumayı
  geciktirerek erken yazmanın önce geldiği durumu kuracak şekilde yeniden yazıldı. Mutasyon kontrolü olmasa fark edilmeyecekti.
- **Bağımlılıklar:**
  - `npx expo install … -- --save-dev` test paketlerini `dependencies`'e yazdı; elle taşındı.
  - RNTL 14'ün çektiği `test-renderer@1.3.0` React 19.3 istiyordu. `--force` yerine React 19.2 ile uyumlu `~1.2.0` sürümüne sabitlendi.
  - TypeScript 6'da `types` varsayılanı boş olduğu için `tsc` jest tiplerini görmedi; `tsconfig`'e `"types": ["jest"]` eklendi.
  - Jest `expo-asset`'i çözemedi (`expo/node_modules` altında kalmıştı). Mock yerine `npx expo install expo-asset` ile doğrudan bağımlılık yapıldı.
- **Şablon:** `create-expo-app` şablonu kendi `AGENTS.md`'sini getirdi (Expo Router, EAS ve dev build önerir). Proje
  kurallarıyla çeliştiği için alınmadı.
- **Erişilebilirlik:** Sıralama butonlarının erişilebilir adı "✓ En düşük fiyat" olarak türüyordu ve seçimi iki kez
  söylüyordu; sabit etikete çevrildi.
- **Küçük süreç hataları:** Paletin dışında, koda gömülü bir renk; WORKLOG'a `date` çalıştırılmadan yazılmış bir saat.
  İkisi de fark edilip düzeltildi.
