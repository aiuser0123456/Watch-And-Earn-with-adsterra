
# 🟢 BLOCK SYSTEM - PHOTO CORRECTION GUIDE

Based on your screenshot, please make these 3 specific changes to your blocks:

## 1. Fix the "GotRewardItem" Block
Your JavaScript string is missing the origin. Change it to this exactly:
- **Old**: `window.postMessage('reward_granted')`
- **New**: `window.postMessage('reward_granted', '*')` 
*(The `, '*'` is required for the WebView to talk to the website)*

## 2. Fix the "AdDismissed" Block Logic
In your photo, you reset the variable too early. Swap the order like this:
1. **If** `reward_given` = `false`:
   - Call `WebViewer1.RunJavaScript` -> `window.postMessage('ad_dismissed', '*')`
2. **Set** `reward_ready` to `false`
3. **Set** `reward_given` to `false`
4. **Call** `AdmobReward1.LoadAd`

## 3. Add the missing "App Open" & "Native" Logic
To make your app high-fidelity, add these two `if` checks inside your `WebViewStringChange` block:

**If** `get value` = `show_app_open`:
- **If** `app_open_ready` = `true`:
  - Call `AdmobAppOpen1.ShowAd`

**If** `get value` = `load_native_ad`:
- Call `AdmobNative1.LoadAd`

## ⚠️ Final Checklist
1. **AdMob App ID**: Enter it in Screen1 Properties.
2. **Origin**: Always use `window.postMessage('message', '*')` in your JavaScript blocks.
3. **Reset String**: Keeping the `set WebViewer1.WebViewString to "*4"` is good! It helps the app recognize repeated clicks.
