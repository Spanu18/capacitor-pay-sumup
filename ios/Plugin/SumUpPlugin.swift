import Foundation
import Capacitor
import SumUpSDK

@objc(SumUpPlugin)
public class SumUpPlugin: CAPPlugin {
    private var affiliateKey: String?

    @objc func setup(_ call: CAPPluginCall) {
        guard let key = call.getString("affiliateKey") else {
            call.reject("affiliateKey is required")
            return
        }

        self.affiliateKey = key
        SumUpSDK.setup(withAPIKey: key)
        call.resolve(["success": true])
    }

    @objc func login(_ call: CAPPluginCall) {
        guard let accessToken = call.getString("accessToken") else {
            call.reject("Missing accessToken")
            return
        }

        DispatchQueue.main.async {
            SumUpSDK.login(withToken: accessToken) { success, error in
                if success {
                    call.resolve(["success": true])
                } else if let error = error {
                    call.reject(error.localizedDescription)
                } else {
                    call.reject("Login failed: unknown reason")
                }
            }
        }
    }

    @objc func checkout(_ call: CAPPluginCall) {
        guard let amount = call.getDouble("amount"),
              let currency = call.getString("currency"),
              let title = call.getString("title") else {
            call.reject("Missing parameters")
            return
        }

        let methodString = call.getString("paymentMethod")
        var paymentMethod: PaymentMethod?

        if let methodString = methodString {
            switch methodString {
            case "tapToPay":
                paymentMethod = .tapToPay
            case "cardReader":
                paymentMethod = .cardReader
            default:
                break // fallback to nil (let SDK decide)
            }
        }

        let request = CheckoutRequest(
            total: NSDecimalNumber(value: amount),
            title: title,
            currencyCode: currency
        )
        request.paymentMethod = paymentMethod ?? .cardReader

        DispatchQueue.main.async {
            guard let viewController = self.bridge?.viewController else {
                call.reject("No view controller")
                return
            }

            SumUpSDK.checkout(with: request, from: viewController) { result, error in
                if result?.success == true {
                    call.resolve(["success": true])
                } else {
                    call.reject(error?.localizedDescription ?? "Checkout failed")
                }
            }
        }
    }

    @objc func logout(_ call: CAPPluginCall) {
        SumUpSDK.logout { success, error in
            if success {
                call.resolve(["success": true])
            } else if let error = error {
                call.reject(error.localizedDescription)
            } else {
                call.reject("Logout failed for unknown reason")
            }
        }
    }

    @objc func checkTapToPay(_ call: CAPPluginCall) {
        guard self.affiliateKey != nil else {
            call.reject("Plugin not configured. Call setup() first.")
            return
        }

        DispatchQueue.main.async {
            SumUpSDK.checkTapToPayAvailability { isAvailable, isActivated, error in
                if let error = error {
                    call.reject(error.localizedDescription)
                    return
                }

                call.resolve([
                    "available": isAvailable,
                    "activated": isActivated,
                ])
            }
        }
    }

    @objc func activateTapToPay(_ call: CAPPluginCall) {
        guard let viewController = self.bridge?.viewController else {
            call.reject("No view controller available")
            return
        }

        DispatchQueue.main.async {
            SumUpSDK.presentTapToPayActivation(
                from: viewController,
                animated: true,
                completionBlock: { success, error in
                    if let error = error {
                        call.reject(error.localizedDescription)
                    } else {
                        call.resolve(["success": success])
                    }
                }
            )
        }
    }
}
