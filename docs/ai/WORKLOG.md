# WORKLOG

Araç: Claude Code (Opus 5.5), VS Code eklentisi. Saatler `date '+%H:%M'` ile alındı.

> Not: Bu çalışma bir deneme turu. Commit atılıyor, push yok.

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
