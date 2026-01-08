
# Emerald Rewards - Native App Guide (AdMob Only)

## ⚠️ CRITICAL: App Crash Fix
In **Android Builder**, when you add the AdMob components (Rewarded, Native, App Open), you **MUST** go to the component properties and enter your **Google AdMob App ID** (starts with `ca-app-pub-`). 
*   If you leave this blank, the app **WILL CRASH** on start.
*   Do not use the "Unit ID" here; use the "App ID" for the global screen settings.

## 1. Google Login (Redirect Mode)
The login system now uses `signInWithRedirect`.
*   **Firebase Setup**: Ensure `watch-and-earn-with-me.netlify.app` is in your Firebase Authorized Domains.
*   **Android Builder**: Ensure `WebViewer1` has the following properties checked:
    *   `UsesLocation`
    *   `PromptForPermission`
    *   `UsesHardwareAcceleration`

## 2. Updated Block Commands
The site sends these signals to your native blocks via `WebViewStringChange`:
- `show_rewarded_ad`: Show the video ad.
- `show_app_open`: Show the App Open ad (triggered at startup).
- `load_native_ad`: Tells the Native Ad component to load a new ad.

## 3. Native -> Site Signals
Ensure your native blocks use `RunJavaScript` to send these messages back to the site:
- `window.postMessage('reward_granted', '*')`: Adds points.
- `window.postMessage('ad_dismissed', '*')`: Stops the loading spinner.
- `window.postMessage('ad_not_ready', '*')`: Shows the "Ad not ready" error.
