package com.capacitorpay.sumup;

import android.app.Activity;
import android.content.Intent;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.sumup.merchant.reader.api.SumUpAPI;
import com.sumup.merchant.reader.api.SumUpLogin;
import com.sumup.merchant.reader.api.SumUpPayment;
import com.sumup.merchant.reader.models.Merchant;
import com.sumup.reader.sdk.api.SumUpState;

import org.json.JSONObject;

import java.math.BigDecimal;
import java.util.Locale;

@CapacitorPlugin(name = "SumUpPlugin")
public class SumUpPlugin extends Plugin {

    private static final int LOGIN_REQUEST_CODE = 1001;
    private static final int CHECKOUT_REQUEST_CODE = 1002;
    private static final int CARD_READER_REQUEST_CODE = 1004;

    private String affiliateKey;
    private String loginCallbackId;
    private String checkoutCallbackId;
    private String cardReaderCallbackId;

    @Override
    public void load() {
        SumUpState.init(getContext());
    }

    @PluginMethod
    public void setup(PluginCall call) {
        String key = call.getString("affiliateKey");
        if (key == null) {
            call.reject("affiliateKey is required");
            return;
        }

        this.affiliateKey = key;

        JSObject result = new JSObject();
        result.put("success", true);
        call.resolve(result);
    }

    @PluginMethod
    public void login(PluginCall call) {
        String accessToken = call.getString("accessToken");
        if (accessToken == null) {
            call.reject("Missing accessToken");
            return;
        }

        if (this.affiliateKey == null) {
            call.reject("Plugin not configured. Call setup() first.");
            return;
        }

        SumUpLogin sumUpLogin = SumUpLogin.builder(this.affiliateKey)
            .accessToken(accessToken)
            .build();

        bridge.saveCall(call);
        this.loginCallbackId = call.getCallbackId();

        Activity activity = getActivity();
        activity.runOnUiThread(() -> SumUpAPI.openLoginActivity(activity, sumUpLogin, LOGIN_REQUEST_CODE));
    }

    @PluginMethod
    public void isLoggedIn(PluginCall call) {
        JSObject result = new JSObject();
        result.put("isLoggedIn", SumUpAPI.isLoggedIn());
        call.resolve(result);
    }

    @PluginMethod
    public void getCurrentMerchant(PluginCall call) {
        Merchant merchant = SumUpAPI.getCurrentMerchant();

        JSObject result = new JSObject();
        if (merchant != null) {
            SumUpPayment.Currency currency = merchant.getCurrency();
            String merchantCode = merchant.getMerchantCode();
            result.put("currencyCode", currency != null ? currency.getIsoCode() : JSONObject.NULL);
            result.put("merchantCode", merchantCode != null ? merchantCode : JSONObject.NULL);
        } else {
            result.put("currencyCode", JSONObject.NULL);
            result.put("merchantCode", JSONObject.NULL);
        }
        call.resolve(result);
    }

