// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyBWD_S-ixA0gQn6pWEMQl81Juvj6FlU1F0",
    authDomain: "sistema-unidad-terrritorial.firebaseapp.com",
    projectId: "sistema-unidad-terrritorial",
    storageBucket: "sistema-unidad-terrritorial.appspot.com",
    messagingSenderId: "110154609263",
    appId: "1:110154609263:web:07ffec8194534c5fca539a"
  },
  mercadoPagoToken: 'TEST-5657629847525687-112112-7b52261d4929d83fb1433b4bed625d05-689743348', // Access Token de Prueba
  mercadoPagoPublicKey: 'TEST-f814e750-e255-4354-bd0b-a08aae611b10', // Public Key de Prueba
  appUrl: window.location.hostname === 'localhost' ? 'http://localhost:8100' : 'https://sistema-unidad-terrritorial.web.app',
  integrationModel: 'Marketplace' // Nuevo modelo de integración
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
