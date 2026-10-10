# WORKLOG

Araç: Claude Code (Opus 5.5), VS Code eklentisi. Saatler `date '+%H:%M'` ile alındı.

> Not: Geliştirme yerel git ile yapıldı; repo, iş bitince aday tarafından GitHub'a gönderildi.

## Blok 0 — Okuma ve sözleşme doğrulama (20:52–21:04)

**Yapılanlar**
- AGENTS.md, KICKOFF.md, case-kit/README.md, case-kit/flight.types.ts ve case-kit/server.js okundu.
- `docs/case/` boştu; brief ve BASLA.md yoktu. `~/Downloads/react-native-case/` altında bulundu.
  Oradaki `case-kit/` dosyaları depodakilerle `cmp` ile birebir aynı çıktı. `React-Native-Case.md`
  ve `BASLA.md` `docs/case/`'e kopyalandı (repoya girmeyecek, §10).
- Mock servis arka planda başlatıldı (`/tmp/flight-case-server.log`), sözleşme curl ile doğrulandı
  (sonuçlar CHECKLIST'in sonunda).
- CHECKLIST.md ve bu dosya oluşturuldu.

**Doğrulama**
- `curl /health` → ok, 24 uçuş.
- `curl "/flights?page=1&limit=8&sort=price"` → FL004, FL009, FL006 (BASLA ile uyumlu).
- 404 / 400 / fail-once / empty / reset curl ile denendi, README'deki sözleşmeyle uyumlu.

**Bulgular**
- `ids` ucu `limit` verilmezse de 8 ile sayfalar. Favorileri tam `FlightDto` olarak yerelde
  sakladığımız için bu uç kullanılmayacak.
- Doğal veride `onlyDirect=true` boş dönmez (17 kayıt); filtreli boş durum yalnızca `/debug/empty` ile üretilebilir.
- `fail-once` bir sonraki `/flights*` isteğini bozar; ilk sayfa yüklendikten sonra kurulursa sonraki sayfa hatası denenebilir.

**İlk denemede yanlış / düzeltilen**
- (yok)

**Açık riskler**
- Expo SDK 57 şablonunun (`blank-typescript@sdk-57`) varlığı Blok 1'de doğrulanacak.

## Blok 1 — Kurulum ve iskelet (21:04–21:08)

**Yapılanlar**
- `npx create-expo-app@latest flight-case --template blank-typescript@sdk-57 --no-install`, scratchpad'deki geçici
  klasöre kuruldu. Köke yalnızca `package.json`, `app.json`, `tsconfig.json`, `.gitignore`, `index.ts`, `App.tsx`
  ve `assets/` taşındı.
  - Şablonla gelen `AGENTS.md` (Expo Router, EAS ve dev build önerir; bizim AGENTS.md ile çelişir), `.claude/`
    (Expo Claude eklentisini açar), Expo'nun `LICENSE` dosyası ve şablonun `.git`'i alınmadı.
- `git init`, `docs/case/` `.git/info/exclude`'a eklendi.
- Bağımlılıklar: `npx expo install` ile React Navigation 7 (native, native-stack, bottom-tabs), react-native-screens,
  safe-area-context, AsyncStorage 2.2.0, @expo/vector-icons, jest 29, jest-expo 57, @types/jest.
  npm ile zustand 5, @testing-library/react-native 14, test-renderer ~1.2.0.
- `npm test` betiği `TZ=America/New_York jest`. Jest preset `jest-expo`, `jest.setup.ts` içinde AsyncStorage ve
  safe-area resmi mock'ları.
- `src/config.ts`, `src/api/` (birebir kopya wire tipleri, `client.ts`: ApiError, isAbortError, __DEV__ log,
  `flights.ts`: buildFlightsQuery, getFlights), navigasyon iskeleti (kök stack: Tabs + FlightDetail) ve yer tutucu ekranlar.
- `src/api/flights.test.ts`: 4 parametre testi, getFlights için 2 test (fetch mock'lu, ağa çıkmaz).

**Doğrulama**
- `npm test` → 1 suite, 6/6 geçti.
- `npx tsc --noEmit` → hata yok.
- `npx expo install --check` → "Dependencies are up to date".
- `npx expo export --platform ios --output-dir /tmp/flight-case-export` → bundle üretildi (1.9 MB hbc).
- `ios/` ve `android/` yok.

**İlk denemede yanlış / düzeltilen**
- `npx expo install jest-expo jest @types/jest -- --save-dev` paketleri `dependencies`'e yazdı (bu SDK'da npm'e
  `--save-dev` geçmedi). `package.json` elle düzeltilip yeniden `npm install` yapıldı.
- RNTL 14 peer olarak `test-renderer@^1` istiyor; npm 1.3.0'ı seçti. O da React 19.3 isteyen `react-reconciler@0.34`'ü
  çekti (ERESOLVE uyarısı; projede React 19.2.3 var). `--force` kullanılmadı. `test-renderer@~1.2.0`
  (`react-reconciler@0.33`, React ^19.2) sabitlendi, uyarı kalktı.
- `tsc` jest global'lerini görmedi: TypeScript 6'da `types` varsayılanı boş liste. `tsconfig.json`'a `"types": ["jest"]`
  eklendi. Testte `global.fetch` yerine `globalThis.fetch` kullanıldı (Node tiplerine gerek kalmasın diye).

**Açık riskler**
- RNTL 14'te `render` async (Promise döner). Ekran testinde `await render(...)` kullanılmalı.
- Uygulamanın Expo Go'da açıldığı henüz doğrulanmadı (CHECKPOINT 1).

## Blok 2 — Liste (21:36–21:40, CHECKPOINT 2 bekleniyor)

**Yapılanlar**
- Sıra: reducer + testleri → format/flightView + testleri → hook + testleri → arayüz.
- `flightsReducer.ts`: ilk sayfa için tek `status`, sonraki sayfa için `loadingMore` / `loadMoreError`, `requestId`
  ile eski yanıtı yok sayma. `FILTERS_CHANGED` state'i sıfırlar (öğeler, sayfa, toplam, sonraki sayfa durumları).
- `useFlights.ts`: artan `requestId` (ref), tek `AbortController` (yeni istek eskisini iptal eder), `onEndReached`
  patlamasına karşı senkron `isLoadingMore` ref'i; sonraki sayfa hatası kaydırmayla değil, yalnız "Tekrar dene" ile
  yeniden denenir. `AbortError` hata olarak dispatch edilmez.
- **Plandan sapma:** `domain/format.ts` ve `toFlightView` Blok 3'ten öne alındı, çünkü kart biçimlendirilmiş saat ve
  fiyat gösteriyor. İstanbul saati `Intl` yerine sabit +3 saat ofsetle hesaplanıyor (Türkiye 2016'dan beri yaz saati
  uygulamıyor). Böylece Hermes'in Intl/timeZone desteğine bağımlılık da yok.
- Arayüz: `FlightListControls` (Switch, iki sıralama düğmesi ✓ ile, "{n} uçuş"), `FlightCard`, `StateView`,
  `ListFooter`, `FlightListScreen`. Ekranda tek bir `renderBody` dalı çalışır: yükleniyor / hata / boş (iki tür) / liste.
  Filtre değişince `status` `loading`'e döner, FlatList unmount olur, yeni sonuç en üstten başlar.

**Doğrulama**
- `npm test` → 4 suite, 50/50 (`flights`, `flightsReducer`, `format` + `flightView`, `useFlights`).
- `npx tsc --noEmit` → temiz. `npx expo export --platform ios` → derlendi.
- Mutasyon kontrolü: reducer'da `PAGE_SUCCEEDED`'deki `requestId` kontrolü silinince 2 race testi düştü. Hook'ta
  `isLoadingMore.current` koruması silinince "only once" testi düştü. İkisi de geri alındı.

**İlk denemede yanlış / düzeltilen**
- Seçili sıralama zemini için paletin dışında, koda gömülü bir renk (`#E8F0FB`) yazılmıştı; `colors.accentSoft` olarak `theme.ts`'e taşındı.
- CHECKLIST'i güncelleyen betiğin regex'i boş hücreyi iki boşluk sanıyordu (tek boşluk); assert ile yakalandı, düzeltildi.

**Açık riskler**
- Gerçek cihazda/simülatörde `onEndReached` davranışı ve race modu henüz manuel doğrulanmadı (CHECKPOINT 2).

CHECKPOINT 2 (kullanıcı, ~22:20): 9 manuel kontrolün hepsi geçti (açılış sırası, sayfalama tekilliği, filtre/sıralama
sıfırlama, race, ilk/sonraki sayfa hatası, iki boş durum, slow modda yükleniyor, detaydan dönüşte state korunması).
Not: "Uçuş bulunamadı." durumunda yeniden yükleme aksiyonu yok (brief istemiyor); `empty=off` sonrası listeyi
görmek için filtre değiştirmek ya da uygulamayı yenilemek gerekiyor. Bilinen eksik olarak README'ye girecek.

## Blok 3 — Detay (22:22–22:23)

**Yapılanlar**
- `FlightDetailScreen`: route parametresindeki `FlightDto`'yu `toFlightView` ile gösterir, ek istek atmaz. Kalkış ve
  varış ayrı kartlarda; her birinde saat, havalimanı kodu ve adı, tarih. FL024'te varış tarihi "16 Ekim 2026 (ertesi gün)".
  Süre, aktarma, bagaj ("Bagaj dahil değil" / "Bagaj bilgisi yok" / "n kg") ve fiyat.
- Alt safe area `useSafeAreaInsets().bottom` ile; üstü native header karşılar.
- Biçimlendirme ve testleri Blok 2'de yazılmıştı (bkz. plandan sapma). Detaydaki favori aksiyonu Blok 4'te.

**Doğrulama**
- `npm test` → 50/50 · `npx tsc --noEmit` → temiz. Detayın manuel kontrolü CHECKPOINT 3'te.

**İlk denemede yanlış / düzeltilen**
- (yok)

## Blok 4 — Favoriler (22:23–22:26, CHECKPOINT 3 bekleniyor)

**Yapılanlar**
- `favoritesStore.ts`: `createFavoritesStore()` fabrikası (Zustand vanilla + `persist` + AsyncStorage). `name: 'favorites'`,
  `version: 1`, `partialize` yalnız `favorites`'ı yazar. State: `id → { flight: FlightDto, addedAt }`.
  `hasHydrated` `onRehydrateStorage` ile (başarı veya hata) true olur; `toggleFavorite` / `removeFavorite` o zamana kadar no-op.
- `FavoriteButton`: durumu store'dan id ile okur; hydration bitene kadar disabled; a11y label "{no} favorilere ekle/çıkar",
  `accessibilityState.selected`, görünür metin "Favori"/"Favoride".
- `FlightCard`: buton, kartın Pressable'ının kardeşi olarak alt satırda.
- `FlightDetailScreen`: fiyat satırında favori butonu.
- `FavoritesScreen`: hydration sürerken yükleniyor; boşsa "Henüz favori uçuşun yok."; yoksa `addedAt` azalan sırada liste.
  Sıralama `useMemo`'da (selector'da yeni dizi döndürmek v5'te sonsuz render'a yol açar).
