import { Capacitor } from '@capacitor/core'
import { SumUp } from '@capacitor-pay/sumup'

const logEl = document.getElementById('log')

function log(label, value) {
  const time = new Date().toLocaleTimeString()
  const text = value === undefined ? '' : ` ${JSON.stringify(value, null, 2)}`
  logEl.textContent += `[${time}] ${label}${text}\n`
  logEl.scrollTop = logEl.scrollHeight
}

function val(id) {
  const el = document.getElementById(id)
  return el.value === '' ? undefined : el.value
}

function num(id) {
  const v = val(id)
  return v === undefined ? undefined : Number(v)
}

const actions = {
  async setup() {
    const affiliateKey = val('affiliateKey')
    if (!affiliateKey) throw new Error('Enter an affiliate key first')
    return SumUp.setup({ affiliateKey })
  },

  async login() {
    const accessToken = val('accessToken')
    if (!accessToken) throw new Error('Enter an access token first')
    return SumUp.login({ accessToken })
  },

  async logout() {
    return SumUp.logout()
  },

  async isLoggedIn() {
    return SumUp.isLoggedIn()
  },

  async getCurrentMerchant() {
    return SumUp.getCurrentMerchant()
  },

  async prepareForCheckout() {
    return SumUp.prepareForCheckout()
  },

  async checkout() {
    const options = {
      amount: num('amount'),
      currency: val('currency'),
      title: val('title'),
    }

    const paymentMethod = val('paymentMethod')
    if (paymentMethod) options.paymentMethod = paymentMethod

    const tipAmount = num('tipAmount')
    if (tipAmount !== undefined) options.tipAmount = tipAmount

    const foreignTransactionID = val('foreignTransactionID')
    if (foreignTransactionID) options.foreignTransactionID = foreignTransactionID

    return SumUp.checkout(options)
  },

  async openCheckoutPreferences() {
    return SumUp.openCheckoutPreferences()
  },

  async checkTapToPay() {
    return SumUp.checkTapToPay()
  },

  async activateTapToPay() {
    return SumUp.activateTapToPay()
  },

  clearLog() {
    logEl.textContent = ''
  },
}

document.querySelectorAll('button[data-action]').forEach(button => {
  button.addEventListener('click', async () => {
    const action = button.dataset.action
    if (action === 'clearLog') {
      actions.clearLog()
      return
    }

    button.disabled = true
    try {
      const result = await actions[action]()
      log(`${action}() ->`, result ?? null)
    } catch (error) {
      log(`${action}() ERROR ->`, { message: error?.message ?? String(error) })
    } finally {
      button.disabled = false
    }
  })
})

log(`Ready. Platform: ${Capacitor.getPlatform()}`)
