export type SumUpCheckoutPaymentMethod = 'tapToPay' | 'cardReader'

export interface SumUpCheckoutOptions {
  /** Amount to charge, in the major currency unit (e.g. 12.50 for €12.50). */
  amount: number
  /** ISO 4217 currency code, e.g. "EUR". */
  currency: string
  /** Title shown on the SumUp checkout screen. */
  title: string
  /** Preferred payment method. Defaults to `cardReader` when omitted. */
  paymentMethod?: SumUpCheckoutPaymentMethod
}

export interface SumUpTapToPayStatus {
  available: boolean
  activated: boolean
}

export interface SumUpPlugin {
  /** Configure the SDK with a SumUp affiliate key. Call once before login/checkout. */
  setup: (options: { affiliateKey: string }) => Promise<{ success: boolean }>
  /** Log in to a SumUp merchant account using an OAuth access token. */
  login: (options: { accessToken: string }) => Promise<{ success: boolean }>
  /** Present the SumUp checkout flow for a single payment. */
  checkout: (options: SumUpCheckoutOptions) => Promise<{ success: boolean }>
  /** Log out of the current SumUp merchant account. */
  logout: () => Promise<{ success: boolean }>
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
