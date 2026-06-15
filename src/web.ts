import { WebPlugin } from '@capacitor/core'
import type { SumUpCheckoutOptions, SumUpCheckoutResult, SumUpMerchant, SumUpPlugin, SumUpTapToPayStatus } from './definitions'

export class SumUpWeb extends WebPlugin implements SumUpPlugin {
  async setup(_options: { affiliateKey: string }): Promise<{ success: boolean }> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async login(_options: { accessToken: string }): Promise<{ success: boolean }> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async isLoggedIn(): Promise<{ isLoggedIn: boolean }> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async getCurrentMerchant(): Promise<SumUpMerchant> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async logout(): Promise<{ success: boolean }> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async prepareForCheckout(): Promise<void> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async checkout(_options: SumUpCheckoutOptions): Promise<SumUpCheckoutResult> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async openCheckoutPreferences(): Promise<{ success: boolean }> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async checkTapToPay(): Promise<SumUpTapToPayStatus> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async activateTapToPay(): Promise<{ success: boolean }> {
    throw this.unavailable('SumUp is not available on web.')
  }
}