- `FlightCard.test.tsx` (AGENTS §9 madde 6, isteğe bağlı): favori butonu detay navigasyonunu tetiklemiyor; karta basınca tetikleniyor.

**Doğrulama**
- `npm test` → 6 suite, 57/57 · `npx tsc --noEmit` → temiz · `npx expo install --check` → güncel · `npx expo export --platform ios` → derlendi.
- Mutasyon: store'daki `hasHydrated` koruması silinince "ignores actions before hydration" testi düştü (testin ikinci sürümüyle; aşağıya bak).

**İlk denemede yanlış / düzeltilen**
- **Hydration testi ilk hâliyle hatayı yakalamıyordu.** Koruma silindiğinde de geçiyordu. Sebep: Zustand `persist`
  `getItem`'ı store oluşturulurken başlatır ve hydration'da depodaki değeri bellektekinin üstüne yazar; ardından
  `markHydrated` → `setItem` depoyu düzeltir. Test, okumanın yazmadan önce bittiği "şanslı" sırayı modelliyordu.
  Gerçek risk: erken yazma okumadan önce tamamlanırsa (ya da uygulama o arada kapanırsa) depoda yalnız yeni favori kalır.
  Test, `AsyncStorage.getItem`'ı bir kapıyla geciktirip erken yazmanın önce gelmesini sağlayacak ve hydration öncesi
  bellek/depo durumunu da kontrol edecek şekilde yeniden yazıldı; mutasyonla düştüğü doğrulandı.
