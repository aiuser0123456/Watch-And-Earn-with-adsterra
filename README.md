
# Emerald Rewards - Native App Guide (AdMob Only)

## 1. AdMob App ID
Ensure your **AdMob App ID** is entered in the `Properties` section of Screen1 in Android Builder. Without this, the app will crash upon launching AdMob components.

## 2. Google Login Troubleshooting
If you see "Failed to connect to google":
1. **Firebase Authorized Domains**: Go to Firebase Console -> Authentication -> Settings -> Authorized Domains. Add your Netlify URL: `watch-and-earn-with-me.netlify.app`.
2. **SHA-1 Fingerprint**: You MUST add your Android Builder Keystore SHA-1 to your Firebase project settings.
3. **WebView Settings**: In Android Builder, ensure `WebViewer1` has `UsesLocation` and `PromptForPermission` enabled.

## 3. AdMob Blocks Setup
The app communicates via `WebViewString`. Set up your blocks to listen for:
- `show_rewarded_ad`: Calls `AdmobReward1.ShowAd`.
- `show_app_open`: Calls `AdmobAppOpen1.ShowAd`.
- `load_native_ad`: Calls `AdmobNative1.LoadAd`.

## 4. Point System
- Rewards are calculated on the JS side but synced to Firestore.
- Ensure the native block `AdmobReward1.GotRewardItem` triggers `window.postMessage('reward_granted', '*')`.
