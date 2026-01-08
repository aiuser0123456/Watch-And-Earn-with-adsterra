
# Emerald Rewards - Full Block System Guide

Follow these steps to rebuild your "Watch & Earn" blocks in Android Builder (Kodular/App Inventor).

## 1. Components Needed
- **WebViewer1**: Your main interface.
- **AdmobReward1**: For Rewarded Video ads.
- **AdmobAppOpen1**: For ads shown when the app opens.
- **AdmobNative1**: To show ads inside the dashboard container.

## 2. Variables
- `global ad_ready` = `false`
- `global app_open_ready` = `false`

## 3. Screen Initialize Blocks
```text
When Screen1.Initialize:
  Set WebViewer1.Url to "https://watch-and-earn-with-me.netlify.app"
  Call AdmobReward1.LoadAd
  Call AdmobAppOpen1.LoadAd
```

## 4. Ad Loading Blocks
```text
When AdmobReward1.AdLoaded:
  Set global ad_ready to true

When AdmobAppOpen1.AdLoaded:
  Set global app_open_ready to true
```

## 5. WebView Communication (The Bridge)
```text
When WebViewer1.WebViewStringChange (value):
  If value = "show_rewarded_ad":
     If global ad_ready = true:
        Call AdmobReward1.ShowAd
     Else:
        Call WebViewer1.RunJavaScript("window.postMessage('ad_not_ready', '*')")
  
  If value = "show_app_open":
     If global app_open_ready = true:
        Call AdmobAppOpen1.ShowAd

  If value = "load_native_ad":
     Call AdmobNative1.LoadAd
```

## 6. Reward & Cleanup Blocks
```text
When AdmobReward1.GotRewardItem:
  Call WebViewer1.RunJavaScript("window.postMessage('reward_granted', '*')")

When AdmobReward1.AdDismissed:
  Set global ad_ready to false
  Call AdmobReward1.LoadAd
  Call WebViewer1.RunJavaScript("window.postMessage('ad_dismissed', '*')")

When AdmobReward1.FailedToShowAd:
  Set global ad_ready to false
  Call AdmobReward1.LoadAd
  Call WebViewer1.RunJavaScript("window.postMessage('ad_failed', '*')")
```

## ⚠️ Important Configuration
1. **AdMob App ID**: You MUST put your App ID (e.g., `ca-app-pub-xxx~xxx`) in the **Screen1 Properties** under "AdMob App ID".
2. **Google Login**: Ensure your `WebViewer1` has `UsesLocation` and `PromptForPermission` enabled.
3. **Firebase**: Ensure the site URL is in your "Authorized Domains" in the Firebase Console.
