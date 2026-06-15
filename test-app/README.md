# capacitor-pay-sumup test app

A minimal Capacitor app for manually exercising every method exposed by
`capacitor-pay-sumup`, without touching `domicilioo-pos`.

It depends on the plugin via `file:..`, so any change you make to the
plugin's `src/`, `ios/`, or `android/` code is picked up after rebuilding
the plugin and re-syncing this app.

## Prerequisites

- A SumUp **affiliate key** (from the SumUp developer dashboard).
- A SumUp merchant account, logged in via the **access token** flow (the
  plugin's `login()` opens SumUp's hosted login screen, so you don't need to
  hardcode a password).
- A physical device for full testing - the SumUp SDK's card reader / Tap to
  Pay flows do not work in the iOS Simulator or Android emulator.

## 1. Rebuild the plugin (after any native/TS change)

```sh
cd ..
npm run build
```

## 2. Install deps / re-sync after plugin changes

```sh
npm install   # first time only
npm run sync  # bundles src/index.js -> www/index.js and runs `cap sync`
```

## 3. iOS

```sh
npx cap sync ios
cd ios/App
pod install
open App.xcworkspace
```

- Open `App.xcworkspace` (not `.xcodeproj`) in Xcode.
- Select your physical device as the run target, set a development team
  under **Signing & Capabilities**, and run.
- The Podfile pins `CapacitorPaySumup` and the Capacitor pods via local
  `:path`, so SumUp SDK 6.x is pulled in automatically by the plugin's
  podspec.

## 4. Android

```sh
npx cap sync android
```

Open the `android/` folder in Android Studio, or build from the CLI:

```sh
cd android
./gradlew :app:assembleDebug
./gradlew :app:installDebug   # with a device connected via adb
```

`variables.gradle` is set to `minSdkVersion = 26`, which the SumUp Merchant
SDK requires. The root `build.gradle` adds `https://maven.sumup.com/releases`
and `:app/build.gradle` enables core library desugaring - both are required
for `com.sumup:merchant-sdk:7.0.0` to resolve and compile.

## 5. Using the app

1. **Setup & Auth**
   - Enter your affiliate key and tap **setup**.
   - Tap **login** - this opens SumUp's hosted login UI. Use the SumUp app
     login screen to authenticate (a SumUp access token is optional; leaving
     it blank lets the SDK prompt for credentials interactively).
   - Tap **isLoggedIn** / **getCurrentMerchant** to confirm the session and
     inspect the merchant's currency/merchant code.
2. **Checkout**
   - Fill in amount, currency (ISO code, e.g. `EUR`), and title.
   - Optionally set tip amount, foreign transaction ID, or payment method
     (iOS only: `card`, `cardReader`, or `tap`).
   - Tap **prepareForCheckout** to let the SDK pre-warm the card reader
     connection (useful right before a checkout).
   - Tap **checkout** to launch the SumUp payment flow. On success the log
     shows `transactionCode` and any `additionalInfo`.
   - Tap **openCheckoutPreferences** to open SumUp's card reader / checkout
     settings screen (pairing, receipts, etc.).
3. **Tap to Pay** (iOS only - Android always reports `available: false`)
   - Tap **checkTapToPay** to see device eligibility/activation status.
   - Tap **activateTapToPay** to start the SumUp activation flow if needed.

All results and errors are printed to the log panel at the bottom of the
screen, with timestamps. Use **clear log** to reset it between runs.