    @PluginMethod
    public void checkout(PluginCall call) {
        Double amount = call.getDouble("amount");
        String currencyCode = call.getString("currency");
        String title = call.getString("title");

        if (amount == null || currencyCode == null || title == null) {
            call.reject("Missing parameters");
            return;
        }

        SumUpPayment.Currency currency;
        try {
            currency = SumUpPayment.Currency.valueOf(currencyCode.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            call.reject("Unsupported currency: " + currencyCode);
            return;
        }

        // Note: unlike iOS, the standard SumUp Android checkout flow does not expose a
        // tapToPay/cardReader selector - the SDK picks the available payment method itself.
        SumUpPayment.Builder paymentBuilder = SumUpPayment.builder()
            .total(BigDecimal.valueOf(amount))
            .currency(currency)
            .title(title);

        Double tipAmount = call.getDouble("tipAmount");
        if (tipAmount != null) {
            paymentBuilder.tip(BigDecimal.valueOf(tipAmount));
        }

        String foreignTransactionID = call.getString("foreignTransactionID");
        if (foreignTransactionID != null) {
            paymentBuilder.foreignTransactionId(foreignTransactionID);
        }

        SumUpPayment payment = paymentBuilder.build();

        bridge.saveCall(call);
        this.checkoutCallbackId = call.getCallbackId();

        Activity activity = getActivity();
        activity.runOnUiThread(() -> SumUpAPI.checkout(activity, payment, CHECKOUT_REQUEST_CODE));
    }

    @PluginMethod
    public void prepareForCheckout(PluginCall call) {
        SumUpAPI.prepareForCheckout();
        call.resolve();
    }

    @PluginMethod
    public void openCheckoutPreferences(PluginCall call) {
        bridge.saveCall(call);
        this.cardReaderCallbackId = call.getCallbackId();

        Activity activity = getActivity();
        activity.runOnUiThread(() -> SumUpAPI.openCardReaderPage(activity, CARD_READER_REQUEST_CODE));
    }

    @PluginMethod
    public void logout(PluginCall call) {
        SumUpAPI.logout();

        JSObject result = new JSObject();
        result.put("success", true);
        call.resolve(result);
    }

    @PluginMethod
    public void checkTapToPay(PluginCall call) {
        // Tap to Pay on Android requires SumUp's separate Tap to Pay SDK, which is not
        // bundled with this plugin. Report it as unavailable so callers can fall back
        // to the card reader flow.
        JSObject result = new JSObject();
        result.put("available", false);
        result.put("activated", false);
        call.resolve(result);
    }

    @PluginMethod
    public void activateTapToPay(PluginCall call) {
        call.reject("Tap to Pay is not available on Android with this plugin. It requires SumUp's separate Tap to Pay SDK.");
    }

    @Override
    public void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);

        if (requestCode == LOGIN_REQUEST_CODE) {
            handleLoginResult(resultCode, data);
        } else if (requestCode == CHECKOUT_REQUEST_CODE) {
            handleCheckoutResult(resultCode, data);
        } else if (requestCode == CARD_READER_REQUEST_CODE) {
            handleCardReaderResult(resultCode);
        }
    }

    private void handleLoginResult(int resultCode, Intent data) {
        PluginCall call = getSavedCall(this.loginCallbackId);
        this.loginCallbackId = null;
        if (call == null) {
            return;
        }

        if (resultCode == Activity.RESULT_OK) {
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } else {
            call.reject(extractMessage(data, "Login failed"));
        }
    }

    private void handleCheckoutResult(int resultCode, Intent data) {
        PluginCall call = getSavedCall(this.checkoutCallbackId);
        this.checkoutCallbackId = null;
        if (call == null) {
            return;
        }

        if (resultCode == Activity.RESULT_OK && data != null
            && data.getIntExtra(SumUpAPI.Response.RESULT_CODE, SumUpAPI.Response.ResultCode.ERROR_TRANSACTION_FAILED)
                == SumUpAPI.Response.ResultCode.SUCCESSFUL) {
            JSObject result = new JSObject();
            result.put("success", true);

            String transactionCode = data.getStringExtra(SumUpAPI.Response.TX_CODE);
            if (transactionCode != null) {
                result.put("transactionCode", transactionCode);
            }

            call.resolve(result);
        } else {
            call.reject(extractMessage(data, "Checkout failed"));
        }
    }

    private void handleCardReaderResult(int resultCode) {
        PluginCall call = getSavedCall(this.cardReaderCallbackId);
        this.cardReaderCallbackId = null;
        if (call == null) {
            return;
        }

        JSObject result = new JSObject();
        result.put("success", resultCode == Activity.RESULT_OK);
        call.resolve(result);
    }

    @NonNull
    private String extractMessage(Intent data, String fallback) {
        if (data == null) {
            return fallback;
        }

        String message = data.getStringExtra(SumUpAPI.Response.MESSAGE);
        return message != null ? message : fallback;
    }

    private PluginCall getSavedCall(String callbackId) {
        if (callbackId == null) {
            return null;
        }

        PluginCall call = bridge.getSavedCall(callbackId);
        if (call != null) {
            bridge.releaseCall(call);
        }
        return call;
    }
}
