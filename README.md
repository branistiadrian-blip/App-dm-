# Toolkit DM · Emarbiland

Aplicație pentru gestionat campania de D&D: fișe de personaje, tracker de
luptă, jurnal de sesiuni și NPC-uri/locații din Emarbiland.

Momentan datele se salvează local pe telefon (`localStorage`), nu în cloud.
Poate fi conectat mai târziu la Firebase (`compendiu-dnd`) pentru sincronizare
între dispozitive — structura de `Storage` din `js/storage.js` e făcută să
poată fi înlocuită ușor cu apeluri Firestore.

## Cum obții APK-ul (fără Android Studio)

1. Creează un repo nou pe GitHub și încarcă tot acest folder.
2. Intră în tab-ul **Actions** al repo-ului — workflow-ul `Build APK` pornește
   automat la fiecare push pe `main` (sau apeși "Run workflow" manual).
3. Așteaptă ~3-5 minute până se termină build-ul.
4. Deschide job-ul terminat → în secțiunea **Artifacts** găsești
   `dm-toolkit-debug-apk` → descarcă-l (e un `.zip` cu APK-ul înăuntru).
5. Pe telefon: dezarhivează, apasă pe `app-debug.apk`, permite instalarea din
   surse necunoscute dacă ți se cere, și instalează.

Asta funcționează integral de pe telefon — nu ai nevoie de PC pentru pașii
de mai sus, doar de un cont GitHub.

## Dacă vrei să lucrezi local (pe PC, cu Android Studio)

```bash
npm install
npx cap sync android
npx cap open android
```

Apoi apeși Run/Build direct din Android Studio.

## Structura proiectului

```
www/                  ← aplicația web (asta editezi cel mai des)
  index.html
  css/style.css
  js/
    storage.js         ← strat de date (localStorage, ușor de mutat pe Firebase)
    characters.js       ← tab Fișe
    combat.js            ← tab Luptă (initiative tracker)
    journal.js            ← tab Jurnal
    world.js                ← tab Lume (NPC-uri/locații)
    app.js                    ← router între tab-uri + utilitare UI
android/               ← proiectul nativ generat de Capacitor (nu edita direct)
.github/workflows/     ← build automat de APK în cloud
```

## Idei pentru pasul următor

- Sincronizare Firebase (multi-dispozitiv, backup automat)
- Legătură directă NPC → punct pe harta Emarbiland (link către overlay-ul HTML)
- Export/import JSON al campaniei (backup manual)
- Notificări/remindere pentru sesiuni programate