- `@expo/vector-icons` → `expo-font` → `expo-asset` zinciri jest'te "Cannot find module 'expo-asset'" verdi:
  `expo-asset` yalnız `expo/node_modules` altındaydı (hoist edilmemiş), `expo-font` onu bağımlılık olarak bildirmiyor.
  Metro çözebiliyordu, jest çözemedi. Mock'la gizlemek yerine `npx expo install expo-asset` (~57.0.19) ile doğrudan bağımlılık yapıldı.

**Açık riskler**
- Hydration öncesi favori dokunuşu sessizce yok sayılır (buton zaten disabled). AsyncStorage okuması pratikte ms
  mertebesinde olduğundan kullanıcı fark etmez.

CHECKPOINT 3 (kullanıcı, ~22:45): 1–6 geçti (favori butonu detayı açmıyor, üç ekranda tutarlılık, boş durum, FL024 ve
bagaj 0/null detayları, Expo Go kapat/aç sonrası favoriler yerinde). 7. adım (Accessibility Inspector) brief'te
istenmediği için kullanıcı kararıyla atlandı; erişilebilirlik otomatik testlerle doğrulanıyor, ekran okuyucuyla denenmedi.

## Blok 5 — Erişilebilirlik ve gözden geçirme (22:46–22:47)

**Yapılanlar**
- AGENTS.md §4/§7 taraması (grep): `src/api` dışında `fetch(` yok; `any` / `@ts-ignore` yok; StrictMode yok; liste için
  istemcide sort/filter yok (tek `.sort(` favoriler ekranında, brief "sıralama serbest" diyor); bagajda falsy kontrol yok;
  `keyExtractor` her yerde `id`; `ios/` `android/` yok.
