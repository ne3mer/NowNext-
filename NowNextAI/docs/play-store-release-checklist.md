# Play Store Release Checklist

Use this checklist before pushing NowNext AI to production on Google Play.

## 1) Identity and Metadata

- [ ] Final app name confirmed (`NowNext AI`)
- [ ] Android package name confirmed (`com.ne3mer.nownextai`)
- [ ] Version bump done in `app.json` (`expo.version`) and `android.versionCode`
- [ ] Final store short description and full description prepared

## 2) Assets

- [ ] 512x512 Play Store icon
- [ ] Feature graphic (1024x500)
- [ ] 2-8 phone screenshots (light and dark mode is better)
- [ ] Privacy policy URL ready and publicly reachable

## 3) Technical QA

- [ ] New install flow tested
- [ ] Task CRUD tested
- [ ] Theme toggle persistence tested
- [ ] Linked goal chain and impact path tested
- [ ] App relaunch persistence tested
- [ ] No red screens in release mode

## 4) Build and Submit

- [ ] `eas login`
- [ ] `eas init` completed for this project
- [ ] Preview APK built and tested (`npm run build:android:preview`)
- [ ] Production AAB built (`npm run build:android:production`)
- [ ] Uploaded/submitted to internal track (`npm run submit:android:production`)

## 5) Google Play Console

- [ ] Data safety form completed
- [ ] Content rating questionnaire completed
- [ ] App access section configured (if needed)
- [ ] Target audience + ads declarations reviewed
- [ ] Internal testing release published and installed by testers
- [ ] Final production rollout strategy selected (staged rollout recommended)
