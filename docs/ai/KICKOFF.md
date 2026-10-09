# KICKOFF — Uçuş Keşfi case'i

Bu klasörde bir işe alım case'ini sıfırdan uygulayacaksın. Ben adayım; kodun her satırını inceleyip teknik mülakatta savunacağım. Brief AI kullanımına izin veriyor ve README'de AI'ın nerede kullanıldığını, çıktının nasıl doğrulandığını istiyor.

Toplam çalışma süresi okuma ve kurulum dahil 6 saatle sınırlı. Önce P0, zaman kalırsa P1. Zaman daralırsa P1'den kes, P0'ı yarım bırakma.

Kurallar `AGENTS.md`'de ve bağlayıcı: push yok, native build yok, kapsam dışı özellik yok.

## Çalışma şekli

- Blokları sırayla uygula. Her blok sonunda testler ve tip kontrolü geçsin, commit at, `docs/ai/WORKLOG.md`'ye yaz ve bana kısa bir rapor ver.
- **CHECKPOINT** yazan yerlerde dur. Benden istediğin manuel kontrolleri, gereken `curl` komutlarıyla birlikte numaralı liste halinde ver ve "devam" yazmamı bekle. Simülatördeki uygulamayı sen göremiyorsun; o kontroller benim. "Checkpoint'leri sona bırak" dersem kontrolleri sonda topluca iste.
- Emin olmadığın bir sözleşme ayrıntısını tahmin etme: `curl` ile dene ya da `case-kit/server.js`'i oku. Brief'le çelişen bir şey görürsen dur ve sor.
- Bir blok tahmini süresini belirgin şekilde aşarsa söyle ve neyin kesileceğini öner.
- Hatalarını gizleme. İlk denemede yanlış olan ve test ya da denemeyle yakalanan her şeyi WORKLOG'a yaz; mülakatta "AI nerede yanılttı" sorusuna bunlarla cevap vereceğim.

Rapor biçimi (kısa tut):

```
Blok N — <ad> (ss:dd–ss:dd)
Yapılanlar: …
Doğrulama: <komut> → <sonuç>
Düzelttiğim hatalar: …
Riskler / sorular: …
Commit: <hash> <mesaj>
```

## Bloklar

### Blok 0 — Okuma ve sözleşme doğrulama (~30 dk)

1. `AGENTS.md`, `docs/case/React-Native-Case.md`, `docs/case/BASLA.md`, `case-kit/README.md` ve `case-kit/flight.types.ts`'i oku; `case-kit/server.js`'e göz at (değiştirme).
2. Mock servisi arka planda başlat ve `curl` ile doğrula:
   - `/health`
   - BASLA'daki URL'de ilk üç kayıt FL004, FL009, FL006
   - `sort=duration` ile ilk kayıtlar
   - `onlyDirect=true` için `meta.total`
   - `ids` ucunun sayfalaması (limit verilmeyince kaç kayıt dönüyor)
   - `/flights/FL013`, bilinmeyen id → 404, geçersiz `sort` → 400
   - Bagajı `0` ve `null` olan uçuşların kimlikleri (manuel testte lazım)
3. `docs/ai/CHECKLIST.md`'yi oluştur, `docs/ai/WORKLOG.md`'yi başlangıç saatiyle başlat.
4. **CHECKPOINT 0:** Bulgularını, en fazla 15 satırlık planını ve brief'le ilgili sorularını göster.

### Blok 1 — Kurulum ve iskelet (~30 dk)

