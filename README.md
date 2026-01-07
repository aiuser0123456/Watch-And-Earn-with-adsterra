
# Emerald Rewards - Native App Master Guide

## 1. AdMob Alternatives (Adsterra & Unity)

### A. Using Adsterra (Web-based Timer)
Adsterra doesn't have "Rewarded Video" events. 
1. Get an **Adsterra Direct Link**.
2. In `Dashboard.tsx`, update `handleStartAd` to open that link:
   ```ts
   import { Browser } from '@capacitor/browser';
   const handleStartAd = async () => {
     await Browser.open({ url: 'YOUR_ADSTERRA_DIRECT_LINK' });
     setIsWatching(true);
     setTimer(30); // Force user to wait 30s
   };
   ```

### B. Using Unity Ads (Real Rewarded Video)
Unity Ads is the best non-Google alternative.
1. Install: `npm install @capacitor-community/unity-ads`
2. Usage:
   ```ts
   import { UnityAds } from '@capacitor-community/unity-ads';
   await UnityAds.showRewardVideoAd({ adId: 'REWARD_ID' });
   // Grant points if successful
   ```

## 2. Firebase Configuration
- **Web App Config**: Use in code for Firebase SDK.
- **Android App Config**: Put `google-services.json` in `android/app/`.

## 3. Reward Points System
- **1-3 Points**: Random regular reward.
- **6 Points**: Lucky Bonus (10% chance, max 2x daily).
- **Timer**: Users must wait for the countdown to finish before points are granted.

## 4. SHA-1 Fingerprint (For Google Sign-In)
1. Run: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
2. Copy **SHA1**.
3. Add to **Firebase Console > Project Settings > Android App**.

## 5. Build APK
1. `npm run build`
2. `npx cap init`
3. `npx cap add android`
4. `npx cap copy`
5. Open in Android Studio and Build APK.
