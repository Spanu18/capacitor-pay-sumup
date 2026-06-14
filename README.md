# capacitor-pay-sumup

SumUp provider plugin for [`capacitor-pay`](https://github.com/Spanu18/capacitor-pay), wrapping the SumUp SDK for in-app card and Tap to Pay checkout. Can also be used standalone without `capacitor-pay`.

## Install

```bash
npm install capacitor-pay-sumup
npx cap sync
```

## Android setup

This plugin depends on the SumUp Merchant SDK for Android (`com.sumup:merchant-sdk:7.0.0`), which:

* requires `minSdkVersion 26` or higher in your app's `android/variables.gradle`
* is hosted on SumUp's own Maven repository

If your app uses Gradle's centralized repository management (`dependencyResolutionManagement` in `android/settings.gradle`), add SumUp's repository there:

```gradle
dependencyResolutionManagement {
    repositories {
        // ...existing repositories
        maven { url 'https://maven.sumup.com/releases' }
    }
}
```

(The plugin's `build.gradle` already declares this repository for older, non-centralized setups, so most projects need no extra configuration.)

### Tap to Pay

`checkTapToPay()` / `activateTapToPay()` wrap **Tap to Pay on iPhone** and are iOS-only. On Android, `checkTapToPay()` resolves `{ available: false, activated: false }` and `activateTapToPay()` rejects. SumUp's Tap to Pay on Android is a separate SDK (requiring dedicated Maven credentials from SumUp) and is not bundled here.

## API

<docgen-index>

* [`setup(...)`](#setup)
* [`login(...)`](#login)
* [`checkout(...)`](#checkout)
* [`logout()`](#logout)
* [`checkTapToPay()`](#checktaptopay)
* [`activateTapToPay()`](#activatetaptopay)

</docgen-index>

### setup(...)

```ts
setup(options: { affiliateKey: string }) => Promise<{ success: boolean }>
```

Configure the SDK with a SumUp affiliate key. Call once before login/checkout.

### login(...)

```ts
login(options: { accessToken: string }) => Promise<{ success: boolean }>
```

Log in to a SumUp merchant account using an OAuth access token.

### checkout(...)

```ts
checkout(options: SumUpCheckoutOptions) => Promise<{ success: boolean }>
```

Present the SumUp checkout flow for a single payment.

### logout()

```ts
logout() => Promise<{ success: boolean }>
```

Log out of the current SumUp merchant account.

### checkTapToPay()

```ts
checkTapToPay() => Promise<SumUpTapToPayStatus>
```

Check whether Tap to Pay on iPhone is available and activated for this device/account.
Always resolves `{ available: false, activated: false }` on Android, which does not
support Tap to Pay through this plugin.

### activateTapToPay()

```ts
activateTapToPay() => Promise<{ success: boolean }>
```

Present the Tap to Pay on iPhone activation flow.
Rejects on Android, which does not support Tap to Pay through this plugin.
