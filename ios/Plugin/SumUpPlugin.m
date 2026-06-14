#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(SumUpPlugin, "SumUpPlugin",
     CAP_PLUGIN_METHOD(setup, CAPPluginReturnPromise);
     CAP_PLUGIN_METHOD(login, CAPPluginReturnPromise);
     CAP_PLUGIN_METHOD(checkout, CAPPluginReturnPromise);
     CAP_PLUGIN_METHOD(logout, CAPPluginReturnPromise);
     CAP_PLUGIN_METHOD(checkTapToPay, CAPPluginReturnPromise);
     CAP_PLUGIN_METHOD(activateTapToPay, CAPPluginReturnPromise);
)