- Sıralama butonlarına sabit `accessibilityLabel` verildi.
- `FlightListControls.test.tsx`: switch'in erişilebilir adı ve değeri, sıralamanın `selected` durumu ve görünür ✓, onChange değerleri.
- `app.json` `name`: "Uçuş Keşfi" (Expo Go'da görünen ad).

**Doğrulama**
- `npm test` → 7 suite, 59/59 · `npx tsc --noEmit` → temiz.

**İlk denemede yanlış / düzeltilen**
- Sıralama butonlarının erişilebilir adı görünür metinden türüyordu, yani "✓ En düşük fiyat". VoiceOver seçimi hem ✓
  hem `selected` ile iki kez söylerdi. Sabit etiket verildi; test adı tam eşleşmeyle (`name: 'En düşük fiyat'`) kontrol ediyor.
- zsh'te tırnaksız `grep --include=*.ts` glob olarak açılıp "no matches found" verdi; tarama tırnaklı desenle tekrarlandı.

## Blok 6 — P1 (22:47–22:48)

**Yapılanlar**
- P1.1: `FlightListScreen.test.tsx`. `<App />` gerçek navigasyonla render edilir, yalnız `getFlights` mock'lanır. İlk istek
  `ApiError(500)` → "Uçuşlar yüklenemedi." görünür, boş/yükleniyor görünmez → "Tekrar dene" → "2 uçuş" ve kart görünür,
  hata kalkar; ikinci istek de aynı filtreyle `page: 1`.
- P1.2 gözden geçirme: race koruması iki katmanda test ediliyor. Reducer'da eski `requestId`'li ilk sayfa, sonraki sayfa
  ve hata yanıtları yok sayılıyor. Hook'ta filtre değişince bekleyen isteğin `signal`'i iptal ediliyor ve geç gelen eski
  sayfa yeni sonuca karışmıyor. Manuel race doğrulaması CHECKPOINT 2 madde 4'te yapıldı. Ek test gerekmedi.

**Doğrulama**
- `npm test` → 9 suite, 60/60 · `npx tsc --noEmit` → temiz.
- Mutasyon: `retryFirstPage` no-op yapılınca ekran testi "Unable to find an element with text: 2 uçuş" ile düştü; geri alındı.

**İlk denemede yanlış / düzeltilen**
- Blok 5'in bitiş saati WORKLOG'a `date` çalıştırılmadan tahminle (22:49) yazılmıştı; gerçek saatle (22:47) düzeltildi.

## Blok 7 — README ve son kontrol (22:48–22:51)

**Yapılanlar**
- README (Türkçe): sürümler; brief §7'nin 7 maddesi aynı sıra ve başlıklarla; mimari gerekçe içinde favori saklama
  tercihi ve detay parametresinin gerekçesi; AI kullanımı (taslak). §5 "Harcadığın süre" adaya bırakıldı, blok saatleri tabloda.
- Doğrulanan simülatör `xcrun simctl list devices booted` → iPhone 18 Pro (iOS 27.0); Expo Go 57.0.9; Xcode 27.0.
- Öz denetim: brief ve case-kit README yeniden karşılaştırıldı; CHECKLIST'te P0 ve P1'in tamamı ✅. Yalnız README
  §5 (süre) ve AI bölümünün aday tarafından gözden geçirilmesi 🟡.

**Doğrulama (bitti tanımı)**
- `npm test` → 9 suite, 60/60 · `npx tsc --noEmit` → temiz · `npx expo install --check` → "Dependencies are up to date"
  · `npx expo export --platform ios` → derlendi.
- Temiz klon: `git clone . /tmp/flight-case-clone && npm ci && npm test` → 60/60, `tsc` temiz; klonda `docs/case/` yok.
  `npm ci` yalnızca jest 29'un geçişli bağımlılıkları için deprecation uyarısı verdi (inflight, glob@7 vb.); peer çakışması yok.
- Mock servis kapatıldı (port 4000 boş). `ios/` `android/` yok, uzak depo yok (`git remote` boş).

**İlk denemede yanlış / düzeltilen**
- (yok)

**Açık riskler**
- Android denenmedi. `npm audit` jest/expo alt bağımlılıklarında bilinen açıklar raporluyor. Bunlar geliştirme
  araçlarında ve `--force` ile SDK dışı sürümlere geçmek gerekeceği için dokunulmadı.

## Düzeltme — erişilebilirlik kontrolü (22:58)

- CHECKPOINT 3'ün 7. adımı (Accessibility Inspector) başta atlanmıştı ve README'ye "Bilinen eksikler" altında "ekran
  okuyucuyla deneme yapılmadı" diye yazılmıştı. Kullanıcı sonradan Accessibility Inspector ile kontrol etti.
- README'de madde "Bilinen eksikler"den çıkarıldı ve §2'deki manuel kontrollere eklendi. CHECKLIST 5.e'ye manuel kanıt eklendi.

## Kod gözden geçirme — tekrar, sabitler, ölü kod, iş kuralı yeri (23:04–23:08)

Kullanıcının kontrol listesi: tekrar eden kod/biçimlendirme, tekrar eden renk ve sayılar, kullanılmayan dosya ve
bağımlılık, bileşenin içinde kalmış iş kuralı.

**Bulgular ve yapılanlar**
- Tekrar eden kod:
  - Uçuşlar ve Favoriler ekranında aynı FlatList kurulumu (`renderItem`, `keyExtractor`, içerik boşluğu) → `components/FlightCardList.tsx`.
  - "Tekrar dene" iki ayrı buton olarak yazılmıştı ve iki farklı görünümdeydi (StateView'da dolu, footer'da çerçeveli) → `components/ActionButton.tsx`.
  - Kart yüzeyi stili (beyaz zemin, 12 radius, hairline kenar) kartta ve detay bölümlerinde ayrı ayrı → `theme.surface`.
  - "Havayolu · uçuş no" biçimi kartta ve detayda ayrı ayrı → `FlightView.title`.
- Tekrar eden sayılar: 9 farklı font boyutu (13–24) ve dağınık boşluklar (4, 6, 8, 10, 12, 16, 20, 24) vardı. `theme.ts`'e
  `fontSize` (5 basamak), `spacing` (4-pt, 5 basamak), `radius` ve `opacity` eklendi. Stil dosyalarında koda gömülü sayı
  kalmadı (grep ile doğrulandı). Bunun bedeli küçük görsel kaymalar: 14→13, 16→15, 17→18, 22→20 pt; 6→4, 10→12, 20→16 boşluk.
  Renkler zaten tek yerdeydi (`theme.ts` dışında hex yok).
- Kullanılmayanlar:
  - `removeFavorite` uygulamada hiç çağrılmıyordu (yalnız testlerde) → silindi, testler `toggleFavorite` kullanıyor.
  - `assets/splash-icon.png` hiçbir yerde referans edilmiyordu → silindi.
  - `assets/favicon.png` ve `app.json`'daki `web` bloğu hedeflenmeyen web için ve `react-native-web` kurulu değil → silindi.
  - Bağımlılıklar: import'u olmayan paketlerin hepsi meşru (tip paketleri, jest araçları; `test-renderer` RNTL peer'ı,
    `react-native-screens` native-stack peer'ı, `expo-asset` expo-font'un çalışma zamanı bağımlılığı).
