import { WebPlugin } from '@capacitor/core'
import type { SumUpCheckoutOptions, SumUpPlugin, SumUpTapToPayStatus } from './definitions'

export class SumUpWeb extends WebPlugin implements SumUpPlugin {
  async setup(_options: { affiliateKey: string }): Promise<{ success: boolean }> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async login(_options: { accessToken: string }): Promise<{ success: boolean }> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async checkout(_options: SumUpCheckoutOptions): Promise<{ success: boolean }> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async logout(): Promise<{ success: boolean }> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async checkTapToPay(): Promise<SumUpTapToPayStatus> {
    throw this.unavailable('SumUp is not available on web.')
  }

  async activateTapToPay(): Promise<{ success: boolean }> {
    throw this.unavailable('SumUp is not available on web.')
  }
}
