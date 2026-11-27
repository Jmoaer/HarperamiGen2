# Harperami Gen 2 — Android app

The Android app is a native shell around the existing choir web app
(`https://jmoaer.github.io/HarperamiGen2/`). Sign-in, the song library, chat,
private messages, online dots, uploads and downloads all run against the same
Supabase backend, so members see the same data on the phone as on the website.

## What is in this folder

| Path | Purpose |
| --- | --- |
| `android/` | The Android Studio / Gradle project |
| `android/app/src/main/java/com/harperami/gen2/MainActivity.java` | WebView screen: back button, file uploads, video fullscreen, downloads |
| `android/release/harperami-upload.jks` | **Your upload key — keep it safe, never commit or share it** |
| `android/release/keystore.properties` | Passwords for that key (also secret) |
| `release/HarperamiGen2-1.0.0.aab` | Signed bundle to upload to Play Console (in the project workspace, kept out of git) |
| `release/HarperamiGen2-1.0.0.apk` | Signed APK for testing on a phone (same folder) |
| `app-assets/play-store-icon-512.png` | 512×512 store icon |
| `app-assets/feature-graphic-1024x500.png` | Store feature graphic |
| `app-assets/screenshots/` | Four phone screenshots (1080×1920) for the store listing |
| `manifest.webmanifest`, `icons/` | Make the website installable too |
| `privacy.html` | Privacy policy page (required by Play) |

## Install it on a phone right now (no Play Store)

1. Copy `release/HarperamiGen2-1.0.0.apk` to the phone (email, Drive, USB).
2. Open the file and allow "install unknown apps" for that app when asked.
3. The app appears as **Harperami Gen 2**.

The APK is signed with your upload key, so it can be updated later by any build
signed with the same key.

## Build it again after changing the website

The website content is loaded live, so most changes need **no new app build** —
just push to GitHub Pages. Rebuild only when the app itself changes (icon, name,
version, Android code).

```bash
cd android
./gradlew assembleRelease bundleRelease     # in Android Studio, or with Gradle installed
```

Outputs:

- `android/app/build/outputs/bundle/release/app-release.aab`
- `android/app/build/outputs/apk/release/app-release.apk`

Requirements: JDK 17, Android SDK with platform 36 and build-tools 36.

## Publish to Google Play

1. Create a Google Play developer account at
   <https://play.google.com/console> (one-time US$25 fee, ID verification takes
   a few days).
2. **Create app** → name `Harperami Gen 2`, default language English, type
   *App*, free.
3. **Production → Create new release** → upload
   `release/HarperamiGen2-1.0.0.aab`. When Play asks about app signing, accept
   *Use Play App Signing* (recommended) and let Google hold the app signing key;
   your `harperami-upload.jks` remains the upload key.
4. Fill in the store listing:
   - Short description, full description
   - App icon `app-assets/play-store-icon-512.png`
   - Feature graphic `app-assets/feature-graphic-1024x500.png`
   - At least 2 phone screenshots from `app-assets/screenshots/`
5. **Privacy policy URL**:
   `https://jmoaer.github.io/HarperamiGen2/privacy.html`
6. **Data safety** form: the app collects name, username, password, birthdate,
   age, address, profile photo and messages, all stored on the choir's Supabase
   project; data is encrypted in transit; users can request deletion through the
   admin. Declare that no data is shared with third parties.
7. **Content rating** questionnaire → the app has user-generated content
   (chat), so answer yes to "users can interact" and "sharing of user content".
8. **Target audience**: 13+ (or 18+ if you prefer to avoid child-directed rules).
9. Submit for review. First reviews usually take 1–7 days.

### Version bumps for later updates

In `android/app/build.gradle`:

```groovy
versionCode 2          // must increase for every upload
versionName '1.0.1'
```

Then rebuild and upload the new `.aab`.

## Capacity: 200+ members and unlimited messages

- The member list, the online dots and the private-message member picker load the
  whole choir in one query, so 200 members fit comfortably (photos load lazily).
- Every chat and private message is its own small file in Supabase Storage, so
  nothing is overwritten or trimmed. The group room opens with the newest 300
  messages and **Load earlier messages** walks back through the whole history a
  page at a time.
- Storage listing is paged at 1000 entries per request, so the app keeps working
  past the API's single-call limit, and presence covers every member.
- Growth is bounded by your Supabase plan (free tier: 1 GB storage and 5 GB
  bandwidth/month). At roughly 300 bytes per message that is millions of
  messages; if the choir gets very busy, upgrade the Supabase plan rather than
  deleting history.
- The room polls only the newest page every 3 s; older pages are fetched once and
  kept in memory, so long histories do not slow the chat down.

## Known limits (please read)

- **The app is a wrapper around your website.** Google rejects apps that are
  only a website with no app-like value; this one keeps members signed in,
  handles phone uploads/downloads and shows the choir's own private data, which
  is normally accepted, but approval is Google's decision, not something a build
  can guarantee.
- **Notifications while the app is closed are not possible** with this
  architecture. In-app "new message" badges work; real push notifications need a
  small server (Cloudflare Worker or Supabase Edge Function with Web Push).
- **Account security needs work before a public release.** The `members` table is
  readable with the publishable key, and passwords are stored in plain text. A
  Play reviewer may also flag this. Fixing it needs Row Level Security, a private
  storage bucket and hashed passwords (Supabase `service_role` work).
- The app requires Android 10 or newer (it saves downloads straight into the
  phone's Download folder without extra permissions).
- This build was compiled and its signature verified here, but it could not be
  launched on a real device or emulator in this environment. Test the APK on a
  phone before publishing.
