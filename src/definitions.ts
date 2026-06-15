export type SumUpCheckoutPaymentMethod = 'tapToPay' | 'cardReader'

export interface SumUpCheckoutOptions {
  /** Amount to charge, in the major currency unit (e.g. 12.50 for €12.50). */
  amount: number
  /** ISO 4217 currency code, e.g. "EUR". Must match the logged-in merchant's currency. */
  currency: string
  /** Title shown on the SumUp checkout screen. */
  title: string
  /** Preferred payment method. Defaults to `cardReader` when omitted. */
  paymentMethod?: SumUpCheckoutPaymentMethod
  /** Optional tip amount, in the major currency unit, added on top of `amount`. */
  tipAmount?: number
  /**
   * Optional unique ID to associate with this transaction, for later lookup via the SumUp
   * REST API. Must be unique per merchant account and at most 128 printable ASCII characters.
   */
  foreignTransactionID?: string
}

export interface SumUpCheckoutResult {
  success: boolean
  /** Reference code for the transaction. Absent if checkout failed before reaching SumUp's backend. */
  transactionCode?: string
  /** Additional transaction details returned by SumUp (e.g. card information). iOS only. */
  additionalInfo?: Record<string, unknown>
}

export interface SumUpTapToPayStatus {
  available: boolean
  activated: boolean
}

export interface SumUpMerchant {
  /** The currency code used by the merchant for all payments, or `null` if no merchant is logged in. */
  currencyCode: string | null
  /** The merchant's identifier within the SumUp system, or `null` if no merchant is logged in. */
  merchantCode: string | null
}

export interface SumUpPlugin {
  /** Configure the SDK with a SumUp affiliate key. Call once before login/checkout. */
  setup: (options: { affiliateKey: string }) => Promise<{ success: boolean }>
  /** Log in to a SumUp merchant account using an OAuth access token. */
  login: (options: { accessToken: string }) => Promise<{ success: boolean }>
  /** Check whether a merchant is currently logged in. The session persists across app restarts. */
  isLoggedIn: () => Promise<{ isLoggedIn: boolean }>
  /** Get the currency and merchant code of the currently logged-in merchant. */
  getCurrentMerchant: () => Promise<SumUpMerchant>
  /** Log out of the current SumUp merchant account. */
  logout: () => Promise<{ success: boolean }>
  /**
   * Let the SDK know that a checkout is imminent (e.g. while the user is entering an amount),
   * so it can take steps like waking a connected card reader ahead of time.
   */
  prepareForCheckout: () => Promise<void>
  /** Present the SumUp checkout flow for a single payment. */
  checkout: (options: SumUpCheckoutOptions) => Promise<SumUpCheckoutResult>
  /**
   * Present SumUp's checkout preferences screen, where the merchant can pair/configure a card
   * reader and adjust checkout settings.
   */
  openCheckoutPreferences: () => Promise<{ success: boolean }>
  /**
   * Check whether Tap to Pay on iPhone is available and activated for this device/account.
   * Always resolves `{ available: false, activated: false }` on Android, which does not
   * support Tap to Pay through this plugin.
   */
  checkTapToPay: () => Promise<SumUpTapToPayStatus>
  /**
   * Present the Tap to Pay on iPhone activation flow.
   * Rejects on Android, which does not support Tap to Pay through this plugin.
   */
  activateTapToPay: () => Promise<{ success: boolean }>
}
