# CHECKLIST — Brief P0 / P1

Durum: ⬜ bekliyor · 🟡 kısmen · ✅ doğrulandı · ⏭️ yapılmadı (gerekçesi README'de)

Kanıt sütunu: otomatik test adı (`dosya › test`) ya da manuel adım (CHECKPOINT numarasıyla).

## P0 — 2.1 Uçuş listesi

| # | Madde | Kanıt | Durum |
|---|---|---|---|
| 2.1.a | Uygulama liste ekranıyla açılır | Kök navigator Tabs → ilk sekme Flights · CHECKPOINT 1 (manuel) | ✅ |
| 2.1.b | Kartta havayolu, uçuş no, kalkış/varış kodları, saatler, toplam süre, direkt/aktarmalı, fiyat, favori aksiyonu | `FlightCard` + `FavoriteButton` · CHECKPOINT 2 ✔ (favori hariç), CHECKPOINT 3 | 🟡 |
| 2.1.c | Toplam sonuç sayısı (`meta.total`) görünür | `FlightListControls` → "{n} uçuş" · CHECKPOINT 2 ✔ manuel | ✅ |
| 2.1.d | Karta dokununca doğru uçuşun detayı açılır | `navigate('FlightDetail', { flight })` · CHECKPOINT 2 madde 9 ✔ manuel | ✅ |
| 2.1.e | Favori aksiyonu detay navigasyonunu tetiklemez | `FlightCard.test.tsx › toggles the favorite without opening the detail`; buton Pressable'ın kardeşi · CHECKPOINT 3 | 🟡 |

## P0 — 2.2 Sayfalama

| # | Madde | Kanıt | Durum |
|---|---|---|---|
| 2.2.a | `page`, `limit=8` ile sayfalı istek | `flights.test.ts › buildFlightsQuery …` | ✅ |
| 2.2.b | Liste sonuna yaklaşınca sonraki sayfa; `hasMore=false` olunca durur | `useFlights.test.ts › stops asking once hasMore is false` · CHECKPOINT 2 ✔ manuel | ✅ |
| 2.2.c | Aynı sayfa iki kez istenmez; yükleme sürerken yeni istek yok | `useFlights.test.ts › requests the next page only once when onEndReached fires repeatedly` · CHECKPOINT 2 ✔ manuel | ✅ |
| 2.2.d | Sonraki sayfa belirteci ekranı bloklamaz, liste görünür kalır | `ListFooter` (FlatList footer) · CHECKPOINT 2 ✔ manuel | ✅ |

## P0 — 2.3 Filtre ve sıralama

| # | Madde | Kanıt | Durum |
|---|---|---|---|
| 2.3.a | "Yalnızca direkt" filtresi, "En düşük fiyat" / "En kısa süre" sıralaması | `FlightListControls` · CHECKPOINT 2 ✔ manuel | ✅ |
| 2.3.b | Varsayılan: filtre kapalı, sıralama fiyat | `flightsReducer.test.ts › starts on a first-page load with the default filters`, `useFlights.test.ts › loads page 1 with the default filters on mount` | ✅ |
| 2.3.c | Sunucu tarafında (`onlyDirect`, `sort`); istemcide filtreleme/sıralama yok | `flights.test.ts › sends sort=duration…`, `…onlyDirect=true…`; istemcide sort/filter kodu yok | ✅ |
| 2.3.d | Değişince sayfalama başa döner, eski veri karışmaz | `flightsReducer.test.ts › when the filter or sort changes …`, `useFlights.test.ts › cancels the pending request…` · CHECKPOINT 2 ✔ manuel | ✅ |
| 2.3.e | Filtre sonucu boşsa açıklama + "Filtreyi temizle" | `FlightListScreen.renderBody` · CHECKPOINT 2 (`/debug/empty`) ✔ manuel | ✅ |

## P0 — 2.4 Uçuş detayı

| # | Madde | Kanıt | Durum |
|---|---|---|---|
| 2.4.a | Kart bilgileri + kalkış ve varış tarihi + bagaj | `flightView.test.ts › formats every field…`, `› marks FL024…` · CHECKPOINT 3 | 🟡 |
| 2.4.b | `baggageKg` 0 → "Bagaj dahil değil", null → "Bagaj bilgisi yok" | `format.test.ts › baggageText …`, `flightView.test.ts › shows missing baggage…` · CHECKPOINT 3 (FL004=0, FL006=null) | 🟡 |
| 2.4.c | Detayda favori ekle/çıkar | `FavoriteButton` detayda · CHECKPOINT 3 | 🟡 |
| 2.4.d | Listeye dönünce filtre, sıralama, yüklenmiş sayfalar korunur | Liste ekranı stack'te mount kalır, state `useReducer`'da · CHECKPOINT 2 madde 9 ✔ manuel | ✅ |

## P0 — 2.5 Favoriler

| # | Madde | Kanıt | Durum |
|---|---|---|---|
| 2.5.a | Ayrı ekranda favoriler; detay açılır, favoriden çıkarılır | `FavoritesScreen` · CHECKPOINT 3 | 🟡 |
| 2.5.b | Liste, detay, favoriler işaretleri anında tutarlı | Tek store, `FavoriteButton` id ile okur; `FlightCard.test.tsx › toggles…` · CHECKPOINT 3 | 🟡 |
| 2.5.c | Son favori çıkınca boş durum | `FavoritesScreen` → "Henüz favori uçuşun yok." · CHECKPOINT 3 | 🟡 |
| 2.5.d | Uygulama tamamen kapatılıp açılınca favoriler korunur | `favoritesStore.test.ts › restores saved favorites… (app restart)` · CHECKPOINT 3 (Expo Go kapat/aç) | 🟡 |
| 2.5.e | Hydration bitmeden boş state depolamaya yazılmaz | `favoritesStore.test.ts › ignores actions before hydration so saved favorites are never overwritten` (mutasyonla doğrulandı) | ✅ |
| 2.5.f | Favoriler ekranı liste filtresinden bağımsız | `FavoritesScreen` yalnız store'u okur, liste filtresine bağlı değil · CHECKPOINT 3 | 🟡 |

## P0 — 2.6 Yüklenme, boş ve hata durumları

| # | Madde | Kanıt | Durum |
|---|---|---|---|
| 2.6.a | İlk istekte yükleniyor durumu | `StateView kind="loading"` · CHECKPOINT 2 (`/debug/mode?value=slow`) ✔ manuel | ✅ |
| 2.6.b | Boş liste → "Uçuş bulunamadı." | `FlightListScreen.renderBody` · CHECKPOINT 2 (`/debug/empty`) ✔ manuel | ✅ |
| 2.6.c | Hata → anlaşılır mesaj + "Tekrar dene"; başarıya dönebilir, eldeki veriyi silmez | `flightsReducer.test.ts › keeps the loaded items when a next page fails`, `› recovers when …retried`, `useFlights.test.ts › does not retry a failed next page on scroll…` · CHECKPOINT 2 (`/debug/fail-once`) ✔ manuel | ✅ |
| 2.6.d | Yükleniyor / hata / boş aynı anda görünmez | Tek `status` alanı + `renderBody` içinde tek dal · CHECKPOINT 2 ✔ manuel | ✅ |

## P0 — 2.7 Test

| # | Madde | Kanıt | Durum |
|---|---|---|---|
| 2.7.1 | Filtre/sıralama parametreleri **veya** filtre değişiminde sayfalama sıfırlama | `flights.test.ts` (parametreler) **ve** `flightsReducer.test.ts` (sıfırlama) | ✅ |
| 2.7.2 | Favori ekle/çıkar + depolamadan geri yükleme | `favoritesStore.test.ts` (5 test: yazma, partialize, geri yükleme, hydration koruması, sıra) | ✅ |
| 2.7.x | Snapshot dışı, davranış odaklı | Snapshot testi yok; 7 suite davranış testi | ✅ |

## P0 — 5 Teknik beklentiler

| # | Madde | Kanıt | Durum |
|---|---|---|---|
| 5.a | React Native + TypeScript | | ⬜ |
| 5.b | README'de SDK, RN, Node, paket yöneticisi sürümleri; kilit dosyası | | ⬜ |
| 5.c | Sorumluluk ayrımı; bileşenlerde HTTP çağrısı yok | | ⬜ |
| 5.d | Safe area ve geri navigasyon | | ⬜ |
| 5.e | Favori ve filtre kontrollerinde erişilebilir ad + seçili durum; bilgi yalnız renkle değil | | ⬜ |

## P0 — 7 Teslim (README)

| # | Madde | Kanıt | Durum |
|---|---|---|---|
| 7.1–7.7 | Kurulum/çalıştırma, platform, test komutu, mimari gerekçe, süre, P1 durumu, bilinen eksikler | | ⬜ |
| 7.AI | AI kullanımı ve doğrulama yöntemi | | ⬜ |

## P1

| # | Madde | Kanıt | Durum |
|---|---|---|---|
| P1.1 | Ekran etkileşim testi: hata → "Tekrar dene" → liste | | ⬜ |
| P1.2 | Sırasız yanıt dayanıklılığı (race) | `flightsReducer.test.ts › stale responses …`, `useFlights.test.ts › cancels the pending request…` · CHECKPOINT 2 (race) ✔ manuel | ✅ |

## Blok 0 sözleşme doğrulaması (curl, 20:52–)

| Kontrol | Sonuç |
|---|---|
| `/health` | `status: ok`, `flightCount: 24` |
| `sort=price` p1 | FL004, FL009, FL006, … · `total 24`, `totalPages 3` |
| `sort=duration` p1 | FL003 (65), FL011 (65), FL001 (70), … |
| `onlyDirect=true` | `total 17`, 3 sayfa (8 + 8 + 1) |
| `ids` limit vermeden | yine `limit=8` uygulanır; 12 id → 8 kayıt + `hasMore: true` |
| `ids` + `onlyDirect=true` | `onlyDirect` yok sayılır, meta'da `false` |
| `/flights/FL013` | 200, `{ item }` |
| `/flights/FL999` | 404 `FLIGHT_NOT_FOUND` |
| `sort=name` | 400 `INVALID_SORT` |
| `limit=999` | 50'ye kırpılır |
| `/debug/fail-once` | sonraki `/flights*` isteği 500, ardından 200 |
| `/debug/empty?value=on` | `items: []`, `total: 0`, `hasMore: false` |
| Bagaj 0 | FL002, FL004, FL009, FL012, FL017, FL021, FL024 |
| Bagaj null | FL006, FL010, FL015, FL020 |
| Ertesi gün varış | yalnız FL024 (15.10 23:20 → 16.10 00:45) |
