// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  url: `https://api.noworri.com/api/`,
  payStackCheckoutUrl: `https://api.noworri.com/api/securewithnoworritest`,
  checkTransactionStatusUrl: `https://api.noworri.com/api/verifybusinessclientspayment`,
  checkNoworripaymentUrl : `https://api.noworri.com/api/checknoworricheckoutpaymentstatustest`,
  addAccountUrl: `https://api.noworri.com/api/adduseraccounttest/`,
  deleteAccountUrl: `https://api.noworri.com/api/deleteduseraccounttest`,
  createBusinessTransactionUrl: `https://api.noworri.com/api/createbusinesstransactiontest`,
  sendVerificationCodeUrl: `https://api.noworri.com/api/sendverificationcodetest`,
  verifyPaymentOTPUrl: `https://api.noworri.com/api/submitotptest`,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
