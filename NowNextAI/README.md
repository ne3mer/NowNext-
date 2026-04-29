# NowNext AI

NowNext AI is a creative productivity app built with Expo React Native.  
Users can plan daily/weekly/monthly/yearly tasks with sticky-note style cards, smart next-task suggestions, and linked goal chains.

## Tech Stack

- Expo React Native
- TypeScript
- Zustand
- AsyncStorage

## Run Locally

```bash
npm install
npm start
```

## Android Build (Play Store Flow)

```bash
# one-time
npm install -g eas-cli
eas login

# link/init project once (interactive)
eas init

# preview APK (internal test)
npm run build:android:preview

# production AAB (Play Store)
npm run build:android:production
```

Submit to Play internal track:

```bash
npm run submit:android:production
```

## Play Store Readiness

The release checklist is in `docs/play-store-release-checklist.md`.