- Bileşende kalmış iş kuralı:
  - "Favoriler en yeni üstte" sıralaması `FavoritesScreen`'deydi → `favoritesStore.ts` içinde `favoritesNewestFirst()` (testli).
  - "Bu kart favori mi" selector'ı → `selectIsFavorite(id)`.
  - "Filtreyi temizle"nin ne yaptığı (`onlyDirect: false`, sıralama korunur) ekrandaydı → `useFlights().clearDirectFilter`.

**Doğrulama**
- `npm test` → 9 suite, 60/60 · `npx tsc --noEmit` temiz · `npx expo install --check` güncel · `npx expo export` derlendi.
- Hydration testi `removeFavorite` yerine `toggleFavorite` ile yeniden yazıldığı için mutasyon tekrarlandı: koruma silinince yine düşüyor.

**Açık riskler**
- Font ve boşluk değerleri birkaç pt değişti; simülatörde göz kontrolü gerekiyor.

**İlk denemede yanlış / düzeltilen**
- Bu bölümün bitiş saati yine `date` çalıştırılmadan tahminle (23:12) yazılmıştı; gerçek saat 23:08. Blok 5'teki
  hatanın tekrarı.
- Ara commit'leri ayrı worktree'de doğrularken önce `npm test` yerine `npx jest` çalıştırıldı; `TZ` ayarlanmadığı için
  `format.test.ts › runs these tests in a non-Istanbul time zone…` düştü. Kod hatası değil, komut hatası; ama nöbetçi
  testin işe yaradığının canlı örneği. `npm test` ile iki ara commit de 60/60.