1. Expo SDK 57 TypeScript projesini bu klasörün köküne kur (AGENTS.md §3). `create-expo-app` dolu klasöre kurmayı reddederse geçici bir klasöre kur, dosyaları (gizli dosyalar dahil) köke taşı; mevcut dosyalara dokunma. Git deposu yoksa `git init`; `docs/case/`'i `.git/info/exclude`'a ekle.
2. Bağımlılıklar: React Navigation (native-stack, bottom-tabs), react-native-screens, react-native-safe-area-context, AsyncStorage, Zustand; geliştirme için jest-expo ve @testing-library/react-native. TypeScript `strict`; `npm test` betiği `TZ=America/New_York` ile.
3. Navigasyon iskeleti (Tabs + FlightDetail, yer tutucu ekranlar), `config.ts`, `api/` katmanı (tipler, client, `buildFlightsQuery`, `getFlights`) ve parametre testi.
4. `npm test`, `npx tsc --noEmit`, `npx expo install --check`, ardından commit.
5. **CHECKPOINT 1:** Benden `npx expo start` → `i` ile uygulamanın Xcode 27'deki iOS 27 simülatöründe Expo Go içinde açıldığını doğrulamamı iste.

### Blok 2 — Liste (~1 sa 45 dk)

Reducer, `useFlights`, liste ekranı, FlightCard, durum görünümleri, filtre ve sıralama kontrolleri (AGENTS.md §7 "Liste ve sayfalama"). Sıra: önce reducer ve testleri, sonra hook, sonra arayüz. Geliştirme modunda her isteği logla; Metro terminalinde görünsün.

**CHECKPOINT 2:** Bana şu kontrolleri ver:
- Varsayılan açılışta ilk üç kart FL004, FL009, FL006 ve toplam sayı doğru.
- Sona kadar kaydırınca aynı sayfa iki kez istenmiyor; `hasMore=false` olduktan sonra istek gitmiyor.
- Filtre ve sıralama değişince liste başa dönüyor.
- `/debug/mode?value=race` açıkken hızlı değişimlerde son seçimin sonucu kalıyor.
- `/debug/fail-once` ile hem ilk sayfa hem sonraki sayfa hatası ve "Tekrar dene".
- `/debug/empty?value=on` ile iki farklı boş durum.
- `/debug/mode?value=slow` ile yükleniyor durumu; sonunda `/debug/reset`.

### Blok 3 — Detay (~45 dk)

Önce testleriyle `domain/format.ts` ve `toFlightView`, sonra detay ekranı ve detaydaki favori aksiyonu. Detaydan dönünce liste state'i korunmalı.

### Blok 4 — Favoriler (~45 dk)

`createFavoritesStore` (persist + hydration koruması), favoriler ekranı, kart/detay/favoriler tutarlılığı ve favori testleri.

**CHECKPOINT 3:** Bana şu kontrolleri ver:
- Karttaki favori butonu detayı açmıyor.
- Üç ekrandaki işaretler anında tutarlı; son favori çıkınca boş durum görünüyor.
- FL024 ile bagajı 0 ve null olan uçuşların detayı (Blok 0'da bulduğun kimliklerle).
- İki favori ekle → Expo Go'yu tamamen kapat → projeyi yeniden aç → favoriler yerinde.

### Blok 5 — Erişilebilirlik ve gözden geçirme (~30 dk)

AGENTS.md §7 "Erişilebilirlik ve navigasyon" maddelerini uygula. CHECKLIST'i baştan sona gözden geçir ve eksikleri kapat.

### Blok 6 — P1 (~45 dk)

1. Ekran etkileşim testi: hata → "Tekrar dene" → liste görünür.
2. Race korumasının birim testini gözden geçir; manuel race doğrulamasını CHECKLIST'e yaz.

Zaman yetmezse bu bloğu atla ve README'de açıkça yaz.

### Blok 7 — README ve son kontrol (~30 dk)

1. README'yi yaz (AGENTS.md §11). Doğrulanan simülatörü `xcrun simctl list devices booted` ile al.
2. Öz denetim: brief'i ve case-kit README'yi baştan oku, her P0 ve P1 maddesini kanıtıyla CHECKLIST'te işaretle, eksik varsa düzelt.
3. Bitti tanımındaki komutları ve temiz klon testini çalıştır, mock servisi kapat, son commit'i at.
4. **CHECKPOINT 4 (final):** Son manuel kontrol listesi, 150 kelimeyi geçmeyen bir özet ve mülakat için satır satır anlamam gereken 5–8 yer (dosya:satır ve tek cümlelik "neden").

Şimdi Blok 0 ile başla.