## Not — brief metinleri (kullanıcı isteği)

- README › AI kullanımı'na not eklendi: `docs/case/` repoya eklenmedi (`.git/info/exclude`), agent brief'i yerelde okudu;
  `AGENTS.md` ve `KICKOFF.md`'deki `docs/case/…` referansları bu yerel kopyayı gösterir.

## Teslim (10 Ekim, 13:49–14:52)

- README son düzenlemeleri: önkoşullar (Node 20.19.4+ / 22.13+, Xcode + iOS Simulator), §5 süre ve tablonun tamamlanması,
  AI bölümünde planlamanın Claude ile birlikte yapıldığının belirtilmesi, `docs/case/` notu.
- Markdown son kontrolü: eskimiş ifadeler düzeltildi. Bu dosyanın başındaki "deneme turu" notu, CHECKLIST'te README
  satırlarının 🟡 kalması ve "7 suite" (doğrusu 9).
- Repo aday tarafından GitHub'a gönderildi. Yukarıdaki Blok 7'de yazan "uzak depo yok" ifadesi o anki durumu anlatıyor.
  Bir push (`ad4ee86`) agent tarafından yapıldı: AGENTS.md'deki "push yok" kuralına rağmen, adayın açık isteğiyle.
- Commit e-postası, makine adresleri yerine adayın GitHub e-postasına ayarlandı; eski commit'ler değiştirilmedi.
- README'deki "TanStack Query'nin infinite query'si bu davranışları kendi içinde çözerdi" ifadesi yanlıştı.
  `@tanstack/query-core` 5.104.1 kaynak kodunda `fetchNextPage`'in `cancelRefetch` varsayılanı `true`: önceki çağrı
  bitmeden tekrar çağrılınca `queryFn` yeniden çalışır. Resmi rehber `hasNextPage && !isFetching` kontrolünü öneriyor.
  Cümle, TanStack'in neyi hazır verip (queryKey başına önbellek, `signal`) neyi vermediğini (aynı sayfanın tekrar
  istenmemesi) ayıracak şekilde düzeltildi. Kickoff'u hazırlayan da bu konuda emin olmadığını belirtmişti.
